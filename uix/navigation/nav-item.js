import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

/**
 * @component uix-nav-item
 * @description A navigation item component with icon, label, badge, and active state support
 *
 * @property {string} icon - Icon name (uses uix-icon)
 * @property {string} label - Label text for the navigation item
 * @property {string} badge - Optional badge text/number to display
 * @property {boolean} active - Whether the item is currently active/selected
 * @property {string} href - Optional link URL (renders as anchor)
 * @property {boolean} disabled - Whether the item is disabled
 * @property {string} size - Size variant (sm, md, lg)
 *
 * @event nav-item-click - Emitted when the item is clicked {href?, active, disabled}
 *
 *
 * @part container - The main container element (button or anchor)
 * @part icon - The icon wrapper
 * @part label - The label wrapper
 * @part badge - The badge wrapper
 *
 * @example
 * <uix-nav-item icon="house" label="Home" active></uix-nav-item>
 * <uix-nav-item icon="settings" label="Settings" badge="3"></uix-nav-item>
 * <uix-nav-item href="/docs" label="Documentation"></uix-nav-item>
 */
export default {
  tag: "uix-nav-item",
  properties: {
    icon: T.string({ defaultValue: "" }),
    label: T.string({ defaultValue: "" }),
    badge: T.string({ defaultValue: "" }),
    active: T.boolean(false),
    href: T.string({ defaultValue: "" }),
    disabled: T.boolean(false),
    activeBg: T.boolean(),
    iconOnly: T.boolean(false),
    indicatorPosition: T.string({
      defaultValue: "none",
      enum: ["none", "left", "right", "top", "bottom"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
  },
  style: true,
  _handleClick(e) {
    if (this.disabled) {
      e.preventDefault();
      return;
    }

    this.emit("nav-item-click", {
      href: this.href,
      active: this.active,
      disabled: this.disabled,
    });
  },

  render() {
    const content = this.iconOnly
      ? html`
          ${
            this.icon
              ? html`
                <span part="icon" class="nav-item-icon">
                  <uix-icon name=${this.icon} size=${this.size}></uix-icon>
                </span>
              `
              : null
          }
        `
      : html`
          <span part="label" class="nav-item-label label">
          ${
            this.icon
              ? html`
                <span part="icon" class="nav-item-icon">
                  <uix-icon name=${this.icon} size=${this.size}></uix-icon>
                </span>
              `
              : null
          }
            ${this.label}
          </span>
          ${
            this.badge
              ? html`
                <span part="badge" class="nav-item-badge badge">${this.badge}</span>
              `
              : null
          }
        `;

    const title = this.iconOnly ? this.label : "";

    if (this.href && !this.disabled) {
      return html`
        <a
          part="container"
          class="nav-item"
          href=${this.href}
          title=${title}
          @click=${this._handleClick.bind(this)}
        >
          ${content}
        </a>
      `;
    }

    return html`
      <button
        part="container"
        class="nav-item"
        title=${title}
        ?disabled=${this.disabled}
        @click=${this._handleClick.bind(this)}
      >
        ${content}
      </button>
    `;
  },
};
