/**
 * @bootstrapp/events - Type Schema
 * Defines the Events API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/events",
  exports: {
    // Default export: createEventHandler function
    default: T.function({
      description: "Creates an event handler with on, off, emit, set, get methods",
      args: [
        T.object({ name: "target", description: "Target object to install event methods on" }),
        T.object({ name: "options", description: "{ getter?: boolean }" }),
      ],
      returns: T.object({ description: "EventHandler instance" }),
    }),

    // EventHandler interface (returned by createEventHandler)
    EventHandler: {
      $interface: true,
      listeners: T.object({ description: "Map of event keys to callback sets" }),

      hasListeners: T.function({
        description: "Check if event key has listeners",
        args: [T.string({ name: "key", description: "Event key" })],
        returns: T.boolean(),
      }),

      on: T.function({
        description: "Register an event listener",
        args: [
          T.string({ name: "key", description: "Event key" }),
          T.function({ name: "callback", description: "Listener function (can be async)" }),
        ],
        returns: T.any(),
      }),

      off: T.function({
        description: "Unregister an event listener",
        args: [
          T.string({ name: "key", description: "Event key" }),
          T.function({ name: "callback", description: "Listener function to remove" }),
        ],
        returns: T.any(),
      }),

      emit: T.function({
        description: "Execute all listeners for a key",
        args: [
          T.string({ name: "key", description: "Event key" }),
          T.any({ name: "data", description: "Data to pass to listeners" }),
        ],
        returns: T.array({ description: "Promise resolving to array of listener results" }),
      }),

      set: T.function({
        description: "Register multiple event listeners from an object",
        args: [T.object({ name: "events", description: "Key-value pairs of events and callbacks" })],
        returns: T.any(),
      }),

      get: T.function({
        description: "Get all registered callbacks for a key",
        args: [T.string({ name: "key", description: "Event key" })],
        returns: T.array({ description: "Array of callback functions" }),
      }),
    },

    // EventOptions interface
    EventOptions: {
      $interface: true,
      getter: T.boolean({ description: "Whether to include the 'get' method (default: true)" }),
    },
  },
};
