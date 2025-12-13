/**
 * @file IndexedDB Database Adapter
 * @description IndexedDB adapter implementing the database interface
 */

import { DatabaseAdapterBase } from "/$app/model/adapter-base.js";
import { SystemModelManager } from "./system-model-manager.js";

/**
 * IndexedDB Adapter Configuration
 * @typedef {Object} IndexedDBConfig
 * @property {string} name - Database name
 * @property {number} version - Database version
 * @property {Object} models - Model schemas
 * @property {boolean} [system] - Is system database
 * @property {Function} [onConnected] - Callback when connected
 * @property {boolean} [enableSystemModels] - Enable system model management
 * @property {Function} [buildQueryResult] - Query result builder (injected)
 * @property {Function} [matchesWhere] - Where clause matcher (injected)
 * @property {Function} [validateQueryOptions] - Query options validator (injected)
 * @property {Function} [loadRelationships] - Relationship loader (injected)
 * @property {Function} [loadRelationshipsForMany] - Batch relationship loader (injected)
 * @property {Function} [generateId] - ID generator (injected)
 * @property {Function} [mergeRowUpdates] - Row merge function (injected)
 * @property {Function} [prepareRow] - Row preparation function (injected)
 * @property {Function} [validateRow] - Row validation function (injected)
 * @property {Function} [eventEmitter] - Event emitter for reactivity
 * @property {Object} [subscriptionManager] - Subscription manager for query notifications
 */

export class IndexedDBAdapter extends DatabaseAdapterBase {
  constructor(config) {
    super(config);
    this.db = null;
    this.isConnected = false;
    this.connectionPromise = null;

    // Injected dependencies
    this.buildQueryResult =
      config.buildQueryResult ||
      ((records, options) => ({ items: records, total: records.length }));
    this.matchesWhere = config.matchesWhere || (() => true);
    this.validateQueryOptions = config.validateQueryOptions || (() => {});
    this.loadRelationships = config.loadRelationships || ((a, b, c, r) => r);
    this.loadRelationshipsForMany =
      config.loadRelationshipsForMany || ((a, b, c, r) => r);
    this.generateId =
      config.generateId ||
      ((useStringId) => {
        const id = `${Date.now()}${Math.random().toString(10).substr(2, 2)}`;
        return useStringId ? id : Number(id);
      });
    this.mergeRowUpdates =
      config.mergeRowUpdates ||
      ((current, updates) => ({ ...current, ...updates }));
    this.prepareRow =
      config.prepareRow || ((models, model, row) => ({ ...row }));
    this.validateRow =
      config.validateRow || (() => ({ valid: true, errors: {} }));
    this.eventEmitter = config.eventEmitter || null;
    this.subscriptionManager = config.subscriptionManager || null;

    // System model manager
    this.systemModelManager = config.enableSystemModels
      ? new SystemModelManager(this, config.systemModelManagerOptions || {})
      : null;
  }

  /**
   * Initialize IndexedDB connection
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, Number(this.version));

      request.onerror = (event) => {
        this.connectionPromise = null;
        console.error("IndexedDB: Failed to open database", event.target.error);
        reject(new Error(`Failed to open database: ${event.target.error}`));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isConnected = true;
        this.db.onversionchange = () => {
          console.warn(
            "IndexedDB: Database version changed, closing connection",
          );
          this.close();
        };
        console.log(
          `IndexedDB: Connected to database "${this.name}" v${this.version}`,
        );
        if (this.onConnected && typeof this.onConnected === "function") {
          this.onConnected();
        }
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const transaction = event.target.transaction;
        console.info(
          `IndexedDB: Upgrading database to version ${this.version}`,
        );
        for (const [modelName, schema] of Object.entries(this.models)) {
          if (!db.objectStoreNames.contains(modelName)) {
            this._createObjectStore(db, modelName, schema);
          } else {
            this._updateObjectStore(transaction.objectStore(modelName), schema);
          }
        }
      };
    });

    return this.connectionPromise;
  }

  /**
   * Create an object store with indexes
   * @private
   */
  _createObjectStore(db, storeName, schema) {
    const idField = schema.id;
    const useAutoIncrement = !idField || idField.type === "number";

    const store = db.createObjectStore(storeName, {
      keyPath: "id",
      autoIncrement: useAutoIncrement,
    });

    for (const [field, fieldDef] of Object.entries(schema)) {
      if (fieldDef.index === true || fieldDef.unique === true) {
        store.createIndex(field, field, {
          unique: fieldDef.unique ?? false,
          multiEntry: fieldDef.type === "array",
        });
      }
    }

    console.log(
      `IndexedDB: Created object store "${storeName}" with ${Object.keys(schema).length} fields`,
    );
  }

  /**
   * Update object store indexes
   * @private
   */
  _updateObjectStore(store, schema) {
    for (const [field, fieldDef] of Object.entries(schema)) {
      if (
        (fieldDef.index === true || fieldDef.unique === true) &&
        !store.indexNames.contains(field)
      ) {
        store.createIndex(field, field, {
          unique: fieldDef.unique ?? false,
          multiEntry: fieldDef.type === "array",
        });
        console.log(`IndexedDB: Added index for field "${field}"`);
      }
    }
  }

