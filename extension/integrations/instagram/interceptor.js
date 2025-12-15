/**
 * Instagram Integration - Fetch Interceptor Patterns
 * Patterns for intercepting Instagram API responses
 */

// Instagram GraphQL URL pattern
export const PATTERNS = [
  {
    match: /\/graphql\/query/,
    type: "graphql",
    handler: "instagram",
  },
  {
    match: /\/api\/v1\/users\/web_profile_info/,
    type: "profile",
    handler: "instagram",
  },
];

/**
 * Parse Instagram GraphQL response to extract user data
 */
export function parseResponse(url, data) {
  let userData = null;

  // Format 1: Direct user object
  if (data.user) {
    userData = data.user;
  }
  // Format 2: data.user
  else if (data.data?.user) {
    userData = data.data.user;
  }
  // Format 3: data.xdt_api__v1__users__web_profile_info.user (newer API)
  else if (data.data?.xdt_api__v1__users__web_profile_info?.user) {
    userData = data.data.xdt_api__v1__users__web_profile_info.user;
  }

  return {
    handler: "instagram",
    type: url.includes("web_profile_info") ? "profile" : "graphql",
    user: userData,
    raw: data,
  };
}

/**
 * Check if current page is Instagram
 */
export function isMatch() {
  return window.location.hostname.includes("instagram.com");
}

export default {
  PATTERNS,
  parseResponse,
  isMatch,
};
