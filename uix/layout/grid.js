import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-grid",
  properties: {
    columns: T.string({ defaultValue: "auto-fit" }),
    minColumnWidth: T.string({ defaultValue: "250px" }),
    cols: T.string(),
    rows: T.string(),
    gap: T.string({
      defaultValue: "md",
      enum: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
    }),
    align: T.string({
      defaultValue: "stretch",
      enum: ["start", "center", "end", "stretch"],
    }),
    justify: T.string({
      defaultValue: "start",
      enum: ["start", "center", "end", "stretch"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    const customStyles = [];
    if (this.cols) customStyles.push(`--grid-cols: ${this.cols}`);
    if (this.rows) customStyles.push(`--grid-rows: ${this.rows}`);
    if (this.minColumnWidth)
      customStyles.push(`--grid-min-column-width: ${this.minColumnWidth}`);
    const styleAttr = customStyles.length > 0 ? customStyles.join("; ") : "";

    return html`
      <div part="container" class="grid" style=${styleAttr}>
        <slot></slot>
      </div>
    `;
  },
};

/**
 * Grid Component
 *
 * @component
 * @category layout
 * @tag uix-grid
 *
 * A CSS Grid layout component for creating responsive grid layouts.
 *
 * @example
 * // Basic auto-fit grid
 * ```html
 * <uix-grid>
 *   <uix-panel variant="bordered">Item 1</uix-panel>
 *   <uix-panel variant="bordered">Item 2</uix-panel>
 *   <uix-panel variant="bordered">Item 3</uix-panel>
 *   <uix-panel variant="bordered">Item 4</uix-panel>
 * </uix-grid>
 * ```
 *
 * @example
 * // Fixed number of columns
 * ```html
 * <uix-grid columns="3">
 *   <uix-panel variant="bordered">Item 1</uix-panel>
 *   <uix-panel variant="bordered">Item 2</uix-panel>
 *   <uix-panel variant="bordered">Item 3</uix-panel>
 *   <uix-panel variant="bordered">Item 4</uix-panel>
 *   <uix-panel variant="bordered">Item 5</uix-panel>
 *   <uix-panel variant="bordered">Item 6</uix-panel>
 * </uix-grid>
 * ```
 *
 * @example
 * // Custom minimum column width
 * ```html
 * <uix-grid min-column-width="150px">
 *   <uix-panel variant="bordered">Small 1</uix-panel>
 *   <uix-panel variant="bordered">Small 2</uix-panel>
 *   <uix-panel variant="bordered">Small 3</uix-panel>
 *   <uix-panel variant="bordered">Small 4</uix-panel>
 *   <uix-panel variant="bordered">Small 5</uix-panel>
 *   <uix-panel variant="bordered">Small 6</uix-panel>
 * </uix-grid>
 * ```
 *
 * @example
 * // Gap variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 2rem;">
 *   <div>
 *     <p>Small gap:</p>
 *     <uix-grid columns="3" gap="sm">
 *       <div style="background: #ddd; padding: 1rem;">Item 1</div>
 *       <div style="background: #ddd; padding: 1rem;">Item 2</div>
 *       <div style="background: #ddd; padding: 1rem;">Item 3</div>
 *     </uix-grid>
 *   </div>
 *
 *   <div>
 *     <p>Large gap:</p>
 *     <uix-grid columns="3" gap="lg">
 *       <div style="background: #ddd; padding: 1rem;">Item 1</div>
 *       <div style="background: #ddd; padding: 1rem;">Item 2</div>
 *       <div style="background: #ddd; padding: 1rem;">Item 3</div>
 *     </uix-grid>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // Product grid
 * ```html
 * <uix-grid min-column-width="200px" gap="lg">
 *   ${products.map(product => html`
 *     <uix-panel variant="elevated">
 *       <img src=${product.image} alt=${product.name} style="width: 100%; height: 200px; object-fit: cover;">
 *       <div style="padding: 1rem;">
 *         <h3>${product.name}</h3>
 *         <p>${product.price}</p>
 *         <uix-button variant="primary" style="width: 100%;">Add to Cart</uix-button>
 *       </div>
 *     </uix-panel>
 *   `)}
 * </uix-grid>
 * ```
 *
 * @example
 * // Dashboard grid
 * ```html
 * <uix-grid columns="4" gap="md">
 *   <uix-panel variant="elevated">
 *     <h4>Total Users</h4>
 *     <p style="font-size: 2rem; font-weight: bold;">1,234</p>
 *   </uix-panel>
 *   <uix-panel variant="elevated">
 *     <h4>Revenue</h4>
 *     <p style="font-size: 2rem; font-weight: bold;">$45K</p>
 *   </uix-panel>
 *   <uix-panel variant="elevated">
 *     <h4>Orders</h4>
 *     <p style="font-size: 2rem; font-weight: bold;">567</p>
 *   </uix-panel>
 *   <uix-panel variant="elevated">
 *     <h4>Sessions</h4>
 *     <p style="font-size: 2rem; font-weight: bold;">890</p>
 *   </uix-panel>
 * </uix-grid>
 * ```
 *
 * @example
 * // Image gallery
 * ```html
 * <uix-grid min-column-width="150px" gap="xs">
 *   <img src="/image1.jpg" alt="Image 1" style="width: 100%; height: 150px; object-fit: cover;">
 *   <img src="/image2.jpg" alt="Image 2" style="width: 100%; height: 150px; object-fit: cover;">
 *   <img src="/image3.jpg" alt="Image 3" style="width: 100%; height: 150px; object-fit: cover;">
 *   <img src="/image4.jpg" alt="Image 4" style="width: 100%; height: 150px; object-fit: cover;">
 *   <img src="/image5.jpg" alt="Image 5" style="width: 100%; height: 150px; object-fit: cover;">
 *   <img src="/image6.jpg" alt="Image 6" style="width: 100%; height: 150px; object-fit: cover;">
 * </uix-grid>
 * ```
 *
 * @example
 * // Feature cards
 * ```html
 * <uix-grid columns="3" gap="xl">
 *   <uix-panel variant="bordered" style="text-align: center;">
 *     <uix-icon name="zap" size="xl" style="color: var(--color-primary);"></uix-icon>
 *     <h3>Fast</h3>
 *     <p>Lightning fast performance for all your needs.</p>
 *   </uix-panel>
 *
 *   <uix-panel variant="bordered" style="text-align: center;">
 *     <uix-icon name="shield" size="xl" style="color: var(--color-success);"></uix-icon>
 *     <h3>Secure</h3>
 *     <p>Enterprise-grade security you can trust.</p>
 *   </uix-panel>
 *
 *   <uix-panel variant="bordered" style="text-align: center;">
 *     <uix-icon name="trending-up" size="xl" style="color: var(--color-info);"></uix-icon>
 *     <h3>Scalable</h3>
 *     <p>Grows seamlessly with your business.</p>
 *   </uix-panel>
 * </uix-grid>
 * ```
 *
 * @example
 * // Responsive columns (using CSS custom property)
 * ```html
 * <uix-grid style="--grid-columns: 1;" gap="md">
 *   <uix-panel variant="bordered">Mobile: 1 column</uix-panel>
 *   <uix-panel variant="bordered">Mobile: 1 column</uix-panel>
 * </uix-grid>
 *
 * <style>
 *   @media (min-width: 768px) {
 *     uix-grid {
 *       --grid-columns: 2;
 *     }
 *   }
 *   @media (min-width: 1024px) {
 *     uix-grid {
 *       --grid-columns: 3;
 *     }
 *   }
 * </style>
 * ```
 *
 * @example
 * // Team member grid
 * ```html
 * <uix-grid min-column-width="200px" gap="lg">
 *   ${teamMembers.map(member => html`
 *     <uix-panel variant="elevated" style="text-align: center;">
 *       <uix-avatar size="xl" src=${member.photo}></uix-avatar>
 *       <h3>${member.name}</h3>
 *       <p>${member.role}</p>
 *       <uix-flex direction="horizontal" justify="center" spacing="sm">
 *         <uix-link href=${member.twitter}><uix-icon name="twitter"></uix-icon></uix-link>
 *         <uix-link href=${member.linkedin}><uix-icon name="linkedin"></uix-icon></uix-link>
 *       </uix-flex>
 *     </uix-panel>
 *   `)}
 * </uix-grid>
 * ```
 */
