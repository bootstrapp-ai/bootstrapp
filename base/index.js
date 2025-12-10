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

export { initAuthBackend } from "@bootstrapp/auth/backend.js";
// Auth - Authentication
export { initAuthFrontend } from "@bootstrapp/auth/frontend.js";
// Controller - Reactive state management
export { Controller, createController } from "@bootstrapp/controller";
// Events - Pub/sub event system
export { default as createEventHandler } from "@bootstrapp/events";
// Model - ORM-like data layer
export { createModel, default as Model, ModelType } from "@bootstrapp/model";
export { initModelBackend } from "@bootstrapp/model/backend.js";
export { initModelFrontend } from "@bootstrapp/model/frontend.js";
// Router - Client-side routing
export { default as Router } from "@bootstrapp/router";
// Service Worker - Caching and filesystem
export {
  createFSHandlers,
  initSWBackend,
  initSWFrontend,
  SWAdapter,
} from "@bootstrapp/sw";
// Theme - CSS variables and theming
export { createTheme, Theme } from "@bootstrapp/theme";
// Types - Schema definitions for models and component properties
export { default as T } from "@bootstrapp/types";
// View - Web Components base class
export { define, View } from "@bootstrapp/view";

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
