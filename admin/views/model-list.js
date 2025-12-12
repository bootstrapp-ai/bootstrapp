import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import { keyed } from "/npm/lit-html/directives/keyed.js";
import {
  capitalize,
  getDisplayColumns,
  getModelSchema,
  getSingularName,
} from "../utils/model-utils.js";

export default {
  tag: "admin-model-list",
  dataQuery: true,
  properties: {
    rows: T.array(),
    model: T.string(),
    selectedRow: T.object(),
    selectedColumns: T.array({ sync: "local", scope: "model" }),
    viewMode: T.string({ defaultValue: "list", enum: ["list", "board"] }),
    groupByField: T.string({ sync: "local", scope: "model", defaultValue: "" }),
    modalOpen: T.boolean({ defaultValue: false }),
    confirmDelete: T.boolean({ defaultValue: false }),
    searchQuery: T.string({ defaultValue: "" }),
  },

  connected() {
    if (!this.selectedColumns || this.selectedColumns.length === 0) {
      this.selectedColumns = getDisplayColumns(this.model);
    }
  },

  getColumns() {
    const schema = getModelSchema(this.model);
    return this.selectedColumns
      .map((colName) => {
        const field = schema.find((f) => f.name === colName);
        return {
          name: colName,
          label: field?.label || capitalize(colName),
          type: field?.type || "string",
          sortable: true,
        };
      })
      .filter(Boolean);
  },

  getGroupableFields() {
    const schema = getModelSchema(this.model);
    // Prioritize enum and relationship fields, then string fields
    const groupable = schema.filter((f) => {
      const type = f.type?.toLowerCase() || "";
      return (
        f.enum ||
        type === "enum" ||
        type === "belongs" ||
        type === "string" ||
        type === "boolean"
      );
    });
    // Sort: enums first, then relationships, then others
    return groupable.sort((a, b) => {
      const aScore = a.enum ? 0 : a.type === "belongs" ? 1 : 2;
      const bScore = b.enum ? 0 : b.type === "belongs" ? 1 : 2;
      return aScore - bScore;
    });
  },

  openCreateForm() {
    this.selectedRow = {};
    this.modalOpen = true;
  },

  openEditForm(row) {
    this.selectedRow = { ...row };
    this.modalOpen = true;
  },

  closeModal() {
    this.modalOpen = false;
    this.selectedRow = null;
    this.confirmDelete = false;
  },

  async handleFormSubmit(e) {
    const data = e.detail;
    try {
      if (data.id) {
        await $APP.Model[this.model].edit(data);
      } else {
        await $APP.Model[this.model].add(data);
      }
      this.closeModal();
      // Trigger refresh by re-fetching
      this.dispatchEvent(new CustomEvent("refresh"));
    } catch (error) {
      console.error("Error saving:", error);
      alert(`Error: ${error.message}`);
    }
  },

  async handleDelete() {
    if (!this.selectedRow?.id) return;

    try {
      await $APP.Model[this.model].remove(this.selectedRow.id);
      this.closeModal();
      this.dispatchEvent(new CustomEvent("refresh"));
    } catch (error) {
      console.error("Error deleting:", error);
      alert(`Error: ${error.message}`);
    }
  },

  toggleColumn(column) {
    if (column === "id") return;
    const current = [...(this.selectedColumns || [])];
    const index = current.indexOf(column);
    if (index === -1) {
      current.push(column);
    } else {
      current.splice(index, 1);
    }
    this.selectedColumns = current;
  },

  filterRows(rows) {
    if (!this.searchQuery) return rows;
    const query = this.searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query),
      ),
    );
  },

  formatCellValue(value, type) {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    if (typeof value === "object") {
      return JSON.stringify(value).slice(0, 50) + "...";
    }
    if (type === "date" && value) {
      return new Date(value).toLocaleDateString();
    }
    const str = String(value);
    return str.length > 50 ? str.slice(0, 50) + "..." : str;
  },

  render() {
    const { rows, model, selectedRow, modalOpen, confirmDelete } = this;
    const modelName = getSingularName(model);
    const schema = getModelSchema(model);
    const columns = this.getColumns();
    const filteredRows = this.filterRows(rows || []);

    return html`
      <div class="p-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-black uppercase">${capitalize(model)}</h1>
            <p class="text-gray-600">${filteredRows.length} records</p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Column Selector -->
            <div class="relative group">
              <button
                class="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg
                       hover:bg-gray-100 transition-colors"
              >
                <uix-icon name="columns-3" size="18"></uix-icon>
                Columns
              </button>
              <div
                class="absolute right-0 mt-2 w-48 bg-white border-3 border-black rounded-xl
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 hidden group-hover:block"
              >
                <div class="p-2 max-h-64 overflow-y-auto">
                  ${schema.map(
                    (field) => html`
                      <label
                        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          ?checked=${this.selectedColumns?.includes(field.name)}
                          ?disabled=${field.name === "id"}
                          @change=${() => this.toggleColumn(field.name)}
                          class="w-4 h-4"
                        />
                        <span class="text-sm">${field.label || field.name}</span>
                      </label>
                    `,
                  )}
                </div>
              </div>
            </div>

            <!-- Group By Field Selector (Board Mode) -->
            ${this.viewMode === "board"
              ? html`
                  <div class="relative group">
                    <button
                      class="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg
                             hover:bg-gray-100 transition-colors"
                    >
                      <uix-icon name="layers" size="18"></uix-icon>
                      ${this.groupByField
                        ? capitalize(this.groupByField)
                        : "No Grouping"}
                    </button>
                    <div
                      class="absolute right-0 mt-2 w-48 bg-white border-3 border-black rounded-xl
                             shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 hidden group-hover:block"
                    >
                      <div class="p-2 max-h-64 overflow-y-auto">
                        <button
                          @click=${() => (this.groupByField = "")}
                          class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg text-left
                                 ${!this.groupByField ? "bg-gray-100 font-bold" : ""}"
                        >
                          <uix-icon name="layout-grid" size="16"></uix-icon>
                          No Grouping
                        </button>
                        ${this.getGroupableFields().map(
                          (field) => html`
                            <button
                              @click=${() => (this.groupByField = field.name)}
                              class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg text-left
                                     ${this.groupByField === field.name ? "bg-gray-100 font-bold" : ""}"
                            >
                              <uix-icon
                                name=${field.enum ? "list-filter" : field.type === "belongs" ? "link" : "type"}
                                size="16"
                              ></uix-icon>
                              ${field.label || capitalize(field.name)}
                            </button>
                          `,
                        )}
                      </div>
                    </div>
                  </div>
                `
              : ""}

            <!-- View Mode Toggle -->
            <div class="flex border-2 border-black rounded-lg overflow-hidden">
              <button
                @click=${() => (this.viewMode = "list")}
                class="flex items-center gap-2 px-3 py-2 transition-colors
                       ${this.viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-100"}"
              >
                <uix-icon name="list" size="18"></uix-icon>
              </button>
              <button
                @click=${() => (this.viewMode = "board")}
                class="flex items-center gap-2 px-3 py-2 transition-colors
                       ${this.viewMode === "board" ? "bg-black text-white" : "hover:bg-gray-100"}"
              >
                <uix-icon name="kanban" size="18"></uix-icon>
              </button>
            </div>

            <!-- Import/Export -->
            <admin-import .model=${model}></admin-import>
            <admin-export .model=${model} .rows=${rows}></admin-export>

            <!-- New Button -->
            <button
              @click=${this.openCreateForm}
              class="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold
                     rounded-xl border-3 border-black
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
                     transition-all duration-150"
            >
              <uix-icon name="plus" size="20"></uix-icon>
              New ${capitalize(modelName)}
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="mb-6">
          <div class="relative max-w-md">
            <uix-icon
              name="search"
              size="20"
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            ></uix-icon>
            <input
              type="search"
              placeholder="Search..."
              .value=${this.searchQuery}
              @input=${(e) => (this.searchQuery = e.target.value)}
              class="w-full pl-12 pr-4 py-3 border-3 border-black rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <!-- Content Area -->
        ${this.viewMode === "board"
          ? html`
              <admin-board
                .model=${model}
                .rows=${filteredRows}
                .groupByField=${this.groupByField}
                @select-item=${(e) => this.openEditForm(e.detail)}
                @new-item=${(e) => {
                  this.selectedRow = e.detail || {};
                  this.modalOpen = true;
                }}
              ></admin-board>
            `
          : html`
              <!-- Data Table -->
              <div
                class="bg-white border-3 border-black rounded-2xl overflow-hidden
                       shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                ${filteredRows.length === 0
                  ? html`
                      <div class="p-12 text-center text-gray-500">
                        <uix-icon name="inbox" size="48" class="mx-auto mb-4 opacity-50"></uix-icon>
                        <p class="text-lg font-medium">No records found</p>
                        <p class="text-sm">Create a new ${modelName} to get started</p>
                      </div>
                    `
                  : html`
                      <div class="overflow-x-auto">
                        <table class="w-full">
                          <thead class="bg-gray-100 border-b-3 border-black">
                            <tr>
                              ${columns.map(
                                (col) => html`
                                  <th
                                    class="px-4 py-3 text-left text-sm font-black uppercase tracking-wide"
                                  >
                                    ${col.label}
                                  </th>
                                `,
                              )}
                              <th class="px-4 py-3 text-right text-sm font-black uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200">
                            ${filteredRows.map(
                              (row) => html`
                                <tr
                                  class="hover:bg-gray-50 cursor-pointer transition-colors"
                                  @click=${() => this.openEditForm(row)}
                                >
                                  ${columns.map(
                                    (col) => html`
                                      <td class="px-4 py-3 text-sm">
                                        ${this.formatCellValue(row[col.name], col.type)}
                                      </td>
                                    `,
                                  )}
                                  <td class="px-4 py-3 text-right">
                                    <button
                                      @click=${(e) => {
                                        e.stopPropagation();
                                        this.openEditForm(row);
                                      }}
                                      class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <uix-icon name="pen" size="18"></uix-icon>
                                    </button>
                                  </td>
                                </tr>
                              `,
                            )}
                          </tbody>
                        </table>
                      </div>
                    `}
              </div>
            `}

        <!-- Edit/Create Modal -->
        ${
          modalOpen
            ? html`
              <div
                class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                @click=${(e) => {
                  if (e.target === e.currentTarget) this.closeModal();
                }}
              >
                <div
                  class="bg-white border-3 border-black rounded-2xl w-full max-w-2xl max-h-[90vh]
                         shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
                >
                  <!-- Modal Header -->
                  <div
                    class="flex items-center justify-between px-6 py-4 border-b-3 border-black bg-gray-50"
                  >
                    <h2 class="text-xl font-black uppercase">
                      ${selectedRow?.id ? `Edit ${modelName}` : `New ${modelName}`}
                    </h2>
                    <button
                      @click=${this.closeModal}
                      class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <uix-icon name="x" size="24"></uix-icon>
                    </button>
                  </div>

                  <!-- Modal Body -->
                  <div class="flex-1 overflow-y-auto p-6">
                    ${keyed(
                      selectedRow,
                      html`
                        <admin-model-form
                          .model=${model}
                          .row=${selectedRow}
                          @submit=${this.handleFormSubmit}
                          @delete=${() => (this.confirmDelete = true)}
                        ></admin-model-form>
                      `,
                    )}
                  </div>
                </div>
              </div>
            `
            : ""
        }

        <!-- Delete Confirmation -->
        ${
          confirmDelete
            ? html`
              <div
                class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
              >
                <div
                  class="bg-white border-3 border-black rounded-2xl p-6 max-w-md
                         shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div class="flex items-center gap-4 mb-4">
                    <div class="p-3 bg-red-100 rounded-full">
                      <uix-icon name="alert-triangle" size="24" class="text-red-600"></uix-icon>
                    </div>
                    <div>
                      <h3 class="font-black text-lg">Delete ${modelName}?</h3>
                      <p class="text-gray-600 text-sm">This action cannot be undone.</p>
                    </div>
                  </div>
                  <div class="flex gap-4">
                    <button
                      @click=${() => (this.confirmDelete = false)}
                      class="flex-1 px-4 py-3 border-3 border-black rounded-xl font-bold
                             hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      @click=${this.handleDelete}
                      class="flex-1 px-4 py-3 bg-red-500 text-white border-3 border-black
                             rounded-xl font-bold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `
            : ""
        }
      </div>
    `;
  },
};
