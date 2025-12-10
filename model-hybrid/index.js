/**
 * @file Hybrid Adapter Entry Point
 * @description Main entry point for @bootstrapp/model-hybrid package
 */

export { HybridAdapter, default } from "./adapter.js";

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
 * @example
 * import PocketBase from "pocketbase";
 * import { createHybridAdapter } from "@bootstrapp/model-hybrid";
 * import { IndexedDBAdapter } from "@bootstrapp/model-indexeddb";
 * import { PocketBaseAdapter } from "@bootstrapp/model-pocketbase";
 *
 * const adapter = createHybridAdapter({
 *   name: "my-app",
 *   version: 1,
 *   url: "http://localhost:8090",
 *   models: $APP.models,
 *   IndexedDBAdapter,
 *   PocketBaseAdapter,
 *   PocketBase,
 *   userId: currentUser.id,
 *   conflictStrategy: "remote-wins",
 * });
 *
 * await adapter.init();
 */
import { HybridAdapter } from "./adapter.js";

export function createHybridAdapter(config) {
  return new HybridAdapter(config);
}
