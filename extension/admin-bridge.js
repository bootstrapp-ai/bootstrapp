/**
 * Bootstrapp Extension - Admin Bridge
 * Use this in your admin panel to communicate with the extension
 */

// Message types
const MSG = {
  PING: "ext:ping",
  PONG: "ext:pong",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  INJECT: "ext:inject",
  EXECUTE: "ext:execute",
  OBSERVE: "ext:observe",
  STOP_OBSERVE: "ext:stopObserve",
  DATA: "ext:data",
  ERROR: "ext:error",
  EVENT: "ext:event",
};

/**
 * Create a bridge to communicate with the Bootstrapp extension
 * @param {string} extensionId - The Chrome extension ID (found in chrome://extensions)
 * @returns {Object} Bridge API
 */
export const createExtensionBridge = (extensionId) => {
  let port = null;
  let connected = false;
  const eventListeners = new Map();
  const pendingRequests = new Map();
  const disconnectCallbacks = new Set();
  let requestId = 0;

  // Check if chrome.runtime is available
  const isExtensionAvailable = () => {
    return typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect;
  };

  // Generate unique request ID
  const nextRequestId = () => `req-${++requestId}-${Date.now()}`;

  // Send message and wait for response
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

  // Handle incoming messages
  const handleMessage = (message) => {
    console.log("[Bridge] Received:", message);
    console.log("[Bridge] Message requestId:", message.requestId, "| Pending:", [...pendingRequests.keys()]);

    // Handle response to pending request
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

    // No match - log why
    if (message.requestId) {
      console.log(`[Bridge] NO MATCH - requestId ${message.requestId} not in pending requests`);
    } else {
      console.log("[Bridge] NO MATCH - message has no requestId");
    }

    // Handle events
    if (message.type === MSG.EVENT) {
      const listeners = eventListeners.get(message.observerId) || [];
      listeners.forEach((callback) => callback(message));
    }
  };

  return {
    /**
     * Check if extension communication is available
     */
    isAvailable: isExtensionAvailable,

    /**
     * Check if currently connected
     */
    isConnected: () => connected,

    /**
     * Connect to the extension
     * @returns {Promise<boolean>}
     */
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
            // Notify disconnect callbacks
            disconnectCallbacks.forEach((cb) => cb());
          });

          // Wait for initial pong
          const timeout = setTimeout(() => {
            reject(new Error("Connection timeout"));
          }, 5000);

          const initialListener = (msg) => {
            if (msg.type === MSG.PONG) {
              clearTimeout(timeout);
              connected = true;
              console.log("[Bridge] Connected to extension:", msg.connectionId);
              resolve(true);
            }
          };

          port.onMessage.addListener(initialListener);
        } catch (error) {
          reject(new Error(`Failed to connect: ${error.message}`));
        }
      });
    },

    /**
     * Disconnect from the extension
     */
    disconnect: () => {
      if (port) {
        port.disconnect();
        port = null;
        connected = false;
      }
    },

    /**
     * Get all open tabs
     * @returns {Promise<Array>} List of tabs
     */
    getTabs: async () => {
      const response = await sendRequest(MSG.GET_TABS);
      return response.data;
    },

    /**
     * Scrape content from a tab
     * @param {number} tabId - Tab ID
     * @param {string|Object} selector - CSS selector or object of selectors
     * @param {Object} options - Scraping options
     * @returns {Promise<Object>} Scraped data
     */
    scrape: async (tabId, selector, options = {}) => {
      const response = await sendRequest(MSG.SCRAPE, { tabId, selector, options });
      return response.data;
    },

    /**
     * Inject HTML into a tab
     * @param {number} tabId - Tab ID
     * @param {string} html - HTML to inject
     * @param {string} target - Target selector (default: 'body')
     * @param {Object} options - Injection options
     * @returns {Promise<Object>} Injection result
     */
    inject: async (tabId, html, target = "body", options = {}) => {
      const response = await sendRequest(MSG.INJECT, { tabId, html, target, ...options });
      return response.data;
    },

    /**
     * Execute JavaScript in a tab
     * @param {number} tabId - Tab ID
     * @param {string} script - JavaScript code to execute
     * @param {Array} args - Arguments to pass to the script
     * @returns {Promise<any>} Execution result
     */
    execute: async (tabId, script, args = []) => {
      const response = await sendRequest(MSG.EXECUTE, { tabId, script, args });
      return response.data;
    },

    /**
     * Observe DOM changes in a tab
     * @param {number} tabId - Tab ID
     * @param {string} selector - Element selector to observe
     * @param {Function} callback - Callback for changes
     * @param {Array} events - Events to observe (default: ['mutation'])
     * @returns {Promise<string>} Observer ID
     */
    observe: async (tabId, selector, callback, events = ["mutation"]) => {
      const response = await sendRequest(MSG.OBSERVE, { tabId, selector, events });
      const observerId = response.data.observerId;

      // Register callback
      if (!eventListeners.has(observerId)) {
        eventListeners.set(observerId, []);
      }
      eventListeners.get(observerId).push(callback);

      return observerId;
    },

    /**
     * Stop observing
     * @param {string} observerId - Observer ID from observe()
     */
    stopObserving: async (observerId) => {
      await sendRequest(MSG.STOP_OBSERVE, { observerId });
      eventListeners.delete(observerId);
    },

    /**
     * Ping the extension
     * @returns {Promise<boolean>}
     */
    ping: async () => {
      const response = await sendRequest(MSG.PING);
      return response.type === MSG.PONG;
    },

    /**
     * Register a disconnect callback
     * @param {Function} callback - Called when connection is lost
     * @returns {Function} Unsubscribe function
     */
    onDisconnect: (callback) => {
      disconnectCallbacks.add(callback);
      return () => disconnectCallbacks.delete(callback);
    },
  };
};

export default createExtensionBridge;
