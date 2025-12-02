/**
 * @bootstrapp/controller
 * Main entry point
 */

import adaptersStorage from "./adapters/storage.js";
import adaptersUrl from "./adapters/url.js";
import { createController } from "./core.js";
import * as syncUtils from "./sync.js";
import { createSync } from "./sync-factory.js";

const adapters = { ...adaptersStorage, ...adaptersUrl };
const Controller = createController(adapters);
Controller.createSync = createSync;
Controller.registerSyncType = syncUtils.registerSyncType;
Controller.getSyncInfo = syncUtils.getSyncInfo;

/**
 * Initialize URL sync (popstate listener)
 * Call this once to enable automatic URL adapter synchronization on browser navigation
 */
Controller.initUrlSync = () => {
  if (Controller._urlSyncInitialized) return;
  Controller._urlSyncInitialized = true;

  window.addEventListener("popstate", () => {
    syncUtils.syncUrl(Controller.querystring);
    syncUtils.syncUrl(Controller.hash);
  });
};

/**
 * Install View plugin for sync properties
 * @param {Object} View - View instance
 * @param {Object} options - Plugin options
 * @param {Function} options.onBroadcast - Optional callback for cross-tab sync broadcasts
 * @param {Function} options.onAsyncLoad - Optional async loading handler for special sync types
 */
Controller.installViewPlugin = (View, options = {}) => {
  View.plugins.push({
    name: "syncProps",
    test: ({ component }) =>
      Object.values(component.properties || {}).some((p) => p.sync),
    events: {
      disconnected: ({ instance }) => {
        syncUtils.cleanupSyncBindings(instance, Controller);
      },
      connected: ({ instance, component }) => {
        Object.entries(component.properties)
          .filter(([, p]) => p.sync)
          .forEach(([key, prop]) => {
            const info = syncUtils.getSyncInfo(prop.sync);
            if (!info) {
              return console.error(`Missing sync object for '${key}'`);
            }

            if (info.syncObj) {
              syncUtils.bindCustomSync({
                instance,
                key,
                prop,
                syncObj: info.syncObj,
                onAsyncLoad:
                  options.onAsyncLoad && syncUtils.needsAsyncLoad(info.syncObj)
                    ? options.onAsyncLoad
                    : null,
              });
            } else {
              syncUtils.bindAdapterSync({
                instance,
                key,
                prop,
                adapterName: info.adapter,
                Controller,
                onBroadcast: options.onBroadcast,
              });
            }
          });
      },
    },
  });
};

export default Controller;

export { createController, createSync };

export {
  bindAdapterSync,
  bindCustomSync,
  cleanupSyncBindings,
  getScopedKey,
  getSyncInfo,
  needsAsyncLoad,
  registerSyncType,
  syncUrl,
  updateState,
} from "./sync.js";
