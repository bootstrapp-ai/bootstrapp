import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-pagination",
  properties: {
    current: T.number({ defaultValue: 1 }),
    total: T.number({ defaultValue: 1 }),
    siblings: T.number({ defaultValue: 1 }), // Number of pages to show on each side of current
    showFirst: T.boolean(true),
    showLast: T.boolean(true),
    showPrevNext: T.boolean(true),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
  },
  style: true,
  shadow: false,

  goToPage(page) {
    if (page < 1 || page > this.total || page === this.current) return;
    this.current = page;
    this.emit("change", { page: this.current });
  },

  next() {
    this.goToPage(this.current + 1);
  },

  prev() {
    this.goToPage(this.current - 1);
  },

  _getPageNumbers() {
    const pages = [];
    const leftSibling = Math.max(1, this.current - this.siblings);
    const rightSibling = Math.min(this.total, this.current + this.siblings);

    // Show first page
    if (this.showFirst && leftSibling > 1) {
      pages.push(1);
      if (leftSibling > 2) {
        pages.push("...");
      }
    }

    // Show sibling pages
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    // Show last page
    if (this.showLast && rightSibling < this.total) {
      if (rightSibling < this.total - 1) {
        pages.push("...");
      }
      pages.push(this.total);
    }

    return pages;
  },

  render() {
    const pages = this._getPageNumbers();
    const hasPrev = this.current > 1;
    const hasNext = this.current < this.total;

    return html`
      <nav class="pagination" role="navigation" aria-label="Pagination">
        <ul class="pagination-list">
          ${
            this.showPrevNext
              ? html`
                <li>
                  <button
                    class="pagination-button prev"
                    ?disabled=${!hasPrev}
                    @click=${this.prev}
                    aria-label="Previous page"
                  >
                    <uix-icon name="chevron-left"></uix-icon>
                  </button>
                </li>
              `
              : ""
          }

          ${pages.map((page) =>
            page === "..."
              ? html`<li><span class="pagination-ellipsis">…</span></li>`
              : html`
                  <li>
                    <button
                      class="pagination-button ${page === this.current ? "active" : ""}"
                      @click=${() => this.goToPage(page)}
                      aria-label="Page ${page}"
                      aria-current=${page === this.current ? "page" : "false"}
                    >
                      ${page}
                    </button>
                  </li>
                `,
          )}

          ${
            this.showPrevNext
              ? html`
                <li>
                  <button
                    class="pagination-button next"
                    ?disabled=${!hasNext}
                    @click=${this.next}
                    aria-label="Next page"
                  >
                    <uix-icon name="chevron-right"></uix-icon>
                  </button>
                </li>
              `
              : ""
          }
        </ul>
      </nav>
    `;
  },
};

/**
 * Pagination Component
 *
 * @component
 * @category navigation
 * @tag uix-pagination
 *
 * Pagination controls for navigating through pages of content.
 *
 * @example
 * // Basic pagination
 * ```html
 * <uix-pagination current="1" total="10"></uix-pagination>
 * ```
 *
 * @example
 * // Current page in middle
 * ```html
 * <uix-pagination current="5" total="10"></uix-pagination>
 * ```
 *
 * @example
 * // Many pages with ellipsis
 * ```html
 * <uix-pagination current="15" total="50"></uix-pagination>
 * ```
 *
 * @example
 * // More siblings (show more pages around current)
 * ```html
 * <uix-pagination current="10" total="20" siblings="2"></uix-pagination>
 * ```
 *
 * @example
 * // Without first/last
 * ```html
 * <uix-pagination
 *   current="5"
 *   total="10"
 *   show-first="false"
 *   show-last="false"
 * ></uix-pagination>
 * ```
 *
 * @example
 * // Without prev/next arrows
 * ```html
 * <uix-pagination
 *   current="5"
 *   total="10"
 *   show-prev-next="false"
 * ></uix-pagination>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-pagination size="sm" current="3" total="7"></uix-pagination>
 *   <uix-pagination size="md" current="3" total="7"></uix-pagination>
 *   <uix-pagination size="lg" current="3" total="7"></uix-pagination>
 * </div>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-pagination
 *   current="1"
 *   total="20"
 *   @change=${(e) => this.loadPage(e.detail.page)}
 * ></uix-pagination>`
 * ```
 *
 * @example
 * // Complete pagination example with data
 * ```js
 * html`
 *   <div>
 *     <div class="data-grid">
 *       ${this.currentPageData.map(item => html`<div>${item.name}</div>`)}
 *     </div>
 *
 *     <uix-pagination
 *       .current=${this.currentPage}
 *       .total=${Math.ceil(this.totalItems / this.itemsPerPage)}
 *       @change=${(e) => {
 *         this.currentPage = e.detail.page;
 *         this.loadData();
 *       }}
 *     ></uix-pagination>
 *
 *     <p>
 *       Showing ${(this.currentPage - 1) * this.itemsPerPage + 1} to
 *       ${Math.min(this.currentPage * this.itemsPerPage, this.totalItems)} of
 *       ${this.totalItems} items
 *     </p>
 *   </div>
 * `
 * ```
 */
