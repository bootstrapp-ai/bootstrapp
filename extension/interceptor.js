/**
 * Bootstrapp Extension - Fetch Interceptor
 * Injected into page context to capture network responses
 *
 * NOTE: Google Maps interception is handled by webRequest API in background.js
 * This interceptor is only used for Instagram (and other platforms that need page-context interception)
 */
(function () {
  "use strict";

  // Already installed check
  if (window.__bootstrappInterceptor) return;
  window.__bootstrappInterceptor = true;

  const EVENT_NAME = "__bootstrapp_intercepted";
  const DEBUG = false;

  // ============================================
  // INTEGRATION PATTERNS (Instagram only)
  // ============================================

  const PATTERNS = {
    instagram: [
      {
        match: /\/graphql\/query/,
        type: "graphql",
        contentType: "json",
      },
      {
        match: /\/api\/v1\/users\/web_profile_info/,
        type: "profile",
        contentType: "json",
      },
    ],
  };

  // ============================================
  // PARSERS (Instagram only)
  // ============================================

  const Parsers = {
    instagram: {
      parseResponse(url, data) {
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
      },
    },
  };

  // ============================================
  // PLATFORM DETECTION
  // ============================================

  function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes("instagram.com")) return "instagram";
    // GMaps is handled by webRequest in background.js, not here
    return null;
  }

  // ============================================
  // FETCH INTERCEPTOR (Instagram uses fetch for GraphQL)
  // ============================================

  const originalFetch = window.fetch;
  const platform = detectPlatform();
  const patterns = platform ? PATTERNS[platform] : [];
  const parser = platform ? Parsers[platform] : null;

  window.fetch = new Proxy(originalFetch, {
    apply: async function (target, thisArg, args) {
      const [resource, config] = args;
      const url = resource instanceof Request ? resource.url : String(resource);

      // Check if URL matches any pattern for current platform
      const matchedPattern = patterns.find((p) => p.match.test(url));

      if (matchedPattern) {
        if (DEBUG) console.log(`[Interceptor] MATCHED pattern: ${matchedPattern.type} for ${url.substring(0, 100)}`);
        try {
          const response = await target.apply(thisArg, args);
          const clone = response.clone();

          // Process response based on content type
          const processResponse = async () => {
            try {
              let data;
              let parsed;

              if (matchedPattern.contentType === "json") {
                data = await clone.json();
                parsed = parser?.parseResponse(url, data, matchedPattern.type);
              } else {
                data = await clone.text();
                parsed = parser?.parseResponse(url, data, matchedPattern.type);
              }

              if (DEBUG) console.log(`[Interceptor] Parsed data:`, parsed);

              // Dispatch event with intercepted data
              window.dispatchEvent(
                new CustomEvent(EVENT_NAME, {
                  detail: {
                    platform,
                    url,
                    method: config?.method || "GET",
                    type: matchedPattern.type,
                    parsed,
                    timestamp: Date.now(),
                  },
                })
              );
            } catch (e) {
              console.error("[Interceptor] Parse error:", e);
            }
          };

          processResponse();
          return response;
        } catch (e) {
          return target.apply(thisArg, args);
        }
      }

      return target.apply(thisArg, args);
    },
  });

  // Note: XHR interceptor removed - GMaps now uses webRequest API in background.js

  if (platform) {
    console.log(`[Bootstrapp] Interceptor installed for ${platform}`);
  }
})();
