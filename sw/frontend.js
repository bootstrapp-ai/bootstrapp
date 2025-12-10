/**
 * @file Service Worker Frontend Module
 * @description Frontend communication with Service Worker
 */

let $APP;
const pendingSWRequests = {};
let nextRequestId = 1;

/**
 * Handle incoming messages from Service Worker
 * @param {MessageEvent} message - Message event from SW
 */
const handleSWMessage = async (message = {}) => {
  const { data } = message;
  const { eventId, type, payload } = data;

  // Handle response to pending request
  if (eventId && pendingSWRequests[eventId]) {
    try {
      pendingSWRequests[eventId].resolve(payload);
    } catch (error) {
      pendingSWRequests[eventId].reject(new Error(error));
    } finally {
      delete pendingSWRequests[eventId];
    }
    return;
  }

  // Handle incoming event
  const handler = $APP.swEvents.get(type);
  if (handler) await handler({ payload });
};

/**
 * Post a message to the Service Worker (fire and forget)
 * @param {string} type - Message type
 * @param {any} payload - Message payload
 */
const postMessageToSW = (type, payload) => {
  if (!navigator.serviceWorker?.controller) {
    console.warn("SW: No active service worker controller");
    return;
  }
  navigator.serviceWorker.controller.postMessage({ type, payload });
};

/**
 * Send a request to the Service Worker and wait for response
 * @param {string} type - Request type
 * @param {any} payload - Request payload
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<any>} Response from SW
 */
const requestToSW = (type, payload, timeout = 30000) => {
  if (!navigator.serviceWorker?.controller) {
    return Promise.reject(new Error("No active service worker controller"));
  }

  const eventId = `sw-request-${nextRequestId++}`;

  return new Promise((resolve, reject) => {
    pendingSWRequests[eventId] = { resolve, reject };

    const timeoutId = setTimeout(() => {
      if (pendingSWRequests[eventId]) {
        delete pendingSWRequests[eventId];
        reject(new Error(`SW request timed out after ${timeout}ms: ${type}`));
      }
    }, timeout);

    // Clear timeout on resolution
    const originalResolve = pendingSWRequests[eventId].resolve;
    pendingSWRequests[eventId].resolve = (value) => {
      clearTimeout(timeoutId);
      originalResolve(value);
    };

    navigator.serviceWorker.controller.postMessage({
      type,
      payload,
      eventId,
    });
  });
};

/**
 * Initialize Service Worker frontend module
 * @param {Object} app - $APP instance
 */
export function initSWFrontend(app) {
  $APP = app;

  // Setup message listener
  if (navigator.serviceWorker) {
    navigator.serviceWorker.onmessage = handleSWMessage;
  }

  // Register swEvents module for handling incoming SW events
  $APP.addModule({
    name: "swEvents",
    base: new Map([
      ["SW:SYNC_PROPS", ({ payload }) => {
        if (payload?.property && payload?.value !== undefined) {
          $APP.events.emit(`SYNC:${payload.property}`, payload.value);
        }
      }],
      ["SW:QUERY_SYNC", ({ payload }) => {
        $APP.events.emit("SYNC:QUERY", payload);
      }],
    ]),
  });

  // Register SW module
  const SW = {
    postMessage: postMessageToSW,
    request: requestToSW,
  };

  $APP.addModule({
    name: "sw",
    alias: "SW",
    base: SW,
  });

  return SW;
}

export default { initSWFrontend };
