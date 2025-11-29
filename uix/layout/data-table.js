import T from "@bootstrapp/types";
import { html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export default {
  tag: "data-table",
  properties: {
    searchable: T.boolean(),
    sortable: T.boolean(),
    paginated: T.boolean(),
    pageSize: T.number(10),
    selectable: T.boolean(),
    responsive: T.boolean(true),
    searchQuery: T.string(""),
    currentPage: T.number(1),
    sortColumn: T.number(),
    sortDirection: T.string(), // 'asc', 'desc', or null
  },
  style: true,

  connected() {
    this.parseTableContent();
    this.filterAndSort();
  },

  parseTableContent() {
    const table = this.querySelector("table");
    if (!table) {
      console.warn("data-table: No <table> element found");
      this.headers = [];
      this.allRows = [];
      return;
    }

    // Parse headers
    const thead = table.querySelector("thead");
    const headerRow = thead?.querySelector("tr");
    this.headers = Array.from(headerRow?.querySelectorAll("th") || []).map(
      (th, index) => ({
        label: th.textContent.trim(),
        sortable: th.hasAttribute("data-sortable"),
        type: th.getAttribute("data-type") || "string",
        hidden: th.hasAttribute("data-hidden"),
        index,
      }),
    );

    // Parse rows
    const tbody = table.querySelector("tbody");
    this.allRows = Array.from(tbody?.querySelectorAll("tr") || []).map(
      (tr, rowIndex) => ({
        cells: Array.from(tr.querySelectorAll("td")).map((td) => td.innerHTML),
        selected: false,
        rowIndex,
      }),
    );

    // Remove original table
    table.remove();
  },

  filterAndSort() {
    let filtered = [...this.allRows];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((row) => {
        return row.cells.some((cellHTML, index) => {
          if (this.headers[index]?.hidden) return false;
          const cellText = this.stripHTML(cellHTML).toLowerCase();
          return cellText.includes(query);
        });
      });
    }

    // Apply sort
    if (this.sortColumn !== undefined && this.sortDirection) {
      const columnType = this.headers[this.sortColumn]?.type || "string";
      filtered.sort((a, b) => {
        const aText = this.stripHTML(a.cells[this.sortColumn] || "").trim();
        const bText = this.stripHTML(b.cells[this.sortColumn] || "").trim();

        let comparison = 0;

        if (columnType === "number") {
          comparison = (parseFloat(aText) || 0) - (parseFloat(bText) || 0);
        } else if (columnType === "date") {
          comparison = new Date(aText) - new Date(bText);
        } else {
          comparison = aText.localeCompare(bText);
        }

        return this.sortDirection === "asc" ? comparison : -comparison;
      });
    }

    this.filteredRows = filtered;
  },

  stripHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  },

  handleSearch(e) {
    this.searchQuery = e.target.value;
    this.currentPage = 1;
    this.filterAndSort();
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: { query: this.searchQuery, results: this.filteredRows.length },
      }),
    );
  },

  handleSort(columnIndex) {
    if (!this.headers[columnIndex]?.sortable) return;

    if (this.sortColumn === columnIndex) {
      if (this.sortDirection === "asc") {
        this.sortDirection = "desc";
      } else if (this.sortDirection === "desc") {
        this.sortColumn = undefined;
        this.sortDirection = null;
      } else {
        this.sortDirection = "asc";
      }
    } else {
      this.sortColumn = columnIndex;
      this.sortDirection = "asc";
    }

    this.filterAndSort();
    this.dispatchEvent(
      new CustomEvent("sort", {
        detail: {
          column: this.sortColumn,
          direction: this.sortDirection,
          type: this.headers[columnIndex]?.type,
        },
      }),
    );
  },

  handleSelectAll(e) {
    const checked = e.target.checked;
    const visibleRows = this.getVisibleRows();

    this.allRows = this.allRows.map((row) => {
      if (visibleRows.includes(row)) {
        return { ...row, selected: checked };
      }
      return row;
    });

    this.dispatchRowSelectEvent();
  },

  handleRowSelect(rowIndex, e) {
    const checked = e.target.checked;
    this.allRows = this.allRows.map((row) => {
      if (row.rowIndex === rowIndex) {
        return { ...row, selected: checked };
      }
      return row;
    });

    this.dispatchRowSelectEvent();
  },

  dispatchRowSelectEvent() {
    const selectedRows = this.allRows.filter((row) => row.selected);
    this.dispatchEvent(
      new CustomEvent("row-select", {
        detail: { selectedRows, count: selectedRows.length },
      }),
    );
  },

  handlePageChange(page) {
    this.currentPage = page;
    this.dispatchEvent(
      new CustomEvent("page-change", {
        detail: { page: this.currentPage },
      }),
    );
  },

  getVisibleRows() {
    if (!this.paginated) {
      return this.filteredRows;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredRows.slice(startIndex, endIndex);
  },

  getTotalPages() {
    return Math.ceil((this.filteredRows?.length || 0) / this.pageSize);
  },

  render() {
    if (!this.headers || !this.allRows) {
      return html`<div class="uix-data-table">Loading...</div>`;
    }

    const visibleRows = this.getVisibleRows();
    const totalPages = this.getTotalPages();
    const visibleHeaders = this.headers.filter((h) => !h.hidden);
    const visibleSelected = visibleRows.filter((r) => r.selected);
    const allVisibleSelected =
      visibleRows.length > 0 && visibleSelected.length === visibleRows.length;

    return html`
      <div class="uix-data-table">
        ${
          this.searchable || this.paginated
            ? html`
              <div class="data-table-controls">
                ${
                  this.searchable
                    ? html`
                      <div class="data-table-search">
                        <input
                          type="search"
                          class="search-input"
                          placeholder="Search..."
                          .value=${this.searchQuery}
                          @input=${this.handleSearch.bind(this)}
                          aria-label="Search table"
                        />
                      </div>
                    `
                    : ""
                }
                ${
                  this.paginated
                    ? html`
                      <div class="data-table-pagination">
                        <span class="pagination-info">
                          ${
                            this.filteredRows.length > 0
                              ? (this.currentPage - 1) * this.pageSize + 1
                              : 0
                          }-${Math.min(
                            this.currentPage * this.pageSize,
                            this.filteredRows.length,
                          )}
                          of ${this.filteredRows.length}
                        </span>
                        <button
                          class="pagination-btn prev"
                          ?disabled=${this.currentPage === 1}
                          @click=${() => this.handlePageChange(this.currentPage - 1)}
                          aria-label="Previous page"
                        >
                          ‹
                        </button>
                        <span class="pagination-current">
                          Page ${this.currentPage} of ${totalPages || 1}
                        </span>
                        <button
                          class="pagination-btn next"
                          ?disabled=${this.currentPage >= totalPages}
                          @click=${() => this.handlePageChange(this.currentPage + 1)}
                          aria-label="Next page"
                        >
                          ›
                        </button>
                      </div>
                    `
                    : ""
                }
              </div>
            `
            : ""
        }

        <table>
          <thead>
            <tr>
              ${
                this.selectable
                  ? html`
                    <th style="width: 40px">
                      <input
                        type="checkbox"
                        class="select-all"
                        .checked=${allVisibleSelected}
                        @change=${this.handleSelectAll.bind(this)}
                        aria-label="Select all rows"
                      />
                    </th>
                  `
                  : ""
              }
              ${visibleHeaders.map(
                (header) => html`
                  <th
                    class=${
                      header.sortable &&
                      this.sortColumn === header.index &&
                      this.sortDirection
                        ? `sorted-${this.sortDirection}`
                        : ""
                    }
                    @click=${() =>
                      header.sortable && this.handleSort(header.index)}
                    style=${header.sortable ? "cursor: pointer; user-select: none;" : ""}
                  >
                    ${header.label}
                  </th>
                `,
              )}
            </tr>
          </thead>
          <tbody>
            ${
              visibleRows.length === 0
                ? html`
                  <tr>
                    <td
                      colspan=${
                        this.selectable
                          ? visibleHeaders.length + 1
                          : visibleHeaders.length
                      }
                      class="data-table-empty"
                    >
                      No results found
                    </td>
                  </tr>
                `
                : visibleRows.map(
                    (row) => html`
                    <tr class=${row.selected ? "selected" : ""}>
                      ${
                        this.selectable
                          ? html`
                            <td>
                              <input
                                type="checkbox"
                                class="select-row"
                                ?checked=${row.selected}
                                @change=${(e) =>
                                  this.handleRowSelect(row.rowIndex, e)}
                                aria-label="Select row"
                              />
                            </td>
                          `
                          : ""
                      }
                      ${row.cells.map((cellHTML, cellIndex) =>
                        this.headers[cellIndex]?.hidden
                          ? ""
                          : html`<td>${unsafeHTML(cellHTML)}</td>`,
                      )}
                    </tr>
                  `,
                  )
            }
          </tbody>
        </table>
      </div>
    `;
  },
};

