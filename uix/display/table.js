import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

const TypesRenderers = {
  [String]: (content) => content,
  [Boolean]: (content) =>
    content ? html`<uix-icon name="check"></uix-icon>` : null,
};

export default {
  tag: "uix-table",
  style: true,
  dataQuery: true,
  properties: {
    columns: T.array({ defaultValue: [] }),
    rows: T.array({ defaultValue: [] }),
    selectRow: T.function(),
  },
  render() {
    return html`
      <table>
        <thead>
          <tr>
            ${this.columns.map(
              (column) => html`
                <th>${column.name || column.label || column}</th>
              `,
            )}
          </tr>
        </thead>
        <tbody>
          ${this.rows?.map(
            (row) => html`
              <tr
                class=${this.selectRow ? "clickable" : ""}
                @click=${this.selectRow ? (e) => this.selectRow(row, e) : null}
              >
                ${this.columns.map((column) => {
                  const name = typeof column === "string" ? column : column.name;
                  const columnType =
                    typeof column === "string" ? "string" : column.type;
                  return html`
                    <td>
                      ${TypesRenderers[columnType]?.call(null, row[name]) ??
                      row[name]}
                    </td>
                  `;
                })}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  },
};
