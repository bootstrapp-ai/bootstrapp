import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";

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
  const headers = rows[0].split(",");

  return rows
    .slice(1)
    .map((row) => {
      const values = row.split(",");
      return headers.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
    })
    .filter((row) => Object.values(row).some((value) => value));
};

const getFields = (data) => {
  return data.length > 0 ? Object.keys(data[0]) : [];
};

const transformCsvData = (csvData, fieldMapping) => {
  return csvData.map((row) => mapRowToModel(row, fieldMapping));
};

const mapRowToModel = (row, fieldMapping) => {
  return Object.keys(fieldMapping).reduce((acc, modelField) => {
    const csvField = fieldMapping[modelField];
    acc[modelField] = row[csvField];
    return acc;
  }, {});
};
export default {
  tag: "cms-import",
  icons: ["menu"],
  properties: {
    fields: T.array(),
    insertRow: T.function(),
    model: T.string(),
    rows: T.array(),
    filetype: T.string(),
  },

  connected() {
    const model = $APP.models[this.model];
    if (!model) return console.log(`Error: model ${this.model} not found`);
    this.hasRetrieveProp = Object.keys(model).some((prop) =>
      Boolean(model[prop].retrieve),
    );
  },

  async handleFileChange(e, filetype) {
    try {
      const file = e.target.files[0];
      const fileContent = await readFile(file);
      let data = [];
      if (filetype === "CSV") {
        data = parseCSV(fileContent);
        this.CSVFields = getFields(data);
      } else if (filetype === "JSON") {
        data = JSON.parse(fileContent);
      }
      this.rows = Array.isArray(data) ? data : [data];
      this.filetype = filetype;
      this.q("uix-modal").show();
    } catch (error) {
      console.error("Error processing file:", error);
    }
  },

  async populateData() {
    const { rows } = this;
    const model = $APP.models[this.model];
    const retrieveProps = Object.keys(model).filter((prop) =>
      Boolean(model[prop].retrieve),
    );
    if (retrieveProps.length > 0) {
      rows.map((row, index) => {
        retrieveProps.map(async (propKey) => {
          const prop = model[propKey];
          const value = row[propKey];
          if (!value) return;

          const isValid = prop.validate ? prop.validate(value) : true;
          if (isValid)
            await prop.retrieve({
              value,
              formData: row,
              update: ((row) => this.updateRow(index, row)).bind(this),
            });
        });
      });
    }
  },

  updateRow(index, updatedRow) {
    const rows = [...this.rows];
    if (!this.rows?.[index]) return;
    rows[index] = { ...this.rows[index], ...updatedRow };
    this.rows = rows;
  },

  handleImport() {
    const form = this.q("uix-form");
    const data = this.rows;
    if (this.filetype === "CSV") {
      const fieldMapping = form.formData();
      const rows = transformCsvData(data, fieldMapping);
      rows.map(this.insertRow);
    } else if (this.filetype === "JSON") {
      data.map(this.insertRow);
    }
    this.q("uix-modal").hide();
  },
  render() {
    const { hasRetrieveProp, fields = [], filetype, rows = [] } = this;
    const dataCount = rows.length;

    return html`
		<uix-link
			.dropdown=${["CSV", "JSON", "XML"].map(
        (filetype) => html`
					<uix-link
						@click=${() => this.q(`#ImportFileInput-${filetype}`).click()}
						size="sm"
						class="px-4 py-2"
						variant="secondary"
						label=${filetype}
					>
						<input
							type="file"
							id=${`ImportFileInput-${filetype}`}
							accept=${`.${filetype.toLowerCase()}`}
							style="display: none;"
							@change=${((e) => this.handleFileChange(e, filetype)).bind(this)}
						/>
					</uix-link>
				`,
      )}
			label="Import"
			icon="import"
		>
		</uix-link>

		<uix-modal
		>
	<dialog>
				<div class="flex flex-col justify-between gap-8">
					<span class="text-xl font-bold">
						Select the matching ${filetype} fields:
					</span>
					<span class="text-base">
						Importing ${dataCount} ${filetype === "CSV" ? "rows" : "objects"}
					</span>

					<!--<uix-table .rows=${rows} .fields=${fields}></uix-table>-->

					<div class="flex justify-between">
						${
              hasRetrieveProp
                ? html`
										<uix-button
											@click=${this.populateData.bind(this)}
											variant="primary"
											label="Populate Data"
										></uix-button>
								  `
                : null
            }

						<uix-button
							@click=${this.handleImport.bind(this)}
							variant="primary"
							label=${`Import ${dataCount} rows`}
						></uix-button>
					</div>
				</div>
	</dialog>
	</uix-modal>
	`;
  },
};
