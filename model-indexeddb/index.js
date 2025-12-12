/**
 * @file IndexedDB Adapter Entry Point
 * @description Main entry point for @bootstrapp/model-indexeddb package
 */

export { IndexedDBAdapter, default } from "./adapter.js";
export { DatabaseAdapterBase, validateAdapter } from "/$app/model/adapter-base.js";
export { SystemModelManager } from "./system-model-manager.js";

/**
 * Create a configured IndexedDB adapter
 * @param {Object} config - Adapter configuration
 * @param {string} config.name - Database name
 * @param {number} config.version - Database version
 * @param {Object} config.models - Model schemas
 * @param {Object} [config.options] - Additional options
 * @returns {IndexedDBAdapter}
 *
 * @example
 * import { createIndexedDBAdapter } from "@bootstrapp/model-indexeddb";
 * import { buildQueryResult, matchesWhere, validateRow, prepareRow } from "@bootstrapp/model";
 *
 * const adapter = createIndexedDBAdapter({
 *   name: "my-app",
 *   version: 1,
 *   models: $APP.models,
 *   buildQueryResult,
 *   matchesWhere,
 *   validateRow,
 *   prepareRow,
 * });
 *
 * await adapter.init();
 */
import { IndexedDBAdapter } from "./adapter.js";

export function createIndexedDBAdapter(config) {
  return new IndexedDBAdapter(config);
}
