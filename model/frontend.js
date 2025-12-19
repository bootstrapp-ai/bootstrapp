
import { createModel } from "./index.js";
import { SubscriptionManager } from "./subscription-manager.js";

export function initModelFrontend($APP, options = {}) {
  const Model = createModel($APP);

  // Create request function that uses Backend
  const request = (action, modelName, params = {}) => {
    return $APP.Backend.request(action, {
      model: modelName,
      ...params,
    });
  };

  Model.request = request;
  $APP.addModule({ name: "Model", base: Model });

  // Initialize SubscriptionManager on frontend (without database - notifications come from backend)
  if (!$APP.SubscriptionManager) {
    $APP.SubscriptionManager = new SubscriptionManager(null);
  }

  // New query-level data sync
  $APP.events.on("QUERY_DATA_SYNC", ({ payload }) => {
    const { action, model, record } = payload;

    // Route to SubscriptionManager for query-level notifications
    if ($APP.SubscriptionManager) {
      $APP.SubscriptionManager.notifyMatchingQueries(model, action, record);
    }

    // Broadcast to service worker for other tabs
    if ($APP.SW) {
      $APP.SW.postMessage("SW:BROADCAST_QUERY_SYNC", payload);
    }
  });

  return Model;
}

export default { initModelFrontend };
