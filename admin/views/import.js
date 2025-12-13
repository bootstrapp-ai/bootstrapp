import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import { getModelSchema } from "../utils/model-utils.js";

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const parseCSV = (csvData) => {
  const rows = csvData.trim().split("\n");
  if (rows.length === 0) return [];

  const headers = rows[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return rows
    .slice(1)
    .map((row) => {
      const values = [];
      let current = "";
      let inQuotes = false;

      for (const char of row) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      return headers.reduce((object, header, index) => {
        let value = values[index] || "";
        value = value.replace(/^"|"$/g, "");
        object[header] = value;
        return object;
      }, {});
    })
    .filter((row) => Object.values(row).some((value) => value));
};

export default {
  tag: "admin-import",
  style: true,
  properties: {
    model: T.string(),
    modalOpen: T.boolean({ defaultValue: false }),
    fileType: T.string({ defaultValue: "" }),
    parsedData: T.array({ defaultValue: [] }),
    importing: T.boolean({ defaultValue: false }),
    csvFields: T.array({ defaultValue: [] }),
    fieldMapping: T.object({ defaultValue: {} }),
  },

  async handleFileSelect(e, fileType) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const content = await readFile(file);
      let data = [];

      if (fileType === "CSV") {
        data = parseCSV(content);
        if (data.length > 0) {
          this.csvFields = Object.keys(data[0]);
          const schema = getModelSchema(this.model);
          const mapping = {};
          schema.forEach((field) => {
            const match = this.csvFields.find(
              (csvField) => csvField.toLowerCase() === field.name.toLowerCase(),
            );
            if (match) {
              mapping[field.name] = match;
            }
          });
          this.fieldMapping = mapping;
        }
      } else if (fileType === "JSON") {
        data = JSON.parse(content);
        if (!Array.isArray(data)) {
          data = [data];
        }
      }

      this.parsedData = data;
      this.fileType = fileType;
      this.modalOpen = true;
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(`Error parsing file: ${error.message}`);
    }

    e.target.value = "";
  },

  updateMapping(modelField, csvField) {
    this.fieldMapping = { ...this.fieldMapping, [modelField]: csvField };
  },

  async handleImport() {
    this.importing = true;
    let successCount = 0;
    let errorCount = 0;

    try {
      const data =
        this.fileType === "CSV"
          ? this.parsedData.map((row) => this.mapCsvRow(row))
          : this.parsedData;

      for (const item of data) {
        try {
          await $APP.Model[this.model].add(item);
          successCount++;
        } catch (error) {
          console.error("Error importing row:", error);
          errorCount++;
        }
      }

      alert(
        `Import complete! ${successCount} records imported${errorCount > 0 ? `, ${errorCount} failed` : ""}.`,
      );
      this.closeModal();
    } catch (error) {
      console.error("Import error:", error);
      alert(`Import failed: ${error.message}`);
    }

    this.importing = false;
  },

  mapCsvRow(row) {
    const result = {};
    Object.entries(this.fieldMapping).forEach(([modelField, csvField]) => {
      if (csvField && row[csvField] !== undefined) {
        result[modelField] = row[csvField];
      }
    });
    return result;
  },

  closeModal() {
    this.modalOpen = false;
    this.parsedData = [];
    this.csvFields = [];
    this.fieldMapping = {};
    this.fileType = "";
  },

  render() {
    const schema = getModelSchema(this.model);

    return html`
      <!-- Import Dropdown -->
      <uix-button popovertarget="import-${this.model}" ghost>
        <uix-icon name="upload" size="18"></uix-icon>
        Import
      </uix-button>
      <uix-dropdown id="import-${this.model}">
        <div class="admin-import-options">
          ${["CSV", "JSON"].map(
            (type) => html`
              <label class="admin-import-option">
                ${type}
                <input
                  type="file"
                  accept=".${type.toLowerCase()}"
                  @change=${(e) => this.handleFileSelect(e, type)}
                  class="admin-import-file-input"
                />
              </label>
            `,
          )}
        </div>
      </uix-dropdown>

      <!-- Import Modal -->
      <uix-modal
        ?open=${this.modalOpen}
        @close=${this.closeModal}
        title="Import ${this.fileType} - ${this.parsedData.length} records"
      >
        ${this.modalOpen
          ? html`
              <div class="admin-import-content">
                ${this.fileType === "CSV" && this.csvFields.length > 0
                  ? html`
                      <div class="admin-import-mapping">
                        <h3 class="admin-import-mapping-title">Map CSV columns to model fields:</h3>
                        <div class="admin-import-mapping-list">
                          ${schema
                            .filter((f) => f.name !== "id")
                            .map(
                              (field) => html`
                                <div class="admin-import-mapping-row">
                                  <span class="admin-import-field-name">${field.label || field.name}</span>
                                  <span class="admin-import-arrow">→</span>
                                  <uix-select
                                    .value=${this.fieldMapping[field.name] || ""}
                                    placeholder="-- Skip --"
                                    .options=${this.csvFields.map((csvField) => ({
                                      value: csvField,
                                      label: csvField,
                                    }))}
                                    @change=${(e) =>
                                      this.updateMapping(field.name, e.target.value)}
                                  ></uix-select>
                                </div>
                              `,
                            )}
                        </div>
                      </div>
                    `
                  : html`
                      <div class="admin-import-preview">
                        <h3 class="admin-import-preview-title">Preview:</h3>
                        <pre class="admin-import-preview-code">${JSON.stringify(this.parsedData.slice(0, 3), null, 2)}</pre>
                        ${this.parsedData.length > 3
                          ? html`<p class="admin-import-preview-more">
                              ... and ${this.parsedData.length - 3} more records
                            </p>`
                          : ""}
                      </div>
                    `}
              </div>

              <div slot="footer" class="admin-import-footer">
                <uix-button ghost @click=${this.closeModal}>
                  Cancel
                </uix-button>
                <uix-button
                  primary
                  @click=${this.handleImport}
                  ?disabled=${this.importing}
                >
                  ${this.importing ? "Importing..." : `Import ${this.parsedData.length} records`}
                </uix-button>
              </div>
            `
          : ""}
      </uix-modal>
    `;
  },
};
