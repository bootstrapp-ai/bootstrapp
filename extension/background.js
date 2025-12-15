/**
 * Bootstrapp Extension - Background Service Worker
 * Routes messages between admin panel, content scripts, and side panel
 */

// ============================================
// GOOGLE MAPS INTERCEPTION (via webRequest)
// ============================================

const GMAPS_PATTERNS = {
  search: /\/search\?tbm=map/,
  place: /\/maps\/preview\/place/,
};

// Track processed URLs to prevent duplicates
const processedUrls = new Map();
const DEBOUNCE_TIME = 5000;

// Check if URL matches our patterns
function matchGmapsPattern(url) {
  for (const [type, pattern] of Object.entries(GMAPS_PATTERNS)) {
    if (pattern.test(url)) return type;
  }
  return null;
}

// GMaps parser (moved from interceptor.js)
const GmapsParser = {
  getData(obj, path, modifier = (val) => val) {
    const result = path.reduce(
      (xs, x) => (xs && xs[x] !== undefined ? xs[x] : null),
      obj,
    );
    return result !== null ? modifier(result) : null;
  },

  getPlaceData(mainData) {
    const getData = this.getData;

    // Extract thumbnail from photos array
    const getThumbnail = () => {
      // Primary location: [37][0][0][6][0]
      const photoUrl = getData(mainData, [37, 0, 0, 6, 0]);
      if (
        photoUrl &&
        typeof photoUrl === "string" &&
        photoUrl.startsWith("http")
      ) {
        return photoUrl.replace(/=w\d+-h\d+-k-no/, "=w400-h300-k-no");
      }
      // Fallback: [77][0][0][6][0]
      const fallbackUrl = getData(mainData, [77, 0, 0, 6, 0]);
      if (
        fallbackUrl &&
        typeof fallbackUrl === "string" &&
        fallbackUrl.startsWith("http")
      ) {
        return fallbackUrl.replace(/=w\d+-h\d+-k-no/, "=w400-h300-k-no");
      }
      return null;
    };

    // Extract opening hours
    const getOpeningHours = () => {
      const hoursData = getData(mainData, [175, 0]);
      if (!Array.isArray(hoursData)) return null;
      return hoursData.map((day) => ({
        day: day[0], // "Monday"
        dayNum: day[1], // 1
        hours: day[3]?.[0]?.[0] || "Closed", // "9 AM–3 PM"
      }));
    };

    // Extract current open status
    const getOpenStatus = () => {
      const statusData = getData(mainData, [175, 1, 4, 0]);
      return statusData || null; // "Open · Closes 3 PM"
    };

    // Extract phone number - [178][0] is the string directly
    const getPhoneNumber = () => {
      const phone = getData(mainData, [178, 0]);
      if (phone && typeof phone === "string") return phone;
      return null;
    };

    // Extract amenities/activities
    const getAmenities = () => {
      const amenitiesData = getData(mainData, [100, 1]);
      if (!Array.isArray(amenitiesData)) return [];
      return amenitiesData.flatMap((category) =>
        (category[2] || []).map((amenity) => ({
          category: category[1], // "Activities"
          name: amenity[1], // "Hiking"
          available: amenity[2]?.[0] === 1,
        })),
      );
    };

    return {
      // Basic info
      name: getData(mainData, [11]),
      address: getData(mainData, [2], (arr) => arr.join(", ")),
      categories: getData(mainData, [13]) || [],

      // Rating & reviews
      rating: getData(mainData, [4, 7]),
      reviewCount: getData(mainData, [4, 8]) || 0,

      // Location
      coordinates: {
        latitude: getData(mainData, [9, 2]),
        longitude: getData(mainData, [9, 3]),
      },
      placeId: getData(mainData, [78]),

      // Contact
      phoneNumber: getPhoneNumber(),
      website: getData(mainData, [7, 0]),

      // Media
      thumbnail: getThumbnail(),

      // Hours
      openingHours: getOpeningHours(),
      openStatus: getOpenStatus(),

      // Additional info
      priceRange: getData(mainData, [4, 2]),
      amenities: getAmenities(),
      altName: getData(mainData, [101]),
      timezone: getData(mainData, [30]),
    };
  },

  parseSearchResults(responseText) {
    try {
      // Your working approach: slice(18) + regex + backslash cleanup
      const sliced = responseText.slice(18);
      const jsonMatch = sliced.match(/^.*\]/);
      if (!jsonMatch) {
        console.warn("[BG] No JSON match found");
        return null;
      }

      const jsonStr = jsonMatch[0];

      // Backslash cleanup that was working
      const withPlaceholder = jsonStr.replace(/\\\\/g, "__TEMP_BACKSLASH__");
      const withoutSingleBackslashes = withPlaceholder.replace(/\\/g, "");
      const processedString = withoutSingleBackslashes.replace(
        /__TEMP_BACKSLASH__/g,
        "\\",
      );
      console.error({ jsonStr, processedString });
      const jsonData = JSON.parse(processedString);

      // Debug: find where the places actually are
      console.log("[BG] jsonData length:", jsonData.length);
      console.log("[BG] jsonData[0] length:", jsonData[0]?.length);
      console.log("[BG] jsonData[0][0]:", jsonData[0]?.[0]); // query title
      console.log(
        "[BG] jsonData[0][1]:",
        Array.isArray(jsonData[0]?.[1])
          ? `array(${jsonData[0][1].length})`
          : typeof jsonData[0]?.[1],
      );
      console.log({ jsonData }, jsonData[64]);

      const queryTitle = jsonData[0]?.[0] || "";
      const placeList = jsonData[64].map(([_, place]) => place) || [];
      console.log("[BG] placeList length:", placeList.length);

      const parsedPlaceList = placeList
        .filter(Boolean)
        .map((data) => this.getPlaceData(data));

      console.log("[BG] Parsed", parsedPlaceList.length, "places");

      return {
        queryTitle,
        places: parsedPlaceList,
      };
    } catch (error) {
      console.warn("[BG] GMaps search response parse error:", error.message);
      return null;
    }
  },

  parsePlaceDetails(responseText) {
    try {
      const data = JSON.parse(responseText.slice(4));
      return this.getPlaceData(data[6]);
    } catch (error) {
      console.error("[BG] GMaps place parse error:", error);
      return null;
    }
  },

  parseResponse(url, responseText, type) {
    if (type === "search") {
      const data = this.parseSearchResults(responseText);
      return data
        ? {
            handler: "gmaps",
            type: "search",
            data,
          }
        : null;
    } else if (type === "place") {
      const data = this.parsePlaceDetails(responseText);
      return data
        ? {
            handler: "gmaps",
            type: "place",
            data,
          }
        : null;
    }
    return null;
  },
};

