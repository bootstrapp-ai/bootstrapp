/**
 * @file Auth Module Entry Point
 * @description Exports auth module with runtime-aware initialization
 */

export { createAuthEventHandlers, initAuthBackend } from "./backend.js";
export { AuthSession, createAuth, initAuthFrontend } from "./frontend.js";

/**
 * Initialize auth module based on runtime environment
 * @param {object} $APP - App instance with settings.runtime
 * @returns {Promise<object|void>} Auth module on frontend, void on backend
 */
export async function initAuth($APP) {
  if ($APP.settings.runtime === "worker") {
    const { initAuthBackend } = await import("./backend.js");
    initAuthBackend($APP);
  } else if ($APP.settings.runtime === "frontend") {
    const { initAuthFrontend } = await import("./frontend.js");
    return initAuthFrontend($APP);
  }
}

export default { initAuth };
