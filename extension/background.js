/**
 * Bootstrapp Extension - Background Service Worker
 * Routes messages between admin panel, content scripts, and side panel
 */

// Message types
const MSG = {
  // Commands
  PING: "ext:ping",
  GET_TABS: "ext:getTabs",
  SCRAPE: "ext:scrape",
  SCRAPE_INSTAGRAM: "ext:scrapeInstagram",
  FETCH_INSTAGRAM_PROFILE: "ext:fetchInstagramProfile",
  UPDATE_DOC_ID: "ext:updateDocId",
  INJECT: "ext:inject",
  OBSERVE: "ext:observe",
  EXECUTE: "ext:execute",
  START_INTERCEPT: "ext:startIntercept",
  STOP_INTERCEPT: "ext:stopIntercept",

  // Responses
  PONG: "ext:pong",
  DATA: "ext:data",
  ERROR: "ext:error",
  EVENT: "ext:event",
  INTERCEPTED_DATA: "ext:interceptedData",
};

// Track connected admin panels
const adminConnections = new Map();

// Track active observers per tab
const tabObservers = new Map();

// Open side panel when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Side panel error:", error));

// Handle messages from external sources (admin panel)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("[BG] External message:", message, "from:", sender);
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BG] Internal message:", message, "from:", sender);
  handleMessage(message, sender, sendResponse);
  return true; // Keep channel open for async response
});

// Handle long-lived connections from admin panel
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log("[BG] External connection from:", port.sender);

  const connectionId = `${port.sender.tab?.id || "webapp"}-${Date.now()}`;
  adminConnections.set(connectionId, port);

  port.postMessage({ type: MSG.PONG, connectionId });

  port.onMessage.addListener((message) => {
    handleMessage(message, port.sender, (response) => {
      port.postMessage(response);
    });
  });

  port.onDisconnect.addListener(() => {
    console.log("[BG] Connection closed:", connectionId);
    adminConnections.delete(connectionId);
  });
});

// Main message handler
async function handleMessage(message, sender, sendResponse) {
  const { type, requestId, tabId, ...payload } = message;

  try {
    switch (type) {
      case MSG.PING:
        sendResponse({ type: MSG.PONG, requestId, timestamp: Date.now() });
        break;

      case MSG.GET_TABS:
        const tabs = await chrome.tabs.query({});
        sendResponse({
          type: MSG.DATA,
          requestId,
          data: tabs.map((t) => ({
            id: t.id,
            url: t.url,
            title: t.title,
            favIconUrl: t.favIconUrl,
            active: t.active,
            windowId: t.windowId,
          })),
        });
        break;

      case MSG.SCRAPE:
        const scrapeResult = await sendToContentScript(tabId, {
          type: MSG.SCRAPE,
          ...payload,
        });
        sendResponse({ ...scrapeResult, requestId });
        break;

      case MSG.SCRAPE_INSTAGRAM:
        const igResult = await sendToContentScript(tabId, {
          type: MSG.SCRAPE_INSTAGRAM,
        });
        sendResponse({ ...igResult, requestId });
        break;

      case MSG.FETCH_INSTAGRAM_PROFILE:
        const profileResult = await sendToContentScript(tabId, {
          type: MSG.FETCH_INSTAGRAM_PROFILE,
          ...payload,
        });
        sendResponse({ ...profileResult, requestId });
        break;

      case MSG.UPDATE_DOC_ID:
        const docIdResult = await sendToContentScript(tabId, {
          type: MSG.UPDATE_DOC_ID,
          ...payload,
        });
        sendResponse({ ...docIdResult, requestId });
        break;

      case MSG.INJECT:
        const injectResult = await sendToContentScript(tabId, {
          type: MSG.INJECT,
          ...payload,
        });
        sendResponse({ ...injectResult, requestId });
        break;

      case MSG.EXECUTE:
        const execResult = await sendToContentScript(tabId, {
          type: MSG.EXECUTE,
          ...payload,
        });
        sendResponse({ ...execResult, requestId });
        break;

      case MSG.OBSERVE:
        // Set up observer and forward events
        const observeResult = await sendToContentScript(tabId, {
          type: MSG.OBSERVE,
          ...payload,
        });
        sendResponse({ ...observeResult, requestId });
        break;

      // Forward events from content script to admin
      case MSG.EVENT:
        broadcastToAdmin({ type: MSG.EVENT, tabId: sender.tab?.id, ...payload });
        sendResponse({ type: MSG.DATA, requestId, success: true });
        break;

      case MSG.START_INTERCEPT:
        const startResult = await sendToContentScript(tabId, {
          type: MSG.START_INTERCEPT,
          ...payload,
        });
        sendResponse({ ...startResult, requestId });
        break;

      case MSG.STOP_INTERCEPT:
        const stopResult = await sendToContentScript(tabId, {
          type: MSG.STOP_INTERCEPT,
        });
        sendResponse({ ...stopResult, requestId });
        break;

      case MSG.INTERCEPTED_DATA:
        // Forward intercepted API data to admin panels
        broadcastToAdmin({
          type: MSG.INTERCEPTED_DATA,
          tabId: sender.tab?.id,
          ...payload,
        });
        sendResponse({ type: MSG.DATA, requestId, success: true });
        break;

      default:
        sendResponse({ type: MSG.ERROR, requestId, error: `Unknown message type: ${type}` });
    }
  } catch (error) {
    console.error("[BG] Error handling message:", error);
    sendResponse({ type: MSG.ERROR, requestId, error: error.message });
  }
}

// Send message to content script in a specific tab
async function sendToContentScript(tabId, message) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response;
  } catch (error) {
    // Content script might not be loaded, try injecting it
    if (error.message.includes("Receiving end does not exist")) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
      });
      // Retry after injection
      return await chrome.tabs.sendMessage(tabId, message);
    }
    throw error;
  }
}

// Broadcast message to all connected admin panels
function broadcastToAdmin(message) {
  adminConnections.forEach((port) => {
    try {
      port.postMessage(message);
    } catch (e) {
      console.error("[BG] Failed to send to admin:", e);
    }
  });
}

console.log("[BG] Bootstrapp Extension background worker started");
