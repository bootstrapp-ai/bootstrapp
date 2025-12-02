/**
 * @bootstrapp/controller - App Integration
 * Bridges Controller to $APP framework features (Service Worker integration)
 */

import { registerSyncType } from "./sync.js";

/**
 * Register ModelType as a sync type
 * @param {Function} ModelType - ModelType class constructor
 */
export function registerModelType(ModelType) {
  registerSyncType(
    (adapter) => adapter instanceof ModelType,
    (adapter) => ({ adapter: adapter.name, syncObj: adapter }),
  );
}

/**
 * Async loader for ModelType queries
 * @param {Object} options - Load options
 */
function loadModelTypeAsync({ instance, key, prop, syncObj, updateState }) {
  (async () => {
    let val = prop.defaultValue;
    try {
      const query =
        typeof prop.query === "function" ? prop.query(instance) : prop.query;
      val =
        prop.type === "array"
          ? await syncObj.getAll(query)
          : await syncObj.get(query);
      val.subscribe((v) => updateState(instance, key, v));
    } catch (e) {
      console.error(`Sync error ${key}:`, e);
    }
    updateState(instance, key, val ?? prop.defaultValue);
  })();
}

/**
 * Initialize controller with $APP integration
 * @param {Object} $APP - The $APP framework instance
 * @param {Object} Controller - The Controller instance
 * @param {Object} View - The View instance
 */
export function initControllerApp($APP, Controller, View) {
  // Service Worker sync handler (truly $APP-specific)
  $APP.swEvents.set(
    "SW:PROP_SYNC_UPDATE",
    ({ payload: { sync, key, value } }) => {
      const adapter = Controller[sync];
      if (adapter) {
        console.log(`SYNC: Update ${sync}.${key}`, value);
        adapter.emit(key, value, { skipBroadcast: true });
      }
    },
  );

  // Install View plugin with $APP-specific callbacks
  Controller.installViewPlugin(View, {
    onBroadcast: (data) => $APP.SW.request("SW:BROADCAST_SYNCED_PROP", data),
    onAsyncLoad: loadModelTypeAsync,
  });

  // Initialize URL sync
  Controller.initUrlSync();
}

export default initControllerApp;
