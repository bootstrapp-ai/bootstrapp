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
  async importData(dump, options = {}) {
    console.error({ dump, options });
  }

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
