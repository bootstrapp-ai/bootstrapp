/**
 * Bootstrapp Extension - Message Protocol
 * Shared message types and utilities
 */

// Message types
export const MSG = {
  // Commands (Admin/Panel -> Extension)
  PING: "ext:ping",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  INJECT: "ext:inject",
  EXECUTE: "ext:execute",
  OBSERVE: "ext:observe",
  STOP_OBSERVE: "ext:stopObserve",

  // Responses (Extension -> Admin/Panel)
  PONG: "ext:pong",
  DATA: "ext:data",
  ERROR: "ext:error",
  EVENT: "ext:event",
};

/**
 * Send a message and wait for response
 * Works in side panel and popup contexts
 */
export const sendMessage = (message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.type === MSG.ERROR) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * Send message to a specific tab's content script
 */
export const sendToTab = (tabId, message) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.type === MSG.ERROR) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * Create a request ID for tracking responses
 */
export const createRequestId = () => `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Create a typed message
 */
export const createMessage = (type, payload = {}) => ({
  type,
  requestId: createRequestId(),
  timestamp: Date.now(),
  ...payload,
});
