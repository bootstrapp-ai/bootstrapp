/**
 * Google Maps Integration - Fetch Interceptor Patterns
 * Patterns for intercepting Google Maps API responses
 */

import { parseSearchResults, parsePlaceDetails } from "./parser.js";

// Google Maps API URL patterns
export const PATTERNS = [
  {
    match: /\/search\?tbm=map/,
    type: "search",
    handler: "gmaps",
  },
  {
    match: /\/maps\/preview\/place/,
    type: "place",
    handler: "gmaps",
  },
  {
    match: /\/maps\/api\/place/,
    type: "place_api",
    handler: "gmaps",
  },
];

/**
 * Parse Google Maps API response based on type
 */
export function parseResponse(url, responseText, type) {
  try {
    if (type === "search") {
      const data = parseSearchResults(responseText);
      return {
        handler: "gmaps",
        type: "search",
        data,
      };
    } else if (type === "place" || type === "place_api") {
      const data = parsePlaceDetails(responseText);
      return {
        handler: "gmaps",
        type: "place",
        data,
      };
    }
  } catch (error) {
    console.error("[GMaps] Parse error:", error);
    return {
      handler: "gmaps",
      type,
      error: error.message,
      raw: responseText,
    };
  }
}

/**
 * Check if current page is Google Maps
 */
export function isMatch() {
  return (
    window.location.hostname.includes("google.com") &&
    window.location.pathname.includes("/maps")
  );
}

export default {
  PATTERNS,
  parseResponse,
  isMatch,
};
