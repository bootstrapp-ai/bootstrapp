/**
 * @file PocketBase Database Adapter
 * @description PocketBase adapter implementing the database interface
 */

import { DatabaseAdapterBase } from "./base.js";
import { AuthManager } from "./auth-manager.js";
import { buildFilterString } from "./filter-builder.js";
import { RealtimeManager } from "./realtime-manager.js";
import {
  loadRelationships,
  loadRelationshipsForMany,
} from "./relationship-loader.js";

/**
 * PocketBase Adapter Configuration
 * @typedef {Object} PocketBaseConfig
 * @property {string} url - PocketBase server URL
 * @property {string} [email] - Auto-login email (optional)
 * @property {string} [password] - Auto-login password (optional)
 * @property {string} [authToken] - Pre-authenticated token (optional)
 * @property {boolean} [autoAuth] - Enable auto-authentication (default: false)
 * @property {Object} models - Model schemas
 * @property {string} name - Database name (for logging)
 * @property {number} [version] - Version number
 * @property {string} [adminEmail] - Admin email for collection management
 * @property {string} [adminPassword] - Admin password for collection management
 * @property {Object} [PocketBase] - PocketBase constructor (injected)
 * @property {Function} [validateRow] - Row validation function (injected)
 * @property {Function} [parseOrder] - Order parser function (injected)
 * @property {Function} [eventEmitter] - Event emitter for reactivity
 */

export class PocketBaseAdapter extends DatabaseAdapterBase {
  constructor(config) {
    super(config);
    // PocketBase specific config
    this.url = config.url;
    this.email = config.email;
    this.password = config.password;
    this.authToken = config.authToken;
    this.autoAuth = config.autoAuth || false;

    // Admin credentials for collection management
    this.adminEmail = config.adminEmail;
    this.adminPassword = config.adminPassword;

    // Injected dependencies
    this.PocketBase = config.PocketBase;
    this.validateRow = config.validateRow || (() => ({ valid: true, errors: {} }));
    this.parseOrder = config.parseOrder || ((order) => (typeof order === "string" ? [{ field: order, direction: "ASC" }] : order || []));
    this.eventEmitter = config.eventEmitter || null;

    // Instance properties
    this.pb = null;
    this.isConnected = false;
    this.authManager = null;
    this.realtimeManager = null;
  }

  /**
   * Initialize PocketBase connection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.pb) return;

    if (!this.PocketBase) {
      throw new Error(
        "PocketBase constructor not provided. Pass it via config.PocketBase",
      );
    }

    try {
      this.pb = new this.PocketBase(this.url);

      // Initialize auth manager
      this.authManager = new AuthManager(this.pb, {
        email: this.email,
        password: this.password,
        authToken: this.authToken,
        autoAuth: this.autoAuth,
        adminEmail: this.adminEmail,
        adminPassword: this.adminPassword,
      });

      // Initialize realtime manager
      this.realtimeManager = new RealtimeManager(this.pb);

      // Auto-authenticate if configured
      if (this.autoAuth) {
        await this.authManager.authenticate();
      }

      // Ensure collections exist
      await this.ensureCollections();

      this.isConnected = true;
      console.info(`PocketBase: Connected to ${this.url}`);

      if (this.onConnected && typeof this.onConnected === "function") {
        this.onConnected();
      }
    } catch (error) {
      console.error("PocketBase: Failed to initialize", error);
      throw new Error(`Failed to initialize PocketBase: ${error.message}`);
    }
  }

  /**
   * Ensure all collections exist for the defined models
   * @returns {Promise<void>}
   * @private
   */
  async ensureCollections() {
    try {
      console.log("PocketBase: Ensuring collections exist...");

      const collections = await this.pb.collections.getFullList();
      const existingCollections = new Map(collections.map((c) => [c.name, c]));

      for (const [modelName, schema] of Object.entries(this.models)) {
        const collectionName = this._getCollectionName(modelName);
        const pbSchema = this._buildPocketBaseSchema(schema);

        if (!existingCollections.has(collectionName)) {
          console.log(`PocketBase: Creating collection "${collectionName}"...`);
          await this.pb.collections.create({
            name: collectionName,
            type: "base",
            fields: pbSchema,
          });
          console.log(
            `PocketBase: Created collection "${collectionName}" with ${pbSchema.length} fields`,
          );
        } else {
          const existingCollection = existingCollections.get(collectionName);
          const updatedSchema = this._mergeSchemas(
            existingCollection.fields,
            pbSchema,
          );

          if (updatedSchema.added.length > 0) {
            console.log(
              `PocketBase: Updating collection "${collectionName}" - adding ${updatedSchema.added.length} new fields...`,
            );
            await this.pb.collections.update(existingCollection.id, {
              schema: updatedSchema.merged,
            });
            console.log(`PocketBase: Updated collection "${collectionName}"`);
          } else {
            console.log(
              `PocketBase: Collection "${collectionName}" already up-to-date`,
            );
          }
        }
      }
    } catch (error) {
      console.error("PocketBase: Failed to ensure collections", error);
      throw error;
    }
  }