  /**
   * Execute a transaction
   * @private
   */
  async _executeTransaction(storeNames, mode, callback) {
    await this.init();

    return new Promise((resolve, reject) => {
      const stores = Array.isArray(storeNames) ? storeNames : [storeNames];
      const transaction = this.db.transaction(stores, mode);
      const result = callback(transaction);

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Transaction aborted"));
    });
  }

  /**
   * Emit an event if eventEmitter is available
   * @private
   */
  _emit(event, data) {
    if (this.eventEmitter && typeof this.eventEmitter === "function") {
      this.eventEmitter(event, data);
    }
  }

  /**
   * Notify query subscribers that match this record change
   * @param {string} model - Model name
   * @param {string} action - Action type: 'add', 'update', 'delete'
   * @param {Object} record - Changed record
   * @private
   */
  _notifyQuerySubscribers(model, action, record) {
    if (!this.subscriptionManager) return;

    const subManager = this.subscriptionManager;
    const queryHashes = subManager.modelToQueries?.get(model);
    if (!queryHashes) return;

    for (const queryHash of queryHashes) {
      const subscription = subManager.subscriptions?.get(queryHash);
      if (!subscription) continue;

      const shouldNotify =
        action === "delete" ||
        !subscription.where ||
        Object.keys(subscription.where).length === 0 ||
        this.matchesWhere(record, subscription.where);

      if (shouldNotify) {
        subscription.callbacks.forEach((callback) => {
          try {
            callback({ action, record, model });
          } catch (error) {
            console.error(
              "IndexedDB: Error in query subscription callback:",
              error,
            );
          }
        });
      }
    }
  }

  /**
   * Get a single record by ID or query
   * @param {string} model - Model name
   * @param {string|number|Object} idOrWhere - Record ID or where clause object
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object|null>}
   */
  async get(model, idOrWhere, options = {}) {
    try {
      const isId = typeof idOrWhere !== "object" || idOrWhere === null;

      if (isId) {
        const id = idOrWhere;
        let record = await this._executeTransaction(
          model,
          "readonly",
          (transaction) => {
            return new Promise((resolve, reject) => {
              const store = transaction.objectStore(model);
              const request = store.get(id);
              request.onsuccess = () => {
                const row = request.result;
                if (row) {
                  const prepared = this.prepareRow(this.models, model, row, {
                    reverse: true,
                    currentRow: row,
                  });
                  resolve(prepared);
                } else {
                  resolve(null);
                }
              };
              request.onerror = () => reject(request.error);
            });
          },
        );

        if (record && options.includes) {
          record = await this.loadRelationships(
            this,
            this.models,
            model,
            record,
            options.includes,
            options.recursive || false,
          );
        }

        return record;
      } else {
        const where = idOrWhere;
        const results = await this.getAll(model, {
          where,
          limit: 1,
          includes: options.includes,
        });
        return results.length > 0 ? results[0] : null;
      }
    } catch (error) {
      console.error(`IndexedDB: Error getting record from "${model}"`, error);
      throw error;
    }
  }

  /**
   * Get all records matching criteria
   * @param {string} model - Model name
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Object>>}
   */
  async getAll(model, options = {}) {
    this.validateQueryOptions(options);

    try {
      const records = await this._executeTransaction(
        model,
        "readonly",
        (transaction) => {
          return new Promise((resolve, reject) => {
            const store = transaction.objectStore(model);
            const request = store.getAll();

            request.onsuccess = () => {
              const rows = request.result || [];
              const prepared = rows.map((row) =>
                this.prepareRow(this.models, model, row, {
                  reverse: true,
                  currentRow: row,
                }),
              );
              resolve(prepared);
            };
            request.onerror = () => reject(request.error);
          });
        },
      );

      const result = this.buildQueryResult(records, options);
      let items = result.items;

      if (options.includes && items.length > 0) {
        items = await this.loadRelationshipsForMany(
          this,
          this.models,
          model,
          items,
          options.includes,
          options.recursive || false,
        );
      }

      // Return full pagination object if limit was requested
      if (options.limit !== undefined) {
        result.items = items; // items may have relationships loaded
        return result;
      }
      return items;
    } catch (error) {
      console.error(`IndexedDB: Error getting records from "${model}"`, error);
      throw error;
    }
  }

