import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import Controller from "/$app/controller/index.js";

const convertToCSV = (data) => {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((header) => JSON.stringify(obj[header] ?? "")).join(","),
  );

  return [headers.join(","), ...rows].join("\n");
};

const exportCSV = (data) => {
  const csvString = convertToCSV(data);
  exportFile(csvString, "exported-data.csv", "text/csv");
};

const exportJSON = (data) => {
  const jsonString = JSON.stringify(data, null, 2);
  exportFile(jsonString, "exported-data.json", "application/json");
};

const exportFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  tag: "cms-export",

  icons: ["menu"],
  properties: {
    fields: T.array(),
    model: T.string(),
  },

  async exportCollection(filetype) {
    const items = await Controller.backend("GET_MANY", { model: this.model });
    if (filetype === "CSV") {
      exportCSV(items, this.fields);
    } else if (filetype === "JSON") {
      exportJSON(items);
    }
  },

  render() {
    return html`
      <uix-link
			  .dropdown=${[
          html`
          <uix-link
						class="px-4 py-2"
            @click=${() => this.exportCollection("CSV")}
            label="CSV"
          ></uix-link>`,
          html`<uix-link
						class="px-4 py-2"
            @click=${() => this.exportCollection("JSON")}
            label="JSON"
          ></uix-link>`,
        ]}
        label="Export" icon="download">              
      </uix-link>
    `;
  },
};
