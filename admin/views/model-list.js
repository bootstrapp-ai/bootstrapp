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
  style: true,
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

  render() {
    const { rows, model, selectedRow, modalOpen, confirmDelete } = this;
    const modelName = getSingularName(model);
    const schema = getModelSchema(model);
    const columns = this.getColumns();
    const filteredRows = this.filterRows(rows || []);

    return html`
      <div class="admin-model-list">
        <!-- Header -->
        <div class="admin-model-list-header">
          <div>
            <h1 class="admin-model-list-title">${capitalize(model)}</h1>
            <p class="admin-model-list-count">${filteredRows.length} records</p>
          </div>

          <div class="admin-model-list-actions">
            <!-- Column Selector -->
            <uix-dropdown>
              <uix-button slot="trigger" ghost>
                <uix-icon name="columns-3" size="18"></uix-icon>
                Columns
              </uix-button>
              <div class="admin-dropdown-content">
                ${schema.map(
                  (field) => html`
                    <label class="admin-dropdown-item">
                      <uix-checkbox
                        ?checked=${this.selectedColumns?.includes(field.name)}
                        ?disabled=${field.name === "id"}
                        @change=${() => this.toggleColumn(field.name)}
                      ></uix-checkbox>
                      <span>${field.label || field.name}</span>
                    </label>
                  `,
                )}
              </div>
            </uix-dropdown>

            <!-- Group By Field Selector (Board Mode) -->
            ${
              this.viewMode === "board"
                ? html`
                  <uix-dropdown>
                    <uix-button slot="trigger" ghost>
                      <uix-icon name="layers" size="18"></uix-icon>
                      ${
                        this.groupByField
                          ? capitalize(this.groupByField)
                          : "No Grouping"
                      }
                    </uix-button>
                    <div class="admin-dropdown-content">
                      <button
                        class="admin-dropdown-item ${!this.groupByField ? "active" : ""}"
                        @click=${() => (this.groupByField = "")}
                      >
                        <uix-icon name="layout-grid" size="16"></uix-icon>
                        No Grouping
                      </button>
                      ${this.getGroupableFields().map(
                        (field) => html`
                          <button
                            class="admin-dropdown-item ${this.groupByField === field.name ? "active" : ""}"
                            @click=${() => (this.groupByField = field.name)}
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
                  </uix-dropdown>
                `
                : ""
            }

            <!-- View Mode Toggle -->
            <div class="admin-view-toggle">
              <uix-button
                ghost
                size="sm"
                ?primary=${this.viewMode === "list"}
                @click=${() => (this.viewMode = "list")}
              >
                <uix-icon name="list" size="18"></uix-icon>
              </uix-button>
              <uix-button
                ghost
                size="sm"
                ?primary=${this.viewMode === "board"}
                @click=${() => (this.viewMode = "board")}
              >
                <uix-icon name="kanban" size="18"></uix-icon>
              </uix-button>
            </div>

            <!-- Import/Export -->
            <admin-import .model=${model}></admin-import>
            <admin-export .model=${model} .rows=${rows}></admin-export>

            <!-- New Button -->
            <uix-button primary @click=${this.openCreateForm}>
              <uix-icon name="plus" size="20"></uix-icon>
              New ${capitalize(modelName)}
            </uix-button>
          </div>
        </div>

        <!-- Search -->
        <div class="admin-model-list-search">
          <uix-input
            type="search"
            placeholder="Search..."
            icon="search"
            .value=${this.searchQuery}
            @input=${(e) => (this.searchQuery = e.target.value)}
          ></uix-input>
        </div>

        <!-- Content Area -->
        ${
          this.viewMode === "board"
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
                <uix-data-table
                  .data-query=${{ model, key: "rows" }}
                  .columns=${columns}
                  .selectRow=${(row) => this.openEditForm(row)}
                ></uix-data-table>
            `
        }

        <!-- Edit/Create Modal -->
        <uix-modal
          ?open=${modalOpen}
          @close=${this.closeModal}
          title=${selectedRow?.id ? `Edit ${modelName}` : `New ${modelName}`}
        >
          ${
            modalOpen
              ? keyed(
                  selectedRow,
                  html`
                  <admin-model-form
                    .model=${model}
                    .row=${selectedRow}
                    @submit=${this.handleFormSubmit}
                    @delete=${() => (this.confirmDelete = true)}
                  ></admin-model-form>
                `,
                )
              : ""
          }
        </uix-modal>

        <!-- Delete Confirmation Modal -->
        <uix-modal
          ?open=${confirmDelete}
          @close=${() => (this.confirmDelete = false)}
          title="Delete ${modelName}?"
          size="sm"
        >
          <div class="admin-delete-confirm">
            <div class="admin-delete-icon">
              <uix-icon name="alert-triangle" size="24"></uix-icon>
            </div>
            <div>
              <p class="admin-delete-title">Delete ${modelName}?</p>
              <p class="admin-delete-text">This action cannot be undone.</p>
            </div>
          </div>
          <div slot="footer" class="admin-modal-footer">
            <uix-button ghost @click=${() => (this.confirmDelete = false)}>
              Cancel
            </uix-button>
            <uix-button danger @click=${this.handleDelete}>
              Delete
            </uix-button>
          </div>
        </uix-modal>
      </div>
    `;
  },
};
