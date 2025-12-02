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
      onRouteChange: Controller
        ? (route) => Controller.ram.set("currentRoute", route)
        : null,
    });

    // Make Router available on $APP
    $APP.Router = Router;
  };

  // Hook into APP:INIT event
  $APP.events.on("APP:INIT", init);

  // Register as framework module
  $APP.addModule({
    name: "router",
    path: "@bootstrapp/router",
    exports: Router,
  });

  // Set up popstate handler for browser back/forward
  window.addEventListener("popstate", () => {
    Router.handleHistoryNavigation();
  });
}

export default initRouterApp;
