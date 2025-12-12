/**
 * @bootstrapp/router - Memory Router Factory
 * Creates independent router instances with in-memory history
 */

import Controller from "/$app/controller/index.js";
import { createRouterCore } from "./core.js";
import { createMemoryAdapter } from "./adapters.js";

// Counter for unique adapter names
let memoryRouterCounter = 0;

/**
 * Creates a memory-based router instance
 * @param {Object} routesConfig - Route configuration object
 * @param {Object} options - Router options
 * @param {string} options.initialPath - Initial path to navigate to (default: '/')
 * @param {string} options.appName - Application name for titles
 * @param {string} options.adapterName - Custom adapter name for sync (auto-generated if not provided)
 * @param {Function} options.onRouteChange - Callback when route changes
 * @param {Function} options.onTitleChange - Callback when title changes
 * @returns {Object} Memory router instance with $sync support
 */
export const createMemoryRouter = (routesConfig, options = {}) => {
  const {
    initialPath = "/",
    adapterName = `memory-router-${++memoryRouterCounter}`,
    ...routerOptions
  } = options;

  // Create memory adapter
  const adapter = createMemoryAdapter(initialPath);

  // Create router core with memory adapter
  const router = createRouterCore(adapter);

  // Initialize with routes
  router.init(routesConfig, routerOptions);

  // Create sync object for reactive binding
  router.$sync = Controller.createSync(router, adapterName, [
    "currentRoute",
    "stack",
  ]);

  // Register this router instance as a sync type
  Controller.registerSyncType(
    (syncAdapter) => syncAdapter === router,
    (syncAdapter) => ({ adapter: adapterName, syncObj: syncAdapter.$sync }),
  );

  return router;
};

export default createMemoryRouter;
