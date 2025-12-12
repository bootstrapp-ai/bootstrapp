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
      // Handle quoted values with commas
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
        // Remove surrounding quotes
        value = value.replace(/^"|"$/g, "");
        object[header] = value;
        return object;
      }, {});
    })
    .filter((row) => Object.values(row).some((value) => value));
};

export default {
  tag: "admin-import",
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
          // Initialize field mapping
          const schema = getModelSchema(this.model);
          const mapping = {};
          schema.forEach((field) => {
            // Try to auto-match fields by name
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

    // Reset file input
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
      <!-- Import Button -->
      <div class="relative group">
        <button
          class="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg
                 hover:bg-gray-100 transition-colors"
        >
          <uix-icon name="upload" size="18"></uix-icon>
          Import
        </button>
        <div
          class="absolute right-0 mt-2 w-32 bg-white border-3 border-black rounded-xl
                 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 hidden group-hover:block"
        >
          ${["CSV", "JSON"].map(
            (type) => html`
              <label
                class="block px-4 py-2 hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
              >
                ${type}
                <input
                  type="file"
                  accept=".${type.toLowerCase()}"
                  @change=${(e) => this.handleFileSelect(e, type)}
                  class="hidden"
                />
              </label>
            `,
          )}
        </div>
      </div>

      <!-- Import Modal -->
      ${this.modalOpen
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
                <!-- Header -->
                <div
                  class="flex items-center justify-between px-6 py-4 border-b-3 border-black bg-gray-50"
                >
                  <h2 class="text-xl font-black uppercase">
                    Import ${this.fileType} - ${this.parsedData.length} records
                  </h2>
                  <button
                    @click=${this.closeModal}
                    class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <uix-icon name="x" size="24"></uix-icon>
                  </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6">
                  ${this.fileType === "CSV" && this.csvFields.length > 0
                    ? html`
                        <div class="mb-6">
                          <h3 class="font-bold mb-4">Map CSV columns to model fields:</h3>
                          <div class="space-y-4">
                            ${schema
                              .filter((f) => f.name !== "id")
                              .map(
                                (field) => html`
                                  <div class="flex items-center gap-4">
                                    <span class="w-32 font-medium">${field.label || field.name}</span>
                                    <span class="text-gray-400">→</span>
                                    <select
                                      class="flex-1 px-3 py-2 border-2 border-black rounded-lg"
                                      .value=${this.fieldMapping[field.name] || ""}
                                      @change=${(e) =>
                                        this.updateMapping(field.name, e.target.value)}
                                    >
                                      <option value="">-- Skip --</option>
                                      ${this.csvFields.map(
                                        (csvField) => html`
                                          <option
                                            value=${csvField}
                                            ?selected=${this.fieldMapping[field.name] ===
                                            csvField}
                                          >
                                            ${csvField}
                                          </option>
                                        `,
                                      )}
                                    </select>
                                  </div>
                                `,
                              )}
                          </div>
                        </div>
                      `
                    : html`
                        <div class="mb-6">
                          <h3 class="font-bold mb-2">Preview:</h3>
                          <pre
                            class="p-4 bg-gray-100 rounded-xl text-sm overflow-x-auto max-h-64"
                          >${JSON.stringify(this.parsedData.slice(0, 3), null, 2)}</pre>
                          ${this.parsedData.length > 3
                            ? html`<p class="text-sm text-gray-500 mt-2">
                                ... and ${this.parsedData.length - 3} more records
                              </p>`
                            : ""}
                        </div>
                      `}
                </div>

                <!-- Footer -->
                <div
                  class="flex items-center justify-end gap-4 px-6 py-4 border-t-3 border-black"
                >
                  <button
                    @click=${this.closeModal}
                    class="px-6 py-2 border-2 border-black rounded-lg font-bold
                           hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click=${this.handleImport}
                    ?disabled=${this.importing}
                    class="px-6 py-2 bg-black text-white font-bold rounded-lg
                           border-2 border-black hover:bg-gray-800 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ${this.importing ? "Importing..." : `Import ${this.parsedData.length} records`}
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  },
};