// Listen for completed requests on Google Maps
// Note: URL filter must include /search* because search API is at /search?tbm=map, not /maps/
chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const { url, tabId } = details;

    // Debug: log all caught URLs
    console.log("[BG] webRequest caught:", url.substring(0, 120));

    const type = matchGmapsPattern(url);
    console.log(
      "[BG] Pattern match result:",
      type,
      "for",
      url.substring(0, 80),
    );

    if (!type) return;

    // Debounce duplicate URLs
    const now = Date.now();
    const lastTime = processedUrls.get(url);
    if (lastTime && now - lastTime < DEBOUNCE_TIME) {
      console.log("[BG] Debounced duplicate URL:", url.substring(0, 80));
      return;
    }
    processedUrls.set(url, now);

    // Clean up old entries
    for (const [processedUrl, time] of processedUrls.entries()) {
      if (now - time > DEBOUNCE_TIME) processedUrls.delete(processedUrl);
    }

    console.log(`[BG] GMaps ${type} request completed:`, url.substring(0, 100));

    // Re-fetch to get complete response from cache
    try {
      const response = await fetch(url);
      const text = await response.text();

      console.log(`[BG] Re-fetched ${type}, got ${text.length} bytes`);

      // Parse the response
      console.log(text);
      const parsed = GmapsParser.parseResponse(url, text, type);

      if (parsed && parsed.data) {
        console.log(`[BG] Parsed ${type} data:`, parsed);

        // Broadcast to admin panels
        broadcastToAdmin({
          type: MSG.INTERCEPTED_DATA,
          platform: "gmaps",
          url,
          interceptType: type,
          parsed,
          tabId,
          timestamp: now,
        });
      } else {
        console.log(`[BG] No parsed data for ${type}`);
      }
    } catch (error) {
      console.error("[BG] Failed to process GMaps request:", error);
    }
  },
  {
    urls: [
      "*://www.google.com/search*", // Search API: /search?tbm=map
      "*://www.google.com/maps/*", // Maps pages and preview API
      "*://maps.google.com/*", // Alternative maps domain
      "*://www.google.com.br/search*", // Brazil domain
      "*://www.google.com.br/maps/*",
    ],
  },
);

