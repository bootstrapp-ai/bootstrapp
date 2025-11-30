/**
 * Spinner Component
 *
 * @component
 * @category feedback
 * @tag uix-spinner
 *
 * A loading spinner component with multiple animation variants and sizes.
 * Uses pure CSS animations for performance.
 *
 * @example Basic Spinner
 * ```html
 * <uix-spinner></uix-spinner>
 * ```
 *
 * @example Spinner Variants
 * Different animation styles
 * ```html
 * <div class="flex gap-4">
 *   <uix-spinner variant="circular"></uix-spinner>
 *   <uix-spinner variant="dots"></uix-spinner>
 *   <uix-spinner variant="bars"></uix-spinner>
 * </div>
 * ```
 *
 * @example Spinner Sizes
 * ```html
 * <div class="flex gap-4 items-center">
 *   <uix-spinner size="xs"></uix-spinner>
 *   <uix-spinner size="sm"></uix-spinner>
 *   <uix-spinner size="md"></uix-spinner>
 *   <uix-spinner size="lg"></uix-spinner>
 *   <uix-spinner size="xl"></uix-spinner>
 * </div>
 * ```
 *
 * @example Colored Spinner
 * ```html
 * <uix-spinner primary></uix-spinner>
 * <uix-spinner secondary></uix-spinner>
 * <uix-spinner success></uix-spinner>
 * <uix-spinner danger></uix-spinner>
 * ```
 *
 * @example Custom Color
 * ```html
 * <uix-spinner style="--spinner-color: #ff6b6b;"></uix-spinner>
 * ```
 */

import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-spinner",
  properties: {
    variant: T.string({
      defaultValue: "circular",
      enum: ["circular", "dots", "bars"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    primary: T.boolean(),
    secondary: T.boolean(),
    success: T.boolean(),
    danger: T.boolean(),
    warning: T.boolean(),
    info: T.boolean(),
  },
  style: true,
  render() {
    // Circular variant uses CSS ::before pseudo-element
    if (this.variant === "circular") {
      return html``;
    }

    // Dots and bars variants need 3 elements
    if (this.variant === "dots") {
      return html`
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      `;
    }

    if (this.variant === "bars") {
      return html`
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      `;
    }

    return html``;
  },
};
