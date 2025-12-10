/**
 * @file PocketBase Adapter Entry Point
 * @description Main entry point for @bootstrapp/model-pocketbase package
 */

export { PocketBaseAdapter, default } from "./adapter.js";
export { DatabaseAdapterBase, validateAdapter } from "./base.js";
export { AuthManager } from "./auth-manager.js";
export { RealtimeManager } from "./realtime-manager.js";
export { buildFilterString, validateWhereClause } from "./filter-builder.js";
export {
  loadRelationships,
  loadRelationshipsForMany,
  loadNestedRelationships,
  parseIncludes,
} from "./relationship-loader.js";

/**
 * Create a configured PocketBase adapter
 * @param {Object} config - Adapter configuration
 * @param {string} config.url - PocketBase server URL
 * @param {Object} config.models - Model schemas
 * @param {Object} config.PocketBase - PocketBase constructor
 * @param {Object} [config.options] - Additional options
 * @returns {PocketBaseAdapter}
 *
 * @example
 * import PocketBase from "pocketbase";
 * import { createPocketBaseAdapter } from "@bootstrapp/model-pocketbase";
 *
 * const adapter = createPocketBaseAdapter({
 *   url: "http://localhost:8090",
 *   models: $APP.models,
 *   PocketBase,
 *   validateRow: (models, model, data) => ({ valid: true }),
 *   parseOrder: (order) => [{ field: order, direction: "ASC" }],
 * });
 *
 * await adapter.init();
 */
import { PocketBaseAdapter } from "./adapter.js";

export function createPocketBaseAdapter(config) {
  return new PocketBaseAdapter(config);
}
