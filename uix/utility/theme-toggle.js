import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-theme-toggle",
  properties: {
    themes: T.array([]), // Array of theme names
    currentTheme: T.string(""),
    variant: T.string({
      defaultValue: "button",
      enum: ["button", "select", "icons"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    selectedTheme: T.string(""),
  },
  style: true,
  shadow: true,

  connected() {
    // Initialize with current theme from $APP or first theme in list
    this.selectedTheme = this.currentTheme || this.themes[0] || "";
  },

  updated({ changedProps }) {
    if (changedProps.has("currentTheme")) {
      this.selectedTheme = this.currentTheme;
    }
  },

  changeTheme(themeName) {
    this.selectedTheme = themeName;
    this.emit("theme-change", { theme: themeName });

    // If $APP is available, update the theme
    if (window.$APP && window.$APP.theme) {
      const theme = window.$APP.modules.uix?.themes?.[themeName];
      if (theme) {
        window.$APP.theme = theme;
      }
    }
  },

  cycleTheme() {
    const currentIndex = this.themes.indexOf(this.selectedTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.changeTheme(this.themes[nextIndex]);
  },

  _getThemeIcon(themeName) {
    // Map theme names to appropriate icons
    const lowerName = themeName.toLowerCase();
    if (lowerName.includes("dark")) return "moon";
    if (lowerName.includes("light")) return "sun";
    return "palette";
  },

  render() {
    if (this.variant === "select") {
      return this._renderSelect();
    } else if (this.variant === "icons") {
      return this._renderIcons();
    }
    return this._renderButton();
  },

  _renderButton() {
    return html`
      <uix-button
        class="theme-toggle"
        ghost
        size=${this.size}
        @click=${this.cycleTheme}
        aria-label="Toggle theme"
      >
        <uix-icon name=${this._getThemeIcon(this.selectedTheme)}></uix-icon>
        ${this.selectedTheme}
      </uix-button>
    `;
  },

  _renderSelect() {
    return html`
      <uix-select
        class="theme-toggle"
        .value=${this.selectedTheme}
        @change=${(e) => this.changeTheme(e.target.value)}
        aria-label="Select theme"
      >
        ${this.themes.map(
          (theme) => html`
            <option value=${theme} ?selected=${theme === this.selectedTheme}>
              ${theme}
            </option>
          `,
        )}
      </uix-select>
    `;
  },

  _renderIcons() {
    return html`
      <div part="icons" class="theme-toggle-icons">
        ${this.themes.map(
          (theme) => html`
            <button
              part="icon"
              class="theme-toggle-icon ${theme === this.selectedTheme ? "active" : ""}"
              @click=${() => this.changeTheme(theme)}
              aria-label="Switch to ${theme} theme"
              title=${theme}
            >
              <uix-icon name=${this._getThemeIcon(theme)}></uix-icon>
            </button>
          `,
        )}
      </div>
    `;
  },
};

/**
 * Theme Toggle Component
 *
 * @component
 * @category utility
 * @tag uix-theme-toggle
 *
 * Toggle between different themes with various display options.
 *
 * @example
 * // Basic theme toggle
 * ```html
 * <uix-theme-toggle
 *   .themes=${["gruvbox-dark", "gruvbox-light"]}
 *   current-theme="gruvbox-dark"
 * ></uix-theme-toggle>
 * ```
 *
 * @example
 * // Select variant
 * ```html
 * <uix-theme-toggle
 *   variant="select"
 *   .themes=${["gruvbox-dark", "gruvbox-light", "catppuccin", "nord"]}
 *   current-theme="gruvbox-dark"
 * ></uix-theme-toggle>
 * ```
 *
 * @example
 * // Icon variant
 * ```html
 * <uix-theme-toggle
 *   variant="icons"
 *   .themes=${["gruvbox-light", "gruvbox-dark"]}
 *   current-theme="gruvbox-light"
 * ></uix-theme-toggle>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; gap: 1rem; align-items: center;">
 *   <uix-theme-toggle
 *     size="sm"
 *     .themes=${["light", "dark"]}
 *   ></uix-theme-toggle>
 *
 *   <uix-theme-toggle
 *     size="md"
 *     .themes=${["light", "dark"]}
 *   ></uix-theme-toggle>
 *
 *   <uix-theme-toggle
 *     size="lg"
 *     .themes=${["light", "dark"]}
 *   ></uix-theme-toggle>
 * </div>
 * ```
 *
 * @example
 * // In navbar
 * ```html
 * <uix-navbar>
 *   <div slot="brand">MyApp</div>
 *   <div slot="end">
 *     <uix-theme-toggle
 *       variant="icons"
 *       .themes=${["gruvbox-light", "gruvbox-dark"]}
 *     ></uix-theme-toggle>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-theme-toggle
 *   .themes=${["light", "dark", "system"]}
 *   @theme-change=${(e) => {
 *     console.log('Theme changed to:', e.detail.theme);
 *     localStorage.setItem('preferred-theme', e.detail.theme);
 *   }}
 * ></uix-theme-toggle>`
 * ```
 *
 * @example
 * // Multiple themes
 * ```html
 * <uix-theme-toggle
 *   variant="select"
 *   .themes=${[
 *     "gruvbox-dark",
 *     "gruvbox-light",
 *     "dracula",
 *     "nord",
 *     "catppuccin",
 *     "tokyo-night"
 *   ]}
 *   current-theme="gruvbox-dark"
 * ></uix-theme-toggle>
 * ```
 *
 * @example
 * // In settings panel
 * ```html
 * <uix-panel variant="bordered">
 *   <div slot="header">
 *     <h3>Appearance Settings</h3>
 *   </div>
 *   <uix-form-control label="Theme">
 *     <uix-theme-toggle
 *       variant="select"
 *       .themes=${["gruvbox-light", "gruvbox-dark"]}
 *       current-theme="gruvbox-dark"
 *     ></uix-theme-toggle>
 *   </uix-form-control>
 * </uix-panel>
 * ```
 *
 * @example
 * // Complete implementation with $APP
 * ```js
 * // In your app initialization
 * const themeToggle = document.querySelector('uix-theme-toggle');
 * themeToggle.themes = Object.keys($APP.modules.uix.themes);
 * themeToggle.currentTheme = 'gruvbox-dark';
 *
 * themeToggle.addEventListener('theme-change', (e) => {
 *   const theme = $APP.modules.uix.themes[e.detail.theme];
 *   $APP.theme = theme;
 *   localStorage.setItem('theme', e.detail.theme);
 * });
 *
 * // Restore saved theme
 * const savedTheme = localStorage.getItem('theme');
 * if (savedTheme && $APP.modules.uix.themes[savedTheme]) {
 *   $APP.theme = $APP.modules.uix.themes[savedTheme];
 *   themeToggle.currentTheme = savedTheme;
 * }
 * ```
 */
