import { initAuthBackend } from "/$app/auth/backend.js";
import config from "/$app/base/config.js";
import { initModelBackend } from "/$app/model/backend.js";
import { createDatabase, registerAdapter } from "/$app/model/factory.js";
import {
  buildQueryResult,
  matchesWhere,
  validateQueryOptions,
} from "/$app/model/query-builder.js";
import {
  generateId,
  mergeRowUpdates,
  prepareRow,
  validateRow,
} from "/$app/model/row-utils.js";
import { SubscriptionManager } from "/$app/model/subscription-manager.js";
import { IndexedDBAdapter } from "/$app/model-indexeddb/adapter.js";
import {
  loadRelationships,
  loadRelationshipsForMany,
} from "/$app/model-pocketbase/relationship-loader.js";
import T from "/$app/types/index.js";
import $APP from "/$app.js";

// Register IndexedDB adapter with injected dependencies
registerAdapter(
  "indexeddb",
  class ConfiguredIndexedDBAdapter extends IndexedDBAdapter {
    constructor(cfg) {
      super({
        ...cfg,
        validateRow,
        prepareRow,
        generateId,
        mergeRowUpdates,
        buildQueryResult,
        matchesWhere,
        validateQueryOptions,
        loadRelationships,
        loadRelationshipsForMany,
        eventEmitter: (event, data) => $APP.events.emit(event, data),
        subscriptionManager: $APP.SubscriptionManager,
      });
    }
  },
);

// Initialize model and auth backends with $APP injection
initModelBackend($APP);
initAuthBackend($APP);
let Backend;
let Database;
let SysModel;

