/**
 * @file Hybrid Adapter Entry Point
 * @description Main entry point for @bootstrapp/model-hybrid package
 */

export { default, HybridAdapter } from "./adapter.js";

/**
 * Create a configured Hybrid adapter
 * @param {Object} config - Adapter configuration
 * @param {string} config.name - Database name
 * @param {number} config.version - Database version
 * @param {Object} config.models - Model schemas
 * @param {string} config.url - PocketBase server URL
 * @param {Object} config.IndexedDBAdapter - IndexedDB adapter class
 * @param {Object} config.PocketBaseAdapter - PocketBase adapter class
 * @param {Object} [config.options] - Additional options
 * @returns {HybridAdapter}
 *
 */
import { HybridAdapter } from "./adapter.js";

export function createHybridAdapter(config) {
  return new HybridAdapter(config);
}
