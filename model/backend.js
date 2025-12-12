/**
 * @file Backend Model Module
 * @description Initializes Model system for worker context with database operations
 */

import { createModel } from "./index.js";

/**
 * Create model event handlers for worker context
 * @param {object} $APP - App instance with Database
 * @returns {object} Event handlers object
 */
export function createModelEventHandlers($APP) {
  return {
    ADD: async ({ payload, respond }) => {
      try {
        const response = await $APP.Database.add(payload.model, payload.row);
        respond([null, response]);
      } catch (error) {
        respond([error, null]);
      }
    },
    ADD_MANY: async ({ payload, respond }) => {
      const results = [];
      for (const row of payload.rows) {
        try {
          const result = await $APP.Database.add(payload.model, row);
          results.push([null, result]);
        } catch (error) {
          respond([error, null]);
        }
      }
      respond([null, results]);
    },
    REMOVE: async ({ payload, respond }) => {
      const response = await $APP.Database.remove(payload.model, payload.id);
      respond(response);
    },
    REMOVE_MANY: async ({ payload, respond }) => {
      const results = [];
      const ids = Array.isArray(payload.ids) ? payload.ids : [payload.ids];
      for (const id of ids) {
        const result = await $APP.Database.remove(payload.model, id);
        results.push(result);
      }
      respond([null, results]);
    },
    EDIT: async ({ payload, respond }) => {
      if (!payload.row.id) {
        respond([
          new Error("Record data must include 'id' field for edit operation"),
          null,
        ]);
        return;
      }
      try {
        const response = await $APP.Database.edit(
          payload.model,
          payload.row.id,
          payload.row,
        );
        respond([null, response]);
      } catch (error) {
        respond([error, null]);
      }
    },
    EDIT_MANY: async ({ payload, respond }) => {
      const results = [];
      for (const row of payload.rows) {
        if (!row.id) {
          results.push([new Error("Record must have id field"), null]);
          continue;
        }
        try {
          const result = await $APP.Database.edit(payload.model, row.id, row);
          results.push([null, result]);
        } catch (error) {
          respond([error, null]);
        }
      }
      respond([null, results]);
    },
    GET: async ({ payload, respond }) => {
      const { id, model, opts = {} } = payload;
      let response;
      if (id) {
        response = await $APP.Database.get(model, id, opts);
      } else if (opts.where) {
        const where =
          typeof opts.where === "string" ? JSON.parse(opts.where) : opts.where;
        const results = await $APP.Database.getAll(model, {
          where,
          limit: 1,
          includes: opts.includes || [],
        });
        response = results.length > 0 ? results[0] : null;
      } else {
        response = null;
      }
      respond(response);
    },
    GET_MANY: async ({ payload: { model, opts = {} }, respond } = {}) => {
      const response = await $APP.Database.getAll(model, opts);
      respond(response);
    },
  };
}

/**
 * Create relationship sync handlers
 * @param {object} $APP - App instance
 * @returns {object} Event handlers for relationship sync
 */
export function createRelationshipSyncHandlers($APP) {
  return {
    onAddRecord({ model, row }) {
      $APP.Backend.broadcast({
        type: "QUERY_DATA_SYNC",
        payload: { action: "add", model, record: row },
      });
    },
    onEditRecord({ model, row }) {
      $APP.Backend.broadcast({
        type: "QUERY_DATA_SYNC",
        payload: { action: "update", model, record: row },
      });
    },
    onRemoveRecord({ model, row, id }) {
      $APP.Backend.broadcast({
        type: "QUERY_DATA_SYNC",
        payload: { action: "delete", model, record: row || { id } },
      });
    },
  };
}

/**
 * Initialize Model backend in worker context
 * @param {object} $APP - App instance with Database, Backend
 * @returns {object} Model instance
 */
export function initModelBackend($APP) {
  const Model = createModel($APP);

  // Register CRUD event handlers
  const queryModelEvents = createModelEventHandlers($APP);
  $APP.events.set(queryModelEvents);

  // Create direct request function for worker
  const request = (action, modelName, payload = {}) => {
    return new Promise((resolve) => {
      const event = queryModelEvents[action];
      if (event && typeof event === "function") {
        event({
          respond: resolve,
          payload: {
            model: modelName,
            ...payload,
          },
        });
      } else
        resolve({ success: false, error: `Action "${action}" not found.` });
    });
  };

  // Register relationship sync handlers
  const relationshipHandlers = createRelationshipSyncHandlers($APP);
  $APP.events.set(relationshipHandlers);

  Model.request = request;
  $APP.addModule({ name: "Model", base: Model });

  return Model;
}

export default { createModelEventHandlers, createRelationshipSyncHandlers, initModelBackend };
