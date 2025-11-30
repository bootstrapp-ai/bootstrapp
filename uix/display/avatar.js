/**
 * Avatar Component
 *
 * @component
 * @category display
 * @tag uix-avatar
 *
 * A flexible avatar component that displays user profile images, initials,
 * or fallback icons. Supports status indicators and multiple shapes/sizes.
 *
 * @example Image Avatar
 * ```html
 * <uix-avatar
 *   src="/path/to/image.jpg"
 *   name="John Doe"
 *   alt="Profile picture"
 * ></uix-avatar>
 * ```
 *
 * @example Initials Avatar
 * Automatically generates initials from name when no image provided
 * ```html
 * <uix-avatar name="Jane Smith"></uix-avatar>
 * <uix-avatar name="Bob"></uix-avatar>
 * ```
 *
 * @example Avatar Sizes
 * ```html
 * <div class="flex gap-4 items-center">
 *   <uix-avatar name="XS" size="xs"></uix-avatar>
 *   <uix-avatar name="SM" size="sm"></uix-avatar>
 *   <uix-avatar name="MD" size="md"></uix-avatar>
 *   <uix-avatar name="LG" size="lg"></uix-avatar>
 *   <uix-avatar name="XL" size="xl"></uix-avatar>
 * </div>
 * ```
 *
 * @example Avatar Shapes
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
 *
 * @example Combined Features
 * ```html
 * <uix-avatar
 *   src="/profile.jpg"
 *   name="John Doe"
 *   size="lg"
 *   shape="rounded"
 *   status="online"
 * ></uix-avatar>
 * ```
 */

import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-avatar",
  properties: {
    src: T.string(),
    name: T.string(),
    alt: T.string(),
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
  shadow: true,
  render() {
    const initials = this.getInitials(this.name);
    const hasImage = !!this.src;
    const hasStatus = !!this.status;

    return html`
      <div class="uix-avatar__container" part="container">
        ${
          hasImage
            ? html`
              <img
                src="${this.src}"
                alt="${this.alt || this.name || "Avatar"}"
                part="image"
                @error=${this.handleImageError.bind(this)}
              />
            `
            : html`
              <div class="uix-avatar__initials" part="initials">
                ${initials}
              </div>
            `
        }
        ${
          hasStatus
            ? html`
              <div
                class="uix-avatar__status uix-avatar__status--${this.status}"
                part="status"
                role="status"
                aria-label="${this.status}"
              ></div>
            `
            : ""
        }
      </div>
    `;
  },

  getInitials(name) {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  handleImageError(e) {
    // On image load error, hide the image and show initials
    e.target.style.display = "none";
    const container = e.target.parentElement;
    const initials = this.getInitials(this.name);
    const initialsDiv = document.createElement("div");
    initialsDiv.className = "uix-avatar__initials";
    initialsDiv.setAttribute("part", "initials");
    initialsDiv.textContent = initials;
    container.appendChild(initialsDiv);
  },
};
