import T from "/$app/types/index.js";
import View from "/$app/view/index.js";
import $APP from "/$app.js";

let appWorker;
let wwPort;
const pendingRequests = {};

const handleWWMessage = async (message = {}) => {
  const { data } = message;
  const { eventId, type, payload, connection } = data;
  const response = payload;
  const respond =
    eventId &&
    ((responsePayload) =>
      wwPort.postMessage({
        eventId,
        payload: responsePayload,
        connection,
      }));
  await $APP.events.emit(type, { respond, payload, eventId });

  if (eventId && pendingRequests[eventId]) {
    try {
      pendingRequests[data.eventId].resolve(response);
    } catch (error) {
      pendingRequests[data.eventId].reject(new Error(error));
    } finally {
      delete pendingRequests[eventId];
    }
  }
  if (respond) return respond(response);
};

const initBackend = async () => {
  try {
    appWorker = new Worker(`/backend.js`, {
      type: "module",
    });
    const wwChannel = new MessageChannel();
    wwPort = wwChannel.port1;
    wwPort.onmessage = handleWWMessage;
    wwPort.onmessageerror = (e) => {
      console.error("Worker message error:", e);
    };
    appWorker.postMessage({ type: "APP:BACKEND:START" }, [wwChannel.port2]);
    //await navigator.storage.persist();
    $APP.events.on("APP:BACKEND:READY", async () => {
      await $APP.events.emit("APP:READY");
    });
  } catch (error) {
    console.error("Failed to initialize backend:", error);
    throw error;
  }
};

$APP.events.on("APP:INIT", initBackend);

const postMessageToPort = (port, params, retryFn) => {
  if (!port) {
    setTimeout(() => retryFn(params), 100);
    return;
  }
  port.postMessage(params);
};

const postMessageToWW = (params) =>
  postMessageToPort(wwPort, params, postMessageToWW);
const fetchDataQuery = async (instance) => {
  const query = instance["data-query"];
  if (!query) return;

  const {
    model,
    id,
    limit,
    offset = 0,
    order,
    where,
    includes,
    key,
    single,
  } = query;

  if (!model) return console.warn("data-query: 'model' is required");
  if (!key)
    return console.warn(
      "data-query: 'key' is required to know where to store data",
    );
  if (!$APP.Model || !$APP.Model[model])
    return console.error(`data-query: Model "${model}" does not exist`);

  const isMany = query.many ?? (!id && !single);
  const opts = { limit: single ? 1 : limit, offset, includes, order, where };
  console.error({ isMany, opts });
  if (instance._dataQuerySub && instance._dataQuerySubHandler) {
    instance._dataQuerySub.unsubscribe(instance._dataQuerySubHandler);
    instance._dataQuerySub = null;
  }
  instance._paginationInfo = null;
  instance._dataQuerySubHandler = (data) => {
    const oldValue = instance.state[key];
    instance.state[key] = data;
    instance.requestUpdate(key, oldValue);
    instance.emit("dataLoaded", {
      instance,
      rows: isMany ? data : undefined,
      row: !isMany ? data : undefined,
      ...(instance._paginationInfo || {}),
      component: instance.constructor,
    });
  };

  try {
    if (isMany) {
      const result = await $APP.Model[model].getAll(opts);
      const oldValue = instance.state[key];
      instance.state[key] = result;
      instance._paginationInfo =
        result.limit !== undefined
          ? {
              total: result.total,
              limit: result.limit,
              offset: result.offset,
              count: result.count,
            }
          : null;
      instance.requestUpdate(key, oldValue);
      result.subscribe?.(instance._dataQuerySubHandler);
      instance._dataQuerySub = result;
    } else if (single && where) {
      const result = await $APP.Model[model].getAll(opts);

      const oldValue = instance.state[key];
      instance.state[key] = result[0] || null;
      instance.requestUpdate(key, oldValue);

      // Subscribe to array, extract first item on updates
      result.subscribe?.((data) => {
        instance._dataQuerySubHandler(data[0] || null);
      });
      instance._dataQuerySub = result;
    } else {
      // Single record via id
      const reactiveRow = await $APP.Model[model].get(id);
      const oldValue = instance.state[key];
      instance.state[key] = reactiveRow;
      instance.requestUpdate(key, oldValue);

      // Subscribe to updates - handle both array and single row formats
      reactiveRow.subscribe?.((data) => {
        const row = Array.isArray(data) ? data[0] : data;
        instance._dataQuerySubHandler(row);
      });
      instance._dataQuerySub = reactiveRow;
    }
    instance.emit("dataLoaded", {
      instance,
      rows: isMany ? instance.state[key] : undefined,
      row: !isMany ? instance.state[key] : undefined,
      ...(instance._paginationInfo || {}),
      component: instance.constructor,
    });
  } catch (error) {
    console.error(
      `data-query: Failed to load data for model "${model}":`,
      error,
    );
    instance.emit("dataError", { instance, error, model, id });
  }

  instance.syncable = true;
};

View.plugins.push({
  name: "dataQuery",
  test: ({ component }) => !!component.dataQuery,
  init: ({ View }) => {
    View.properties["data-query"] = T.object({
      properties: {
        model: T.string(),
        id: T.string(),
        where: T.object(),
        includes: T.string(),
        order: T.string(),
        limit: T.number(),
        offset: T.number(),
        count: T.number(),
        key: T.string(),
        single: T.boolean(),
      },
    });
  },
  events: {
    connected: async ({ instance }) => {
      // Initial data fetch
      await fetchDataQuery(instance);

      // Listen for data-query prop changes to re-fetch
      instance._dataQueryChangeHandler = async () => {
        await fetchDataQuery(instance);
      };
      instance.on("data-queryChanged", instance._dataQueryChangeHandler);
    },
    disconnected: ({ instance }) => {
      // Clean up subscription
      if (instance._dataQuerySub && instance._dataQuerySubHandler)
        instance._dataQuerySub.unsubscribe(instance._dataQuerySubHandler);
      instance._dataQuerySub = null;
      instance._dataQuerySubHandler = null;
      if (instance._dataQueryChangeHandler) {
        instance.off("data-queryChanged", instance._dataQueryChangeHandler);
        instance._dataQueryChangeHandler = null;
      }
    },
  },
});

const backend = (type, payload = {}, connection = null, timeout = 10000) => {
  if (!type) {
    return Promise.reject(new Error("backend: type parameter is required"));
  }
  const eventId =
    Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const params = { type, payload, eventId };
  return new Promise((resolve, reject) => {
    if (connection) params.connection = connection;
    const timeoutId = setTimeout(() => {
      if (pendingRequests[eventId]) {
        delete pendingRequests[eventId];
        reject(
          new Error(
            `Backend request timeout after ${timeout}ms for type: ${type}`,
          ),
        );
      }
    }, timeout);

    pendingRequests[eventId] = {
      resolve: (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      reject: (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    };

    postMessageToWW(params);
  });
};
const Backend = { request: backend, init: initBackend };
$APP.addModule({ name: "Backend", base: Backend });
export default Backend;
