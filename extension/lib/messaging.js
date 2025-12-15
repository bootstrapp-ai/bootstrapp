/**
 * Bootstrapp Extension - Message Protocol
 * Shared message types and utilities
 */

// Message types
export const MSG = {
  // Core Commands (Admin/Panel -> Extension)
  PING: "ext:ping",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  INJECT: "ext:inject",
  EXECUTE: "ext:execute",
  OBSERVE: "ext:observe",
  STOP_OBSERVE: "ext:stopObserve",
  START_INTERCEPT: "ext:startIntercept",
  STOP_INTERCEPT: "ext:stopIntercept",

  // Core Responses (Extension -> Admin/Panel)
  PONG: "ext:pong",
  DATA: "ext:data",
  ERROR: "ext:error",
  EVENT: "ext:event",
  INTERCEPTED_DATA: "ext:interceptedData",

  // Instagram Integration
  SCRAPE_INSTAGRAM: "ext:scrapeInstagram",
  FETCH_INSTAGRAM_PROFILE: "ext:fetchInstagramProfile",
  UPDATE_DOC_ID: "ext:updateDocId",

  // Google Maps Integration
  SCRAPE_GMAPS_SEARCH: "ext:scrapeGmapsSearch",
  SCRAPE_GMAPS_DETAILS: "ext:scrapeGmapsDetails",
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
