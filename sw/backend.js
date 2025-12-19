import createFSHandlers from "./filesystem.js";

let $APP;
let config;

const getMimeType = (path) => {
  const ext = path.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    webp: "image/webp",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    eot: "application/vnd.ms-fontobject",
    otf: "font/otf",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    webm: "video/webm",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    xml: "application/xml",
    wasm: "application/wasm",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

const getLocalUrl = (path) => {
  const origin = self.location.origin;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};

export function initSWBackend(app, appConfig = {}) {
  $APP = app;
  config = appConfig;

  if ($APP.settings?.runtime !== "serviceworker") {
    return;
  }

  const LOCAL_FILES_CACHE_NAME = config.cache?.localFiles || "local-files-v1";
  const STAGING_CACHE_NAME = config.cache?.stagingFiles || "staging-files-v1";
  const CDN_CACHE_NAME = "cdn-assets-v1";
  const FILE_STORE_CACHE_NAME = "file-store-v1";

  const ALLOWED_HOSTNAMES = [
    "esm.sh",
    "cdn.jsdelivr.net",
    "unpkg.com",
    "cdnjs.cloudflare.com",
  ];

  let localCachingEnabled = false;

  const fsCache = {
    open: async (type) => {
      const cacheNames = {
        local: LOCAL_FILES_CACHE_NAME,
        staging: STAGING_CACHE_NAME,
        cdn: CDN_CACHE_NAME,
        fileStore: FILE_STORE_CACHE_NAME,
      };
      return caches.open(cacheNames[type] || type);
    },
    getKeysInDirectory: async (cache, dirPath) => {
      const keys = await cache.keys();
      return keys.filter((req) => {
        const url = new URL(req.url);
        return url.pathname.startsWith(dirPath);
      });
    },
  };

  const FSHandlers = createFSHandlers({ getMimeType, fsCache, getLocalUrl });

  self.addEventListener("install", (event) => {
    console.log("Service Worker: Installing...");
    event.waitUntil(
      Promise.all([
        caches.open(LOCAL_FILES_CACHE_NAME),
        caches.open(STAGING_CACHE_NAME),
        caches.open(CDN_CACHE_NAME),
        caches.open(FILE_STORE_CACHE_NAME),
      ]).then(() => {
        console.log("Service Worker: Caches initialized");
        return self.skipWaiting();
      }),
    );
  });

  self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...");
    event.waitUntil(self.clients.claim());
  });

  const respond = (client) => (payload, type) => {
    client.postMessage({ payload, type });
  };

  const messageHandlers = {
    SKIP_WAITING: async () => {
      console.log("Service Worker: Skip waiting requested");
      self.skipWaiting();
    },
    "SW:BROADCAST_SYNCED_PROP": async (data, { broadcast }) => {
      broadcast({ type: "SW:SYNC_PROPS", payload: data.payload });
    },
    "SW:BROADCAST_QUERY_SYNC": async (data, { broadcast }) => {
      broadcast({ type: "SW:QUERY_SYNC", payload: data.payload });
    },
    "SW:BROADCAST_AUTH_STATE": async (data, { broadcast }) => {
      broadcast({ type: "SW:AUTH_STATE", payload: data.payload });
    },
    "SW:CACHE_FILE": async (data, { respond }) => {
      try {
        const { url, content } = data.payload;
        const cache = await fsCache.open("fileStore");
        const response = new Response(content, {
          headers: { "Content-Type": getMimeType(url) },
        });
        await cache.put(url, response);
        respond({ success: true });
      } catch (error) {
        respond({ error: error.message });
      }
    },
    "SW:ENABLE_LOCAL_CACHING": async (data, { respond }) => {
      localCachingEnabled = true;
      console.log("Service Worker: Local caching ENABLED for build");
      respond({ success: true, enabled: true });
    },
    "SW:DISABLE_LOCAL_CACHING": async (data, { respond }) => {
      localCachingEnabled = false;
      console.log("Service Worker: Local caching DISABLED");
      respond({ success: true, enabled: false });
    },
    "SW:CLEAR_LOCAL_CACHE": async (data, { respond }) => {
      try {
        const localCache = await fsCache.open("local");
        const keys = await localCache.keys();
        await Promise.all(keys.map((key) => localCache.delete(key)));
        console.log(
          `Service Worker: Cleared ${keys.length} entries from local cache`,
        );
        respond({ success: true, clearedCount: keys.length });
      } catch (error) {
        respond({ error: error.message });
      }
    },
    "SW:GET_CACHED_FILES": async (data, { respond }) => {
      try {
        const files = {};

        const localCache = await fsCache.open("local");
        const localKeys = await localCache.keys();
        for (const req of localKeys) {
          const response = await localCache.match(req);
          if (response) {
            const url = new URL(req.url);
            const hasExtension =
              url.pathname.includes(".") && !url.pathname.endsWith("/");
            if (!hasExtension) continue;

            const content = await response.clone().text();
            const mimeType =
              response.headers.get("Content-Type")?.split(";")[0] ||
              getMimeType(url.pathname);
            files[url.pathname] = { content, mimeType };
          }
        }

        const cdnCache = await fsCache.open("cdn");
        const cdnKeys = await cdnCache.keys();
        for (const req of cdnKeys) {
          const response = await cdnCache.match(req);
          if (response) {
            const url = new URL(req.url);
            if (url.hostname === "esm.sh") {
              const esmPath = `${url.pathname}${url.search}`;
              const content = await response.clone().text();
              const mimeType =
                response.headers.get("Content-Type")?.split(";")[0] ||
                "application/javascript";
              files[esmPath] = { content, mimeType };
            }
          }
        }

        respond(files);
      } catch (error) {
        respond({ error: error.message });
      }
    },
    ...FSHandlers,
  };

  self.addEventListener("message", async (event) => {
    const { data } = event;
    const { type, payload, eventId } = data;
    const client = event.source;

    const broadcastToClients = async (message) => {
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((c) => {
        if (c.id !== client?.id) {
          c.postMessage(message);
        }
      });
    };

    const handler = messageHandlers[type];
    if (handler) {
      await handler(
        { payload, eventId },
        {
          respond: (responsePayload, responseType) => {
            if (client) {
              client.postMessage({
                payload: responsePayload,
                type: responseType || type,
                eventId,
              });
            }
          },
          broadcast: broadcastToClients,
        },
      );
    } else {
      $APP.events?.emit(type, { payload, eventId, client });
    }
  });

  self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    if (
      url.origin === self.location.origin &&
      url.pathname.startsWith("/npm/")
    ) {
      event.respondWith(
        (async () => {
          const packagePath = url.pathname.slice(5);
          const esmUrl = `https://esm.sh/${packagePath}${url.search}`;

          const cdnCache = await fsCache.open("cdn");
          const cacheKey = new Request(esmUrl);
          const cachedResponse = await cdnCache.match(cacheKey);
          if (cachedResponse) return cachedResponse;

          try {
            const networkResponse = await fetch(esmUrl);
            if (networkResponse.ok) {
              cdnCache.put(cacheKey, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            console.error("SW: ESM.sh fetch failed:", error);
            return new Response("Network error", { status: 503 });
          }
        })(),
      );
      return;
    }

    const isEsmPath =
      url.origin === self.location.origin &&
      (url.pathname.match(/^\/[^/]+@[\d.]+/) || url.pathname.startsWith("/v1"));

    if (isEsmPath) {
      event.respondWith(
        (async () => {
          const esmUrl = `https://esm.sh${url.pathname}${url.search}`;
          const cdnCache = await fsCache.open("cdn");
          const cacheKey = new Request(esmUrl);
          const cachedResponse = await cdnCache.match(cacheKey);
          if (cachedResponse) return cachedResponse;

          try {
            const networkResponse = await fetch(esmUrl);
            if (networkResponse.ok) {
              cdnCache.put(cacheKey, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            console.error("SW: ESM.sh internal fetch failed:", error);
            return new Response("Network error", { status: 503 });
          }
        })(),
      );
      return;
    }

    if (ALLOWED_HOSTNAMES.includes(url.hostname)) {
      event.respondWith(
        (async () => {
          const cdnCache = await fsCache.open("cdn");
          const cachedResponse = await cdnCache.match(event.request);
          if (cachedResponse) return cachedResponse;

          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              cdnCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            console.error("SW: CDN fetch failed:", error);
            return new Response("Network error", { status: 503 });
          }
        })(),
      );
      return;
    }

    if (url.origin === self.location.origin) {
      event.respondWith(
        (async () => {
          const stagingCache = await fsCache.open("staging");
          const stagingResponse = await stagingCache.match(event.request);
          if (stagingResponse) return stagingResponse;

          try {
            const networkResponse = await fetch(event.request);
            if (
              localCachingEnabled &&
              networkResponse.ok &&
              event.request.method === "GET"
            ) {
              const localCache = await fsCache.open("local");
              localCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            console.error("SW: Local fetch failed:", error);
            return new Response("Not found", { status: 404 });
          }
        })(),
      );
    }
  });

  console.log("Service Worker: Backend initialized");
}

export default { initSWBackend };
