import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-app-header",
  properties: {
    title: T.string(""),
    fixed: T.boolean(),
    transparent: T.boolean(false),
    showBackButton: T.boolean(false),
    showShadow: T.boolean(true),
    elevation: T.number(1),
  },
  style: true,
  shadow: true,

  handleBackClick() {
    this.emit("back-click");
  },

  render() {
    return html`
        <div part="start" class="app-header-start">
          ${
            this.showBackButton
              ? html`
                <button
                  part="back-button"
                  class="back-button"
                  @click=${this.handleBackClick}
                  aria-label="Go back"
                >
                </button>
              `
              : ""
          }
          <slot name="start"></slot>
        </div>

        <div part="title" class="app-header-title">
          ${this.title ? html`<h1>${this.title}</h1>` : ""}
          <slot name="title"></slot>
        </div>

        <div part="end" class="app-header-end">
          <slot name="end"></slot>
        </div>
    `;
  },
};

/**
 * App Header Component
 *
 * @component
 * @category navigation
 * @tag uix-app-header
 *
 * A mobile-optimized header with back button, title, and action buttons.
 * Designed for mobile apps with support for fixed positioning and safe areas.
 *
 * @slot start - Left side content (menu button, back button, etc.)
 * @slot title - Header title content
 * @slot end - Right side content (action buttons)
 *
 * @part header - The header container
 * @part start - The start/left section
 * @part title - The title section
 * @part end - The end/right section
 * @part back-button - The back button (when showBackButton is true)
 *
 * @example Basic Header
 * ```html
 * <uix-app-header title="My App"></uix-app-header>
 * ```
 *
 * @example With Back Button
 * ```html
 * <uix-app-header
 *   title="Profile"
 *   show-back-button
 *   @back-click=${() => console.log('Back clicked')}
 * ></uix-app-header>
 * ```
 *
 * @example With Actions
 * ```html
 * <uix-app-header title="Messages">
 *   <button slot="end">
 *     <uix-icon name="search"></uix-icon>
 *   </button>
 *   <button slot="end">
 *     <uix-icon name="more-vertical"></uix-icon>
 *   </button>
 * </uix-app-header>
 * ```
 *
 * @example With Menu Button
 * ```html
 * <uix-app-header title="Dashboard">
 *   <button slot="start">
 *     <uix-icon name="menu"></uix-icon>
 *   </button>
 * </uix-app-header>
 * ```
 *
 * @example Transparent Header
 * ```html
 * <uix-app-header
 *   title="Photo"
 *   transparent
 *   show-back-button
 * ></uix-app-header>
 * ```
 *
 * @example Custom Title Content
 * ```html
 * <uix-app-header>
 *   <div slot="title">
 *     <img src="/logo.svg" alt="Logo" height="32">
 *   </div>
 * </uix-app-header>
 * ```
 *
 * @example Non-Fixed Header
 * ```html
 * <uix-app-header title="About" fixed="false"></uix-app-header>
 * ```
 *
 * @example Without Shadow
 * ```html
 * <uix-app-header
 *   title="Settings"
 *   show-shadow="false"
 * ></uix-app-header>
 * ```
 */
