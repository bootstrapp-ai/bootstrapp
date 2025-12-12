import Router from "/node_modules/@bootstrapp/router/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import { keyed } from "lit-html/directives/keyed.js";
import $APP from "/node_modules/@bootstrapp/base/app.js";

const getModelName = (name) => {
  if (!name) return name;
  if (name.endsWith("ies")) return `${name.slice(0, -3)}y`;
  if (name.endsWith("es")) return name.slice(0, -2);
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
};

const getColumns = (modelProps, selectedColumns = []) => {
  const columns = selectedColumns.map((columnName) => ({
    name: columnName,
    ...modelProps[columnName],
  }));
  return [{ name: "id" }, ...columns.filter((column) => column.name !== "id")];
};

export default {
  tag: "cms-crud",
  dataQuery: true,
  class: "flex flex-1 flex-col gap-4 w-full",
  properties: {
    rows: T.array(),
    allowedActions: T.array({
      defaultValue: ["import", "export", "changeViewMode", "changeColumns"],
    }),
    editId: T.string(),
    view: T.string({ defaultValue: "list", enum: ["list", "board"] }),
    selectedId: T.string(),
    selectedRow: T.object(),
    selectedColumns: T.array({
      sync: "local",
      scope: "data-query.model",
      defaultValue: [],
    }),
  },
  selectRow(row) {
    this.selectedId = row.id;
    this.selectedRow = row;
    this.q("uix-modal").show();
    const route = Router.create("cms_item", {
      model: this["data-query"].model,
      id: row.id,
    });
    Router.replace(route);
  },
  tableClick(row, e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      e.preventDefault();
      const route = Router.create("cms_item", {
        model: this["data-query"].model,
        id: row.id,
      });

      if (route) {
        window.open(route, "_blank");
      }
      return;
    }

    this.selectRow(row);
  },

  deselectRow(updateModal = true) {
    this.selectedId = undefined;
    this.selectedRow = undefined;
    if (updateModal) this.q("uix-modal").hide();
  },

  initializeDefaultColumns() {
    const { models } = $APP;
    const modelProps = models[this["data-query"].model];
    if (!modelProps) return;
    const prop = Object.entries(modelProps).find(
      ([name, prop]) => name !== "id" && prop.primary,
    )?.[0];
    this.selectedColumns = ["id", prop ?? Object.keys(modelProps)[0]];
  },

  toggleColumn(column) {
    if (column === "id") return;
    const currentColumns = [...(this.selectedColumns || [])];
    const index = currentColumns.indexOf(column);
    if (index === -1) currentColumns.push(column);
    else currentColumns.splice(index, 1);
    this.selectedColumns = currentColumns;
  },

  connected() {
    if (!this.selectedColumns || this.selectedColumns.length === 0) {
      this.initializeDefaultColumns();
    }
  },
  firstUpdated() {
    if (this.selectedId && !this.selectedRow) {
      setTimeout(() => {
        $APP.Model[this["data-query"].model]
          .get(this.selectedId)
          .then((row) => this.selectRow(row));
      }, 500);
    }
  },
  currentPage() {
    const { limit = 10, offset = 0 } = this["data-query"];
    if (offset < limit) return 1;
    return Math.floor(offset / limit) + 1;
  },

  Views: {
    list({ rows, count }) {
      const { models } = $APP;
      const { model, limit, offset } = this["data-query"];
      const modelProps = models[model];
      return html`
				<div class="flex flex-col gap-8">
					<uix-table
						class="w-full"
						.columns=${getColumns(modelProps, this.selectedColumns)}
						.rows=${rows}
						.selectRow=${this.tableClick.bind(this)}
					></uix-table>
					<uix-pagination
						count=${count || 0}
						limit=${limit || 10}
						offset=${offset || 0}
					></uix-pagination>
				</div>
			`;
    },
  },
  render() {
    const { selectedId, selectedRow, rows } = this;
    const { count, model } = this["data-query"];
    const { models } = $APP;
    const modelProps = models[model];
    if (!rows) return null;
    const modelName = getModelName(model);
    return html`
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<uix-input label="Search"></uix-input>
					<uix-modal
						.close=${() => this.deselectRow(false)}
						docked="right"
						label=${
              selectedId ? `Update ${modelName}` : `Create new ${modelName}`
            }
					>
						<uix-button
							icon="plus"
							variant="primary"
							label=${`New ${modelName}`}
							@click=${() => this.selectRow({ id: undefined })}
						></uix-button>
						<dialog>
							${keyed(
                selectedRow,
                selectedRow
                  ? html`
											<cms-form
												label=${
                          selectedRow.id
                            ? `Edit ${modelName} #${selectedRow.id}`
                            : `New ${modelName}`
                        }
												.row=${selectedRow}
												.data-query=${{
                          model,
                          method: selectedRow.id ? "edit" : "add",
                          id: selectedRow.id,
                          key: "row",
                        }}
												.close=${this.deselectRow.bind(this)}
											></cms-form>
									  `
                  : "",
              )}
						</dialog>
					</uix-modal>
				</div>
				<div class="flex items-center gap-8">
					${
            this.view === "board" ||
            (
              this.allowedActions &&
                !this.allowedActions?.includes("changeColumns")
            )
              ? null
              : html`<uix-link
								.dropdown=${html`
									${
                    modelProps &&
                    Object.keys(modelProps).map(
                      (prop) => html`<uix-input
											class="px-4 py-2"
											checkbox
											type="checkbox"
											label=${prop}
											?selected=${this.selectedColumns?.includes(prop)}
											@change=${() => this.toggleColumn(prop)}
											?disabled=${prop === "id"}
										></uix-input>`,
                    )
                  }
								`}
								label="Columns"
								icon="columns-3"
						  ></uix-link>`
          }
					${
            this.allowedActions && !this.allowedActions?.includes("import")
              ? null
              : html`
								<cms-import
									model=${model}
									.props=${modelProps}
									.fields=${this.fields}
								></cms-import>
						  `
          }
					${
            this.allowedActions && !this.allowedActions?.includes("export")
              ? null
              : html`<cms-export
								model=${model}
								.fields=${this.fields}
						  ></cms-export>`
          }
					${
            this.allowedActions &&
            !this.allowedActions?.includes("changeViewMode")
              ? null
              : html`<uix-link
								.dropdown=${html`
									${["list", "board"].map(
                    (view) => html`
											<uix-link
												class="px-4 py-2 capitalize"
												@click=${() => (this.view = view)}
												label=${view}
											></uix-link>
										`,
                  )}
								`}
								label="View Mode"
								icon="eye"
						  ></uix-link>`
          }
				</div>
			</div>
			${
        this.view === "board"
          ? html`
						<cms-board
							.rows=${rows}
							.data-query=${this["data-query"]}
							@new-item=${(e) => this.selectRow(e.detail)}
							@select-item=${(e) => this.selectRow(e.detail)}
						></cms-board>
				  `
          : this.Views.list.bind(this)?.({ rows, count })
      }
		`;
  },
};
