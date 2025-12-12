import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";

const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) return '""';
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (str.includes(",") || str.includes("\n") || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export default {
  tag: "admin-export",
  properties: {
    model: T.string(),
    rows: T.array(),
    exporting: T.boolean({ defaultValue: false }),
  },

  async exportData(format) {
    this.exporting = true;

    try {
      // Use provided rows or fetch all
      let data = this.rows;
      if (!data || data.length === 0) {
        data = await $APP.Model[this.model].getAll();
      }

      if (!data || data.length === 0) {
        alert("No data to export");
        this.exporting = false;
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${this.model}-${timestamp}`;

      if (format === "CSV") {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, `${fileName}.csv`, "text/csv;charset=utf-8");
      } else if (format === "JSON") {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, `${fileName}.json`, "application/json");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message}`);
    }

    this.exporting = false;
  },

  render() {
    return html`
      <div class="relative group">
        <button
          ?disabled=${this.exporting}
          class="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg
                 hover:bg-gray-100 transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <uix-icon name="download" size="18"></uix-icon>
          ${this.exporting ? "Exporting..." : "Export"}
        </button>
        <div
          class="absolute right-0 mt-2 w-32 bg-white border-3 border-black rounded-xl
                 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 hidden group-hover:block"
        >
          ${["CSV", "JSON"].map(
            (format) => html`
              <button
                @click=${() => this.exportData(format)}
                class="block w-full px-4 py-2 text-left hover:bg-gray-100
                       first:rounded-t-lg last:rounded-b-lg"
              >
                ${format}
              </button>
            `,
          )}
        </div>
      </div>
    `;
  },
};