if ($APP.settings.runtime === "worker") {
  const SYSMODELS = { APP: "App", USER: "User", DEVICE: "Device" };

  const SYSTEM = {
    export: async () => {
      if ($APP.Database?.exportData) {
        return await $APP.Database.exportData();
      }
      throw new Error("Export not supported by current database adapter");
    },
    import: async (payload) => {
      if (Database?.importData) {
        const { dump, keepIndex = true } = payload;
        await Database.importData(dump, { keepIndex });

        if (SysModel) {
          const manager = SysModel.getSystemModelManager();
          const app = await manager.getApp();
          await SysModel.edit(manager.MODELS.APP, app.id, {
            migrationTimestamp: Date.now(),
          });
        }
        return { success: true };
      }
      throw new Error("Import not supported by current database adapter");
    },
  };

  $APP.addModule({
    name: "sysmodels",
    alias: "SYSTEM",
    base: SYSTEM,
    settings: SYSMODELS,
  });

  const dbConfig = $APP.databaseConfig || {};
  const needsSystemModels =
    !dbConfig.type ||
    dbConfig.type === "indexeddb" ||
    dbConfig.type === "hybrid";

  if (needsSystemModels) {
    $APP.sysmodels.set({
      [SYSMODELS.APP]: {
        name: T.string({ index: true, primary: true }),
        version: T.number(),
        users: T.many(SYSMODELS.USER, "appId"),
        active: T.boolean({ defaultValue: true, index: true }),
        models: T.object(),
        migrationTimestamp: T.number(),
      },
      [SYSMODELS.USER]: {
        name: T.string({ index: true, primary: true }),
        appId: T.one(SYSMODELS.APP, "users"),
        devices: T.many(SYSMODELS.DEVICE, "userId"),
        publicKey: T.string(),
        privateKey: T.string(),
        active: T.boolean({ index: true }),
      },
      [SYSMODELS.DEVICE]: {
        name: T.string({ index: true, primary: true }),
        userId: T.one(SYSMODELS.USER, "devices"),
        deviceData: T.string(),
        active: T.boolean({ defaultValue: true, index: true }),
      },
    });
  }

  $APP.events.on("APP:BACKEND:STARTED", async ({ app, user, device }) => {
    if (!app) {
      console.error("APP:BACKEND:STARTED hook called with invalid app.", {
        app,
      });
      return;
    }
    if (Database) {
      $APP.SubscriptionManager = new SubscriptionManager(Database);
      console.log("SubscriptionManager: Initialized");

      $APP.Database = Database;
    }
    await $APP.events.emit("APP:DATABASE:STARTED", { app, user, device });
  });

  let nextRequestId = 1;
  const pendingBackendRequests = {};

  const requestFromClient = async (
    type,
    payload,
    timeout = config.backend.requestTimeout,
  ) => {
    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    const client = clients[0]; // Simple strategy: pick the first client.

    if (!client) {
      return Promise.reject(
        new Error("No active client found to send request to."),
      );
    }

    const eventId = `backend-request-${nextRequestId++}`;

    return new Promise((resolve, reject) => {
      pendingBackendRequests[eventId] = { resolve, reject };
      setTimeout(() => {
        delete pendingBackendRequests[eventId];
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);
      client.postMessage({
        type,
        payload,
        eventId,
      });
    });
  };

  const broadcast = async (params) => {
    if (!$APP.Backend.client) return;
    $APP.Backend.client.postMessage(params);
    $APP.Backend.client.postMessage({ type: "BROADCAST", params });
  };

  const handleMessage = async ({ data, respond }) => {
    const { type, payload, eventId } = data;
    if (pendingBackendRequests[eventId]) {
      const promise = pendingBackendRequests[eventId];
      promise.resolve(payload);
      delete pendingBackendRequests[eventId];
      return;
    }

    await $APP.events.emit(type, {
      payload,
      eventId,
      respond,
      client: createClientProxy($APP.Backend.client),
      broadcast,
    });
  };

  const createClientProxy = (client) => {
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          return (payload) => sendRequestToClient(client, prop, payload);
        },
      },
    );
  };

  const sendRequestToClient = (client, type, payload) => {
    const eventId = `sw_${nextRequestId++}`;
    return new Promise((resolve, reject) => {
      pendingBackendRequests[eventId] = { resolve, reject };
      client.postMessage({ type, payload, eventId });
    });
  };

  const createAppEntry = async (options) => {
    if (!SysModel) return null;
    const manager = SysModel.getSystemModelManager();
    return manager ? await manager.createAppEntry(options) : null;
  };

  const getApp = async () => {
    if (!SysModel) return null;
    const manager = SysModel.getSystemModelManager();
    return manager ? await manager.getApp() : null;
  };

  const getUser = async (_app) => {
    if ($APP.Backend.user) return $APP.Backend.user;
    if (!SysModel) return null;
    const manager = SysModel.getSystemModelManager();
    return manager ? await manager.getUser(_app) : null;
  };

  const getDevice = async (opts) => {
    if (!SysModel) return null;
    const manager = SysModel.getSystemModelManager();
    return manager ? await manager.getDevice(opts) : null;
  };

  $APP.events.set({
    GET_CURRENT_APP: async ({ respond }) => {
      if (!SysModel) {
        respond({
          error: "Multi-app not supported with current database adapter",
        });
        return;
      }
      const app = await $APP.Backend.getApp();
      respond(app);
    },
    LIST_APPS: async ({ respond }) => {
      if (!SysModel) {
        respond({
          error: "Multi-app not supported with current database adapter",
        });
        return;
      }
      const manager = SysModel.getSystemModelManager();
      const apps = await manager.listApps();
      respond(apps || []);
    },
    CREATE_APP: async ({ respond }) => {
      if (!SysModel) {
        respond({
          error: "Multi-app not supported with current database adapter",
        });
        return;
      }
      const manager = SysModel.getSystemModelManager();
      const currentApp = await manager.getApp();
      if (currentApp) {
        await SysModel.edit(SYSMODELS.APP, currentApp.id, {
          active: false,
        });
      }

      const newApp = await manager.createAppEntry();
      const env = await manager.setupAppEnvironment(newApp);
      respond(env.app);
    },
    SELECT_APP: async ({ payload, respond }) => {
      if (!SysModel) {
        respond({
          error: "Multi-app not supported with current database adapter",
        });
        return;
      }
      const { appId } = payload;
      if (!appId) {
        return respond({
          error: "An 'appId' is required to select an app.",
        });
      }

      const manager = SysModel.getSystemModelManager();
      const selectedApp = await manager.selectApp(appId);
      const env = await manager.setupAppEnvironment(selectedApp);
      respond(env.app);
    },

    GET_DB_DUMP: async ({ respond }) => {
      const dump = await $APP.SYSTEM.export();
      respond(dump);
    },

    LOAD_DB_DUMP: async ({ payload, respond = console.log }) => {
      try {
        await $APP.SYSTEM.import(payload);
        respond({ success: true });
      } catch (error) {
        console.error("Failed to load DB dump:", error);
        respond({ success: false, error });
      }
    },
  });

  Backend = {
    bootstrap: async () => {
      const dbConfig = {
        type: "indexeddb",
        name: "app",
        models: $APP.models,
        ...($APP.databaseConfig || {}),
      };
      const needsSystemModels = ["indexeddb", "hybrid"].includes(dbConfig.type);

      let app;
      if (needsSystemModels) {
        SysModel = await createDatabase({
          type: "indexeddb",
          name: SYSMODELS.APP,
          version: 1,
          models: $APP.sysmodels,
          system: true,
          enableSystemModels: true,
          systemModelManagerOptions: {
            eventEmitter: (event, data) => $APP.events.emit(event, data),
            importData: async ({ dump }) => {
              if (Database?.importData) {
                await Database.importData(dump, { keepIndex: true });
              }
            },
          },
        });
        await SysModel.init();
        $APP.SysModel = SysModel;

        const manager = SysModel.getSystemModelManager();
        app = await manager.getApp();
        if (!app) app = await manager.createAppEntry();
        dbConfig.name = app.id;
        dbConfig.version = app.version;
        Database = await createDatabase(dbConfig);
        $APP.Database = Database;
        await Database.init();
        if ($APP.data && !app.migrationTimestamp) {
          await manager.migrateData($APP.data, Database);
          app = await manager.getApp();
        }

        await $APP.events.emit("APP:BACKEND:STARTED", { app });
      } else {
        app = {
          id: dbConfig.name,
          version: 1,
          active: true,
        };
        Database = await createDatabase(dbConfig);
        await Database.init();
        const env = { app, user: null, device: null };
        await $APP.events.emit("APP:BACKEND:STARTED", env);
      }
    },
    handleMessage,
    getApp,
    getDevice,
    createAppEntry,
    getUser,
    broadcast,
    requestFromClient,
  };
  $APP.addModule({ name: "Backend", base: Backend });
}

$APP.events.on("APP:INIT", async () => {
  console.info("Initializing backend application");
  await Backend.bootstrap();
});

export default Backend;
