/**
 * Badge Component
 *
 * @component
 * @category display
 * @tag uix-badge
 *
 * Small status indicator or label for displaying metadata, counts, or status.
 * Supports multiple variants for different semantic meanings.
 *
 * @slot - Badge text content
 *
 * @example Basic Badge
 * ```html
 * <uix-badge>Default</uix-badge>
 * ```
 *
 * @example Badge Variants
 * Different colors for various statuses
 * ```html
 * <uix-badge variant="default">Default</uix-badge>
 * <uix-badge variant="success">Active</uix-badge>
 * <uix-badge variant="danger">Error</uix-badge>
 * <uix-badge variant="warning">Warning</uix-badge>
 * <uix-badge variant="info">Info</uix-badge>
 * ```
 *
 * @example Badge Sizes
 * ```html
 * <uix-badge size="sm">Small</uix-badge>
 * <uix-badge size="md">Medium</uix-badge>
 * <uix-badge size="lg">Large</uix-badge>
 * ```
 *
 * @example With Count
 * ```html
 * <uix-badge variant="danger">5</uix-badge>
 * <uix-badge variant="success">New</uix-badge>
 * ```
 *
 * @example Badge Outline
 * ```html
 * <uix-badge variant="success" outline>Approved</uix-badge>
 * ```
 *
 * @example In Context
 * ```javascript
 * import { html } from "lit-html";
 *
 * export default {
 *   tag: "user-profile",
 *
 *   render() {
 *     return html`
 *       <h2>
 *         John Doe
 *         <uix-badge variant="success" size="sm">Pro</uix-badge>
 *       </h2>
 *     `;
 *   }
 * };
 * ```
 */

import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  i18n: {},
  properties: {
    variant: T.string("default"), // default, success, danger, warning, info
    size: T.string("md"), // sm, md, lg
    outline: T.boolean(),
  },
  style: true,
  shadow: true,
  render() {
    return html`
        <slot></slot>
    `;
  },
};
