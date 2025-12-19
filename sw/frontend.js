let $APP;
const pendingSWRequests = {};
let nextRequestId = 1;

let swRegistration = null;
let waitingWorker = null;
let updateCheckInterval = null;
let visibilityHandler = null;
let updateInProgress = false;

const handleSWMessage = async (message = {}) => {
  const { data } = message;
  const { eventId, type, payload } = data;

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

  const handler = $APP.swEvents.get(type);
  if (handler) await handler({ payload });
};

const postMessageToSW = (type, payload) => {
  if (!navigator.serviceWorker?.controller) {
    console.warn("SW: No active service worker controller");
    return;
  }
  navigator.serviceWorker.controller.postMessage({ type, payload });
};

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

const notifyUpdateAvailable = (worker) => {
  if (waitingWorker === worker) return;
  console.log("SW: Update available! Emitting SW:UPDATE_AVAILABLE event");
  waitingWorker = worker;
  $APP?.events?.emit("SW:UPDATE_AVAILABLE", { worker });
};

const handleNewWorker = (newWorker) => {
  console.log("SW: handleNewWorker called, state:", newWorker.state, "hasController:", !!navigator.serviceWorker.controller);

  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
    notifyUpdateAvailable(newWorker);
    return;
  }

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

  waitingWorker.postMessage({ type: "SKIP_WAITING" });

  const timeoutId = setTimeout(() => {
    console.error("SW: Update timed out, reload manually");
    updateInProgress = false;
  }, timeout);

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

  disableAutoUpdates();

  if (onPageLoad) {
    checkForUpdates();
  }

  if (pollingInterval > 0) {
    updateCheckInterval = setInterval(checkForUpdates, pollingInterval);
  }

  if (onVisibilityChange) {
    visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        checkForUpdates();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  }
};

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

const setRegistration = (registration) => {
  swRegistration = registration;

  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    console.log("SW: Update found, new worker installing...");
    if (newWorker) {
      handleNewWorker(newWorker);
    }
  });

  if (registration.waiting) {
    console.log("SW: Found waiting worker on registration");
    handleNewWorker(registration.waiting);
  }

  if (registration.installing) {
    console.log("SW: Found installing worker on registration");
    handleNewWorker(registration.installing);
  }
};

const hasUpdate = () => !!waitingWorker;

const getRegistration = () => swRegistration;

export function initSWFrontend(app) {
  $APP = app;

  if (navigator.serviceWorker) {
    navigator.serviceWorker.onmessage = handleSWMessage;
  }

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

  const SW = {
    postMessage: postMessageToSW,
    request: requestToSW,
    setRegistration,
    enableAutoUpdates,
    disableAutoUpdates,
    checkForUpdates,
    applyUpdate,
    hasUpdate,
    getRegistration,
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
