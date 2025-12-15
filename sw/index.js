/**
 * @file Service Worker Module
 * @description Service Worker communication and caching for Bootstrapp apps
 *
 * This module provides:
 * - Frontend: SW communication, messaging, request/response patterns
 * - Backend: Cache management, fetch handling, filesystem operations
 * - Adapter: Virtual filesystem API for SW cache storage
 */

export { default as SWAdapter } from "./adapter.js";
export { initSWBackend } from "./backend.js";
export { default as createFSHandlers } from "./filesystem.js";
export {
  applyUpdate,
  checkForUpdates,
  disableAutoUpdates,
  enableAutoUpdates,
  hasUpdate,
  initSWFrontend,
  setRegistration,
} from "./frontend.js";
