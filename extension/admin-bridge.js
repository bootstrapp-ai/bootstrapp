const MSG = {
  PING: "ext:ping",
  PONG: "ext:pong",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  INJECT: "ext:inject",
  EXECUTE: "ext:execute",
  OBSERVE: "ext:observe",
  STOP_OBSERVE: "ext:stopObserve",
  START_INTERCEPT: "ext:startIntercept",
  STOP_INTERCEPT: "ext:stopIntercept",
  INTERCEPTED_DATA: "ext:interceptedData",
  DATA: "ext:data",
  ERROR: "ext:error",
  EVENT: "ext:event",
  SCRAPE_INSTAGRAM: "ext:scrapeInstagram",
  FETCH_INSTAGRAM_PROFILE: "ext:fetchInstagramProfile",
  UPDATE_DOC_ID: "ext:updateDocId",
};

export const createExtensionBridge = (extensionId) => {
  let port = null;
  let connected = false;
  const eventListeners = new Map();
  const pendingRequests = new Map();
  const disconnectCallbacks = new Set();
  const interceptDataCallbacks = new Set();
  let requestId = 0;
  let keepAliveInterval = null;

  const isExtensionAvailable = () => {
    return typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect;
  };

  const nextRequestId = () => `req-${++requestId}-${Date.now()}`;

  const sendRequest = (type, payload = {}) => {
    return new Promise((resolve, reject) => {
      if (!connected || !port) {
        reject(new Error("Not connected to extension"));
        return;
      }

      const reqId = nextRequestId();
      console.log(`[Bridge] Sending request: ${type} (${reqId})`);

      const timeout = setTimeout(() => {
        console.log(`[Bridge] TIMEOUT for ${reqId} - pending requests:`, [...pendingRequests.keys()]);
        pendingRequests.delete(reqId);
        reject(new Error("Request timeout"));
      }, 30000);

      pendingRequests.set(reqId, { resolve, reject, timeout });

      port.postMessage({
        type,
        requestId: reqId,
        ...payload,
      });
    });
  };

  const handleMessage = (message) => {
    console.log("[Bridge] Received:", message);
    console.log("[Bridge] Message requestId:", message.requestId, "| Pending:", [...pendingRequests.keys()]);

    if (message.requestId && pendingRequests.has(message.requestId)) {
      console.log(`[Bridge] MATCHED request ${message.requestId}`);
      const { resolve, reject, timeout } = pendingRequests.get(message.requestId);
      clearTimeout(timeout);
      pendingRequests.delete(message.requestId);

      if (message.type === MSG.ERROR) {
        reject(new Error(message.error));
      } else {
        resolve(message);
      }
      return;
    }

    if (message.requestId) {
      console.log(`[Bridge] NO MATCH - requestId ${message.requestId} not in pending requests`);
    } else {
      console.log("[Bridge] NO MATCH - message has no requestId");
    }

    if (message.type === MSG.EVENT) {
      const listeners = eventListeners.get(message.observerId) || [];
      listeners.forEach((callback) => callback(message));
    }

    if (message.type === MSG.INTERCEPTED_DATA) {
      interceptDataCallbacks.forEach((callback) => callback(message));
    }
  };

  return {
    isAvailable: isExtensionAvailable,

    isConnected: () => connected,

    connect: () => {
      return new Promise((resolve, reject) => {
        if (!isExtensionAvailable()) {
          reject(new Error("Chrome extension API not available"));
          return;
        }

        if (!extensionId) {
          reject(new Error("Extension ID is required"));
          return;
        }

        try {
          port = chrome.runtime.connect(extensionId);

          port.onMessage.addListener(handleMessage);

          port.onDisconnect.addListener(() => {
            console.log("[Bridge] Disconnected from extension");
            connected = false;
            port = null;
            if (keepAliveInterval) {
              clearInterval(keepAliveInterval);
              keepAliveInterval = null;
            }
            disconnectCallbacks.forEach((cb) => cb());
          });

          const timeout = setTimeout(() => {
            reject(new Error("Connection timeout"));
          }, 5000);

          const initialListener = (msg) => {
            if (msg.type === MSG.PONG) {
              clearTimeout(timeout);
              connected = true;
              console.log("[Bridge] Connected to extension:", msg.connectionId);

              if (keepAliveInterval) clearInterval(keepAliveInterval);
              keepAliveInterval = setInterval(() => {
                if (connected && port) {
                  port.postMessage({ type: MSG.PING, keepAlive: true });
                }
              }, 20000);

              resolve(true);
            }
          };

          port.onMessage.addListener(initialListener);
        } catch (error) {
          reject(new Error(`Failed to connect: ${error.message}`));
        }
      });
    },

    disconnect: () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      if (port) {
        port.disconnect();
        port = null;
        connected = false;
      }
    },

    getTabs: async () => {
      const response = await sendRequest(MSG.GET_TABS);
      return response.data;
    },

    scrape: async (tabId, selector, options = {}) => {
      const response = await sendRequest(MSG.SCRAPE, { tabId, selector, options });
      return response.data;
    },

    scrapeInstagram: async (tabId) => {
      const response = await sendRequest(MSG.SCRAPE_INSTAGRAM, { tabId });
      return response.data;
    },

    fetchInstagramProfile: async (tabId, username) => {
      const response = await sendRequest(MSG.FETCH_INSTAGRAM_PROFILE, { tabId, username });
      return response.data;
    },

    updateDocId: async (tabId, type, docId) => {
      const response = await sendRequest(MSG.UPDATE_DOC_ID, { tabId, type, docId });
      return response.data;
    },

    startIntercept: async (tabId) => {
      const response = await sendRequest(MSG.START_INTERCEPT, { tabId });
      return response.data;
    },

    stopIntercept: async (tabId) => {
      const response = await sendRequest(MSG.STOP_INTERCEPT, { tabId });
      return response.data;
    },

    onInterceptedData: (callback) => {
      interceptDataCallbacks.add(callback);
      return () => interceptDataCallbacks.delete(callback);
    },

    inject: async (tabId, html, target = "body", options = {}) => {
      const response = await sendRequest(MSG.INJECT, { tabId, html, target, ...options });
      return response.data;
    },

    execute: async (tabId, script, args = []) => {
      const response = await sendRequest(MSG.EXECUTE, { tabId, script, args });
      return response.data;
    },

    observe: async (tabId, selector, callback, events = ["mutation"]) => {
      const response = await sendRequest(MSG.OBSERVE, { tabId, selector, events });
      const observerId = response.data.observerId;

      if (!eventListeners.has(observerId)) {
        eventListeners.set(observerId, []);
      }
      eventListeners.get(observerId).push(callback);

      return observerId;
    },

    stopObserving: async (observerId) => {
      await sendRequest(MSG.STOP_OBSERVE, { observerId });
      eventListeners.delete(observerId);
    },

    ping: async () => {
      const response = await sendRequest(MSG.PING);
      return response.type === MSG.PONG;
    },

    onDisconnect: (callback) => {
      disconnectCallbacks.add(callback);
      return () => disconnectCallbacks.delete(callback);
    },
  };
};

export default createExtensionBridge;