console.log("[BG] GMaps webRequest listener installed");

// ============================================
// MESSAGE TYPES
// ============================================

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

// Handle messages from external sources (admin panel)
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    console.log("[BG] External message:", message, "from:", sender);
    handleMessage(message, sender, sendResponse);
    return true; // Keep channel open for async response
  },
);

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
  console.log("[BG] Admin connections now:", adminConnections.size);

  port.postMessage({ type: MSG.PONG, connectionId });

  port.onMessage.addListener((message) => {
    console.log("[BG] Port message from admin:", message.type);
    handleMessage(message, port.sender, (response) => {
      port.postMessage(response);
    });
  });

  port.onDisconnect.addListener(() => {
    console.log("[BG] Connection closed:", connectionId);
    console.log("[BG] Disconnect error:", chrome.runtime.lastError?.message);
    adminConnections.delete(connectionId);
    console.log("[BG] Admin connections now:", adminConnections.size);
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

      case MSG.GET_TABS: {
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
      }

      case MSG.SCRAPE: {
        const scrapeResult = await sendToContentScript(tabId, {
          type: MSG.SCRAPE,
          ...payload,
        });
        sendResponse({ ...scrapeResult, requestId });
        break;
      }

      case MSG.SCRAPE_INSTAGRAM: {
        const igResult = await sendToContentScript(tabId, {
          type: MSG.SCRAPE_INSTAGRAM,
        });
        sendResponse({ ...igResult, requestId });
        break;
      }

      case MSG.FETCH_INSTAGRAM_PROFILE: {
        const profileResult = await sendToContentScript(tabId, {
          type: MSG.FETCH_INSTAGRAM_PROFILE,
          ...payload,
        });
        sendResponse({ ...profileResult, requestId });
        break;
      }

      case MSG.UPDATE_DOC_ID: {
        const docIdResult = await sendToContentScript(tabId, {
          type: MSG.UPDATE_DOC_ID,
          ...payload,
        });
        sendResponse({ ...docIdResult, requestId });
        break;
      }

      case MSG.INJECT: {
        const injectResult = await sendToContentScript(tabId, {
          type: MSG.INJECT,
          ...payload,
        });
        sendResponse({ ...injectResult, requestId });
        break;
      }

      case MSG.EXECUTE: {
        const execResult = await sendToContentScript(tabId, {
          type: MSG.EXECUTE,
          ...payload,
        });
        sendResponse({ ...execResult, requestId });
        break;
      }

      case MSG.OBSERVE: {
        const observeResult = await sendToContentScript(tabId, {
          type: MSG.OBSERVE,
          ...payload,
        });
        sendResponse({ ...observeResult, requestId });
        break;
      }

      case MSG.EVENT:
        broadcastToAdmin({
          type: MSG.EVENT,
          tabId: sender.tab?.id,
          ...payload,
        });
        sendResponse({ type: MSG.DATA, requestId, success: true });
        break;

      case MSG.START_INTERCEPT: {
        const startResult = await sendToContentScript(tabId, {
          type: MSG.START_INTERCEPT,
          ...payload,
        });
        sendResponse({ ...startResult, requestId });
        break;
      }

      case MSG.STOP_INTERCEPT: {
        const stopResult = await sendToContentScript(tabId, {
          type: MSG.STOP_INTERCEPT,
        });
        sendResponse({ ...stopResult, requestId });
        break;
      }

      case MSG.INTERCEPTED_DATA:
        console.log(
          "[BG] Received INTERCEPTED_DATA, broadcasting to",
          adminConnections.size,
          "admin(s)",
        );
        broadcastToAdmin({
          type: MSG.INTERCEPTED_DATA,
          tabId: sender.tab?.id,
          ...payload,
        });
        sendResponse({ type: MSG.DATA, requestId, success: true });
        break;

      default:
        sendResponse({
          type: MSG.ERROR,
          requestId,
          error: `Unknown message type: ${type}`,
        });
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