  /**
   * Build PocketBase schema from bootstrapp model schema
   * @private
   */
  _buildPocketBaseSchema(modelSchema) {
    const fields = [];

    for (const [fieldName, fieldDef] of Object.entries(modelSchema)) {
      if (fieldName === "id") continue;

      const pbType = this._mapFieldType(fieldDef);
      const field = {
        name: fieldName,
        type: pbType,
        required: fieldDef.required || false,
        options: this._buildFieldOptions(pbType, fieldDef),
      };

      fields.push(field);
    }

    return fields;
  }

  /**
   * Map bootstrapp field type to PocketBase field type
   * @private
   */
  _mapFieldType(fieldDef) {
    const type = fieldDef.type;

    switch (type) {
      case "string":
        return "text";
      case "number":
        return "number";
      case "boolean":
        return "bool";
      case "array":
        return "json";
      case "object":
        return "json";
      case "date":
        return "date";
      default:
        return "text";
    }
  }

  /**
   * Build type-specific options for PocketBase field
   * @private
   */
  _buildFieldOptions(pbType, fieldDef) {
    const options = {};

    switch (pbType) {
      case "text":
        options.min = null;
        options.max = null;
        options.pattern = "";
        if (fieldDef.defaultValue !== undefined) {
          options.default = fieldDef.defaultValue;
        }
        break;

      case "number":
        options.min = null;
        options.max = null;
        options.noDecimal = false;
        if (fieldDef.defaultValue !== undefined) {
          options.default = fieldDef.defaultValue;
        }
        break;

      case "bool":
        if (fieldDef.defaultValue !== undefined) {
          options.default = fieldDef.defaultValue;
        }
        break;

      case "json":
        options.maxSize = 2000000;
        if (fieldDef.defaultValue !== undefined) {
          options.default = JSON.stringify(fieldDef.defaultValue);
        }
        break;

      case "date":
        options.min = "";
        options.max = "";
        if (fieldDef.defaultValue !== undefined) {
          options.default = fieldDef.defaultValue;
        }
        break;
    }

    return options;
  }

  /**
   * Merge existing PocketBase schema with new schema
   * @private
   */
  _mergeSchemas(existingSchema, newSchema) {
    const existingFieldNames = new Set(existingSchema.map((f) => f.name));

    const added = [];
    const merged = [...existingSchema];

    for (const field of newSchema) {
      if (!existingFieldNames.has(field.name)) {
        merged.push(field);
        added.push(field.name);
      }
    }

    return { merged, added };
  }

  /**
   * Get collection name from model name
   * @private
   */
  _getCollectionName(modelName) {
    const schema = this.models[modelName];
    return schema?.collectionName || modelName;
  }

