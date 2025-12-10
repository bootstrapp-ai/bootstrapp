/**
 * @file Frontend Auth Module
 * @description Handles user authentication state, session persistence, and cross-tab sync
 */

/**
 * AuthSession - Manages auth token persistence in localStorage
 */
export class AuthSession {
  static STORAGE_KEY = "bootstrapp_auth";
  static TOKEN_KEY = "bootstrapp_token";

  /**
   * Get stored auth session
   * @returns {{ token: string, user: object, timestamp: number } | null}
   */
  static get() {
    try {
      const data = localStorage.getItem(AuthSession.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("AuthSession: Failed to parse stored session", e);
      return null;
    }
  }

  /**
   * Store auth session
   * @param {string} token - Auth token
   * @param {object} user - User object
   * @param {object} [$APP] - App instance for cross-tab sync
   */
  static set(token, user, $APP = null) {
    const data = { token, user, timestamp: Date.now() };
    localStorage.setItem(AuthSession.STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(AuthSession.TOKEN_KEY, token);

    // Broadcast to other tabs via Service Worker
    if ($APP?.SW) {
      $APP.SW.postMessage({
        type: "SW:BROADCAST_AUTH_STATE",
        payload: { token, user, action: "login" },
      });
    }
  }

  /**
   * Clear stored auth session
   * @param {object} [$APP] - App instance for cross-tab sync
   */
  static clear($APP = null) {
    localStorage.removeItem(AuthSession.STORAGE_KEY);
    localStorage.removeItem(AuthSession.TOKEN_KEY);

    if ($APP?.SW) {
      $APP.SW.postMessage({
        type: "SW:BROADCAST_AUTH_STATE",
        payload: { action: "logout" },
      });
    }
  }

  /**
   * Get stored token
   * @returns {string | null}
   */
  static getToken() {
    return localStorage.getItem(AuthSession.TOKEN_KEY);
  }

  /**
   * Check if stored token is valid (not expired)
   * @returns {boolean}
   */
  static isValid() {
    const data = AuthSession.get();
    if (!data || !data.token) return false;

    // Tokens are JWTs - check expiration
    try {
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  }

  /**
   * Get token expiration time in ms
   * @returns {number | null}
   */
  static getExpiration() {
    const data = AuthSession.get();
    if (!data || !data.token) return null;

    try {
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      return payload.exp * 1000;
    } catch (e) {
      return null;
    }
  }
}

/**
 * Create Auth module instance
 * @param {object} $APP - App instance with Backend, SW, events, Database
 * @returns {object} Auth module
 */
export function createAuth($APP) {
  const Auth = {
    // State
    user: null,
    token: null,
    _refreshTimer: null,
    _$APP: $APP,

    /**
     * Check if user is authenticated
     */
    get isAuthenticated() {
      return !!this.token && !!this.user;
    },

    /**
     * Check if user is a guest (not authenticated)
     */
    get isGuest() {
      return !this.isAuthenticated;
    },

    // ============================================================
    // Guest ID Management
    // ============================================================

    /**
     * Storage key for guest ID
     * @private
     */
    _GUEST_ID_KEY: "bootstrapp_guest_id",

    /**
     * Get or create a persistent guest ID
     * Used to track guest interactions before registration
     * @returns {string} Guest ID in format "guest_{timestamp}_{random}"
     */
    getGuestId() {
      let guestId = localStorage.getItem(this._GUEST_ID_KEY);
      if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(this._GUEST_ID_KEY, guestId);
      }
      return guestId;
    },

    /**
     * Clear the stored guest ID (called after successful registration)
     */
    clearGuestId() {
      localStorage.removeItem(this._GUEST_ID_KEY);
    },

    /**
     * Get the current user ID - either authenticated user ID or guest ID
     * This is the primary way to get a user identifier for data operations
     * @returns {string} User ID or guest ID
     */
    get currentUserId() {
      return this.isAuthenticated ? this.user.id : this.getGuestId();
    },

    /**
     * Check if a given user ID is a guest ID
     * @param {string} userId - User ID to check
     * @returns {boolean} True if the ID is a guest ID
     */
    isGuestId(userId) {
      return typeof userId === "string" && userId.startsWith("guest_");
    },

    /**
     * Login with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
     */
    async login(email, password) {
      try {
        const result = await $APP.Backend.request("AUTH:LOGIN", {
          email,
          password,
        });

        if (result.error) {
          return { success: false, error: result.error };
        }

        if (result.token && result.user) {
          this.token = result.token;
          this.user = result.user;
          AuthSession.set(result.token, result.user, $APP);
          this._startRefreshTimer();

          // Notify the database adapter of user login (triggers sync)
          if ($APP.Database?.handleUserLogin) {
            await $APP.Database.handleUserLogin(result.user.id);
          }

          $APP.events.emit("AUTH:LOGGED_IN", { user: result.user });
          return { success: true, user: result.user };
        }

        return { success: false, error: "Invalid response from server" };
      } catch (error) {
        console.error("Auth.login error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Register a new user
     * @param {object} data - { email, password, passwordConfirm?, name, ...extraData }
     * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
     */
    async register(data) {
      try {
        const result = await $APP.Backend.request("AUTH:REGISTER", data);

        if (result.error) {
          return { success: false, error: result.error, data: result.data };
        }

        if (result.token && result.user) {
          this.token = result.token;
          this.user = result.user;
          AuthSession.set(result.token, result.user, $APP);
          this._startRefreshTimer();
          $APP.events.emit("AUTH:REGISTERED", { user: result.user });
          return { success: true, user: result.user };
        }

        return { success: false, error: "Invalid response from server" };
      } catch (error) {
        console.error("Auth.register error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Start OAuth login flow
     * @param {string} provider - 'google' or 'apple'
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    async loginWithOAuth(provider) {
      try {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const result = await $APP.Backend.request("AUTH:OAUTH_START", {
          provider,
          redirectUrl,
        });

        if (result.error) {
          return { success: false, error: result.error };
        }

        if (result.authUrl && result.codeVerifier) {
          // Store OAuth state for callback
          sessionStorage.setItem("oauth_code_verifier", result.codeVerifier);
          sessionStorage.setItem("oauth_provider", provider);
          sessionStorage.setItem("oauth_redirect", window.location.href);
          sessionStorage.setItem("oauth_state", result.state || "");

          // Redirect to OAuth provider
          window.location.href = result.authUrl;
          return { success: true, redirecting: true };
        }

        return { success: false, error: "Invalid OAuth response" };
      } catch (error) {
        console.error("Auth.loginWithOAuth error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Complete OAuth login after redirect
     * @param {string} code - Authorization code from OAuth provider
     * @param {string} state - State parameter for validation
     * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
     */
    async completeOAuth(code, state) {
      try {
        const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
        const provider = sessionStorage.getItem("oauth_provider");
        const storedState = sessionStorage.getItem("oauth_state");
        const redirectUrl = `${window.location.origin}/auth/callback`;

        // Clear OAuth session storage
        sessionStorage.removeItem("oauth_code_verifier");
        sessionStorage.removeItem("oauth_provider");
        sessionStorage.removeItem("oauth_state");

        if (!codeVerifier || !provider) {
          return { success: false, error: "OAuth session expired" };
        }

        // Validate state if provided
        if (storedState && state && storedState !== state) {
          return { success: false, error: "OAuth state mismatch" };
        }

        const result = await $APP.Backend.request("AUTH:OAUTH_COMPLETE", {
          provider,
          code,
          codeVerifier,
          redirectUrl,
        });

        if (result.error) {
          return { success: false, error: result.error };
        }

        if (result.token && result.user) {
          this.token = result.token;
          this.user = result.user;
          AuthSession.set(result.token, result.user, $APP);
          this._startRefreshTimer();
          $APP.events.emit("AUTH:OAUTH_SUCCESS", {
            user: result.user,
            provider,
          });

          // Redirect back to original page
          const returnUrl = sessionStorage.getItem("oauth_redirect") || "/";
          sessionStorage.removeItem("oauth_redirect");

          // Small delay to let events process
          setTimeout(() => {
            window.location.href = returnUrl;
          }, 100);

          return { success: true, user: result.user };
        }

        return { success: false, error: "Invalid OAuth response" };
      } catch (error) {
        console.error("Auth.completeOAuth error:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Logout current user
     */
    async logout() {
      try {
        await $APP.Backend.request("AUTH:LOGOUT");
      } catch (error) {
        console.warn("Auth.logout backend error (continuing):", error);
      }

      this.token = null;
      this.user = null;
      this._stopRefreshTimer();
      AuthSession.clear($APP);

      // Notify the database adapter to switch to guest mode
      if ($APP.Database?.handleUserLogout) {
        $APP.Database.handleUserLogout(this.getGuestId());
      }

      $APP.events.emit("AUTH:LOGGED_OUT");
    },

    /**
     * Refresh the auth token
     * @returns {Promise<boolean>}
     */
    async refreshToken() {
      if (!this.token) return false;

      try {
        const result = await $APP.Backend.request("AUTH:REFRESH_TOKEN", {
          token: this.token,
        });

        if (result.token && result.user) {
          this.token = result.token;
          this.user = result.user;
          AuthSession.set(result.token, result.user, $APP);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Auth.refreshToken error:", error);
        // Token refresh failed - log out
        await this.logout();
        return false;
      }
    },

    /**
     * Restore auth session from localStorage
     * @returns {Promise<boolean>}
     */
    async restore() {
      const session = AuthSession.get();

      if (!session || !session.token) {
        this.user = null;
        this.token = null;
        return false;
      }

      // Check if token is still valid
      if (!AuthSession.isValid()) {
        // Token expired - try to refresh
        this.token = session.token;
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          AuthSession.clear($APP);
          return false;
        }
      } else {
        // Valid token - restore session
        this.token = session.token;
        this.user = session.user;
        this._startRefreshTimer();
      }

      $APP.events.emit("AUTH:RESTORED", { user: this.user });
      return true;
    },

    /**
     * Update current user profile
     * @param {object} data - Fields to update
     * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
     */
    async updateUser(data) {
      if (!this.isAuthenticated) {
        return { success: false, error: "Not authenticated" };
      }

      try {
        const result = await $APP.Backend.request("AUTH:UPDATE_USER", data);

        if (result.error) {
          return { success: false, error: result.error };
        }

        if (result.user) {
          this.user = result.user;
          AuthSession.set(this.token, result.user, $APP);
          $APP.events.emit("AUTH:USER_UPDATED", { user: result.user });
          return { success: true, user: result.user };
        }

        return { success: false, error: "Invalid response" };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Convert guest to registered user
     * Emits AUTH:GUEST_CONVERTED event for app-layer migration handling
     * @param {object} guestData - Guest's current data/preferences
     * @param {object} registrationData - Registration data (email, password, name)
     * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
     */
    async convertGuest(guestData, registrationData) {
      const guestId = this.getGuestId();

      // Merge guest preferences with registration data
      const mergedData = {
        ...registrationData,
        ...guestData,
      };

      // Register the new user
      const result = await this.register(mergedData);

      if (result.success) {
        // Emit event for app-layer to handle migration
        // Apps can listen for this and call their own migration logic
        $APP.events.emit("AUTH:GUEST_CONVERTED", {
          guestId,
          newUserId: result.user.id,
          user: result.user,
        });

        // Clear the guest ID after successful registration
        this.clearGuestId();
      }

      return result;
    },

    /**
     * Start token refresh timer
     * @private
     */
    _startRefreshTimer() {
      this._stopRefreshTimer();

      const checkAndRefresh = async () => {
        const expiration = AuthSession.getExpiration();
        if (!expiration) return;

        const timeUntilExpiry = expiration - Date.now();

        // Refresh if less than 15 minutes remaining
        if (timeUntilExpiry < 15 * 60 * 1000) {
          await this.refreshToken();
        }
      };

      // Check every 10 minutes
      this._refreshTimer = setInterval(checkAndRefresh, 10 * 60 * 1000);

      // Also check immediately
      checkAndRefresh();
    },

    /**
     * Stop token refresh timer
     * @private
     */
    _stopRefreshTimer() {
      if (this._refreshTimer) {
        clearInterval(this._refreshTimer);
        this._refreshTimer = null;
      }
    },
  };

  return Auth;
}

/**
 * Initialize Auth module on frontend
 * @param {object} $APP - App instance
 * @returns {object} Auth module
 */
export function initAuthFrontend($APP) {
  const Auth = createAuth($APP);

  // Register Auth module
  $APP.addModule({ name: "Auth", base: Auth });

  // Listen for cross-tab auth state changes
  $APP.swEvents?.set("SW:AUTH_STATE_UPDATE", ({ payload }) => {
    const { action, token, user } = payload;

    if (action === "logout") {
      Auth.token = null;
      Auth.user = null;
      Auth._stopRefreshTimer();
      $APP.events.emit("AUTH:LOGGED_OUT");
    } else if (action === "login" && token && user) {
      Auth.token = token;
      Auth.user = user;
      Auth._startRefreshTimer();
      $APP.events.emit("AUTH:LOGGED_IN", { user });
    }
  });

  return Auth;
}

export default { AuthSession, createAuth, initAuthFrontend };
