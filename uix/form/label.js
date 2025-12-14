import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-label",
  properties: {
    for: T.string(),
    text: T.string(),
    required: T.boolean(false),
    inline: T.boolean(false),
  },
  style: true,
  shadow: false,

  render() {
    return html`
      <label class="label" for=${this.for || ""}>${this.text}${this.required ? html`<span class="label-required">*</span>` : ""}</label>
    `;
  },
};

/**
 * Label Component
 *
 * @component
 * @category form
 * @tag uix-label
 *
 * A form label with consistent styling and required indicator support.
 *
 * @example
 * // Basic label
 * ```html
 * <uix-label for="username">Username</uix-label>
 * <uix-input id="username"></uix-input>
 * ```
 *
 * @example
 * // Required label
 * ```html
 * <uix-label for="email" required>Email</uix-label>
 * <uix-input id="email" required></uix-input>
 * ```
 */
