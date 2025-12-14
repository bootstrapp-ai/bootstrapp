/**
 * Bootstrapp Extension - Fetch Interceptor
 * Injected into page context to capture network responses
 */
(function () {
  "use strict";

  // Already installed check
  if (window.__bootstrappInterceptor) return;
  window.__bootstrappInterceptor = true;

  const GRAPHQL_URL = "/graphql/query";
  const EVENT_NAME = "__bootstrapp_intercepted";

  const originalFetch = window.fetch;

  window.fetch = new Proxy(originalFetch, {
    apply: async function (target, thisArg, args) {
      const [resource, config] = args;
      const url = resource instanceof Request ? resource.url : String(resource);

      // Check if this is an Instagram GraphQL request
      if (url.includes(GRAPHQL_URL)) {
        try {
          const response = await target.apply(thisArg, args);
          const clone = response.clone();

          // Try to parse as JSON
          clone.json().then((json) => {
            // Extract user data from various GraphQL response formats
            let userData = null;

            // Format 1: Direct user object
            if (json.user) {
              userData = json.user;
            }
            // Format 2: data.user
            else if (json.data?.user) {
              userData = json.data.user;
            }
            // Format 3: data.xdt_api__v1__users__web_profile_info.user (newer API)
            else if (json.data?.xdt_api__v1__users__web_profile_info?.user) {
              userData = json.data.xdt_api__v1__users__web_profile_info.user;
            }

            // Dispatch event with intercepted data
            window.dispatchEvent(
              new CustomEvent(EVENT_NAME, {
                detail: {
                  url: url,
                  method: config?.method || "GET",
                  data: json,
                  user: userData,
                  timestamp: Date.now(),
                },
              })
            );
          }).catch(() => {
            // Not JSON, ignore
          });

          return response;
        } catch (e) {
          // On error, just proceed normally
          return target.apply(thisArg, args);
        }
      }

      return target.apply(thisArg, args);
    },
  });

  console.log("[Bootstrapp] Fetch interceptor installed");
})();
