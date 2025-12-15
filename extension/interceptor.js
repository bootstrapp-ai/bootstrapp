/**
 * Bootstrapp Extension - Fetch Interceptor
 * Injected into page context to capture network responses
 *
 * Platform-agnostic interceptor with configurable patterns
 */
(function () {
  "use strict";

  // Already installed check
  if (window.__bootstrappInterceptor) return;
  window.__bootstrappInterceptor = true;

  const EVENT_NAME = "__bootstrapp_intercepted";
  const DEBUG = true; // Enable verbose logging

  // ============================================
  // INTEGRATION PATTERNS
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
    gmaps: [
      {
        match: /\/search\?tbm=map/,
        type: "search",
        contentType: "text",
      },
      {
        match: /\/maps\/preview\/place/,
        type: "place",
        contentType: "text",
      },
      {
        match: /maps\/api\/place/,
        type: "place_api",
        contentType: "json",
      },
    ],
  };

  // ============================================
  // PARSERS
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

    gmaps: {
      getData(obj, path, modifier = (val) => val) {
        const result = path.reduce(
          (xs, x) => (xs && xs[x] !== undefined ? xs[x] : null),
          obj
        );
        return result !== null ? modifier(result) : null;
      },

      getPlaceData(mainData) {
        const getData = this.getData;

        // Try to extract thumbnail from various possible locations
        const getThumbnail = () => {
          // Try common locations for place images in Google Maps data
          const possiblePaths = [
            [5, 0],        // Main photo URL (common)
            [5, 0, 0],     // Nested photo
            [6, 0],        // Alternative photo location
            [27, 0, 0, 0], // Another possible location
          ];

          for (const path of possiblePaths) {
            const url = getData(mainData, path);
            if (url && typeof url === "string" && url.startsWith("http")) {
              // Resize Google photos for thumbnails (replace =w\d+ with =w200)
              return url.replace(/=w\d+(-h\d+)?/, "=w200-h200");
            }
          }
          return null;
        };

        return {
          name: getData(mainData, [11]),
          address: getData(mainData, [2], (arr) => arr.join(", ")),
          phoneNumber: getData(mainData, [178, 0, 0]),
          rating: getData(mainData, [4, 7]),
          reviewCount: getData(mainData, [4, 8]) || 0,
          priceRange: getData(mainData, [4, 2]),
          website: getData(mainData, [7, 0]),
          categories: getData(mainData, [13]) || [],
          coordinates: {
            latitude: getData(mainData, [9, 2]),
            longitude: getData(mainData, [9, 3]),
          },
          placeId: getData(mainData, [78]),
          thumbnail: getThumbnail(),
        };
      },

      parseSearchResults(responseText) {
        try {
          const parsed = `${responseText.slice(18)}`;

          // Clean up the string (handle escaped backslashes)
          const withPlaceholder = parsed.replace(/\\\\/g, "__TEMP_BACKSLASH__");
          const withoutSingleBackslashes = withPlaceholder.replace(/\\/g, "");
          const processedString = withoutSingleBackslashes.replace(/__TEMP_BACKSLASH__/g, "\\");

          // Try to parse complete JSON
          const jsonData = JSON.parse(processedString);
          const queryTitle = jsonData[0]?.[0] || "";
          const placeList = jsonData[0]?.[1]?.slice(1) || [];
          const parsedPlaceList = placeList
            .filter(data => data?.[14])
            .map((data) => this.getPlaceData(data[14]));

          return {
            queryTitle,
            places: parsedPlaceList,
          };
        } catch (error) {
          // JSON parsing failed - likely truncated response from aborted XHR
          // This is a known issue with Google Maps search requests
          console.warn("[GMaps] Search response truncated (Google aborts XHR). Use DOM scraping mode instead.");
          return null;
        }
      },

      parsePlaceDetails(responseText) {
        try {
          const data = JSON.parse(responseText.slice(4));
          return this.getPlaceData(data[6]);
        } catch (error) {
          console.error("[GMaps] Parse place error:", error);
          return null;
        }
      },

      parseResponse(url, responseText, type) {
        if (type === "search") {
          const data = this.parseSearchResults(responseText);
          return {
            handler: "gmaps",
            type: "search",
            data,
          };
        } else if (type === "place" || type === "place_api") {
          const data = this.parsePlaceDetails(responseText);
          return {
            handler: "gmaps",
            type: "place",
            data,
          };
        }
        return null;
      },
    },
  };

  // ============================================
  // PLATFORM DETECTION
  // ============================================

  function detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("google.com") && window.location.pathname.includes("/maps")) return "gmaps";
    return null;
  }

  // ============================================
  // FETCH INTERCEPTOR
  // ============================================

  const originalFetch = window.fetch;
  const platform = detectPlatform();
  const patterns = platform ? PATTERNS[platform] : [];
  const parser = platform ? Parsers[platform] : null;

  // ============================================
  // FETCH INTERCEPTOR
  // ============================================

  window.fetch = new Proxy(originalFetch, {
    apply: async function (target, thisArg, args) {
      const [resource, config] = args;
      const url = resource instanceof Request ? resource.url : String(resource);

      // Debug: Log ALL fetch requests on Google Maps
      if (DEBUG && platform === "gmaps") {
        console.log(`[Interceptor:FETCH] ${url.substring(0, 150)}...`);
      }

      // Check if URL matches any pattern for current platform
      const matchedPattern = patterns.find((p) => p.match.test(url));

      if (matchedPattern) {
        console.log(`[Interceptor] MATCHED pattern: ${matchedPattern.type} for ${url.substring(0, 100)}`);
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
                if (DEBUG) console.log(`[Interceptor] Response preview: ${data.substring(0, 200)}...`);
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

  // ============================================
  // XHR INTERCEPTOR (Google Maps often uses XHR)
  // ============================================

  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._interceptUrl = url;
    this._interceptMethod = method;

    // Debug: Log ALL XHR requests on Google Maps
    if (DEBUG && platform === "gmaps") {
      console.log(`[Interceptor:XHR] ${method} ${String(url).substring(0, 150)}...`);
    }

    return originalXHROpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const xhr = this;
    const url = String(this._interceptUrl || "");
    const method = this._interceptMethod || "GET";

    // Check if URL matches any pattern
    const matchedPattern = patterns.find((p) => p.match.test(url));

    if (matchedPattern) {
      console.log(`[Interceptor:XHR] MATCHED pattern: ${matchedPattern.type} for ${url.substring(0, 100)}`);

      // Track state to prevent duplicate processing
      let capturedResponse = "";
      let hasProcessed = false;

      this.addEventListener("readystatechange", function () {
        if (DEBUG) console.log(`[Interceptor:XHR] readyState=${xhr.readyState} status=${xhr.status}`);

        // Capture partial response during loading (readyState 3)
        // This is critical for Google Maps which often aborts requests
        if (xhr.readyState === 3 && xhr.status === 200) {
          try {
            if (xhr.responseType === "" || xhr.responseType === "text") {
              const newResponse = xhr.responseText;
              if (newResponse.length > capturedResponse.length) {
                capturedResponse = newResponse;
                console.log(`[Interceptor:XHR] Captured response, length: ${capturedResponse.length}`);
              }
            }
          } catch (e) {
            // responseText might not be accessible
          }
        }

        // Process at readyState 4 OR when aborted (readyState 0 after having data)
        if (xhr.readyState === 4 && xhr.status === 200) {
          processXHRResponse(capturedResponse);
        } else if (xhr.readyState === 0 && capturedResponse.length > 1000) {
          // Request was aborted but we have captured data - process it!
          console.log(`[Interceptor:XHR] Request aborted, processing captured data (${capturedResponse.length} bytes)`);
          processXHRResponse(capturedResponse);
        }
      });

      function processXHRResponse(responseText) {
        // Prevent duplicate processing
        if (hasProcessed) {
          console.log(`[Interceptor:XHR] Already processed, skipping`);
          return;
        }

        if (!responseText || responseText.length === 0) {
          console.log(`[Interceptor:XHR] No response text available`);
          return;
        }

        hasProcessed = true;
        console.log(`[Interceptor:XHR] Processing response, length: ${responseText.length}`);

        try {
          let parsed;
          if (matchedPattern.contentType === "json") {
            const data = JSON.parse(responseText);
            parsed = parser?.parseResponse(url, data, matchedPattern.type);
          } else {
            parsed = parser?.parseResponse(url, responseText, matchedPattern.type);
          }

          if (!parsed || !parsed.data) {
            console.log(`[Interceptor:XHR] No parsed data`);
            return;
          }

          console.log(`[Interceptor:XHR] Parsed data:`, parsed);

          window.dispatchEvent(
            new CustomEvent(EVENT_NAME, {
              detail: {
                platform,
                url,
                method,
                type: matchedPattern.type,
                parsed,
                timestamp: Date.now(),
              },
            })
          );
          console.log(`[Interceptor:XHR] Event dispatched!`);
        } catch (e) {
          console.error("[Interceptor:XHR] Error processing response:", e);
          hasProcessed = false; // Allow retry on error
        }
      }
    }

    return originalXHRSend.call(this, body);
  };

  console.log(`[Bootstrapp] Interceptor installed for ${platform || "unknown"} (fetch + XHR)`);
})();
