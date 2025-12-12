import $APP from "/$app.js";
import Model from "/$app/model/index.js";
import T from "/$app/types/index.js";
import View from "/$app/view/index.js";

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
      !console.error("APP:READY");
      await $APP.events.emit("APP:READY");
      console.error("After APP:READY");
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
  console.log({ params });
  port.postMessage(params);
};

const postMessageToWW = (params) =>
  postMessageToPort(wwPort, params, postMessageToWW);
// --- REFACTORED ---
// The requestDataSync function is no longer needed and has been removed.
// The View plugin 'connected' event now handles all data fetching and subscription.

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
        key: T.string(), // 'key' is where data is stored (e.g., 'this.state.users')
      },
    });
  },
  events: {
    connected: async ({ instance }) => {
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
      } = query;

      if (!model) return console.warn("data-query: 'model' is required");
      if (!key)
        return console.warn(
          "data-query: 'key' is required to know where to store data",
        );
      if (!Model || !Model[model])
        return console.error(`data-query: Model "${model}" does not exist`);
      const isMany = query.many ?? !id;
      const opts = { limit, offset, includes, order, where };

      // Define the handler that will be called on subscription updates
      instance._dataQuerySubHandler = (data) => {
        const oldValue = instance.state[key];
        instance.state[key] = data;
        instance.requestUpdate(key, oldValue);
        instance.emit("dataLoaded", {
          instance,
          rows: isMany ? data : undefined,
          row: !isMany ? data : undefined,
          component: instance.constructor,
        });
      };

      console.log({ instance });
      instance._dataQuerySub = null;

      try {
        if (isMany) {
          const reactiveArray = await Model[model].getAll(opts);
          instance.state[key] = [...reactiveArray];
          instance.requestUpdate();
          reactiveArray.subscribe(instance._dataQuerySubHandler);
          instance._dataQuerySub = reactiveArray;
        } else {
          // Use getAll with where clause for single record to get proper subscription support
          // (row.subscribe() is deprecated and has issues with async callback registration)
          const reactiveArray = await Model[model].getAll({
            ...opts,
            where: { id },
          });
          const reactiveRow = reactiveArray[0];
          const oldValue = instance.state[key];
          console.error({ reactiveArray });
          instance.state[key] = reactiveRow;
          instance.requestUpdate(key, oldValue);

          // Subscribe to the array, handler extracts single item
          reactiveArray.subscribe((data) => {
            console.log({ instance, data });
            instance._dataQuerySubHandler(data[0]);
          });
          instance._dataQuerySub = reactiveArray;
        }
        instance.emit("dataLoaded", {
          instance,
          rows: isMany ? instance.state[key] : undefined,
          row: !isMany ? instance.state[key] : undefined,
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
    },
    disconnected: ({ instance }) => {
      if (instance._dataQuerySub && instance._dataQuerySubHandler)
        instance._dataQuerySub.unsubscribe(instance._dataQuerySubHandler);
      instance._dataQuerySub = null;
      instance._dataQuerySubHandler = null;
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

    // Set up timeout
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
