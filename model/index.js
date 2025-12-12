/**
 * @file Model System - ORM-like API for data access
 * @description Provides a proxy-based model API with automatic CRUD operations,
 * dynamic finders, relationships, and reactive data synchronization
 */
import createEventHandler from "/$app/events/index.js";

export class ModelType {}

/**
 * Symbol used to store subscription callbacks on a row instance
 * without polluting the data properties.
 */
const SUBSCRIPTION_SYMBOL = Symbol("subscriptions");

/**
 * A simple helper to check if a row matches a 'where' clause.
 * This is naive and only supports exact, top-level key-value matches.
 * @param {object} row - The row object to check.
 * @param {object} where - The 'where' clause (e.g., { active: true }).
 * @returns {boolean} True if the row matches.
 */
const simpleMatcher = (row, where) => {
  if (!where || Object.keys(where).length === 0) {
    return true; // No filter means all rows match.
  }
  return Object.keys(where).every((key) => {
    // Use string coercion for 'id' field to handle string/number mismatch
    if (key === "id") {
      return String(row[key]) === String(where[key]);
    }
    return row[key] === where[key];
  });
};

/**
 * Create a reactive array prototype with subscription capabilities
 * @param {function} proxifyRow - Function to proxify individual rows
 * @param {object} $APP - App instance with SubscriptionManager
 * @returns {object} Reactive array prototype
 */
function createReactiveArrayPrototype(proxifyRow, $APP) {
  const reactiveArrayPrototype = {
    /**
     * Subscribes to changes in the row set.
     * @param {function(Array): void} callback - Fired with the new array.
     */
    subscribe(callback) {
      if (typeof callback !== "function") {
        console.error("Subscription callback must be a function.");
        return this;
      }
      // On the first subscription, register query-level listener
      if (this.subscriptions.size === 0) {
        this.registerListeners();
      }
      this.subscriptions.add(callback);
      return this;
    },

    /**
     * Unsubscribes from changes.
     * @param {function} callback - The original callback to remove.
     */
    unsubscribe(callback) {
      this.subscriptions.delete(callback);
      // If last subscription is gone, destroy all listeners
      if (this.subscriptions.size === 0) {
        this.destroy();
      }
    },

    /**
     * Notifies all set-level subscribers with the current rows.
     */
    notifySubscribers() {
      // Pass a shallow copy so subscribers can't mutate our internal array
      const rowsCopy = [...this];
      this.subscriptions.forEach((cb) => {
        try {
          cb(rowsCopy);
        } catch (err) {
          console.error("Error in ReactiveArray subscription callback:", err);
        }
      });
    },

    /**
     * Handle query-level update notifications from SubscriptionManager
     * @param {object} event - Event object { action, record, model }
     * @private
     */
    handleQueryUpdate(event) {
      const { action, record } = event;

      switch (action) {
        case "add":
        case "create":
          this.handleRecordAdd(record);
          break;

        case "update":
        case "edit":
          this.handleRecordUpdate(record);
          break;

        case "delete":
        case "remove":
          this.handleRecordDelete(record);
          break;
      }
    },

    /**
     * Handle a new record being added
     * @param {object} newRecord - The new record
     * @private
     */
    handleRecordAdd(newRecord) {
      // Check if already in array
      if (this.some((r) => String(r.id) === String(newRecord.id))) {
        return;
      }

      // Proxify and add to array
      const proxified = proxifyRow(newRecord, this.modelName);
      this.push(proxified);
      this.notifySubscribers();
    },

    /**
     * Handle a record being updated
     * @param {object} updatedRecord - The updated record
     * @private
     */
    handleRecordUpdate(updatedRecord) {
      const index = this.findIndex(
        (r) => String(r.id) === String(updatedRecord.id),
      );

      if (index > -1) {
        // Record exists in our array
        // Check if still matches our where clause
        const stillMatches =
          !this.opts.where || simpleMatcher(updatedRecord, this.opts.where);

        if (stillMatches) {
          // Replace with new proxified row (ensures different object reference for change detection)
          const newRow = proxifyRow(updatedRecord, this.modelName);
          this[index] = newRow;
          this.notifySubscribers();
        } else {
          // No longer matches - remove from array
          this.splice(index, 1);
          this.notifySubscribers();
        }
      } else {
        // Record not in array, but might match now (e.g., status changed to 'active')
        const matches =
          !this.opts.where || simpleMatcher(updatedRecord, this.opts.where);

        if (matches) {
          this.handleRecordAdd(updatedRecord);
        }
      }
    },

    /**
     * Handle a record being deleted
     * @param {object} deletedRecord - The deleted record (with at least { id })
     * @private
     */
    handleRecordDelete(deletedRecord) {
      const index = this.findIndex(
        (r) => String(r.id) === String(deletedRecord.id),
      );
      if (index > -1) {
        this.splice(index, 1);
        this.notifySubscribers();
      }
    },

    /**
     * Registers query-level listener via SubscriptionManager
     * @private
     */
    registerListeners() {
      // Get SubscriptionManager instance
      if (typeof $APP === "undefined" || !$APP.SubscriptionManager) {
        console.warn(
          "SubscriptionManager not available - reactive array won't update",
        );
        return;
      }

      // Subscribe to this specific query (model + where clause)
      $APP.SubscriptionManager.subscribe(
        this.modelName,
        this.opts.where,
        (event) => this.handleQueryUpdate(event),
      )
        .then((unsubscribe) => {
          this.queryUnsubscribe = unsubscribe;
        })
        .catch((error) => {
          console.error("Failed to register query subscription:", error);
        });
    },

    /**
     * Cleans up all listeners to prevent memory leaks.
     * @private
     */
    destroy() {
      // Unsubscribe from query-level subscription
      if (
        this.queryUnsubscribe &&
        typeof this.queryUnsubscribe === "function"
      ) {
        this.queryUnsubscribe();
        this.queryUnsubscribe = null;
      }

      // Clear all subscribers
      this.subscriptions.clear();
    },
  };

  // Make our prototype inherit from Array.prototype
  Object.setPrototypeOf(reactiveArrayPrototype, Array.prototype);

  return reactiveArrayPrototype;
}