  /**
   * Add a new record
   * @param {string} model - Model name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record with ID
   */
  async add(model, data) {
    // Run beforeAdd hook
    data = await this.runBeforeAdd(model, data);

    const idField = this.models[model]?.id;
    const useStringId = (idField && idField.type === "string") || !idField;
    if (!data.id) data.id = this.generateId(useStringId);

    const validation = this.validateRow(this.models, model, data, {
      operation: "add",
    });
    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${JSON.stringify(validation.errors)}`,
      );
    }

    try {
      const prepared = this.prepareRow(this.models, model, data);

      const id = await this._executeTransaction(
        model,
        "readwrite",
        (transaction) => {
          return new Promise((resolve, reject) => {
            try {
              const store = transaction.objectStore(model);
              const request = store.add(prepared);

              request.onsuccess = () => {
                if (!this.system) {
                  this._emit(`ModelAddRecord-${model}`, {
                    model,
                    row: prepared,
                  });
                  this._emit("onAddRecord", { model, row: prepared });
                  this._notifyQuerySubscribers(model, "add", prepared);
                }
                resolve(request.result);
              };
              request.onerror = () => reject(request.error);
            } catch (error) {
              reject(error);
            }
          });
        },
      );

      const result = await this.get(model, id);
      // Run afterAdd hook
      return this.runAfterAdd(model, result);
    } catch (error) {
      console.error(`IndexedDB: Error adding record to "${model}"`, error);
      throw error;
    }
  }

  /**
   * Update an existing record
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async edit(model, id, data) {
    // Strip immutable fields
    data = this.stripImmutableFields(model, data);

    // Run beforeEdit hook
    data = await this.runBeforeEdit(model, { ...data, id });

    const validation = this.validateRow(this.models, model, data, {
      operation: "edit",
    });
    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${JSON.stringify(validation.errors)}`,
      );
    }

    try {
      const currentRecord = await this.get(model, id);
      if (!currentRecord) {
        throw new Error(`Record with id ${id} not found in model "${model}"`);
      }

      const merged = this.mergeRowUpdates(currentRecord, data);
      merged.id = id;
      const prepared = this.prepareRow(this.models, model, merged, {
        currentRow: currentRecord,
      });

      await this._executeTransaction(model, "readwrite", (transaction) => {
        return new Promise((resolve, reject) => {
          const store = transaction.objectStore(model);
          const request = store.put(prepared);

          request.onsuccess = () => {
            if (!this.system) {
              this._emit(`ModelEditRecord-${model}`, {
                model,
                row: prepared,
              });
              this._emit("onEditRecord", { model, row: prepared });
              this._notifyQuerySubscribers(model, "update", prepared);
            }
            resolve(request.result);
          };
          request.onerror = () => reject(request.error);
        });
      });

      const result = await this.get(model, id);
      // Run afterEdit hook
      return this.runAfterEdit(model, result);
    } catch (error) {
      console.error(`IndexedDB: Error updating record in "${model}"`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async remove(model, id) {
    try {
      const record = await this.get(model, id);

      // Run beforeRemove hook - can return false to cancel
      const shouldProceed = await this.runBeforeRemove(model, id, record);
      if (!shouldProceed) {
        return false;
      }

      await this._executeTransaction(model, "readwrite", (transaction) => {
        return new Promise((resolve, reject) => {
          const store = transaction.objectStore(model);
          const request = store.delete(id);
          request.onsuccess = () => {
            if (!this.system) {
              this._emit(`ModelRemoveRecord-${model}`, { model, id });
              this._emit("onRemoveRecord", { model, id });
              this._notifyQuerySubscribers(model, "delete", record || { id });
            }
            resolve(true);
          };
          request.onerror = () => reject(request.error);
        });
      });

      // Run afterRemove hook
      await this.runAfterRemove(model, id, record);

      console.log(`IndexedDB: Deleted record ${id} from "${model}"`);
      return true;
    } catch (error) {
      console.error(`IndexedDB: Error deleting record from "${model}"`, error);
      throw error;
    }
  }

  /**
   * Count records matching criteria
   * @param {string} model - Model name
   * @param {Object} [options={}] - Query options
   * @returns {Promise<number>}
   */
  async count(model, options = {}) {
    const records = await this.getAll(model, { where: options.where });
    return records.length;
  }

  /**
   * Execute operations in a transaction
   * @param {Function} callback - Async function to execute
   * @returns {Promise<*>} Result of callback
   */
  async transaction(callback) {
    await this.init();
    return callback(this);
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isConnected = false;
      this.connectionPromise = null;
      console.log("IndexedDB: Connection closed");
    }
  }

  /**
   * Export all model data
   * @returns {Promise<Object>} Data dump object
   */
  async exportData() {
    const dump = {};
    for (const modelName of Object.keys(this.models)) {
      dump[modelName] = await this.getAll(modelName, { object: true });
    }
    return dump;
  }

  /**
   * Import data with optional ID preservation
   * @param {Object} dump - Data dump object
   * @param {Object} options - Import options
   * @param {boolean} options.keepIndex - Whether to preserve original IDs
   * @returns {Promise<void>}
   */
  async importData(dump, options = {}) {
    for (const [modelName, entries] of Object.entries(dump)) {
      if (this.models[modelName])
        await this.addMany(modelName, entries, {
          keepIndex: options.keepIndex,
        });
    }
  }

  /**
   * Get system model manager if supported
   * @returns {SystemModelManager|null}
   */
  getSystemModelManager() {
    return this.systemModelManager;
  }

  /**
   * Get adapter metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      type: "indexeddb",
      isConnected: this.isConnected,
      dbName: this.name,
    };
  }
}

export default IndexedDBAdapter;
