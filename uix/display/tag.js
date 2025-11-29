import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-tag",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: [
        "default",
        "primary",
        "secondary",
        "success",
        "warning",
        "error",
        "info",
      ],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    outlined: T.boolean(false),
    rounded: T.boolean(true),
    closable: T.boolean(false),
    disabled: T.boolean(false),
  },
  style: true,
  shadow: true,

  handleClose(e) {
    e.stopPropagation();
    if (!this.disabled) {
      this.emit("close");
    }
  },

  handleClick(e) {
    if (!this.disabled) {
      this.emit("click", e);
    }
  },

  render() {
    return html`
      <span
        part="container"
        class="tag ${this.outlined ? "outlined" : ""} ${this.rounded ? "rounded" : ""}"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot name="icon"></slot>
        <span part="label" class="tag-label">
          <slot></slot>
        </span>
        ${
          this.closable
            ? html`
              <button
                part="close"
                class="tag-close"
                @click=${this.handleClose}
                ?disabled=${this.disabled}
                aria-label="Remove tag"
              >
                <uix-icon name="x"></uix-icon>
              </button>
            `
            : ""
        }
      </span>
    `;
  },
};

/**
 * Tag Component
 *
 * @component
 * @category display
 * @tag uix-tag
 *
 * Tags/chips for labels, categories, filters, or any metadata display.
 *
 * @slot icon - Icon to display before the tag label
 * @slot default - Tag label content
 *
 * @example
 * // Basic tags
 * ```html
 * <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
 *   <uix-tag>Default</uix-tag>
 *   <uix-tag variant="primary">Primary</uix-tag>
 *   <uix-tag variant="secondary">Secondary</uix-tag>
 *   <uix-tag variant="success">Success</uix-tag>
 *   <uix-tag variant="warning">Warning</uix-tag>
 *   <uix-tag variant="error">Error</uix-tag>
 *   <uix-tag variant="info">Info</uix-tag>
 * </div>
 * ```
 *
 * @example
 * // Outlined tags
 * ```html
 * <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
 *   <uix-tag outlined>Default</uix-tag>
 *   <uix-tag variant="primary" outlined>Primary</uix-tag>
 *   <uix-tag variant="success" outlined>Success</uix-tag>
 *   <uix-tag variant="error" outlined>Error</uix-tag>
 * </div>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; gap: 0.5rem; align-items: center;">
 *   <uix-tag size="sm" variant="primary">Small</uix-tag>
 *   <uix-tag size="md" variant="primary">Medium</uix-tag>
 *   <uix-tag size="lg" variant="primary">Large</uix-tag>
 * </div>
 * ```
 *
 * @example
 * // Closable tags
 * ```html
 * <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
 *   <uix-tag closable variant="primary">React</uix-tag>
 *   <uix-tag closable variant="secondary">Vue</uix-tag>
 *   <uix-tag closable variant="success">Svelte</uix-tag>
 * </div>
 * ```
 *
 * @example
 * // With icons
 * ```html
 * <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
 *   <uix-tag variant="primary">
 *     <uix-icon name="tag" slot="icon"></uix-icon>
 *     Label
 *   </uix-tag>
 *   <uix-tag variant="success">
 *     <uix-icon name="check" slot="icon"></uix-icon>
 *     Verified
 *   </uix-tag>
 *   <uix-tag variant="warning">
 *     <uix-icon name="alert-triangle" slot="icon"></uix-icon>
 *     Warning
 *   </uix-tag>
 * </div>
 * ```
 *
 * @example
 * // Not rounded
 * ```html
 * <div style="display: flex; gap: 0.5rem;">
 *   <uix-tag variant="primary" rounded="false">Square Tag</uix-tag>
 *   <uix-tag variant="success" rounded="false" outlined>Outlined Square</uix-tag>
 * </div>
 * ```
 *
 * @example
 * // Product tags
 * ```html
 * <div style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
 *   <h3>Wireless Headphones</h3>
 *   <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
 *     <uix-tag variant="success" size="sm">
 *       <uix-icon name="check" slot="icon"></uix-icon>
 *       In Stock
 *     </uix-tag>
 *     <uix-tag variant="error" size="sm">Hot</uix-tag>
 *     <uix-tag variant="info" size="sm">Free Shipping</uix-tag>
 *     <uix-tag size="sm" outlined>Electronics</uix-tag>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // User skills
 * ```html
 * <div>
 *   <h4>Skills:</h4>
 *   <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
 *     <uix-tag closable>JavaScript</uix-tag>
 *     <uix-tag closable>TypeScript</uix-tag>
 *     <uix-tag closable>React</uix-tag>
 *     <uix-tag closable>Node.js</uix-tag>
 *     <uix-tag closable>Python</uix-tag>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // Filter tags
 * ```html
 * <div>
 *   <h4>Active Filters:</h4>
 *   <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
 *     <uix-tag closable variant="primary" size="sm">Category: Books</uix-tag>
 *     <uix-tag closable variant="primary" size="sm">Price: $10-$50</uix-tag>
 *     <uix-tag closable variant="primary" size="sm">Rating: 4+</uix-tag>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // Status badges
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <div style="display: flex; justify-content: space-between; align-items: center;">
 *     <span>Order #12345</span>
 *     <uix-tag variant="success" size="sm">Delivered</uix-tag>
 *   </div>
 *   <div style="display: flex; justify-content: space-between; align-items: center;">
 *     <span>Order #12346</span>
 *     <uix-tag variant="info" size="sm">Processing</uix-tag>
 *   </div>
 *   <div style="display: flex; justify-content: space-between; align-items: center;">
 *     <span>Order #12347</span>
 *     <uix-tag variant="error" size="sm">Cancelled</uix-tag>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // With close event handling
 * ```js
 * html`<uix-tag
 *   closable
 *   variant="primary"
 *   @close=${() => {
 *     console.log('Tag closed');
 *     // Remove tag from list
 *   }}
 * >Removable Tag</uix-tag>`
 * ```
 *
 * @example
 * // Disabled state
 * ```html
 * <div style="display: flex; gap: 0.5rem;">
 *   <uix-tag disabled>Disabled</uix-tag>
 *   <uix-tag closable disabled variant="primary">Disabled Closable</uix-tag>
 * </div>
 * ```
 */
