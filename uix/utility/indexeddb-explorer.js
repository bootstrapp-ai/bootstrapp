import Dexie from "https://esm.sh/dexie@4.0.11";
import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-indexeddb-explorer",

  properties: {
    // Database selection
    selectedDatabase: T.string(""),
    selectedStore: T.string(""),

    // UI state
    activeTab: T.number(0),
    searchQuery: T.string(""),

    // Data
    databases: T.array({ defaultValue: [] }),
    stores: T.array({ defaultValue: [] }),
    records: T.array({ defaultValue: [] }),
    selectedRecords: T.array({ defaultValue: [] }),
    schema: T.object({ defaultValue: null }),

    // Query builder state
    queryIndex: T.string(""),
    queryOperator: T.string("equals"),
    queryValue: T.string(""),
    queryResults: T.array({ defaultValue: [] }),

    // Modal state
    showRecordModal: T.boolean(false),
    showDeleteModal: T.boolean(false),
    showSchemaModal: T.boolean(false),
    editingRecord: T.object({ defaultValue: null }),

    // Schema creation state
    newDbName: T.string(""),
    newStoreName: T.string(""),
    newStoreKeyPath: T.string("id"),
    newIndexName: T.string(""),
    newIndexKeyPath: T.string(""),
  },

  style: true,
  shadow: false,

  async connected() {
    await this.loadDatabases();
  },

  // ==================== Database Management ====================

  async loadDatabases() {
    try {
      const dbs = await Dexie.getDatabaseNames();
      this.databases = dbs.map((name) => ({ label: name, value: name }));

      // Auto-select first database if available
      if (this.databases.length > 0 && !this.selectedDatabase) {
        this.selectedDatabase = this.databases[0].value;
        await this.loadStores();
      }
    } catch (error) {
      console.error("Failed to load databases:", error);
      this.showToast("Failed to load databases", "error");
    }
  },

  async loadStores() {
    if (!this.selectedDatabase) {
      this.stores = [];
      this.selectedStore = "";
      return;
    }

    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      this.stores = db.tables.map((table) => ({
        label: table.name,
        value: table.name,
      }));

      this.schema = {
        version: db.verno,
        tables: db.tables.map((table) => ({
          name: table.name,
          keyPath: table.schema.primKey.keyPath,
          autoIncrement: table.schema.primKey.auto,
          indexes: table.schema.indexes.map((idx) => ({
            name: idx.name,
            keyPath: idx.keyPath,
            unique: idx.unique,
            multiEntry: idx.multiEntry,
          })),
        })),
      };

      db.close();

      // Auto-select first store if available
      if (this.stores.length > 0 && !this.selectedStore) {
        this.selectedStore = this.stores[0].value;
        await this.loadRecords();
      }
    } catch (error) {
      console.error("Failed to load stores:", error);
      this.showToast("Failed to load object stores", "error");
      this.stores = [];
    }
  },

  async loadRecords() {
    if (!this.selectedDatabase || !this.selectedStore) {
      this.records = [];
      return;
    }

    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      const allRecords = await table.toArray();

      this.records = allRecords;
      this.selectedRecords = [];

      db.close();
    } catch (error) {
      console.error("Failed to load records:", error);
      this.showToast("Failed to load records", "error");
      this.records = [];
    }
  },

  // ==================== CRUD Operations ====================

  async addRecord(record) {
    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      await table.add(record);

      db.close();

      await this.loadRecords();
      this.showToast("Record added successfully", "success");
    } catch (error) {
      console.error("Failed to add record:", error);
      this.showToast(`Failed to add record: ${error.message}`, "error");
    }
  },

  async updateRecord(key, updates) {
    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      await table.update(key, updates);

      db.close();

      await this.loadRecords();
      this.showToast("Record updated successfully", "success");
    } catch (error) {
      console.error("Failed to update record:", error);
      this.showToast(`Failed to update record: ${error.message}`, "error");
    }
  },

  async deleteRecords(keys) {
    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      await table.bulkDelete(keys);

      db.close();

      await this.loadRecords();
      this.showToast(`Deleted ${keys.length} record(s)`, "success");
    } catch (error) {
      console.error("Failed to delete records:", error);
      this.showToast(`Failed to delete records: ${error.message}`, "error");
    }
  },

  // ==================== Schema Management ====================

  async createDatabase(name) {
    try {
      const db = new Dexie(name);
      db.version(1).stores({});
      await db.open();
      db.close();

      await this.loadDatabases();
      this.selectedDatabase = name;
      this.showToast(`Database "${name}" created successfully`, "success");
    } catch (error) {
      console.error("Failed to create database:", error);
      this.showToast(`Failed to create database: ${error.message}`, "error");
    }
  },

  async deleteDatabase(name) {
    try {
      await Dexie.delete(name);
      await this.loadDatabases();

      if (this.selectedDatabase === name) {
        this.selectedDatabase = "";
        this.stores = [];
        this.selectedStore = "";
        this.records = [];
      }

      this.showToast(`Database "${name}" deleted successfully`, "success");
    } catch (error) {
      console.error("Failed to delete database:", error);
      this.showToast(`Failed to delete database: ${error.message}`, "error");
    }
  },

  async createObjectStore(storeName, keyPath, autoIncrement = false) {
    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();
      const currentVersion = db.verno;
      db.close();

      // Reopen with new version
      const newDb = new Dexie(this.selectedDatabase);
      const stores = {};

      // Preserve existing stores
      this.schema.tables.forEach((table) => {
        const indexes = table.indexes.map((idx) => idx.name).join(",");
        stores[table.name] = indexes || null;
      });

      // Add new store
      const keyPathStr = autoIncrement ? `++${keyPath}` : keyPath;
      stores[storeName] = keyPathStr;

      newDb.version(currentVersion + 1).stores(stores);
      await newDb.open();
      newDb.close();

      await this.loadStores();
      this.selectedStore = storeName;
      this.showToast(
        `Object store "${storeName}" created successfully`,
        "success",
      );
    } catch (error) {
      console.error("Failed to create object store:", error);
      this.showToast(
        `Failed to create object store: ${error.message}`,
        "error",
      );
    }
  },

  // ==================== Query Operations ====================

  async executeQuery() {
    if (!this.queryIndex || !this.queryValue) {
      this.showToast("Please select an index and enter a value", "warning");
      return;
    }

    try {
      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      let query;

      switch (this.queryOperator) {
        case "equals":
          query = table.where(this.queryIndex).equals(this.queryValue);
          break;
        case "above":
          query = table.where(this.queryIndex).above(this.queryValue);
          break;
        case "below":
          query = table.where(this.queryIndex).below(this.queryValue);
          break;
        case "between": {
          const [start, end] = this.queryValue.split(",").map((v) => v.trim());
          query = table.where(this.queryIndex).between(start, end);
          break;
        }
        case "startsWith":
          query = table.where(this.queryIndex).startsWith(this.queryValue);
          break;
        default:
          query = table.where(this.queryIndex).equals(this.queryValue);
      }

      const results = await query.toArray();
      this.queryResults = results;

      db.close();

      this.showToast(`Found ${results.length} record(s)`, "success");
    } catch (error) {
      console.error("Query failed:", error);
      this.showToast(`Query failed: ${error.message}`, "error");
      this.queryResults = [];
    }
  },

  // ==================== Import/Export ====================

  async exportToJSON() {
    try {
      const data = {
        database: this.selectedDatabase,
        store: this.selectedStore,
        records: this.records,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      this.downloadFile(
        blob,
        `${this.selectedDatabase}-${this.selectedStore}.json`,
      );

      this.showToast("Exported to JSON successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      this.showToast(`Export failed: ${error.message}`, "error");
    }
  },

  async exportToCSV() {
    try {
      if (this.records.length === 0) {
        this.showToast("No records to export", "warning");
        return;
      }

      // Get all unique keys from all records
      const keys = [...new Set(this.records.flatMap(Object.keys))];

      // Create CSV header
      const csv = [
        keys.join(","),
        ...this.records.map((record) =>
          keys
            .map((key) => {
              const value = record[key];
              const stringValue =
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value ?? "");
              // Escape quotes and wrap in quotes if contains comma
              return stringValue.includes(",") || stringValue.includes('"')
                ? `"${stringValue.replace(/"/g, '""')}"`
                : stringValue;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      this.downloadFile(
        blob,
        `${this.selectedDatabase}-${this.selectedStore}.csv`,
      );

      this.showToast("Exported to CSV successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      this.showToast(`Export failed: ${error.message}`, "error");
    }
  },

  async importFromJSON(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.records || !Array.isArray(data.records)) {
        throw new Error("Invalid JSON format");
      }

      const db = new Dexie(this.selectedDatabase);
      await db.open();

      const table = db.table(this.selectedStore);
      await table.bulkAdd(data.records);

      db.close();

      await this.loadRecords();
      this.showToast(`Imported ${data.records.length} record(s)`, "success");
    } catch (error) {
      console.error("Import failed:", error);
      this.showToast(`Import failed: ${error.message}`, "error");
    }
  },

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // ==================== Event Handlers ====================

  async _handleDatabaseSelect(dbName) {
    this.selectedDatabase = dbName;
    this.selectedStore = "";
    await this.loadStores();
  },

  async _handleStoreSelect(storeName) {
    this.selectedStore = storeName;
    await this.loadRecords();
  },

  _handleTabChange(e) {
    this.activeTab = e.detail;
  },

  _handleAddRecord() {
    this.editingRecord = null;
    this.showRecordModal = true;
  },

  _handleEditRecord(record) {
    this.editingRecord = record;
    this.showRecordModal = true;
  },

  _handleDeleteRecords() {
    if (this.selectedRecords.length === 0) {
      this.showToast("No records selected", "warning");
      return;
    }
    this.showDeleteModal = true;
  },

  async _confirmDelete() {
    const keyPath = this.schema.tables.find(
      (t) => t.name === this.selectedStore,
    )?.keyPath;
    const keys = this.selectedRecords.map((record) => record[keyPath]);
    await this.deleteRecords(keys);
    this.showDeleteModal = false;
  },

  async _handleSaveRecord(record) {
    if (this.editingRecord) {
      const keyPath = this.schema.tables.find(
        (t) => t.name === this.selectedStore,
      )?.keyPath;
      const key = this.editingRecord[keyPath];
      await this.updateRecord(key, record);
    } else {
      await this.addRecord(record);
    }
    this.showRecordModal = false;
  },

  _handleRecordSelection(e) {
    this.selectedRecords = e.detail.selectedRows || [];
  },

  async _handleRefresh() {
    await this.loadDatabases();
    if (this.selectedDatabase) {
      await this.loadStores();
      if (this.selectedStore) {
        await this.loadRecords();
      }
    }
    this.showToast("Refreshed successfully", "success");
  },

  _handleFileImport(e) {
    const file = e.target.files[0];
    if (file) {
      this.importFromJSON(file);
    }
  },

  // ==================== Render Methods ====================

  renderSidebar() {
    if (this.databases.length === 0) {
      return html`
        <div class="sidebar-empty">
          <uix-text variant="muted">No databases found</uix-text>
          <uix-button size="sm" @click=${this._handleRefresh}>
            Refresh
          </uix-button>
        </div>
      `;
    }

    return html`
      <div class="sidebar-container">
        <uix-accordion>
          ${this.databases.map((db) => {
            const isSelected = this.selectedDatabase === db.value;
            const dbStores = isSelected ? this.stores : [];

            return html`
              <uix-nav-item
                ?open=${isSelected}
                icon="database"
                label=${db.label}
                badge=${isSelected ? dbStores.length : ""}
                header
                @nav-item-click=${() => this._handleDatabaseSelect(db.value)}
              ></uix-nav-item>
              ${
                isSelected
                  ? html`
                <uix-menu>
                  ${dbStores.map(
                    (store) => html`
                    <uix-nav-item
                      label=${store.label}
                      size="sm"
                      ?active=${this.selectedStore === store.value}
                      ?activeBg=${this.selectedStore === store.value}
                      @nav-item-click=${() => this._handleStoreSelect(store.value)}
                    ></uix-nav-item>
                  `,
                  )}
                </uix-menu>
              `
                  : ""
              }
            `;
          })}
        </uix-accordion>
      </div>
    `;
  },

  renderToolbar() {
    return html`
      <uix-flex gap="sm" align="center" justify="space-between" class="toolbar">
        <uix-flex direction="column" gap="xs">
          <h2 style="margin: 0">
            ${this.selectedDatabase || "IndexedDB Explorer"}
          </h2>
          ${
            this.selectedStore
              ? html`
            <uix-text variant="muted" style="font-size: 0.875rem">
              ${this.selectedStore}
            </uix-text>
          `
              : ""
          }
        </uix-flex>

        <uix-button
          variant="secondary"
          @click=${this._handleRefresh}
          title="Refresh"
        >
          <uix-icon name="refresh-cw"></uix-icon>
        </uix-button>
      </uix-flex>
    `;
  },

  renderBrowseTab() {
    if (!this.selectedStore) {
      return html`
        <uix-flex direction="column" align="center" justify="center" style="padding: 2rem">
          <uix-text variant="muted">Select a database and object store to browse records</uix-text>
        </uix-flex>
      `;
    }

    return html`
      <uix-flex direction="column" gap="md">
        <uix-flex gap="sm">
          <uix-button variant="primary" @click=${this._handleAddRecord}>
            <uix-icon name="plus"></uix-icon> Add Record
          </uix-button>
          <uix-button
            variant="danger"
            @click=${this._handleDeleteRecords}
            ?disabled=${this.selectedRecords.length === 0}
          >
            <uix-icon name="trash"></uix-icon> Delete (${this.selectedRecords.length})
          </uix-button>
        </uix-flex>

        <uix-data-table
          searchable
          sortable
          paginated
          selectable
          .data=${this.records}
          @selection-change=${this._handleRecordSelection}
        >
          <table>
            <thead>
              <tr>
                ${
                  this.records.length > 0
                    ? Object.keys(this.records[0]).map(
                        (key) => html`<th>${key}</th>`,
                      )
                    : html`<th>No data</th>`
                }
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.records.map(
                (record) => html`
                <tr>
                  ${Object.values(record).map(
                    (value) => html`
                    <td>${typeof value === "object" ? JSON.stringify(value) : value}</td>
                  `,
                  )}
                  <td>
                    <uix-button
                      size="sm"
                      variant="secondary"
                      @click=${() => this._handleEditRecord(record)}
                    >
                      Edit
                    </uix-button>
                  </td>
                </tr>
              `,
              )}
            </tbody>
          </table>
        </uix-data-table>
      </uix-flex>
    `;
  },

  renderSchemaTab() {
    if (!this.schema) {
      return html`
        <uix-flex direction="column" align="center" justify="center" style="padding: 2rem">
          <uix-text variant="muted">Select a database to view schema</uix-text>
        </uix-flex>
      `;
    }

    return html`
      <uix-flex direction="column" gap="md">
        <uix-card>
          <h3 slot="header">Database: ${this.selectedDatabase}</h3>
          <uix-flex direction="column" gap="sm">
            <uix-text><strong>Version:</strong> ${this.schema.version}</uix-text>
            <uix-text><strong>Object Stores:</strong> ${this.schema.tables.length}</uix-text>

            <uix-flex gap="sm" style="margin-top: 1rem">
              <uix-button variant="primary" @click=${() => (this.showSchemaModal = true)}>
                Add Object Store
              </uix-button>
              <uix-button variant="danger" @click=${() => this.deleteDatabase(this.selectedDatabase)}>
                Delete Database
              </uix-button>
            </uix-flex>
          </uix-flex>
        </uix-card>

        ${this.schema.tables.map(
          (table) => html`
          <uix-card>
            <h4 slot="header">${table.name}</h4>
            <uix-flex direction="column" gap="sm">
              <uix-text><strong>Key Path:</strong> ${table.keyPath}</uix-text>
              <uix-text><strong>Auto Increment:</strong> ${table.autoIncrement ? "Yes" : "No"}</uix-text>

              ${
                table.indexes.length > 0
                  ? html`
                <div>
                  <strong>Indexes:</strong>
                  <uix-list>
                    ${table.indexes.map(
                      (idx) => html`
                      <uix-list-item>
                        ${idx.name} (${idx.keyPath})
                        ${idx.unique ? html`<uix-badge>unique</uix-badge>` : ""}
                        ${idx.multiEntry ? html`<uix-badge>multi-entry</uix-badge>` : ""}
                      </uix-list-item>
                    `,
                    )}
                  </uix-list>
                </div>
              `
                  : html`<uix-text variant="muted">No indexes</uix-text>`
              }
            </uix-flex>
          </uix-card>
        `,
        )}
      </uix-flex>
    `;
  },

  renderQueryTab() {
    if (!this.selectedStore || !this.schema) {
      return html`
        <uix-flex direction="column" align="center" justify="center" style="padding: 2rem">
          <uix-text variant="muted">Select an object store to query</uix-text>
        </uix-flex>
      `;
    }

    const currentTable = this.schema.tables.find(
      (t) => t.name === this.selectedStore,
    );
    const indexes = currentTable?.indexes || [];
    const indexOptions = [
      { label: currentTable?.keyPath, value: currentTable?.keyPath },
      ...indexes.map((idx) => ({ label: idx.name, value: idx.name })),
    ];

    return html`
      <uix-flex direction="column" gap="md">
        <uix-card>
          <h3 slot="header">Query Builder</h3>
          <uix-flex direction="column" gap="md">
            <uix-form-control label="Index">
              <uix-select
                .value=${this.queryIndex}
                .options=${indexOptions}
                @change=${(e) => (this.queryIndex = e.target.value)}
                placeholder="Select index..."
              ></uix-select>
            </uix-form-control>

            <uix-form-control label="Operator">
              <uix-select
                .value=${this.queryOperator}
                .options=${[
                  { label: "Equals", value: "equals" },
                  { label: "Above", value: "above" },
                  { label: "Below", value: "below" },
                  { label: "Between", value: "between" },
                  { label: "Starts With", value: "startsWith" },
                ]}
                @change=${(e) => (this.queryOperator = e.target.value)}
              ></uix-select>
            </uix-form-control>

            <uix-form-control label="Value">
              <uix-input
                .value=${this.queryValue}
                @input=${(e) => (this.queryValue = e.target.value)}
                placeholder=${this.queryOperator === "between" ? "value1, value2" : "Enter value..."}
              ></uix-input>
            </uix-form-control>

            <uix-button variant="primary" @click=${this.executeQuery}>
              Execute Query
            </uix-button>
          </uix-flex>
        </uix-card>

        ${
          this.queryResults.length > 0
            ? html`
          <uix-card>
            <h3 slot="header">Results (${this.queryResults.length})</h3>
            <uix-data-table searchable sortable paginated .data=${this.queryResults}>
              <table>
                <thead>
                  <tr>
                    ${Object.keys(this.queryResults[0]).map((key) => html`<th>${key}</th>`)}
                  </tr>
                </thead>
                <tbody>
                  ${this.queryResults.map(
                    (record) => html`
                    <tr>
                      ${Object.values(record).map(
                        (value) => html`
                        <td>${typeof value === "object" ? JSON.stringify(value) : value}</td>
                      `,
                      )}
                    </tr>
                  `,
                  )}
                </tbody>
              </table>
            </uix-data-table>
          </uix-card>
        `
            : ""
        }
      </uix-flex>
    `;
  },

  renderImportExportTab() {
    if (!this.selectedStore) {
      return html`
        <uix-flex direction="column" align="center" justify="center" style="padding: 2rem">
          <uix-text variant="muted">Select an object store to import/export</uix-text>
        </uix-flex>
      `;
    }

    return html`
      <uix-flex direction="column" gap="md">
        <uix-card>
          <h3 slot="header">Export</h3>
          <uix-flex gap="sm">
            <uix-button variant="primary" @click=${this.exportToJSON}>
              <uix-icon name="download"></uix-icon> Export to JSON
            </uix-button>
            <uix-button variant="primary" @click=${this.exportToCSV}>
              <uix-icon name="download"></uix-icon> Export to CSV
            </uix-button>
          </uix-flex>
        </uix-card>

        <uix-card>
          <h3 slot="header">Import</h3>
          <uix-flex direction="column" gap="sm">
            <uix-text variant="muted">Import records from JSON file</uix-text>
            <input
              type="file"
              accept=".json"
              @change=${this._handleFileImport}
              style="padding: 0.5rem"
            />
          </uix-flex>
        </uix-card>
      </uix-flex>
    `;
  },

  renderRecordModal() {
    if (!this.showRecordModal) return "";

    const isEditing = !!this.editingRecord;
    const record = this.editingRecord || {};

    // Get fields from schema or existing record
    const currentTable = this.schema?.tables.find(
      (t) => t.name === this.selectedStore,
    );
    const keyPath = currentTable?.keyPath;

    return html`
      <uix-modal .open=${this.showRecordModal} @close=${() => (this.showRecordModal = false)}>
        <h3 slot="header">${isEditing ? "Edit" : "Add"} Record</h3>
        <uix-form @submit=${(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const record = Object.fromEntries(formData.entries());

          // Try to parse JSON values
          Object.keys(record).forEach((key) => {
            try {
              const parsed = JSON.parse(record[key]);
              record[key] = parsed;
            } catch {
              // Keep as string
            }
          });

          this._handleSaveRecord(record);
        }}>
          <uix-flex direction="column" gap="md">
            ${
              Object.keys(record).length > 0
                ? Object.entries(record).map(
                    ([key, value]) => html`
                <uix-form-control label=${key}>
                  <uix-input
                    name=${key}
                    .value=${typeof value === "object" ? JSON.stringify(value) : String(value)}
                    ?disabled=${isEditing && key === keyPath}
                  ></uix-input>
                </uix-form-control>
              `,
                  )
                : html`
                <uix-form-control label=${keyPath}>
                  <uix-input name=${keyPath} required></uix-input>
                </uix-form-control>
                <uix-text variant="muted">Add more fields by editing the record JSON or add them after creation</uix-text>
              `
            }

            <uix-flex gap="sm" justify="flex-end">
              <uix-button type="button" variant="secondary" @click=${() => (this.showRecordModal = false)}>
                Cancel
              </uix-button>
              <uix-button type="submit" variant="primary">
                ${isEditing ? "Update" : "Add"}
              </uix-button>
            </uix-flex>
          </uix-flex>
        </uix-form>
      </uix-modal>
    `;
  },

  renderDeleteModal() {
    if (!this.showDeleteModal) return "";

    return html`
      <uix-alert-dialog
        .open=${this.showDeleteModal}
        @close=${() => (this.showDeleteModal = false)}
        @confirm=${this._confirmDelete}
        title="Confirm Delete"
        variant="danger"
      >
        Are you sure you want to delete ${this.selectedRecords.length} record(s)? This action cannot be undone.
      </uix-alert-dialog>
    `;
  },

  renderSchemaModal() {
    if (!this.showSchemaModal) return "";

    return html`
      <uix-modal .open=${this.showSchemaModal} @close=${() => (this.showSchemaModal = false)}>
        <h3 slot="header">Create Object Store</h3>
        <uix-form @submit=${async (e) => {
          e.preventDefault();
          await this.createObjectStore(
            this.newStoreName,
            this.newStoreKeyPath,
            this.querySelector('input[name="autoIncrement"]')?.checked,
          );
          this.showSchemaModal = false;
          this.newStoreName = "";
          this.newStoreKeyPath = "id";
        }}>
          <uix-flex direction="column" gap="md">
            <uix-form-control label="Store Name">
              <uix-input
                name="storeName"
                .value=${this.newStoreName}
                @input=${(e) => (this.newStoreName = e.target.value)}
                required
              ></uix-input>
            </uix-form-control>

            <uix-form-control label="Key Path">
              <uix-input
                name="keyPath"
                .value=${this.newStoreKeyPath}
                @input=${(e) => (this.newStoreKeyPath = e.target.value)}
                required
              ></uix-input>
            </uix-form-control>

            <uix-checkbox name="autoIncrement">Auto Increment</uix-checkbox>

            <uix-flex gap="sm" justify="flex-end">
              <uix-button type="button" variant="secondary" @click=${() => (this.showSchemaModal = false)}>
                Cancel
              </uix-button>
              <uix-button type="submit" variant="primary">
                Create
              </uix-button>
            </uix-flex>
          </uix-flex>
        </uix-form>
      </uix-modal>
    `;
  },

  render() {
    const tabs = [
      { label: "Browse", render: () => this.renderBrowseTab() },
      { label: "Schema", render: () => this.renderSchemaTab() },
      { label: "Query", render: () => this.renderQueryTab() },
      { label: "Import/Export", render: () => this.renderImportExportTab() },
    ];

    return html`
      <div class="uix-indexeddb-explorer">
        <uix-split-pane initialSize="280px" minSize="280px">
          <!-- Sidebar -->
          <div slot="primary" class="explorer-sidebar">
            ${this.renderSidebar()}
          </div>

          <!-- Main Content -->
          <div slot="secondary" class="explorer-main">
            <uix-card>
              ${this.renderToolbar()}

              <uix-tabs .activeTab=${this.activeTab} @tab-change=${this._handleTabChange}>
                ${tabs.map((tab) => html`<button slot="tab">${tab.label}</button>`)}

                <div slot="panel" class="tab-content">
                  ${tabs[this.activeTab].render()}
                </div>
              </uix-tabs>
            </uix-card>
          </div>
        </uix-split-pane>

        ${this.renderRecordModal()}
        ${this.renderDeleteModal()}
        ${this.renderSchemaModal()}
      </div>
    `;
  },

  // ==================== Utilities ====================

  showToast(message, variant = "info") {
    // Dispatch event that can be caught by a toast system
    this.dispatchEvent(
      new CustomEvent("toast", {
        detail: { message, variant },
        bubbles: true,
        composed: true,
      }),
    );

    // Fallback to console
    console.log(`[${variant.toUpperCase()}] ${message}`);
  },
};

/**
 * IndexedDB Explorer Component
 *
 * A comprehensive IndexedDB browser and management tool built with the View framework.
 * Provides full CRUD operations, schema management, querying, and import/export capabilities.
 *
 * @component
 * @category utility
 * @tag uix-indexeddb-explorer
 *
 * @fires toast - Emitted when showing notifications { message, variant }
 *
 * @example Basic Usage
 * ```html
 * <uix-indexeddb-explorer></uix-indexeddb-explorer>
 * ```
 *
 * @example With Event Handling
 * ```html
 * <uix-indexeddb-explorer
 *   @toast=${(e) => showNotification(e.detail.message, e.detail.variant)}
 * ></uix-indexeddb-explorer>
 * ```
 */