/**
 * Create instance proxy handler for model rows
 * @param {object} Model - Model instance
 * @param {object} $APP - App instance
 * @returns {ProxyHandler} Instance proxy handler
 */
function createInstanceProxyHandler(Model, $APP) {
  return {
    get(target, prop, receiver) {
      // Instance method: remove row from database
      if (prop === "remove") {
        return () =>
          Model.request("REMOVE", target._modelName, { id: target.id });
      }

      // Instance method: update row in database
      if (prop === "update") {
        return () => {
          const cleanRow = { ...target };
          delete cleanRow._modelName;
          return Model.request("EDIT", target._modelName, {
            row: cleanRow,
          });
        };
      }

      // Instance method: load relationships
      if (prop === "include") {
        return async (include) => {
          if (!target.id || !target._modelName) {
            console.error(
              "Cannot run .include() on an object without an ID or model name.",
            );
            return receiver;
          }

          if (!(target._modelName in $APP.models))
            throw new Error(
              `Model ${target._modelName} does not exist in models`,
            );

          const model = $APP.models[target._modelName];
          const propDef = model[include];
          if (!propDef)
            throw new Error(
              `Relationship '${include}' not found in ${target._modelName} model`,
            );
          const freshData = await Model.request(
            "GET_MANY",
            propDef.targetModel,
            {
              opts: {
                where: propDef.belongs
                  ? target[include]
                  : { [propDef.targetForeignKey]: target.id },
              },
            },
          );
          target[include] = Model.proxifyMultipleRows(
            freshData,
            propDef.targetModel,
          );

          return receiver;
        };
      }

      /**
       * Instance method: Subscribe to updates on this specific row instance.
       * @deprecated Use query-level subscriptions instead
       */
      if (prop === "subscribe") {
        return (callback) => {
          if (typeof callback !== "function") {
            console.error("Subscription callback must be a function.");
            return target;
          }

          console.warn(
            `row.subscribe() is deprecated and will be removed in v2.0. ` +
              `Use query-level subscriptions instead: ` +
              `Model.${target._modelName}.getAll({ where: { id: '${target.id}' } }).subscribe(...)`,
          );

          // Backward compatibility: Use SubscriptionManager with single-row query
          if ($APP.SubscriptionManager) {
            $APP.SubscriptionManager.subscribe(
              target._modelName,
              { id: target.id },
              (event) => {
                const { action, record } = event;
                if (action === "delete" || action === "remove") {
                  callback(undefined); // Signal deletion
                } else {
                  callback(record); // Pass updated record
                }
              },
            )
              .then((unsubscribe) => {
                // Store unsubscribe function on the target for later cleanup
                if (!target[SUBSCRIPTION_SYMBOL]) {
                  target[SUBSCRIPTION_SYMBOL] = new Set();
                }
                target[SUBSCRIPTION_SYMBOL].add({
                  callback,
                  unsubscribe,
                });
              })
              .catch((error) => {
                console.error("Failed to create row subscription:", error);
              });
          } else {
            // Fallback to old method if SubscriptionManager not available
            if (!target[SUBSCRIPTION_SYMBOL]) {
              target[SUBSCRIPTION_SYMBOL] = new Set();
            }
            target[SUBSCRIPTION_SYMBOL].add(callback);
          }

          return target;
        };
      }

      /**
       * Instance method: Unsubscribe from updates on this row instance.
       * @deprecated Use query-level subscriptions instead
       */
      if (prop === "unsubscribe") {
        return (callback) => {
          if (target[SUBSCRIPTION_SYMBOL]) {
            // Find and call unsubscribe function if using SubscriptionManager
            for (const item of target[SUBSCRIPTION_SYMBOL]) {
              if (
                typeof item === "object" &&
                item.callback === callback &&
                item.unsubscribe
              ) {
                item.unsubscribe();
                target[SUBSCRIPTION_SYMBOL].delete(item);
                return;
              }
            }
            // Fallback for old method
            target[SUBSCRIPTION_SYMBOL].delete(callback);
          }
        };
      }

      return target[prop];
    },

    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  };
}

