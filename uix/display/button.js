import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "uix-button",
  properties: {
    variant: T.string(),
    primary: T.boolean(),
    secondary: T.boolean(),
    danger: T.boolean(),
    success: T.boolean(),
    ghost: T.boolean(),
    outline: T.boolean(),
    border: T.boolean(),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    wFull: T.boolean(false),
  },
  extends: "uix-link",
  style: true,
};

/**
 * Button Component
 *
 * @component
 * @category display
 * @tag uix-button
 *
 * A flexible button component for user actions. Supports multiple variants,
 * sizes, icons, and states. Extends uix-link for navigation functionality.
 *
 * @example Basic Button
 * ```html
 * <uix-button>Click me</uix-button>
 * ```
 *
 * @example Button Variants
 * Different visual styles for various action types
 * ```html
 * <div class="flex flex-col gap-2 items-center">
 *  <uix-button>Default</uix-button>
 *  <uix-button primary>Primary</uix-button>
 *  <uix-button secondary>Secondary</uix-button>
 *  <uix-button success>Success</uix-button>
 *  <uix-button danger>Danger</uix-button>
 * </div>
 * ```
 *
 * @example Button Styles
 * Different style treatments
 * ```html
 * <div class="flex flex-col gap-2 items-center">
 *  <uix-button primary>Solid</uix-button>
 *  <uix-button danger ghost>Ghost</uix-button>
 *  <uix-button secondary outline>Outline</uix-button>
 *  <uix-button primary border>Border</uix-button>
 * </div>
 * ```
 *
 * @example Button Sizes
 * ```html
 * <div class="flex flex-col gap-2 items-center">
 *  <uix-button size="xs">Extra Small</uix-button>
 *  <uix-button size="sm">Small</uix-button>
 *  <uix-button size="md">Medium</uix-button>
 *  <uix-button size="lg">Large</uix-button>
 *  <uix-button size="xl">Extra Large</uix-button>
 * </div>
 * ```
 *
 * @example Disabled Button
 * ```html
 * <uix-button disabled>Cannot Click</uix-button>
 * ```
 *
 * @example With Click Handler
 * ```javascript
 * import { html } from "lit-html";
 *
 * export default {
 *   tag: "my-component",
 *
 *   handleClick() {
 *     alert("Button clicked!");
 *   },
 *
 *   render() {
 *     return html`
 *       <uix-button
 *         primary
 *         @click=${this.handleClick.bind(this)}
 *       >
 *         Click me
 *       </uix-button>
 *     `;
 *   }
 * };
 * ```
 *
 * @example As Link
 * ```html
 * <uix-button href="/dashboard">Go to Dashboard</uix-button>
 * ```
 */
