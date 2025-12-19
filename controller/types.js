/**
 * @bootstrapp/controller - Type Schema
 * Defines the Controller API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/controller",
  exports: {
    // Default export: Controller instance (proxy)
    default: {
      $interface: true,
      add: T.function({
        description: "Add adapter(s) to controller",
        args: [
          { ...T.union(T.string(), T.object()), name: "nameOrAdapters" },
          T.object({ name: "adapter" }),
        ],
        returns: T.any(),
      }),
      createAdapter: T.function({
        description: "Create an adapter from a storage backend",
        args: [T.object({ name: "store" }), T.string({ name: "name" })],
        returns: T.any({ description: "Adapter instance" }),
      }),
      createSync: T.function({
        description: "Create a sync binding",
        args: [
          T.any({ name: "target" }),
          T.string({ name: "adapterName" }),
          T.array({ name: "keys" }),
        ],
        returns: T.object({ description: "Sync object" }),
      }),
      registerSyncType: T.function({
        description: "Register a custom sync type handler",
        args: [T.function({ name: "check" }), T.function({ name: "handler" })],
        returns: T.any(),
      }),
      getSyncInfo: T.function({
        description: "Get sync configuration info",
        args: [{ ...T.union(T.string(), T.object()), name: "sync" }],
        returns: T.object({ description: "Sync info or null" }),
      }),
      initUrlSync: T.function({
        description: "Initialize URL sync (popstate listener)",
        args: [],
        returns: T.any(),
      }),
      installViewPlugin: T.function({
        description: "Install View plugin for sync properties",
        args: [T.any({ name: "View" }), T.object({ name: "options" })],
        returns: T.any(),
      }),
    },

    // Named export: createController function
    createController: T.function({
      description: "Create the Controller proxy system",
      args: [T.object({ name: "initialAdapters" })],
      returns: T.object({ description: "Controller instance" }),
    }),

    // Named export: createSync function
    createSync: T.function({
      description: "Create a sync binding",
      args: [
        T.any({ name: "target" }),
        T.string({ name: "adapterName" }),
        T.array({ name: "keys" }),
      ],
      returns: T.object({ description: "Sync object" }),
    }),

    // Sync utility exports
    registerSyncType: T.function({
      description: "Register a custom sync type handler",
      args: [T.function({ name: "check" }), T.function({ name: "handler" })],
      returns: T.any(),
    }),

    getSyncInfo: T.function({
      description: "Get sync configuration info",
      args: [{ ...T.union(T.string(), T.object()), name: "sync" }],
      returns: T.object({ description: "Sync info or null" }),
    }),

    bindAdapterSync: T.function({
      description: "Bind adapter sync to a component property",
      args: [T.object({ name: "options" })],
      returns: T.any(),
    }),

    bindCustomSync: T.function({
      description: "Bind custom sync to a component property",
      args: [T.object({ name: "options" })],
      returns: T.any(),
    }),

    cleanupSyncBindings: T.function({
      description: "Cleanup sync bindings for an instance",
      args: [T.any({ name: "instance" }), T.any({ name: "Controller" })],
      returns: T.any(),
    }),

    syncUrl: T.function({
      description: "Sync URL adapter state",
      args: [T.any({ name: "adapter" })],
      returns: T.any(),
    }),

    updateState: T.function({
      description: "Update component state from sync",
      args: [T.any({ name: "instance" }), T.string({ name: "key" }), T.any({ name: "value" })],
      returns: T.any(),
    }),

    getScopedKey: T.function({
      description: "Get scoped key for sync binding",
      args: [T.any({ name: "instance" }), T.string({ name: "key" }), T.object({ name: "prop" })],
      returns: T.string(),
    }),

    needsAsyncLoad: T.function({
      description: "Check if sync type needs async loading",
      args: [T.object({ name: "syncObj" })],
      returns: T.boolean(),
    }),

    checkDependsOn: T.function({
      description: "Check and update dependent sync properties",
      args: [T.any({ name: "instance" }), T.any({ name: "component" }), T.any({ name: "changedProps" })],
      returns: T.any(),
    }),

    // Adapter interface
    Adapter: {
      $interface: true,
      get: T.function({
        description: "Get value by key",
        args: [T.string({ name: "key" })],
        returns: T.any(),
      }),
      set: T.function({
        description: "Set value by key",
        args: [T.string({ name: "key" }), T.any({ name: "value" })],
        returns: T.any(),
      }),
      remove: T.function({
        description: "Remove value by key",
        args: [T.string({ name: "key" })],
        returns: T.object(),
      }),
      has: T.function({
        description: "Check if key exists",
        args: [T.string({ name: "key" })],
        returns: T.boolean(),
      }),
      keys: T.function({
        description: "Get all keys",
        args: [],
        returns: T.array({ description: "Array of keys" }),
      }),
      entries: T.function({
        description: "Get all entries",
        args: [],
        returns: T.array({ description: "Array of [key, value] tuples" }),
      }),
      on: T.function({
        description: "Subscribe to key changes",
        args: [T.string({ name: "key" }), T.function({ name: "callback" })],
        returns: T.any(),
      }),
      off: T.function({
        description: "Unsubscribe from key changes",
        args: [T.string({ name: "key" }), T.function({ name: "callback" })],
        returns: T.any(),
      }),
      emit: T.function({
        description: "Emit event to subscribers",
        args: [T.string({ name: "key" }), T.any({ name: "value" })],
        returns: T.any(),
      }),
      broadcast: T.function({
        description: "Broadcast to other tabs/windows",
        args: [T.any({ name: "data" })],
        returns: T.any(),
      }),
    },
  },
};