/**
 * Create the Model proxy system
 * @param {object} $APP - App instance with models, events, SubscriptionManager
 * @returns {Proxy} Model proxy
 */
export function createModel($APP) {
  let Model;
  let instanceProxyHandler;
  let reactiveArrayPrototype;

  const handleModelRequest = async ({ modelName, action, payload }) => {
    const result = await Model.request(action, modelName, payload);
    if (action === "ADD_MANY" && result && Array.isArray(result.results)) {
      result.results.forEach((res) => {
        if (res.status === "fulfilled" && res.value) {
          res.value = proxifyRow(res.value, modelName);
        }
      });
      return result;
    }

    if (action.includes("MANY")) {
      if (payload.opts.object) return result;
      const opts = payload.opts || {};
      if (result?.items) {
        result.items = proxifyMultipleRows(result.items, modelName, opts);
        return result;
      }
      return proxifyMultipleRows(result, modelName, opts);
    }
    if (["ADD", "EDIT"].includes(action)) {
      if (result[0]) return [result[0], null];
      return [null, proxifyRow(result[1], modelName)];
    }
    return proxifyRow(result, modelName);
  };

  const getMethodRegistry = (modelName) => [
    {
      type: "static",
      name: "get",
      handler: (idOrOpts, opts = {}) =>
        handleModelRequest({
          modelName,
          action: "GET",
          payload: ["string", "number"].includes(typeof idOrOpts)
            ? { id: idOrOpts, opts }
            : { opts: idOrOpts },
        }),
    },
    {
      type: "static",
      name: "getAll",
      handler: (opts = {}) =>
        handleModelRequest({
          modelName,
          action: "GET_MANY",
          payload: { opts },
        }),
    },
    {
      type: "static",
      name: "add",
      handler: (row, opts) =>
        handleModelRequest({
          modelName,
          action: "ADD",
          payload: { row, opts },
        }),
    },
    {
      type: "static",
      name: "addMany",
      handler: (rows, opts) =>
        handleModelRequest({
          modelName,
          action: "ADD_MANY",
          payload: { rows, opts },
        }),
    },
    {
      type: "static",
      name: "remove",
      handler: (id) => Model.request("REMOVE", modelName, { id }),
    },
    {
      type: "static",
      name: "removeAll",
      handler: (where) =>
        Model.request("REMOVE_MANY", modelName, { opts: { where } }),
    },
    {
      type: "static",
      name: "edit",
      handler: (row) =>
        handleModelRequest({
          modelName,
          action: "EDIT",
          payload: { row },
        }),
    },
    {
      type: "static",
      name: "editAll",
      handler: (where, updates) =>
        Model.request("EDIT_MANY", modelName, { opts: { where, updates } }),
    },
    {
      type: "static",
      name: "upsert",
      handler: (row, opts) =>
        handleModelRequest({
          modelName,
          action: row?.id ? "EDIT" : "ADD",
          payload: { row, opts },
        }),
    },
    { type: "dynamic", prefix: "getBy", action: "GET" },
    { type: "dynamic", prefix: "getAllBy", action: "GET_MANY" },
    { type: "dynamic", prefix: "editAllBy", action: "EDIT_MANY" },
    { type: "dynamic", prefix: "editBy", action: "EDIT" },
    { type: "dynamic", prefix: "removeBy", action: "REMOVE" },
    { type: "dynamic", prefix: "removeAllBy", action: "REMOVE_MANY" },
  ];

  const proxifyRow = (row, modelName) => {
    if (!row || typeof row !== "object" || row.errors) return row;

    // If row already exists in cache, just update it and return proxy
    if (Model[modelName].rows[row.id]) {
      const { id: _, ...newRow } = row;
      const existingRow = Model[modelName].rows[row.id];
      Object.assign(existingRow, newRow);

      // Manually trigger subscriptions since this is an external update
      const subscriptions = existingRow[SUBSCRIPTION_SYMBOL];
      if (subscriptions && subscriptions.size > 0) {
        subscriptions.forEach(({ callback }) => {
          try {
            callback(existingRow);
          } catch (err) {
            console.error(
              "Error in row subscription callback (manual update):",
              err,
            );
          }
        });
      }
      // Return the *existing proxy*
      return new Proxy(existingRow, instanceProxyHandler);
    }

    // New row: cache it, set up listener, and return new proxy
    Model[modelName].rows[row.id] = row;

    Model[modelName].on(`get:${row.id}`, (data) => {
      const rowInstance = Model[modelName].rows[row.id];
      // Get subscriptions *before* potentially deleting the row
      const subscriptions = rowInstance
        ? rowInstance[SUBSCRIPTION_SYMBOL]
        : undefined;

      if (data === undefined) {
        // Data is gone, notify subscribers and delete from cache
        delete Model[modelName].rows[row.id];

        if (subscriptions && subscriptions.size > 0) {
          subscriptions.forEach(({ callback }) => {
            try {
              callback(undefined); // Signal deletion
            } catch (err) {
              console.error(
                "Error in row subscription callback (deletion):",
                err,
              );
            }
          });
          subscriptions.clear();
        }
        return;
      }

      // Data updated, merge changes
      const { id: _, ...newRow } = data;
      Object.assign(rowInstance, newRow);

      // Notify subscribers of the update
      if (subscriptions && subscriptions.size > 0) {
        subscriptions.forEach(({ callback }) => {
          try {
            callback(rowInstance); // Pass the updated row instance
          } catch (err) {
            console.error("Error in row subscription callback (update):", err);
          }
        });
      }
    });

    row._modelName = modelName;
    const proxified = new Proxy(
      Model[modelName].rows[row.id],
      instanceProxyHandler,
    );

    return proxified;
  };

  /**
   * Proxifies multiple rows and returns a ReactiveRowSet for query-level reactivity.
   * @param {Array<object>} rows - The array of row data.
   * @param {string} modelName - The name of the model.
   * @param {object} [opts={}] - The original query options.
   * @returns {ReactiveRowSet | Array}
   */
  const proxifyMultipleRows = (rows, modelName, opts = {}) => {
    if (!Array.isArray(rows)) return rows;

    // Create the individual proxified rows
    const proxifiedRows = rows.map((row) => proxifyRow(row, modelName));

    // Augment the array with reactive capabilities
    Object.setPrototypeOf(proxifiedRows, reactiveArrayPrototype);

    // Initialize reactive properties on the instance
    proxifiedRows.modelName = modelName;
    proxifiedRows.opts = opts;
    proxifiedRows.subscriptions = new Set();
    proxifiedRows.queryUnsubscribe = null;

    return proxifiedRows;
  };

  const uncapitalize = (str) => {
    if (typeof str !== "string" || !str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  const modelApiCache = new Map();

  Model = new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        if (modelApiCache.has(prop)) return modelApiCache.get(prop);
        const modelName = prop;
        if (!(prop in $APP.models)) {
          throw new Error(`Model ${modelName} does not exist in models`);
        }
        const modelSchema = $APP.models[modelName];
        const methodRegistry = getMethodRegistry(modelName, modelSchema);
        const modelApi = new Proxy(
          Object.assign(Object.create(ModelType.prototype), {
            name: modelName,
          }),
          {
            get(target, methodName, modelReceiver) {
              if (methodName in target)
                return Reflect.get(target, methodName, modelReceiver);
              for (const definition of methodRegistry) {
                if (
                  definition.type === "static" &&
                  definition.name === methodName
                )
                  return definition.handler;

                if (
                  definition.type === "dynamic" &&
                  methodName.startsWith(definition.prefix)
                ) {
                  const property = methodName.slice(definition.prefix.length);
                  if (!property) continue;

                  const propertyKey = uncapitalize(property);

                  if (!(propertyKey in modelSchema))
                    throw new Error(
                      `Property '${propertyKey}' not found in model '${modelName}'`,
                    );

                  return (value, row = null) => {
                    const payload = {
                      opts: { where: { [propertyKey]: value } },
                    };
                    if (row) payload.opts.row = row;

                    return handleModelRequest({
                      modelName,
                      action: definition.action,
                      payload,
                    });
                  };
                }
              }
              throw new Error(
                `Method '${methodName}' not found in model '${modelName}'`,
              );
            },
          },
        );
        createEventHandler(modelApi, { getter: false });
        modelApi.rows = {};
        modelApiCache.set(prop, modelApi);
        return modelApi;
      },
    },
  );

  // Initialize the handlers that need Model reference
  instanceProxyHandler = createInstanceProxyHandler(Model, $APP);
  reactiveArrayPrototype = createReactiveArrayPrototype(proxifyRow, $APP);

  // Attach utility methods
  Model.proxifyRow = proxifyRow;
  Model.proxifyMultipleRows = proxifyMultipleRows;
  Model.ModelType = ModelType;

  return Model;
}

export default { createModel, ModelType };
