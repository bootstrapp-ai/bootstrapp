/**
 * @file Database Adapter Base Class
 * @description Abstract base class that all database adapters must extend
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [limit] - Maximum number of records to return
 * @property {number} [offset] - Number of records to skip
 * @property {string|Array<{field: string, direction: 'ASC'|'DESC'}>} [order] - Sort order
 * @property {Object} [where] - Filter conditions
 * @property {Array<string>} [includes] - Relationships to load
 * @property {boolean} [recursive] - Load nested relationships
 */

/**
 * Abstract base class for database adapters
 * All adapters should extend this class and implement its methods
 */
export class DatabaseAdapterBase {
  constructor({ name, version, models, system, onConnected }) {
    this.name = name;
    this.version = version;
    this.models = models;
    this.system = system;
    this.onConnected = onConnected;
  }

  /**
   * Initialize the database connection
   * @returns {Promise<void>}
   * @abstract
   */
  async init() {
    throw new Error("init() must be implemented by adapter");
  }

  /**
   * Get a single record by ID
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {QueryOptions} [options={}] - Query options
   * @returns {Promise<Object|null>} The record or null if not found
   * @abstract
   */
  async get(model, id, options = {}) {
    throw new Error("get() must be implemented by adapter");
  }

  /**
   * Get multiple records
   * @param {string} model - Model name
   * @param {QueryOptions} [options={}] - Query options
   * @returns {Promise<Array<Object>>} Array of records
   * @abstract
   */
  async getAll(model, options = {}) {
    throw new Error("getAll() must be implemented by adapter");
  }

  /**
   * Add a new record
   * @param {string} model - Model name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} The created record with ID
   * @abstract
   */
  async add(model, data) {
    throw new Error("add() must be implemented by adapter");
  }

  /**
   * Add multiple records in a batch
   * @param {string} model - Model name
   * @param {Array<Object>} dataArray - Array of records to create
   * @returns {Promise<Array<Object>>} Array of created records
   */
  async addMany(model, dataArray) {
    const results = [];
    for (const data of dataArray) {
      results.push(await this.add(model, data));
    }
    return results;
  }

  /**
   * Update an existing record
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} The updated record
   * @abstract
   */
  async edit(model, id, data) {
    throw new Error("edit() must be implemented by adapter");
  }

  /**
   * Delete a record
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @abstract
   */
  async remove(model, id) {
    throw new Error("remove() must be implemented by adapter");
  }

  /**
   * Count records matching criteria
   * @param {string} model - Model name
   * @param {QueryOptions} [options={}] - Query options (where clause)
   * @returns {Promise<number>} Count of matching records
   * @abstract
   */
  async count(model, options = {}) {
    throw new Error("count() must be implemented by adapter");
  }

  /**
   * Execute operations within a transaction
   * @param {Function} callback - Async function to execute in transaction
   * @returns {Promise<*>} Result of the callback
   * @abstract
   */
  async transaction(callback) {
    throw new Error("transaction() must be implemented by adapter");
  }

  /**
   * Close the database connection
   * @returns {Promise<void>}
   * @abstract
   */
  async close() {
    throw new Error("close() must be implemented by adapter");
  }

  /**
   * Export all data from this adapter
   * @returns {Promise<Object>} Data dump object
   */
  async exportData() {
    return {};
  }

  /**
   * Import data into this adapter
   * @param {Object} dump - Data dump object
   * @param {Object} options - Import options
   * @param {boolean} options.keepIndex - Whether to preserve original IDs
   * @returns {Promise<void>}
   */
  async importData(dump, options = {}) {}

  /**
   * Get system model manager if supported
   * @returns {Object|null}
   */
  getSystemModelManager() {
    return null;
  }

  /**
   * Get adapter metadata
   * @returns {Object} Metadata about the adapter
   */
  getMetadata() {
    return {
      name: this.constructor.name,
      type: "unknown",
      version: this.version,
      models: Object.keys(this.models || {}),
      system: this.system,
    };
  }

  // ============================================
  // Hook System - Call these from concrete adapters
  // ============================================

  /**
   * Run beforeAdd hook if defined in schema
   * @param {string} model - Model name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Modified data
   */
  async runBeforeAdd(model, data) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeAdd) {
      return await schema.$hooks.beforeAdd(data, {
        model,
        adapter: this,
        operation: "add",
      });
    }
    return data;
  }

  /**
   * Run afterAdd hook if defined in schema
   * @param {string} model - Model name
   * @param {Object} result - Created record
   * @returns {Promise<Object>} Result (unchanged)
   */
  async runAfterAdd(model, result) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterAdd) {
      await schema.$hooks.afterAdd(result, {
        model,
        adapter: this,
        operation: "add",
      });
    }
    return result;
  }

  /**
   * Run beforeEdit hook if defined in schema
   * @param {string} model - Model name
   * @param {Object} data - Update data (should include id)
   * @returns {Promise<Object>} Modified data
   */
  async runBeforeEdit(model, data) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeEdit) {
      return await schema.$hooks.beforeEdit(data, {
        model,
        adapter: this,
        operation: "edit",
      });
    }
    return data;
  }

  /**
   * Run afterEdit hook if defined in schema
   * @param {string} model - Model name
   * @param {Object} result - Updated record
   * @returns {Promise<Object>} Result (unchanged)
   */
  async runAfterEdit(model, result) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterEdit) {
      await schema.$hooks.afterEdit(result, {
        model,
        adapter: this,
        operation: "edit",
      });
    }
    return result;
  }

  /**
   * Run beforeRemove hook if defined in schema
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {Object} record - Record being deleted
   * @returns {Promise<boolean>} False to cancel deletion
   */
  async runBeforeRemove(model, id, record) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeRemove) {
      const result = await schema.$hooks.beforeRemove(record, {
        model,
        adapter: this,
        operation: "remove",
        id,
      });
      // Return false to cancel deletion
      if (result === false) return false;
    }
    return true;
  }

  /**
   * Run afterRemove hook if defined in schema
   * @param {string} model - Model name
   * @param {string|number} id - Deleted record ID
   * @param {Object} record - Deleted record data
   */
  async runAfterRemove(model, id, record) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterRemove) {
      await schema.$hooks.afterRemove(record, {
        model,
        adapter: this,
        operation: "remove",
        id,
      });
    }
  }

  /**
   * Strip immutable fields from update data
   * Call this in edit() before validation
   * @param {string} model - Model name
   * @param {Object} data - Update data
   * @returns {Object} Data with immutable fields removed
   */
  stripImmutableFields(model, data) {
    const schema = this.models?.[model];
    if (!schema) return data;

    const result = { ...data };
    for (const [field, prop] of Object.entries(schema)) {
      if (field.startsWith("$")) continue; // Skip special keys like $hooks
      if (prop?.immutable && field in result && field !== "id") {
        delete result[field];
      }
    }
    return result;
  }
}

/**
 * Validate adapter implementation
 * @param {DatabaseAdapterBase} adapter - Adapter instance to validate
 * @throws {Error} If adapter doesn't implement required methods
 */
export function validateAdapter(adapter) {
  const requiredMethods = [
    "init",
    "get",
    "getAll",
    "add",
    "edit",
    "remove",
    "count",
    "transaction",
    "close",
  ];

  const missing = requiredMethods.filter(
    (method) => typeof adapter[method] !== "function",
  );

  if (missing.length > 0) {
    throw new Error(
      `Adapter ${adapter.constructor.name} is missing required methods: ${missing.join(", ")}`,
    );
  }

  return true;
}

export default DatabaseAdapterBase;
