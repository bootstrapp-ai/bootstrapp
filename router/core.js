/**
 * @bootstrapp/router - Core Implementation
 * Platform-agnostic router logic
 */

/**
 * Creates a router instance with the given platform adapter
 * @param {Object} adapter - Platform adapter (browser or memory)
 * @returns {Object} Router instance
 */
export const createRouterCore = (adapter) => {
  const router = {
    stack: [],
    routes: [],
    namedRoutes: {},
    currentRoute: {},
    defaultTitle: "",
    options: {},
    adapter, // Store adapter reference

    /**
     * Converts a route path and its named parameters into a URLPattern compatible string.
     * e.g., path: '/servers', namedParams: ['page'] becomes '/servers(/page/:page)?'
     * @param {object} route - The route object from the configuration.
     * @returns {string} The pattern string for the URLPattern constructor.
     * @private
     */
    _createPatternString(route) {
      let path = route.path;
      if (route.namedParams && route.namedParams.length > 0) {
        const optionalSegments = route.namedParams
          .map((param) => `/${param}/:${param}`)
          .join("");
        path += `(${optionalSegments})?`;
      }
      return path;
    },

    /**
     * Recursively flattens the nested route configuration.
     * @param {object} routes - The nested routes object to process.
     * @param {string} [basePath=''] - The base path from the parent route.
     * @param {object} [parentRoute=null] - The parent route object.
     * @returns {{flatRoutes: object, namedRoutes: object}}
     */
    flattenRoutes(routes, basePath = "", parentRoute = null) {
      const flatRoutes = {};
      const namedRoutes = {};

      for (const path in routes) {
        const route =
          typeof routes[path] === "function"
            ? routes[path]
            : { ...routes[path] };
        const fullPath = (basePath + path).replace(/\/+/g, "/");

        route.path = fullPath || "/";
        route.parent = parentRoute;
        flatRoutes[route.path] = route;

        if (route.name) {
          if (namedRoutes[route.name]) {
            console.warn(
              `Router: Duplicate route name "${route.name}". Overwriting.`,
            );
          }
          namedRoutes[route.name] = route.path;
        }

        if (route.routes) {
          const { flatRoutes: childFlatRoutes, namedRoutes: childNamedRoutes } =
            this.flattenRoutes(route.routes, fullPath, route);
          Object.assign(flatRoutes, childFlatRoutes);
          Object.assign(namedRoutes, childNamedRoutes);
        }
      }
      return { flatRoutes, namedRoutes };
    },

    /**
     * Initializes the router.
     * @param {object} routesConfig - The main routes configuration.
     * @param {object} [options={}] - Configuration options.
     * @param {string} [options.appName=''] - Application name for document titles.
     * @param {boolean} [options.isProduction=false] - Whether running in production mode (affects SSG behavior).
     * @param {Function} [options.onRouteChange=null] - Callback when route changes (receives currentRoute).
     * @param {Function} [options.onTitleChange=null] - Callback when title changes (receives newTitle).
     */
    init(routesConfig, options = {}) {
      if (!routesConfig || !Object.keys(routesConfig).length) {
        console.error("Router: No routes loaded");
        return;
      }

      this.options = {
        appName: "",
        isProduction: false,
        onRouteChange: null,
        onTitleChange: null,
        ...options,
      };

      const { flatRoutes, namedRoutes } = this.flattenRoutes(routesConfig);
      this.namedRoutes = namedRoutes;
      this.defaultTitle = this.options.appName || "";

      for (const path in flatRoutes) {
        const route = flatRoutes[path];
        const patternString = this._createPatternString(route);
        try {
          const pattern = new URLPattern({ pathname: patternString });
          this.routes.push({ pattern, route, originalPath: path });
        } catch (e) {
          console.error(
            `Router: Error creating URLPattern for path: "${patternString}"`,
            e,
          );
        }
      }

      this.routes.sort((a, b) => {
        const aParts = a.originalPath.split("/").length;
        const bParts = b.originalPath.split("/").length;
        return bParts - aParts;
      });

      // Initial route setup using adapter
      const location = this.adapter.getLocation();
      this.setCurrentRoute(location.href, false);
    },

    /**
     * Finds the route that matches the given URL path.
     * @param {string} pathname - The normalized URL pathname to match.
     * @returns {object|null} A match object or null.
     * @private
     */
    _matchRoute(pathname) {
      for (const { pattern, route } of this.routes) {
        const match = pattern.exec({ pathname });

        if (match) {
          const params = match.pathname.groups || {};
          const combinedParams = { ...params };

          const component =
            typeof route === "function"
              ? route
              : typeof route.component === "function"
                ? route.component(combinedParams)
                : route.component;

          const result = {
            route,
            params: combinedParams,
            name: route.name,
            component,
            template: route.template,
          };

          if (route.parent) {
            result.route = route.parent;
            result.template = route.parent.template;
            result.component = route.parent.component(combinedParams);
            result.matched = {
              route,
              params: combinedParams,
              path: route.path,
              name: route.name,
              component: component,
              template: route.template,
            };
          }
          return result;
        }
      }
      return null;
    },

    /**
     * Sets the current route based on a path.
     * @param {string} path - The URL path to navigate to.
     * @param {boolean} [pushState=true] - Whether to push to the history stack.
     */
    setCurrentRoute(path, pushState = true) {
      if (!this.routes.length) return;

      const location = this.adapter.getLocation();
      const url = new URL(path, location.origin);
      const normalizedPathname = this.normalizePath(url.pathname);
      const matched = this._matchRoute(normalizedPathname);

      if (!matched) {
        console.warn(
          `Router: No route found for path "${normalizedPathname}".`,
        );
        return pushState ? this.go("/") : null;
      }

      // SSG route handling (only for browser adapter in production)
      if (
        matched.route.ssg &&
        this.options.isProduction &&
        this.adapter.type === "browser" &&
        !this.adapter.isSamePath(path)
      ) {
        this.adapter.hardNavigate(path);
        return;
      }

      matched.path = url.pathname;
      matched.querystring = url.search;
      matched.hash = url.hash;
      matched.queryParams = Object.fromEntries(url.searchParams.entries());
      matched.params = { ...matched.queryParams, ...matched.params };

      if (matched.route.action) return matched.route.action(matched.params);
      if (matched.route.redirect) return this.go(matched.route.redirect);

      this.currentRoute = matched;
      const newTitle = matched.route.title || this.defaultTitle;
      this.setTitle(newTitle);

      if (pushState) {
        this.pushToStack(path, matched.params, newTitle);
        this._pushState(path, { path });
      } else {
        this.updateCurrentRoute(this.currentRoute);
      }
    },

    /**
     * Handles browser history navigation (back/forward buttons).
     */
    handleHistoryNavigation() {
      const location = this.adapter.getLocation();
      const currentPath = location.href;
      const stackIndex = this.stack.findIndex(
        (item) =>
          this.normalizePath(item.path) === this.normalizePath(currentPath),
      );
      if (stackIndex !== -1) {
        this.truncateStack(stackIndex);
      }
      this.setCurrentRoute(currentPath, false);
    },

    /**
     * Generates a URL path for a named route.
     * @param {string} routeName - The name of the route.
     * @param {object} [params={}] - The parameters for the path.
     * @returns {string|null} The generated path or null on error.
     */
    create(routeName, params = {}) {
      if (!routeName) {
        console.error("Router: Route name is required for Router.create()");
        return null;
      }

      const pathPattern = this.namedRoutes[routeName];
      if (!pathPattern) {
        console.error(`Router: Route with name "${routeName}" not found.`);
        return null;
      }

      let finalPath = pathPattern;
      const pathParams = { ...params };

      finalPath = finalPath.replace(/:(\w+)/g, (match, paramName) => {
        if (
          pathParams[paramName] !== undefined &&
          pathParams[paramName] !== null
        ) {
          const value = pathParams[paramName];
          delete pathParams[paramName];
          return String(value);
        }
        console.warn(
          `Router: Parameter "${paramName}" was not provided for named route "${routeName}".`,
        );
        return match;
      });

      const queryParams = new URLSearchParams(pathParams).toString();
      return queryParams ? `${finalPath}?${queryParams}` : finalPath;
    },

    /**
     * Navigates to a given route.
     * @param {string} routeNameOrPath - The path or the name of the route.
     * @param {object} [params] - Route parameters if navigating by name.
     */
    go(routeNameOrPath, params) {
      const isNamedRoute = !!params || this.namedRoutes[routeNameOrPath];
      const path = isNamedRoute
        ? this.create(routeNameOrPath, params)
        : routeNameOrPath;
      if (path !== null) {
        this.setCurrentRoute(path, true);
      }
    },

    /**
     * Navigates to a named route (alias for go).
     * @param {string} routeName - The name of the route.
     * @param {object} [params={}] - Route parameters.
     */
    navigate(routeName, params = {}) {
      return this.go(routeName, params);
    },

    /**
     * Replaces the current route without adding to history.
     * @param {string} routeNameOrPath - The path or the name of the route.
     * @param {object} [params={}] - Route parameters if using named route.
     */
    replace(routeNameOrPath, params = {}) {
      const isNamedRoute = !!params || this.namedRoutes[routeNameOrPath];
      const path = isNamedRoute
        ? this.create(routeNameOrPath, params)
        : routeNameOrPath;

      if (path === null) return;

      const location = this.adapter.getLocation();
      const url = new URL(path, location.origin);
      const normalizedPathname = this.normalizePath(url.pathname);
      const matched = this._matchRoute(normalizedPathname);

      if (!matched) {
        console.warn(
          `Router: No route found for path "${normalizedPathname}".`,
        );
        return;
      }

      matched.path = url.pathname;
      matched.querystring = url.search;
      matched.hash = url.hash;
      matched.queryParams = Object.fromEntries(url.searchParams.entries());
      matched.params = { ...matched.queryParams, ...matched.params };

      this.currentRoute = matched;
      const newTitle = matched.route.title || this.defaultTitle;
      this.setTitle(newTitle);

      this.adapter.replaceState({ path }, path);
      this.updateCurrentRoute(this.currentRoute);
    },

    /**
     * Navigate forward in history.
     */
    forward() {
      const didNavigate = this.adapter.forward();
      // For memory router, trigger route update after forward
      if (this.adapter.type === "memory" && didNavigate) {
        this.handleHistoryNavigation();
      }
    },

    /**
     * Navigate to home route and reset stack.
     */
    home() {
      this.stack = [];
      this.go("/");
    },

    /**
     * Navigate back in history.
     */
    back() {
      if (this.stack.length <= 1) return this.home();
      this.stack = this.stack.slice(0, -1);
      const didNavigate = this.adapter.back();
      // For memory router, trigger route update after back
      if (this.adapter.type === "memory" && didNavigate) {
        this.handleHistoryNavigation();
      }
    },

    _pushState(path, state = {}) {
      const location = this.adapter.getLocation();
      const fullUrl = new URL(path, location.origin).href;
      if (!this.adapter.isSamePath(fullUrl)) {
        this.adapter.pushState(state, path);
      }
      this.updateCurrentRoute(this.currentRoute);
    },

    pushToStack(path, params = {}, title = this.defaultTitle) {
      const newItem = { path, params, title };
      if (this.normalizePath(path) === "/") {
        this.stack = [newItem];
      } else {
        this.stack = [...this.stack, newItem];
      }
    },

    setTitle(newTitle) {
      const fullTitle =
        newTitle && this.options.appName
          ? `${newTitle} | ${this.options.appName}`
          : newTitle || this.options.appName;

      this.adapter.setTitle(fullTitle);

      if (this.stack.length > 0) {
        const updated = [...this.stack];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          title: newTitle,
        };
        this.stack = updated;
      }
      // Reassign currentRoute to trigger reactivity in synced components
      if (this.currentRoute?.route) {
        this.currentRoute = {
          ...this.currentRoute,
          route: {
            ...this.currentRoute.route,
            title: newTitle,
          },
        };
      }

      if (this.options.onTitleChange) {
        this.options.onTitleChange(fullTitle);
      }
    },

    updateCurrentRoute(route) {
      this.currentRoute = { ...route, root: this.isRoot() };
      if (this.options.onRouteChange) {
        this.options.onRouteChange(this.currentRoute);
      }
    },

    isRoot() {
      return this.stack.length <= 1;
    },

    truncateStack(index = 0) {
      this.stack = this.stack.slice(0, index + 1);
    },

    normalizePath(path = "/") {
      const normalized = path.split("?")[0].split("#")[0];
      return (normalized || "/").replace(/\/+$/, "") || "/";
    },
  };

  return router;
};
