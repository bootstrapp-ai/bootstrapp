/**
 * @file Database Adapter Factory
 * @description Factory function to create database adapters with lazy loading
 */

/**
 * Registry of available adapter types
 * @type {Map<string, Class>}
 */
const ADAPTER_REGISTRY = new Map();

/**
 * Register a database adapter
 * @param {string} type - Adapter type name
 * @param {Class} AdapterClass - Adapter class
 * @example
 * import { IndexedDBAdapter } from "@bootstrapp/model-indexeddb";
 * registerAdapter('indexeddb', IndexedDBAdapter);
 */
export function registerAdapter(type, AdapterClass) {
  if (ADAPTER_REGISTRY.has(type)) {
    console.warn(`Database: Overwriting existing adapter type "${type}"`);
  }
  ADAPTER_REGISTRY.set(type, AdapterClass);
  console.info(`Database: Registered adapter type "${type}"`);
}

/**
 * Create a database adapter instance
 * @param {Object} config - Configuration object
 * @param {string} [config.type='indexeddb'] - Adapter type
 * @param {string} config.name - Database name
 * @param {number} [config.version=1] - Database version
 * @param {Object} config.models - Model schemas
 * @returns {Promise<Object>} Adapter instance
 *
 * @example
 * import { createDatabase, registerAdapter } from "@bootstrapp/model/factory";
 * import { IndexedDBAdapter } from "@bootstrapp/model-indexeddb";
 *
 * registerAdapter('indexeddb', IndexedDBAdapter);
 *
 * const db = await createDatabase({
 *   type: 'indexeddb',
 *   name: 'myapp',
 *   version: 1,
 *   models: { user: {...}, post: {...} }
 * });
 */
export async function createDatabase(config) {
  if (typeof config === "string") {
    config = { type: config };
  }

  const { type = "indexeddb", name, version = 1, models = {} } = config;

  if (!name) {
    throw new Error("Database name is required");
  }

  if (!models || Object.keys(models).length === 0) {
    console.warn(`Database: No models provided for database "${name}"`);
  }

  // Check registry first
  if (!ADAPTER_REGISTRY.has(type)) {
    throw new Error(
      `Unknown adapter type "${type}". Available types: ${getAvailableAdapters().join(", ")}. Use registerAdapter() to register adapters.`,
    );
  }

  const AdapterClass = ADAPTER_REGISTRY.get(type);
  const adapter = new AdapterClass(config);

  console.info(`Database: Created ${type} adapter for "${name}" v${version}`);

  return adapter;
}

/**
 * Get list of registered adapter types
 * @returns {Array<string>} List of adapter type names
 */
export function getAvailableAdapters() {
  return Array.from(ADAPTER_REGISTRY.keys());
}

/**
 * Check if an adapter type is registered
 * @param {string} type - Adapter type name
 * @returns {boolean} True if adapter is registered
 */
export function hasAdapter(type) {
  return ADAPTER_REGISTRY.has(type);
}

export default {
  createDatabase,
  registerAdapter,
  getAvailableAdapters,
  hasAdapter,
};
