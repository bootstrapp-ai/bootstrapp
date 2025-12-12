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

export { initAuthBackend } from "/$app/auth/backend.js";
// Auth - Authentication
export { initAuthFrontend } from "/$app/auth/frontend.js";
// Controller - Reactive state management
export { Controller, createController } from "/$app/controller/index.js";
// Events - Pub/sub event system
export { default as createEventHandler } from "/$app/events/index.js";
// Model - ORM-like data layer
export { createModel, default as Model, ModelType } from "/$app/model/index.js";
export { initModelBackend } from "/$app/model/backend.js";
export { initModelFrontend } from "/$app/model/frontend.js";
// Router - Client-side routing
export { default as Router } from "/$app/router/index.js";
// Service Worker - Caching and filesystem
export {
  createFSHandlers,
  initSWBackend,
  initSWFrontend,
  SWAdapter,
} from "/$app/sw/index.js";
// Theme - CSS variables and theming
export { createTheme, Theme } from "/$app/theme/index.js";
// Types - Schema definitions for models and component properties
export { default as T } from "/$app/types/index.js";
// View - Web Components base class
export { define, View } from "/$app/view/index.js";

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
