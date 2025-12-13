import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-data-table",
  style: true,
  properties: {
    "data-query": T.object(),
    columns: T.array(),
    rows: T.array(),
    selectRow: T.function(),
    emptyMessage: T.string({ defaultValue: "No data" }),
    // Pagination state
    page: T.number({ defaultValue: 1 }),
    limit: T.number({ defaultValue: 10 }),
    total: T.number({ defaultValue: 0 }),
    showPagination: T.boolean({ defaultValue: true }),
    // Sorting
    sortBy: T.string(),
    sortDir: T.string({ defaultValue: "asc" }),
  },

  handleDataLoaded(e) {
    const { total, limit, offset } = e.detail;
    this.total = total;
    this.limit = limit;
    this.offset = offset;
    this.totalPages = Math.ceil(this.total / this.limit) || 1;
  },

  handlePageChange(e) {
    const newPage = e.detail.page;
    this.page = newPage;
    // Update data-query to trigger re-fetch via uix-table
    this["data-query"] = {
      ...this["data-query"],
      limit: this.limit,
      offset: (newPage - 1) * this.limit,
    };
  },
  render() {
    return html`
      <uix-table
        .data-query=${{ ...this["data-query"], limit: this.limit }}
        .columns=${this.columns}
        .selectRow=${this.selectRow}
        @dataLoaded=${this.handleDataLoaded}
      ></uix-table>
      ${
        this.showPagination && this.totalPages > 1
          ? html`
            <uix-pagination
              .current=${this.page}
              .total=${this.totalPages}
              @change=${this.handlePageChange}
            ></uix-pagination>
          `
          : ""
      }
    `;
  },
};
