/**
 * @bootstrapp/router - Type Schema
 * Defines the Router API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/router",
  exports: {
    // Default export: Router singleton instance
    default: {
      $interface: true,
      stack: T.array({ description: "Navigation history stack" }),
      routes: T.array({ description: "Compiled route patterns" }),
      namedRoutes: T.object({ description: "Map of route names to paths" }),
      currentRoute: T.object({ description: "Current route state" }),
      defaultTitle: T.string({ description: "Default page title" }),
      options: T.object({ description: "Router configuration options" }),
      $sync: T.object({ description: "Sync binding for reactive properties" }),

      init: T.function({
        description: "Initialize the router with routes configuration",
        args: [
          T.object({ name: "routesConfig", description: "Routes configuration object" }),
          T.object({ name: "options", description: "Router options" }),
        ],
        returns: T.any(),
      }),

      go: T.function({
        description: "Navigate to a route by name or path",
        args: [
          T.string({ name: "routeNameOrPath" }),
          T.object({ name: "params", description: "Route parameters" }),
        ],
        returns: T.any(),
      }),

      navigate: T.function({
        description: "Navigate to a named route",
        args: [T.string({ name: "routeName" }), T.object({ name: "params" })],
        returns: T.any(),
      }),

      replace: T.function({
        description: "Replace current route (no history entry)",
        args: [T.string({ name: "routeNameOrPath" }), T.object({ name: "params" })],
        returns: T.any(),
      }),

      create: T.function({
        description: "Create URL path from route name and params",
        args: [T.string({ name: "routeName" }), T.object({ name: "params" })],
        returns: T.string({ description: "Generated path or null" }),
      }),

      setCurrentRoute: T.function({
        description: "Set the current route from a path",
        args: [T.string({ name: "path" }), T.boolean({ name: "pushState" })],
        returns: T.any(),
      }),

      back: T.function({
        description: "Navigate back in history",
        args: [],
        returns: T.any(),
      }),

      forward: T.function({
        description: "Navigate forward in history",
        args: [],
        returns: T.any(),
      }),

      home: T.function({
        description: "Navigate to home route",
        args: [],
        returns: T.any(),
      }),

      flattenRoutes: T.function({
        description: "Flatten nested route configuration",
        args: [
          T.object({ name: "routes" }),
          T.string({ name: "basePath" }),
          T.object({ name: "parentRoute" }),
        ],
        returns: T.object({ description: "{ flatRoutes, namedRoutes }" }),
      }),

      normalizePath: T.function({
        description: "Normalize a URL path",
        args: [T.string({ name: "path" })],
        returns: T.string(),
      }),

      isRoot: T.function({
        description: "Check if current route is root",
        args: [],
        returns: T.boolean(),
      }),

      truncateStack: T.function({
        description: "Truncate history stack at index",
        args: [T.number({ name: "index" })],
        returns: T.any(),
      }),

      handleLinkClick: T.function({
        description: "Handle anchor link clicks for SPA navigation",
        args: [T.any({ name: "event" }), T.object({ name: "options" })],
        returns: T.boolean(),
      }),
    },

    // Route interface
    Route: {
      $interface: true,
      path: T.string({ description: "Route path pattern" }),
      name: T.string({ description: "Route name for navigation" }),
      title: T.string({ description: "Page title" }),
      component: T.any({ description: "Component or component factory" }),
      template: T.string({ description: "Template name" }),
      routes: T.object({ description: "Nested routes" }),
      parent: T.object({ description: "Parent route reference" }),
      namedParams: T.array({ description: "Named parameter names" }),
      ssg: T.boolean({ description: "Enable static site generation" }),
      action: T.function({ description: "Route action callback" }),
      redirect: T.string({ description: "Redirect path" }),
    },

    // CurrentRoute interface
    CurrentRoute: {
      $interface: true,
      route: T.object({ description: "Matched route object" }),
      params: T.object({ description: "Route parameters" }),
      queryParams: T.object({ description: "Query string parameters" }),
      name: T.string({ description: "Route name" }),
      component: T.any({ description: "Rendered component" }),
      template: T.string({ description: "Template name" }),
      path: T.string({ description: "Current path" }),
      querystring: T.string({ description: "Query string" }),
      hash: T.string({ description: "URL hash" }),
      root: T.boolean({ description: "Whether at root path" }),
      matched: T.object({ description: "Matched child route info" }),
    },

    // RouterOptions interface
    RouterOptions: {
      $interface: true,
      appName: T.string({ description: "Application name for titles" }),
      isProduction: T.boolean({ description: "Production mode flag" }),
      onRouteChange: T.function({ description: "Route change callback" }),
      onTitleChange: T.function({ description: "Title change callback" }),
    },
  },
};