/**
 * Data Table Component
 *
 * @component
 * @category layout
 * @tag uix-data-table
 *
 * A feature-rich data table component that progressively enhances existing
 * HTML table markup with search, sort, pagination, row selection, and more.
 *
 * @example Basic Data Table
 * ```html
 * <uix-data-table>
 *   <table>
 *     <thead>
 *       <tr>
 *         <th>Name</th>
 *         <th>Age</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr><td>Alice</td><td>30</td></tr>
 *       <tr><td>Bob</td><td>25</td></tr>
 *     </tbody>
 *   </table>
 * </uix-data-table>
 * ```
 *
 * @example Searchable and Sortable Table
 * ```html
 * <uix-data-table searchable sortable>
 *   <table>
 *     <thead>
 *       <tr>
 *         <th data-sortable data-type="string">Name</th>
 *         <th data-sortable data-type="number">Age</th>
 *         <th>Actions</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr><td>Alice</td><td>30</td><td><button>Edit</button></td></tr>
 *       <tr><td>Bob</td><td>25</td><td><button>Edit</button></td></tr>
 *     </tbody>
 *   </table>
 * </uix-data-table>
 * ```
 *
 * @example With Pagination and Selection
 * ```html
 * <uix-data-table paginated selectable page-size="5">
 *   <table>
 *     <!-- table content -->
 *   </table>
 * </uix-data-table>
 * ```
 *
 * @example Full Featured Table
 * ```html
 * <uix-data-table searchable sortable paginated selectable responsive page-size="10">
 *   <table>
 *     <thead>
 *       <tr>
 *         <th data-sortable data-type="string">Name</th>
 *         <th data-sortable data-type="number">Score</th>
 *         <th data-sortable data-type="date">Date</th>
 *         <th data-hidden>Hidden Column</th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <!-- rows -->
 *     </tbody>
 *   </table>
 * </uix-data-table>
 * ```
 */
