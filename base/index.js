/**
 * @file Bootstrapp Base Meta Package
 * @description Re-exports all core Bootstrapp modules for convenient imports
 *
 * Usage:
 *   import { T, View, createModel, Auth } from "@bootstrapp/base";
 *
 * Or import individual packages:
 *   import T from "@bootstrapp/types";
 *   import { View } from "@bootstrapp/view";
 */

export { initAuthBackend } from "/node_modules/@bootstrapp/auth/backend.js";
// Auth - Authentication
export { initAuthFrontend } from "/node_modules/@bootstrapp/auth/frontend.js";
// Controller - Reactive state management
export { Controller, createController } from "/node_modules/@bootstrapp/controller/index.js";
// Events - Pub/sub event system
export { default as createEventHandler } from "/node_modules/@bootstrapp/events/index.js";
// Model - ORM-like data layer
export { createModel, default as Model, ModelType } from "/node_modules/@bootstrapp/model/index.js";
export { initModelBackend } from "/node_modules/@bootstrapp/model/backend.js";
export { initModelFrontend } from "/node_modules/@bootstrapp/model/frontend.js";
// Router - Client-side routing
export { default as Router } from "/node_modules/@bootstrapp/router/index.js";
// Service Worker - Caching and filesystem
export {
  createFSHandlers,
  initSWBackend,
  initSWFrontend,
  SWAdapter,
} from "/node_modules/@bootstrapp/sw/index.js";
// Theme - CSS variables and theming
export { createTheme, Theme } from "/node_modules/@bootstrapp/theme/index.js";
// Types - Schema definitions for models and component properties
export { default as T } from "/node_modules/@bootstrapp/types/index.js";
// View - Web Components base class
export { define, View } from "/node_modules/@bootstrapp/view/index.js";

/**
 * Initialize all frontend modules
 * @param {Object} $APP - Application instance
 */
export function initFrontend($APP) {
  initSWFrontend($APP);
  initModelFrontend($APP);
  initAuthFrontend($APP);
}

/**
 * Initialize all backend modules (for workers)
 * @param {Object} $APP - Application instance
 * @param {Object} config - App configuration
 */
export function initBackend($APP, config = {}) {
  initSWBackend($APP, config);
  initModelBackend($APP);
  initAuthBackend($APP);
}
