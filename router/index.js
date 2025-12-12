/**
 * @bootstrapp/router
 * Client-side router leveraging the URLPattern API
 * Supports nested routes, dynamic parameters, query strings, and history management
 */

import Controller from "/$app/controller/index.js";
import { createBrowserAdapter } from "./adapters.js";
import { createRouterCore } from "./core.js";

// Create singleton router with browser adapter
const Router = createRouterCore(createBrowserAdapter());

// Initialize sync for reactive properties
Router.$sync = Controller.createSync(Router, "router", [
  "currentRoute",
  "stack",
]);

export default Router;