  /**
   * Build PocketBase query options from Model API options
   * @private
   */
  _buildQueryOptions(options = {}) {
    const { where, order, limit, offset, includes } = options;
    const pbOptions = {};

    if (where) {
      pbOptions.filter = buildFilterString(where);
    }

    if (order) {
      const orderArray = this.parseOrder(order);
      pbOptions.sort = orderArray
        .map(({ field, direction }) =>
          direction === "DESC" ? `-${field}` : `+${field}`,
        )
        .join(",");
    }

    if (limit) {
      pbOptions.perPage = limit;

      if (offset) {
        pbOptions.page = Math.floor(offset / limit) + 1;
      }
    }

    if (includes && includes.length > 0) {
      pbOptions.expand = includes.join(",");
    }

    return pbOptions;
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
   * Get a single record by ID
   * @param {string} model - Model name
   * @param {string|number|Object} idOrWhere - Record ID or where clause
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object|null>}
   */
  async get(model, idOrWhere, options = {}) {
    await this.init();

    try {
      const collection = this._getCollectionName(model);
      const isId = typeof idOrWhere !== "object" || idOrWhere === null;

      if (isId) {
        const id = idOrWhere;
        const pbOptions = this._buildQueryOptions(options);

        const record = await this.pb
          .collection(collection)
          .getOne(id, pbOptions);

        if (options.includes && !pbOptions.expand) {
          return await loadRelationships(
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
      if (error.status === 404) {
        return null;
      }
      console.error(`PocketBase: Error getting record from "${model}"`, error);
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
    await this.init();

    try {
      const collection = this._getCollectionName(model);
      const pbOptions = this._buildQueryOptions(options);

      const records = await this.pb
        .collection(collection)
        .getFullList(pbOptions);

      let items = records;
      if (options.includes && items.length > 0 && !pbOptions.expand) {
        items = await loadRelationshipsForMany(
          this,
          this.models,
          model,
          items,
          options.includes,
          options.recursive || false,
        );
      }

      return items;
    } catch (error) {
      console.error(`PocketBase: Error getting records from "${model}"`, error);
      throw error;
    }
  }

  /**
   * Add a new record
   * @param {string} model - Model name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async add(model, data) {
    await this.init();

    const validation = this.validateRow(this.models, model, data, {
      operation: "add",
    });
    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${JSON.stringify(validation.errors)}`,
      );
    }

    try {
      const collection = this._getCollectionName(model);
      const record = await this.pb.collection(collection).create(data);

      if (!this.system) {
        this._emit(`ModelAddRecord-${model}`, { model, row: record });
        this._emit("onAddRecord", { model, row: record });
      }

      console.log(`PocketBase: Added record to "${model}"`, record.id);
      return record;
    } catch (error) {
      console.error(
        `PocketBase: Error adding record to "${model}"`,
        error,
        error.data,
        data,
      );
      throw error;
    }
  }

  /**
   * Add multiple records in a batch
   * @param {string} model - Model name
   * @param {Array<Object>} dataArray - Array of records to create
   * @returns {Promise<Array<Object>>} Array of created records
   */
  async addMany(model, dataArray) {
    await this.init();

    const collection = this._getCollectionName(model);
    const results = [];

    console.log(
      `PocketBase: Batch creating ${dataArray.length} records in "${model}"...`,
    );

    const batchSize = 10;

    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      const promises = batch.map((data) => {
        const validation = this.validateRow(this.models, model, data, {
          operation: "add",
        });
        if (!validation.valid) {
          console.warn(`Skipping invalid record:`, validation.errors);
          return null;
        }
        return this.pb
          .collection(collection)
          .create(data)
          .catch((err) => {
            console.error(`Failed to create record:`, err);
            return null;
          });
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults.filter((r) => r !== null));

      console.log(
        `PocketBase: Created ${i + batch.length}/${dataArray.length} records...`,
      );
    }

    if (!this.system) {
      results.forEach((record) => {
        this._emit(`ModelAddRecord-${model}`, { model, row: record });
        this._emit("onAddRecord", { model, row: record });
      });
    }

    console.log(
      `PocketBase: Batch create complete. Created ${results.length}/${dataArray.length} records in "${model}"`,
    );
    return results;
  }

  /**
   * Update an existing record
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async edit(model, id, data) {
    await this.init();

    const validation = this.validateRow(this.models, model, data, {
      operation: "edit",
    });
    if (!validation.valid) {
      throw new Error(
        `Validation failed: ${JSON.stringify(validation.errors)}`,
      );
    }

    try {
      const collection = this._getCollectionName(model);
      const record = await this.pb.collection(collection).update(id, data);

      if (!this.system) {
        this._emit(`ModelEditRecord-${model}`, { model, row: record });
        this._emit("onEditRecord", { model, row: record });
      }

      console.log(`PocketBase: Updated record ${id} in "${model}"`);
      return record;
    } catch (error) {
      console.error(`PocketBase: Error updating record in "${model}"`, error);
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
    await this.init();

    try {
      const collection = this._getCollectionName(model);
      await this.pb.collection(collection).delete(id);

      if (!this.system) {
        this._emit(`ModelRemoveRecord-${model}`, { model, id });
        this._emit("onRemoveRecord", { model, id });
      }

      console.log(`PocketBase: Deleted record ${id} from "${model}"`);
      return true;
    } catch (error) {
      console.error(`PocketBase: Error deleting record from "${model}"`, error);
      throw error;
    }
  }

  /**
   * Count records matching criteria
   * @param {string} model - Model name
   * @param {Object} [options={}] - Query options (where clause)
   * @returns {Promise<number>}
   */
  async count(model, options = {}) {
    await this.init();

    try {
      const collection = this._getCollectionName(model);
      const pbOptions = this._buildQueryOptions(options);

      const result = await this.pb.collection(collection).getList(1, 1, {
        ...pbOptions,
        skipTotal: false,
      });

      return result.totalItems || 0;
    } catch (error) {
      console.error(`PocketBase: Error counting records in "${model}"`, error);
      throw error;
    }
  }

  /**
   * Execute operations in a transaction
   * Note: PocketBase doesn't support client-side transactions
   * @param {Function} callback - Async function to execute
   * @returns {Promise<*>}
   */
  async transaction(callback) {
    await this.init();
    console.warn(
      "PocketBase: Client-side transactions not supported, executing operations sequentially",
    );
    return callback(this);
  }

  /**
   * Subscribe to real-time updates for a model
   * @param {string} model - Model name
   * @param {string|Function} filterOrCallback - PocketBase filter string or callback
   * @param {Function} [callback] - Callback for updates (if filter provided)
   * @returns {Function} Unsubscribe function
   */
  subscribe(model, filterOrCallback, callback) {
    if (typeof filterOrCallback === "function") {
      return this.realtimeManager.subscribe(model, null, filterOrCallback);
    }
    return this.realtimeManager.subscribe(model, filterOrCallback, callback);
  }

  /**
   * Close connection and cleanup
   * @returns {Promise<void>}
   */
  async close() {
    if (this.realtimeManager) {
      this.realtimeManager.cleanup();
    }

    this.pb = null;
    this.isConnected = false;
    console.log("PocketBase: Connection closed");
  }

  /**
   * Export all model data
   * @returns {Promise<Object>} Data dump object
   */
  async exportData() {
    const dump = {};
    for (const modelName of Object.keys(this.models)) {
      const records = await this.getAll(modelName);
      dump[modelName] = records;
    }
    return dump;
  }

  /**
   * Import data into PocketBase
   * @param {Object} dump - Data dump object
   * @param {Object} options - Import options
   * @returns {Promise<void>}
   */
  async importData(dump, options = {}) {
    for (const [modelName, entries] of Object.entries(dump)) {
      if (this.models[modelName]) {
        for (const entry of entries) {
          await this.add(modelName, entry);
        }
      }
    }
  }

  /**
   * Get adapter metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      ...super.getMetadata(),
      type: "pocketbase",
      url: this.url,
      isConnected: this.isConnected,
      isAuthenticated: this.authManager?.isAuthenticated() || false,
    };
  }

  /**
   * Get the PocketBase instance
   * @returns {Object|null}
   */
  getPocketBase() {
    return this.pb;
  }

  /**
   * Get the auth manager
   * @returns {AuthManager|null}
   */
  getAuthManager() {
    return this.authManager;
  }

  /**
   * Get the realtime manager
   * @returns {RealtimeManager|null}
   */
  getRealtimeManager() {
    return this.realtimeManager;
  }
}

export default PocketBaseAdapter;
