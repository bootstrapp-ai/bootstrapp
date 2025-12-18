/**
 * @file Service Worker Frontend Module
 * @description Frontend communication with Service Worker
 */

let $APP;
const pendingSWRequests = {};
let nextRequestId = 1;

// Update management state
let swRegistration = null;
let waitingWorker = null;
let updateCheckInterval = null;
let visibilityHandler = null;
let updateInProgress = false;

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
 * Check for Service Worker updates
 * @returns {Promise<boolean>} True if update check was triggered
 */
const checkForUpdates = async () => {
  if (!swRegistration) return false;
  try {
    await swRegistration.update();
    return true;
  } catch (error) {
    console.warn("SW: Update check failed:", error);
    return false;
  }
};

/**
 * Notify that an update is available
 * @param {ServiceWorker} worker - The waiting worker
 */
const notifyUpdateAvailable = (worker) => {
  if (waitingWorker === worker) return; // Already notified for this worker
  console.log("SW: Update available! Emitting SW:UPDATE_AVAILABLE event");
  waitingWorker = worker;
  $APP?.events?.emit("SW:UPDATE_AVAILABLE", { worker });
};

/**
 * Handle when a new Service Worker is found
 * @param {ServiceWorker} newWorker - The installing/waiting worker
 */
const handleNewWorker = (newWorker) => {
  console.log("SW: handleNewWorker called, state:", newWorker.state, "hasController:", !!navigator.serviceWorker.controller);

  // If already installed and we have a controller, it's waiting
  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
    notifyUpdateAvailable(newWorker);
    return;
  }

  // Listen for state changes (use once to prevent memory leaks)
  newWorker.addEventListener(
    "statechange",
    () => {
      console.log("SW: Worker state changed to:", newWorker.state);
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        notifyUpdateAvailable(newWorker);
      }
    },
    { once: true },
  );
};

/**
 * Apply pending update - activates waiting SW and reloads page
 * @param {number} timeout - Timeout in ms before giving up (default: 10000)
 * @returns {boolean} True if update was initiated
 */
const applyUpdate = (timeout = 10000) => {
  if (!waitingWorker) {
    console.warn("SW: No waiting worker to activate");
    return false;
  }

  if (updateInProgress) {
    console.warn("SW: Update already in progress");
    return false;
  }

  updateInProgress = true;

  // Tell the waiting SW to skip waiting
  waitingWorker.postMessage({ type: "SKIP_WAITING" });

  // Set up timeout in case activation fails
  const timeoutId = setTimeout(() => {
    console.error("SW: Update timed out, reload manually");
    updateInProgress = false;
  }, timeout);

  // Reload once the new SW takes control
  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      clearTimeout(timeoutId);
      window.location.reload();
    },
    { once: true },
  );

  return true;
};

/**
 * Enable automatic update checking
 * @param {Object} config - Update configuration
 * @param {boolean} config.onPageLoad - Check on initial page load (default: true)
 * @param {number} config.pollingInterval - Polling interval in ms (0 to disable, default: 0)
 * @param {boolean} config.onVisibilityChange - Check when tab becomes visible (default: false)
 */
const enableAutoUpdates = (config = {}) => {
  const {
    onPageLoad = true,
    pollingInterval = 0,
    onVisibilityChange = false,
  } = config;

  if (!swRegistration) {
    console.warn("SW: Cannot enable auto updates - no registration");
    return;
  }

  // Clean up existing listeners first
  disableAutoUpdates();

  // Check on page load
  if (onPageLoad) {
    checkForUpdates();
  }

  // Set up polling
  if (pollingInterval > 0) {
    updateCheckInterval = setInterval(checkForUpdates, pollingInterval);
  }

  // Check on visibility change
  if (onVisibilityChange) {
    visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  }
};

/**
 * Disable automatic update checking and clean up listeners
 */
const disableAutoUpdates = () => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
};

/**
 * Set the SW registration reference (called from bootstrapper)
 * @param {ServiceWorkerRegistration} registration - SW registration
 */
const setRegistration = (registration) => {
  swRegistration = registration;

  // Listen for future updates
  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    console.log("SW: Update found, new worker installing...");
    if (newWorker) {
      handleNewWorker(newWorker);
    }
  });

  // Check if there's already a waiting worker (update ready to apply)
  if (registration.waiting) {
    console.log("SW: Found waiting worker on registration");
    handleNewWorker(registration.waiting);
  }

  // Check if there's an installing worker (update in progress)
  if (registration.installing) {
    console.log("SW: Found installing worker on registration");
    handleNewWorker(registration.installing);
  }
};

/**
 * Check if an update is available
 * @returns {boolean} True if a worker is waiting
 */
const hasUpdate = () => !!waitingWorker;

/**
 * Get the current registration
 * @returns {ServiceWorkerRegistration|null}
 */
const getRegistration = () => swRegistration;

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
      [
        "SW:SYNC_PROPS",
        ({ payload }) => {
          if (payload?.property && payload?.value !== undefined) {
            $APP.events.emit(`SYNC:${payload.property}`, payload.value);
          }
        },
      ],
      [
        "SW:QUERY_SYNC",
        ({ payload }) => {
          $APP.events.emit("SYNC:QUERY", payload);
        },
      ],
    ]),
  });

  // Register SW module
  const SW = {
    postMessage: postMessageToSW,
    request: requestToSW,
    // Update management
    setRegistration,
    enableAutoUpdates,
    disableAutoUpdates,
    checkForUpdates,
    applyUpdate,
    hasUpdate,
    getRegistration,
    // Build-time caching control
    enableLocalCaching: () => requestToSW("SW:ENABLE_LOCAL_CACHING"),
    disableLocalCaching: () => requestToSW("SW:DISABLE_LOCAL_CACHING"),
    clearLocalCache: () => requestToSW("SW:CLEAR_LOCAL_CACHE"),
  };

  $APP.addModule({
    name: "sw",
    alias: "SW",
    base: SW,
    path: "/$app/sw/views",
  });

  return SW;
}

export {
  setRegistration,
  enableAutoUpdates,
  disableAutoUpdates,
  checkForUpdates,
  applyUpdate,
  hasUpdate,
};
export default { initSWFrontend };
