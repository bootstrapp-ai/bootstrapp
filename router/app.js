/**
 * @bootstrapp/router - App Integration
 * Bridges Router to $APP framework features
 */

export function initRouterApp($APP, Router, Controller = null) {
  // Initialize router with $APP configuration
  const init = () => {
    Router.init($APP.routes, {
      appName: $APP.settings.name,
      isProduction: $APP.settings.production,
      onRouteChange: null,
    });

    // Register Router as a sync type for component bindings
    if (Controller) {
      Controller.registerSyncType(
        (adapter) => adapter === Router,
        (adapter) => ({ adapter: "router", syncObj: adapter.$sync }),
      );
    }

    // Make Router available on $APP
    $APP.Router = Router;
  };

  // Hook into APP:INIT event
  $APP.events.on("APP:INIT", init);

  // Register as framework module
  $APP.addModule({
    name: "router",
    path: "/node_modules/@bootstrapp/router",
    exports: Router,
  });

  // Set up popstate handler for browser back/forward
  // Only for browser-based routers
  if (Router.adapter?.type === "browser") {
    window.addEventListener("popstate", () => {
      Router.handleHistoryNavigation();
    });
  }
}

export default initRouterApp;
