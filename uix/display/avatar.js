import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-avatar",
  properties: {
    src: T.string(),
    name: T.string(),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    shape: T.string({
      defaultValue: "circle",
      enum: ["circle", "square", "rounded"],
    }),
    status: T.string({
      enum: ["online", "offline", "busy", "away"],
    }),
  },
  style: true,

  getInitials(name) {
    if (!name) return null;
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  render() {
    const initials = this.getInitials(this.name);

    return html`
      ${this.src
        ? html`<img src="${this.src}" alt="${this.name || "Avatar"}" />`
        : initials
          ? html`<span class="initials">${initials}</span>`
          : html`<uix-icon name="user"></uix-icon>`
      }
      ${this.status
        ? html`<span class="status status--${this.status}"></span>`
        : ""
      }
    `;
  },
};

/**
 * Avatar Component
 *
 * @component
 * @category display
 * @tag uix-avatar
 *
 * Displays user profile images, initials, or a fallback user icon.
 * Supports status indicators and multiple shapes/sizes.
 *
 * @example Image Avatar
 * ```html
 * <uix-avatar src="/path/to/image.jpg" name="John Doe"></uix-avatar>
 * ```
 *
 * @example Initials Avatar
 * ```html
 * <uix-avatar name="Jane Smith"></uix-avatar>
 * <uix-avatar name="Bob"></uix-avatar>
 * ```
 *
 * @example Default Icon (no name or src)
 * ```html
 * <uix-avatar></uix-avatar>
 * <uix-avatar size="lg"></uix-avatar>
 * ```
 *
 * @example Sizes
 * ```html
 * <uix-avatar name="XS" size="xs"></uix-avatar>
 * <uix-avatar name="SM" size="sm"></uix-avatar>
 * <uix-avatar name="MD" size="md"></uix-avatar>
 * <uix-avatar name="LG" size="lg"></uix-avatar>
 * <uix-avatar name="XL" size="xl"></uix-avatar>
 * ```
 *
 * @example Shapes
 * ```html
 * <uix-avatar name="C" shape="circle"></uix-avatar>
 * <uix-avatar name="S" shape="square"></uix-avatar>
 * <uix-avatar name="R" shape="rounded"></uix-avatar>
 * ```
 *
 * @example Status Indicator
 * ```html
 * <uix-avatar name="John" status="online"></uix-avatar>
 * <uix-avatar name="Jane" status="offline"></uix-avatar>
 * <uix-avatar name="Bob" status="busy"></uix-avatar>
 * <uix-avatar name="Alice" status="away"></uix-avatar>
 * ```
 */
