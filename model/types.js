/**
 * @bootstrapp/model - Type Schema
 * Defines the Model API for TypeScript declaration generation
 */
import T from "../types/index.js";

export default {
  name: "@bootstrapp/model",
  exports: {
    // Default export: { createModel, ModelType }
    default: {
      $interface: true,
      createModel: T.function({
        description: "Create the Model proxy system",
        args: [T.object({ name: "$APP", description: "App instance" })],
        returns: T.object({ description: "Model proxy" }),
      }),
      ModelType: T.any({
        description: "Model type class for instanceof checks",
      }),
    },

    // Named export: createModel function
    createModel: T.function({
      description: "Create the Model proxy system",
      args: [T.object({ name: "$APP", description: "App instance" })],
      returns: T.object({ description: "Model proxy" }),
    }),

    // Named export: ModelType class
    ModelType: {
      $class: true,
    },

    // ModelApi interface (generic model methods)
    ModelApi: {
      $interface: true,
      name: T.string({ description: "Model name" }),

      get: T.function({
        description: "Get a single record by ID or query",
        args: [
          T.union({
            name: "idOrOpts",
            types: [T.string(), T.number(), T.object()],
          }),
          T.object({ name: "opts" }),
        ],
        returns: T.any({ description: "Promise<T | null>" }),
      }),

      getAll: T.function({
        description: "Get multiple records",
        args: [
          T.object({
            name: "opts",
            properties: {
              where: T.object(),
              limit: T.number(),
              offset: T.number(),
              order: T.string(),
              includes: T.string(),
            },
          }),
        ],
        returns: T.array({ description: "Promise<T[]>" }),
      }),

      add: T.function({
        description: "Add a new record",
        args: [
          T.object({ name: "row", description: "Record data" }),
          T.object({ name: "opts" }),
        ],
        returns: T.any({ description: "Promise<T>" }),
      }),

      addMany: T.function({
        description: "Add multiple records",
        args: [
          T.array({ name: "rows", description: "Array of record data" }),
          T.object({ name: "opts" }),
        ],
        returns: T.array({ description: "Promise<T[]>" }),
      }),

      edit: T.function({
        description: "Update an existing record",
        args: [T.object({ name: "row", description: "Record with id" })],
        returns: T.any({ description: "Promise<T>" }),
      }),

      remove: T.function({
        description: "Delete a record by ID",
        args: [T.string({ name: "id" })],
        returns: T.any({ description: "Promise<void>" }),
      }),

      upsert: T.function({
        description: "Insert or update a record",
        args: [T.object({ name: "row" }), T.object({ name: "opts" })],
        returns: T.any({ description: "Promise<T>" }),
      }),

      subscribe: T.function({
        description: "Subscribe to model changes",
        args: [T.function({ name: "callback" })],
        returns: T.function({ description: "Unsubscribe function" }),
      }),
    },

    // ReactiveArray interface
    ReactiveArray: {
      $interface: true,
      total: T.number({ description: "Total count from pagination" }),
      limit: T.number({ description: "Limit from query" }),
      offset: T.number({ description: "Offset from query" }),
      count: T.number({ description: "Current array length" }),

      subscribe: T.function({
        description: "Subscribe to array changes",
        args: [
          T.function({ name: "callback", description: "(data: T[]) => void" }),
        ],
        returns: T.any({ description: "this" }),
      }),

      unsubscribe: T.function({
        description: "Unsubscribe from changes",
        args: [T.function({ name: "callback" })],
        returns: T.any({ description: "void" }),
      }),
    },

    // Row instance methods (added by proxy)
    RowInstance: {
      $interface: true,
      id: T.string({ required: true, description: "Record ID" }),
      _modelName: T.string({ description: "Model name (internal)" }),

      remove: T.function({
        description: "Delete this record",
        args: [],
        returns: T.any({ description: "Promise<void>" }),
      }),

      update: T.function({
        description: "Save changes to this record",
        args: [],
        returns: T.any({ description: "Promise<T>" }),
      }),

      include: T.function({
        description: "Load a relationship",
        args: [T.string({ name: "relationName" })],
        returns: T.any({ description: "Promise<this>" }),
      }),

      subscribe: T.function({
        description: "Subscribe to updates on this row",
        args: [T.function({ name: "callback" })],
        returns: T.any({ description: "this" }),
      }),

      unsubscribe: T.function({
        description: "Unsubscribe from updates",
        args: [T.function({ name: "callback" })],
        returns: T.any({ description: "void" }),
      }),
    },
  },
};
