/**
 * @file Backend Auth Module
 * @description Handles authentication event handlers in the Web Worker context
 */

/**
 * Generate a random code verifier for PKCE
 * @returns {string}
 */
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Generate code challenge from verifier for PKCE
 * @param {string} verifier
 * @returns {Promise<string>}
 */
const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Create auth event handlers for worker context
 * @param {object} $APP - App instance with Database
 * @returns {object} Event handlers object
 */
export function createAuthEventHandlers($APP) {
  /**
   * Get PocketBase instance from Database adapter
   * @returns {object} PocketBase instance
   * @throws {Error} If PocketBase is not initialized
   */
  const getPb = () => {
    if (!$APP.Database?.pb) {
      throw new Error("PocketBase not initialized");
    }
    return $APP.Database.pb;
  };

  return {
    /**
     * Login with email and password
     */
    "AUTH:LOGIN": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const { email, password } = payload;

        const authData = await pb.collection("users").authWithPassword(email, password);

        respond({
          token: authData.token,
          user: authData.record,
        });
      } catch (error) {
        console.error("AUTH:LOGIN error:", error);
        respond({
          error: error.message || "Login failed",
          code: error.status,
        });
      }
    },

    /**
     * Register a new user
     */
    "AUTH:REGISTER": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const { email, password, passwordConfirm, name, ...extraData } = payload;

        // Build user data
        const userData = {
          email,
          password,
          passwordConfirm: passwordConfirm || password,
          name,
          ...extraData,
          isGuest: false,
        };

        // Create the user
        await pb.collection("users").create(userData);

        // Auto-login after registration
        const authData = await pb.collection("users").authWithPassword(email, password);

        respond({
          token: authData.token,
          user: authData.record,
        });
      } catch (error) {
        console.error("AUTH:REGISTER error:", error);
        respond({
          error: error.message || "Registration failed",
          code: error.status,
          data: error.data,
        });
      }
    },

    /**
     * Start OAuth flow - returns auth URL and PKCE verifier
     */
    "AUTH:OAUTH_START": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const { provider, redirectUrl } = payload;

        // Get available auth methods
        const authMethods = await pb.collection("users").listAuthMethods();

        if (!authMethods.oauth2?.enabled) {
          respond({ error: "OAuth2 is not enabled" });
          return;
        }

        const providerConfig = authMethods.oauth2.providers?.find(
          (p) => p.name === provider,
        );

        if (!providerConfig) {
          respond({ error: `OAuth provider "${provider}" is not configured` });
          return;
        }

        // Generate PKCE challenge
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Build auth URL
        const authUrl = new URL(providerConfig.authURL);
        authUrl.searchParams.set("redirect_uri", redirectUrl);
        authUrl.searchParams.set("code_challenge", codeChallenge);
        authUrl.searchParams.set("code_challenge_method", "S256");

        respond({
          authUrl: authUrl.toString(),
          codeVerifier,
          state: providerConfig.state,
          provider,
        });
      } catch (error) {
        console.error("AUTH:OAUTH_START error:", error);
        respond({ error: error.message || "Failed to start OAuth" });
      }
    },

    /**
     * Complete OAuth flow - exchange code for token
     */
    "AUTH:OAUTH_COMPLETE": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const { provider, code, codeVerifier, redirectUrl } = payload;

        const authData = await pb
          .collection("users")
          .authWithOAuth2Code(provider, code, codeVerifier, redirectUrl);

        respond({
          token: authData.token,
          user: authData.record,
          meta: authData.meta,
        });
      } catch (error) {
        console.error("AUTH:OAUTH_COMPLETE error:", error);
        respond({
          error: error.message || "OAuth authentication failed",
          code: error.status,
        });
      }
    },

    /**
     * Logout - clear auth store
     */
    "AUTH:LOGOUT": async ({ respond }) => {
      try {
        const pb = getPb();
        pb.authStore.clear();
        respond({ success: true });
      } catch (error) {
        console.error("AUTH:LOGOUT error:", error);
        respond({ error: error.message });
      }
    },

    /**
     * Get current authenticated user
     */
    "AUTH:GET_USER": async ({ respond }) => {
      try {
        const pb = getPb();
        respond({ user: pb.authStore.model });
      } catch (error) {
        respond({ error: error.message });
      }
    },

    /**
     * Refresh auth token
     */
    "AUTH:REFRESH_TOKEN": async ({ payload, respond }) => {
      try {
        const pb = getPb();

        // Restore token if provided
        if (payload?.token) {
          pb.authStore.save(payload.token, pb.authStore.model);
        }

        const authData = await pb.collection("users").authRefresh();

        respond({
          token: authData.token,
          user: authData.record,
        });
      } catch (error) {
        console.error("AUTH:REFRESH_TOKEN error:", error);
        respond({
          error: error.message || "Token refresh failed",
          code: error.status,
        });
      }
    },

    /**
     * Update current user profile
     */
    "AUTH:UPDATE_USER": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const userId = pb.authStore.model?.id;

        if (!userId) {
          respond({ error: "Not authenticated" });
          return;
        }

        const updated = await pb.collection("users").update(userId, payload);
        respond({ user: updated });
      } catch (error) {
        console.error("AUTH:UPDATE_USER error:", error);
        respond({
          error: error.message || "Update failed",
          code: error.status,
        });
      }
    },

    /**
     * Hookable guest migration - emits event for apps to handle
     * Apps should listen to AUTH:MIGRATE_GUEST_REQUEST and respond
     */
    "AUTH:MIGRATE_GUEST": async ({ payload, respond }) => {
      try {
        const { guestId, newUserId } = payload;

        if (!guestId || !newUserId) {
          respond({ error: "guestId and newUserId are required" });
          return;
        }

        // Emit event for app-level migration handlers
        // Apps can register handlers via $APP.events.on("AUTH:MIGRATE_GUEST_REQUEST", ...)
        const migrationResult = { success: true, migrated: {} };

        // Allow apps to hook into migration
        try {
          await new Promise((resolve, reject) => {
            let handled = false;

            // Set a timeout in case no handler responds
            const timeout = setTimeout(() => {
              if (!handled) {
                resolve(); // No handler, that's ok
              }
            }, 100);

            // Emit the event and wait for handlers
            $APP.events.emit("AUTH:MIGRATE_GUEST_REQUEST", {
              guestId,
              newUserId,
              onComplete: (result) => {
                handled = true;
                clearTimeout(timeout);
                if (result) {
                  Object.assign(migrationResult.migrated, result);
                }
                resolve();
              },
              onError: (error) => {
                handled = true;
                clearTimeout(timeout);
                reject(error);
              },
            });
          });
        } catch (migrationError) {
          console.warn("Guest migration handler error:", migrationError);
          migrationResult.warning = migrationError.message;
        }

        respond(migrationResult);
      } catch (error) {
        console.error("AUTH:MIGRATE_GUEST error:", error);
        respond({ error: error.message });
      }
    },

    /**
     * Check if email is available for registration
     */
    "AUTH:CHECK_EMAIL": async ({ payload, respond }) => {
      try {
        const pb = getPb();
        const { email } = payload;

        // Try to find a user with this email
        try {
          const users = await pb.collection("users").getList(1, 1, {
            filter: `email = "${email}"`,
          });
          respond({ available: users.totalItems === 0 });
        } catch (e) {
          // If we can't query, assume available
          respond({ available: true });
        }
      } catch (error) {
        respond({ error: error.message });
      }
    },
  };
}

/**
 * Initialize Auth backend in worker context
 * @param {object} $APP - App instance
 */
export function initAuthBackend($APP) {
  const handlers = createAuthEventHandlers($APP);
  $APP.events.set(handlers);
  console.log("Auth backend module loaded");
}

export default { createAuthEventHandlers, initAuthBackend };
