import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

const TypesRenderers = {
  [String]: (content) => content,
  [Boolean]: (content) =>
    content ? html`<uix-icon name="check"></uix-icon>` : null,
};

export default {
  tag: "uix-table",
  style: true,
  extends: "uix-card",
  properties: {
    columns: T.array({ defaultValue: [] }),
    rows: T.array({ defaultValue: [] }),
    selectRow: T.function(),
  },
  render() {
    return html`
        <div class="uix-table__header-group" role="rowgroup">
          <uix-list header>
            ${this.columns.map(
              (column) => html`<span 
						transform="uppercase" 
						text="center" 
						weight="semibold" 
						size="sm" 
						word-break="keep-all">${column.name || column}</span>`,
            )}
          </uix-list>
        </div>
        <div class="uix-table__row-group" role="rowgroup">
          ${this.rows?.map(
            (
              row,
            ) => html`<uix-list horizontal class=${this.selectRow ? "cursor-pointer" : null}
              @click=${this.selectRow ? ((e) => this.selectRow(row, e)).bind(this) : null}
            >
              ${this.columns.map((column) => {
                const name = typeof column === "string" ? column : column.name;
                const columnType =
                  typeof column === "string" ? "string" : column.type;
                return html`<span text="center" size="sm">
                      ${
                        TypesRenderers[columnType] &&
                        typeof TypesRenderers[columnType] === "function"
                          ? TypesRenderers[columnType](row[name])
                          : row[name]
                      }
                    </span>`;
              })}
            </uix-list>`,
          )}
        </div>
    `;
  },
};
