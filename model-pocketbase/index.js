/**
 * @file PocketBase Adapter Entry Point
 * @description Main entry point for @bootstrapp/model-pocketbase package
 */

export {
  DatabaseAdapterBase,
  validateAdapter,
} from "/$app/model/adapter-base.js";
export { default, PocketBaseAdapter } from "./adapter.js";
export { AuthManager } from "./auth-manager.js";
export { buildFilterString, validateWhereClause } from "./filter-builder.js";
export { RealtimeManager } from "./realtime-manager.js";
export {
  loadNestedRelationships,
  loadRelationships,
  loadRelationshipsForMany,
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
 */
import { PocketBaseAdapter } from "./adapter.js";

export function createPocketBaseAdapter(config) {
  return new PocketBaseAdapter(config);
}
