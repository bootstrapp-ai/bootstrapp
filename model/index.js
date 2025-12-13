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
 * Symbol used to store relationship subscription unsubscribers on a row instance.
 */
const RELATIONSHIP_SUBS_SYMBOL = Symbol("relationshipSubscriptions");

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
    // Pagination metadata (set by proxifyMultipleRows when available)
    total: 0,
    limit: undefined,
    offset: 0,
    count: 0,

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
      if (
        this.queryUnsubscribe &&
        typeof this.queryUnsubscribe === "function"
      ) {
        this.queryUnsubscribe();
        this.queryUnsubscribe = null;
      }
      this.subscriptions.clear();
    },
  };
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
      if (prop === "remove")
        return () =>
          Model.request("REMOVE", target._modelName, { id: target.id });

      if (prop === "update")
        return () => {
          const cleanRow = { ...target };
          delete cleanRow._modelName;
          return Model.request("EDIT", target._modelName, {
            row: cleanRow,
          });
        };

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
       * Uses SubscriptionManager under the hood with a single-row query.
       */
      if (prop === "subscribe") {
        return (callback) => {
          if (typeof callback !== "function") {
            console.error("Subscription callback must be a function.");
            return target;
          }

          // Use SubscriptionManager with single-row query
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

  /**
   * Auto-subscribe to included relationships so changes propagate
   * @param {object} row - The row with loaded relationships
   * @param {string} modelName - Name of the model
   * @param {Array<string>} includes - Relationship names that were included
   */
  const autoSubscribeRelationships = (row, modelName, includes) => {
    if (!row || !includes?.length || !$APP.models?.[modelName]) return;

    const modelDef = $APP.models[modelName];
    const unsubscribers = [];

    for (const relationName of includes) {
      const relDef = modelDef[relationName];
      if (!relDef || !relDef.targetModel) continue;

      const targetModel = relDef.targetModel;

      if (relDef.belongs) {
        // Single foreign key: subscribe to that record
        // row[relationName] could be the ID or the loaded object
        const relData = row[relationName];
        const relId = typeof relData === "object" ? relData?.id : relData;
        if (relId) {
          subscribeToRelated(
            targetModel,
            { id: relId },
            row,
            relationName,
            unsubscribers,
          );
        }
      } else if (relDef.belongs_many) {
        // Array of foreign keys or loaded objects
        const relArray = row[relationName] || [];
        for (const item of relArray) {
          const itemId = typeof item === "object" ? item?.id : item;
          if (itemId) {
            subscribeToRelated(
              targetModel,
              { id: itemId },
              row,
              relationName,
              unsubscribers,
            );
          }
        }
      } else if (relDef.many || relDef.one) {
        // Reverse relationship: subscribe to targetModel where foreignKey = row.id
        const foreignKey =
          relDef.targetForeignKey || `${modelName.toLowerCase()}Id`;
        subscribeToRelated(
          targetModel,
          { [foreignKey]: row.id },
          row,
          relationName,
          unsubscribers,
        );
      }
    }

    // Store unsubscribers on the row for cleanup
    if (unsubscribers.length > 0) {
      row[RELATIONSHIP_SUBS_SYMBOL] = unsubscribers;
    }
  };

  /**
   * Subscribe to a related model and update parent row when changes occur
   */
  const subscribeToRelated = (
    targetModel,
    where,
    parentRow,
    relationName,
    unsubscribers,
  ) => {
    if (!$APP.SubscriptionManager) return;

    $APP.SubscriptionManager.subscribe(targetModel, where, (event) => {
      const { action, record } = event;

      if (action === "update" || action === "edit") {
        // Update the relationship data in parent row
        updateRelationshipData(parentRow, relationName, record);
      } else if (action === "delete" || action === "remove") {
        // Remove from relationship if it's an array
        removeFromRelationship(parentRow, relationName, record);
      }
    })
      .then((unsubscribe) => {
        if (unsubscribe) {
          unsubscribers.push(unsubscribe);
        }
      })
      .catch((err) => {
        console.error("Failed to subscribe to relationship:", err);
      });
  };

  /**
   * Update relationship data when a related record changes
   */
  const updateRelationshipData = (parentRow, relationName, updatedRecord) => {
    const currentData = parentRow[relationName];

    if (Array.isArray(currentData)) {
      // Find and update the record in the array
      const index = currentData.findIndex(
        (item) => String(item?.id || item) === String(updatedRecord.id),
      );
      if (index > -1) {
        // Create new array with updated item for change detection
        const newArray = [...currentData];
        newArray[index] = updatedRecord;
        parentRow[relationName] = newArray;
      }
    } else if (currentData && typeof currentData === "object") {
      // Single relationship - replace with updated data
      if (String(currentData.id) === String(updatedRecord.id)) {
        parentRow[relationName] = updatedRecord;
      }
    }
  };

  /**
   * Remove a deleted record from relationship array
   */
  const removeFromRelationship = (parentRow, relationName, deletedRecord) => {
    const currentData = parentRow[relationName];

    if (Array.isArray(currentData)) {
      const newArray = currentData.filter(
        (item) => String(item?.id || item) !== String(deletedRecord.id),
      );
      if (newArray.length !== currentData.length) {
        parentRow[relationName] = newArray;
      }
    } else if (currentData && typeof currentData === "object") {
      if (String(currentData.id) === String(deletedRecord.id)) {
        parentRow[relationName] = null;
      }
    }
  };

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
        // Extract pagination info from result
        const paginationInfo = {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          count: result.count,
        };
        // Proxify items with pagination metadata attached to the array
        const reactiveItems = proxifyMultipleRows(
          result.items,
          modelName,
          opts,
          paginationInfo,
        );
        // Auto-subscribe for each row if includes provided
        if (opts.includes?.length) {
          reactiveItems.forEach((row) =>
            autoSubscribeRelationships(row, modelName, opts.includes),
          );
        }
        // Return the reactive array directly (pagination info is on the array itself)
        return reactiveItems;
      }
      const proxified = proxifyMultipleRows(result, modelName, opts);
      // Auto-subscribe for each row if includes provided
      if (opts.includes?.length) {
        proxified.forEach((row) =>
          autoSubscribeRelationships(row, modelName, opts.includes),
        );
      }
      return proxified;
    }
    if (["ADD", "EDIT"].includes(action)) {
      if (result[0]) return [result[0], null];
      return [null, proxifyRow(result[1], modelName)];
    }

    const proxifiedResult = proxifyRow(result, modelName);
    // Auto-subscribe if includes provided for single record
    if (payload.opts?.includes?.length && proxifiedResult) {
      autoSubscribeRelationships(
        proxifiedResult,
        modelName,
        payload.opts.includes,
      );
    }
    return proxifiedResult;
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

    // If row already exists in cache, create NEW object (immutable update for change detection)
    if (Model[modelName].rows[row.id]) {
      const existingRow = Model[modelName].rows[row.id];
      // Create NEW object with merged data instead of mutating
      const updatedRow = { ...existingRow, ...row };
      updatedRow._modelName = modelName;

      // Replace in cache with new object
      Model[modelName].rows[row.id] = updatedRow;

      // Transfer and trigger subscriptions with the NEW object reference
      const subscriptions = existingRow[SUBSCRIPTION_SYMBOL];
      if (subscriptions && subscriptions.size > 0) {
        updatedRow[SUBSCRIPTION_SYMBOL] = subscriptions;
        subscriptions.forEach(({ callback }) => {
          try {
            callback(updatedRow);
          } catch (err) {
            console.error(
              "Error in row subscription callback (manual update):",
              err,
            );
          }
        });
      }
      // Return proxy wrapping the NEW object
      return new Proxy(updatedRow, instanceProxyHandler);
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
   * @param {object} [paginationInfo=null] - Pagination metadata {total, limit, offset, count}.
   * @returns {ReactiveRowSet | Array}
   */
  const proxifyMultipleRows = (
    rows,
    modelName,
    opts = {},
    paginationInfo = null,
  ) => {
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

    // Attach pagination info if provided
    if (paginationInfo) {
      proxifiedRows.total = paginationInfo.total;
      proxifiedRows.limit = paginationInfo.limit;
      proxifiedRows.offset = paginationInfo.offset;
      proxifiedRows.count = paginationInfo.count;
    }

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
