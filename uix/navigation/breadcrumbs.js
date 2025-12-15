import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-breadcrumbs",
  properties: {
    separator: T.string({
      defaultValue: "/",
      enum: ["/", ">", "→", "·", "|"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    items: T.array([]),
  },
  style: true,
  shadow: false,

  connected() {
    this._parseItems();
  },

  updated() {
    this._parseItems();
  },

  _parseItems() {
    // Parse items from children only on first render
    if (this.items.length === 0) {
      const itemElements = Array.from(
        this.querySelectorAll(":scope > a, :scope > span"),
      );
      if (itemElements.length > 0) {
        this.items = itemElements.map((item, index) => ({
          text: item.textContent,
          href: item.getAttribute("href"),
          isLast: index === itemElements.length - 1,
        }));
        // Remove original children since we'll render them
        itemElements.forEach((el) => el.remove());
      }
    }
  },

  render() {
    return html`
      <nav part="container" class="breadcrumbs" aria-label="Breadcrumb">
        <ol part="list" class="breadcrumbs-list">
          ${this.items.map(
            (item, index) => html`
              <li class="breadcrumbs-item">
                ${
                  item.href
                    ? html`<uix-link href=${item.href}>${item.text}</uix-link>`
                    : html`<span class="current">${item.text}</span>`
                }
                ${
                  index < this.items.length - 1
                    ? html`<span class="separator">${this.separator}</span>`
                    : ""
                }
              </li>
            `,
          )}
        </ol>
      </nav>
    `;
  },
};

/**
 * Breadcrumbs Component
 *
 * @component
 * @category navigation
 * @tag uix-breadcrumbs
 *
 * Breadcrumb navigation showing the current page's location within the site hierarchy.
 *
 * @example
 * // Basic breadcrumbs
 * ```html
 * <uix-breadcrumbs>
 *   <a href="/">Home</a>
 *   <a href="/products">Products</a>
 *   <span>Laptop</span>
 * </uix-breadcrumbs>
 * ```
 *
 * @example
 * // Different separators
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-breadcrumbs separator="/">
 *     <a href="/">Home</a>
 *     <a href="/docs">Docs</a>
 *     <span>Components</span>
 *   </uix-breadcrumbs>
 *
 *   <uix-breadcrumbs separator=">">
 *     <a href="/">Home</a>
 *     <a href="/docs">Docs</a>
 *     <span>Components</span>
 *   </uix-breadcrumbs>
 *
 *   <uix-breadcrumbs separator="→">
 *     <a href="/">Home</a>
 *     <a href="/docs">Docs</a>
 *     <span>Components</span>
 *   </uix-breadcrumbs>
 *
 *   <uix-breadcrumbs separator="·">
 *     <a href="/">Home</a>
 *     <a href="/docs">Docs</a>
 *     <span>Components</span>
 *   </uix-breadcrumbs>
 * </div>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-breadcrumbs size="sm">
 *     <a href="/">Home</a>
 *     <a href="/products">Products</a>
 *     <span>Item</span>
 *   </uix-breadcrumbs>
 *
 *   <uix-breadcrumbs size="md">
 *     <a href="/">Home</a>
 *     <a href="/products">Products</a>
 *     <span>Item</span>
 *   </uix-breadcrumbs>
 *
 *   <uix-breadcrumbs size="lg">
 *     <a href="/">Home</a>
 *     <a href="/products">Products</a>
 *     <span>Item</span>
 *   </uix-breadcrumbs>
 * </div>
 * ```
 *
 * @example
 * // With icons
 * ```html
 * <uix-breadcrumbs>
 *   <a href="/">
 *     <uix-icon name="house"></uix-icon>
 *     Home
 *   </a>
 *   <a href="/settings">
 *     <uix-icon name="settings"></uix-icon>
 *     Settings
 *   </a>
 *   <span>
 *     <uix-icon name="user"></uix-icon>
 *     Profile
 *   </span>
 * </uix-breadcrumbs>
 * ```
 *
 * @example
 * // Deep navigation
 * ```html
 * <uix-breadcrumbs>
 *   <a href="/">Home</a>
 *   <a href="/docs">Documentation</a>
 *   <a href="/docs/components">Components</a>
 *   <a href="/docs/components/navigation">Navigation</a>
 *   <span>Breadcrumbs</span>
 * </uix-breadcrumbs>
 * ```
 */
