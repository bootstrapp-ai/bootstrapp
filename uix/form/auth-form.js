import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-auth-form",
  style: true,
  properties: {
    // Mode
    mode: T.string({ defaultValue: "register", enum: ["login", "register"] }),

    // Config
    showTabs: T.boolean(true),
    showOAuth: T.boolean(true),
    showGuest: T.boolean(true),

    // Labels (i18n support)
    loginLabel: T.string("Login"),
    registerLabel: T.string("Register"),
    loginTitle: T.string("Welcome Back"),
    registerTitle: T.string("Create Account"),
    nameLabel: T.string("Full Name"),
    namePlaceholder: T.string("John Doe"),
    emailLabel: T.string("Email"),
    emailPlaceholder: T.string("you@example.com"),
    submitLoginLabel: T.string("Login"),
    submitRegisterLabel: T.string("Create Account"),
    oauthDividerLabel: T.string("Or continue with"),
    googleLabel: T.string("Continue with Google"),
    appleLabel: T.string("Continue with Apple"),
    guestLabel: T.string("Continue as Guest"),

    // State
    name: T.string(""),
    email: T.string(""),
    error: T.string(""),
    loading: T.boolean(false),
  },

  handleModeChange(newMode) {
    this.mode = newMode;
    this.error = "";
  },

  handleSubmit() {
    this.error = "";

    if (this.mode === "register" && !this.name.trim()) {
      this.error = "Please enter your name";
      this.emit("auth-error", { message: this.error });
      return;
    }

    if (!this.email.trim()) {
      this.error = "Please enter your email";
      this.emit("auth-error", { message: this.error });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = "Please enter a valid email";
      this.emit("auth-error", { message: this.error });
      return;
    }

    this.emit("auth-submit", {
      mode: this.mode,
      name: this.name,
      email: this.email,
    });
  },

  handleOAuth(provider) {
    this.emit("auth-oauth", { provider });
  },

  handleGuest() {
    this.emit("auth-guest", {});
  },

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.handleSubmit();
    }
  },

  setError(message) {
    this.error = message;
  },

  render() {
    const isRegister = this.mode === "register";

    return html`
      <!-- Tabs -->
      ${this.showTabs ? this.renderTabs() : null}

      <!-- Form -->
      <div class="auth-form" part="form">
        <!-- Error Message -->
        ${
          this.error
            ? html`
              <div class="error-message" part="error">
                ${this.error}
              </div>
            `
            : null
        }

        <!-- Name Field (register only) -->
        ${
          isRegister
            ? html`
              <div class="field" part="field">
                <label class="label" part="label">${this.nameLabel}</label>
                <uix-input
                  type="text"
                  placeholder="${this.namePlaceholder}"
                  .value=${this.name}                  
                  @input=${(e) => (this.name = e.detail.value)}
                  @keypress=${this.handleKeyPress.bind(this)}
                  fullWidth
                ></uix-input>
              </div>
            `
            : null
        }

        <!-- Email Field -->
        <div class="field" part="field">
          <label class="label" part="label">${this.emailLabel}</label>
          <uix-input
            type="email"
            placeholder="${this.emailPlaceholder}"
            .value=${this.email}
            @input=${(e) => (this.email = e.detail.value)}
            @keypress=${this.handleKeyPress.bind(this)}
            fullWidth
          ></uix-input>
        </div>

        <!-- Submit Button -->
        <uix-button
          class="submit-btn"
          ?disabled=${this.loading}
          @click=${this.handleSubmit.bind(this)}
          wFull
        >
          ${
            this.loading
              ? "..."
              : isRegister
                ? this.submitRegisterLabel
                : this.submitLoginLabel
          }
        </uix-button>
      </div>

      <!-- OAuth Section -->
      ${this.showOAuth ? this.renderOAuthButtons() : null}

      <!-- Guest Option -->
      ${this.showGuest ? this.renderGuestOption() : null}
    `;
  },

  renderTabs() {
    return html`
      <div class="tabs" part="tabs">
        <uix-button
          class="tab ${this.mode === "login" ? "active" : ""}"
          @click=${() => this.handleModeChange("login")}
        >
          ${this.loginLabel}
        </uix-button>
        <uix-button
          class="tab ${this.mode === "register" ? "active" : ""}"
          @click=${() => this.handleModeChange("register")}
        >
          ${this.registerLabel}
        </uix-button>
      </div>
    `;
  },

  renderOAuthButtons() {
    return html`
      <div class="oauth-section" part="oauth">
        <div class="divider" part="divider">
          <span>${this.oauthDividerLabel}</span>
        </div>
        <div class="oauth-buttons" part="oauth-buttons">
          <uix-button
            class="oauth-btn google"
            @click=${() => this.handleOAuth("google")}
            wFull
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            ${this.googleLabel}
          </uix-button>
          <uix-button
            class="oauth-btn apple"
            @click=${() => this.handleOAuth("apple")}
            wFull
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            ${this.appleLabel}
          </uix-button>
        </div>
      </div>
    `;
  },

  renderGuestOption() {
    return html`
      <div class="guest-section" part="guest">
        <uix-button
          class="guest-btn"
          ghost
          @click=${this.handleGuest.bind(this)}
        >
          ${this.guestLabel}
        </uix-button>
      </div>
    `;
  },
};

/**
 * Auth Form Component
 *
 * @component
 * @category form
 * @tag uix-auth-form
 *
 * A reusable authentication form component with login/register modes,
 * OAuth buttons, and guest option. Emits events for auth actions.
 *
 * @part tabs - Tab container for login/register toggle
 * @part tab - Individual tab button
 * @part tab-active - Active tab button
 * @part form - Main form container
 * @part field - Form field wrapper
 * @part label - Field label
 * @part input - Input field
 * @part error - Error message container
 * @part submit - Submit button
 * @part oauth - OAuth section container
 * @part divider - "Or continue with" divider
 * @part oauth-buttons - OAuth buttons wrapper
 * @part oauth-btn - OAuth button
 * @part oauth-btn-google - Google OAuth button
 * @part oauth-btn-apple - Apple OAuth button
 * @part guest - Guest section container
 * @part guest-btn - Guest option button
 *
 * @fires auth-submit - When form is submitted. Detail: { mode, name, email }
 * @fires auth-oauth - When OAuth button clicked. Detail: { provider: "google" | "apple" }
 * @fires auth-guest - When guest option clicked
 * @fires auth-error - When validation error occurs. Detail: { message }
 *
 * @example Basic Usage
 * ```html
 * <uix-auth-form
 *   @auth-submit=${this.handleAuthSubmit}
 *   @auth-oauth=${this.handleOAuth}
 *   @auth-guest=${this.handleGuest}
 * ></uix-auth-form>
 * ```
 *
 * @example Login Only
 * ```html
 * <uix-auth-form
 *   mode="login"
 *   .showTabs=${false}
 *   .showGuest=${false}
 * ></uix-auth-form>
 * ```
 *
 * @example Custom Labels
 * ```html
 * <uix-auth-form
 *   loginTitle="Welcome!"
 *   registerTitle="Join Us"
 *   submitLoginLabel="Sign In"
 *   submitRegisterLabel="Sign Up"
 * ></uix-auth-form>
 * ```
 */
