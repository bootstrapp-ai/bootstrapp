/**
 * @file Filesystem Event Handlers
 * @description Service Worker filesystem operations for cache-based storage
 */

/**
 * Create filesystem event handlers for Service Worker
 * @param {Object} deps - Dependencies
 * @param {Function} deps.getMimeType - Function to get MIME type from path
 * @param {Object} deps.fsCache - Cache helper object
 * @param {Function} deps.getLocalUrl - Function to get local URL from path
 * @returns {Object} Event handlers map
 */
export default ({ getMimeType, fsCache, getLocalUrl }) => ({
  "FS:WRITE_FILES": async (data, { respond }) => {
    try {
      const { files } = data.payload;
      if (!Array.isArray(files))
        throw new Error("Payload must include a 'files' array.");

      const filesToCache = files.map((entry) => {
        const fullPath = entry.directory
          ? `${entry.directory}/${entry.name}`
          : `/${entry.name}`;
        if (entry.isDirectory) {
          const dirPath = fullPath.endsWith("/") ? fullPath : `${fullPath}/`;
          return { path: `${dirPath}.dir-placeholder`, content: "" };
        }
        return { path: fullPath, content: entry.content || "" };
      });

      const cache = await fsCache.open("local");
      const cachingPromises = filesToCache.map(({ path, content }) => {
        const requestUrl = getLocalUrl(path);
        const responseToCache = new Response(content, {
          headers: { "Content-Type": getMimeType(path) },
        });
        return cache.put(requestUrl, responseToCache);
      });

      await Promise.all(cachingPromises);
      console.info(`Service Worker: Batch wrote ${files.length} entries.`);
      respond({ success: true, count: files.length }, "FS_WRITE_FILES_SUCCESS");
    } catch (error) {
      console.error("Service Worker Error in FS:WRITE_FILES:", error);
      respond({ error: error.message }, "FS_WRITE_FILES_ERROR");
    }
  },

  "FS:WRITE_FILE": async (data, { respond }) => {
    try {
      const { path, content, system } = data.payload;
      const cache = await fsCache.open(system ? "cdn" : "staging");
      const requestUrl = system ? `https://${path}` : getLocalUrl(path);
      const responseToCache = new Response(content, {
        headers: { "Content-Type": getMimeType(path) },
      });
      await cache.put(requestUrl, responseToCache);
      respond({ path }, "FS_WRITE_SUCCESS");
    } catch (error) {
      console.error({ error, data });
      respond({ error: error.message }, "FS_WRITE_ERROR");
    }
  },

  "FS:READ_FILE": async (data, { respond }) => {
    try {
      const { path, system } = data.payload;
      let response;

      if (system) {
        const cdnCache = await fsCache.open("cdn");
        const requestUrl = `https://${path}`;
        response = await cdnCache.match(requestUrl);
      } else {
        const stgCache = await fsCache.open("staging");
        const globalCache = await fsCache.open("local");
        const requestUrl = getLocalUrl(path);
        response =
          (await stgCache.match(requestUrl)) ||
          (await globalCache.match(requestUrl));
      }

      if (!response) throw new Error(`File not found: ${path}`);
      const content = await response.text();
      respond({ path, content }, "FS_READ_SUCCESS");
    } catch (error) {
      respond({ error: error.message }, "FS_READ_ERROR");
    }
  },

  "FS:DELETE_FILE": async (data, { respond }) => {
    try {
      const { path, system } = data.payload;
      let deleted = false;

      if (system) {
        const cdnCache = await fsCache.open("cdn");
        const requestUrl = `https://${path}`;
        deleted = await cdnCache.delete(requestUrl);
      } else {
        const stgCache = await fsCache.open("staging");
        const globalCache = await fsCache.open("local");
        const requestUrl = getLocalUrl(path);
        const deletedFromStg = await stgCache.delete(requestUrl);
        const deletedFromGlobal = await globalCache.delete(requestUrl);
        deleted = deletedFromStg || deletedFromGlobal;
      }

      if (!deleted) {
        throw new Error(`File not found: ${path}`);
      }
      respond({ path }, "FS_DELETE_SUCCESS");
    } catch (error) {
      respond({ error: error.message }, "FS_DELETE_ERROR");
    }
  },

  "FS:DELETE_DIRECTORY": async (data, { respond }) => {
    try {
      const { path, system } = data.payload;

      if (system) {
        respond(
          { path, message: "System directory deletion not supported." },
          "FS_DIRECTORY_DELETE_SKIPPED"
        );
        return;
      }

      const stgCache = await fsCache.open("staging");
      const globalCache = await fsCache.open("local");
      const dirPath = path.endsWith("/") ? path : `${path}/`;

      const keysInStgDir = await fsCache.getKeysInDirectory(stgCache, dirPath);
      const keysInGlobalDir = await fsCache.getKeysInDirectory(globalCache, dirPath);

      const allKeys = [...keysInStgDir, ...keysInGlobalDir];
      const uniqueUrls = [...new Set(allKeys.map((req) => req.url))];

      const deletionPromises = uniqueUrls.flatMap((url) => [
        stgCache.delete(url),
        globalCache.delete(url),
      ]);

      await Promise.all(deletionPromises);
      respond({ path }, "FS_DIRECTORY_DELETE_SUCCESS");
    } catch (error) {
      respond({ error: error.message }, "FS_DIRECTORY_DELETE_ERROR");
    }
  },

  "FS:LIST_FILES": async (data, { respond }) => {
    try {
      const { path = "/", system } = data.payload;

      if (system) {
        // List files from CDN cache
        const cdnCache = await fsCache.open("cdn");
        const keys = await cdnCache.keys();
        const pathPrefix =
          path === "/" ? "" : path.endsWith("/") ? path : `${path}/`;
        const directChildren = new Map();

        for (const req of keys) {
          const url = new URL(req.url);
          const fullPath = `${url.hostname}${url.pathname}`;

          if (path !== "/" && !fullPath.startsWith(pathPrefix)) continue;

          const relativePath =
            path === "/" ? fullPath : fullPath.substring(pathPrefix.length);

          if (!relativePath) continue;

          const firstSlashIndex = relativePath.indexOf("/");
          const segmentName =
            firstSlashIndex === -1
              ? relativePath
              : relativePath.substring(0, firstSlashIndex);

          if (!segmentName) continue;

          const isDirectory = firstSlashIndex !== -1;
          const childPath = `${pathPrefix}${segmentName}${isDirectory ? "/" : ""}`;

          if (!directChildren.has(childPath)) {
            directChildren.set(childPath, {
              path: childPath,
              name: segmentName,
              isDirectory,
            });
          }
        }

        const filesList = Array.from(directChildren.values());
        filesList.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        respond(filesList);
        return;
      }

      // List local files
      const dirPath = path.endsWith("/") ? path : `${path}/`;
      const stgCache = await fsCache.open("staging");
      const globalCache = await fsCache.open("local");

      const stgKeys = await fsCache.getKeysInDirectory(stgCache, dirPath);
      const globalKeys = await fsCache.getKeysInDirectory(globalCache, dirPath);

      const requestMap = new Map();
      globalKeys.forEach((req) => requestMap.set(req.url, req));
      stgKeys.forEach((req) => requestMap.set(req.url, req));
      const keys = Array.from(requestMap.values());

      const pathPromises = keys.map(async (req) => {
        const fullPathUrl = new URL(req.url).pathname;
        const isDirPlaceholder = fullPathUrl.endsWith(".dir-placeholder");
        const finalPath = isDirPlaceholder
          ? fullPathUrl.replace(/\.dir-placeholder$/, "")
          : fullPathUrl;
        return { path: finalPath };
      });

      const allCacheEntries = (await Promise.all(pathPromises)).filter(Boolean);
      const directChildren = new Map();

      for (const entry of allCacheEntries) {
        if (!entry.path.startsWith(dirPath)) continue;
        const relativePath = entry.path.substring(dirPath.length);
        if (relativePath === "") continue;

        const firstSlashIndex = relativePath.indexOf("/");
        const segmentName =
          firstSlashIndex === -1
            ? relativePath
            : relativePath.substring(0, firstSlashIndex);
        if (!segmentName) continue;

        const isDirectory = firstSlashIndex !== -1 || entry.path.endsWith("/");
        if (isDirectory) {
          const childDirPath = `${dirPath}${segmentName}/`;
          if (!directChildren.has(childDirPath)) {
            directChildren.set(childDirPath, {
              path: childDirPath,
              name: segmentName,
              isDirectory: true,
            });
          }
        } else {
          const childFilePath = `${dirPath}${segmentName}`;
          if (!directChildren.has(childFilePath)) {
            directChildren.set(childFilePath, {
              path: childFilePath,
              name: segmentName,
              isDirectory: false,
            });
          }
        }
      }

      const filesList = Array.from(directChildren.values());
      filesList.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      respond(filesList);
    } catch (error) {
      console.error("Service Worker Error in FS:LIST_FILES:", error);
      respond({ error: error.message }, "FS_LIST_ERROR");
    }
  },

  "FS:DIR_EXISTS": async (data, { respond }) => {
    try {
      const { path } = data.payload;
      if (!path) throw new Error("Payload must include 'path'.");
      const dirPath = path.endsWith("/") ? path : `${path}/`;
      const stgCache = await fsCache.open("staging");
      const globalCache = await fsCache.open("local");

      const stgKeys = await fsCache.getKeysInDirectory(stgCache, dirPath);
      if (stgKeys.length > 0) {
        respond(true);
        return;
      }

      const globalKeys = await fsCache.getKeysInDirectory(globalCache, dirPath);
      respond(globalKeys.length > 0);
    } catch (error) {
      respond({ error: error.message }, "FS_DIR_EXISTS_ERROR");
    }
  },

  "FS:FILE_EXISTS": async (data, { respond }) => {
    try {
      const { path } = data.payload;
      if (!path) throw new Error("Payload must include 'path'.");
      const stgCache = await fsCache.open("staging");
      const globalCache = await fsCache.open("local");
      const requestUrl = getLocalUrl(path);

      let response = await stgCache.match(requestUrl);
      if (response) {
        respond(true);
        return;
      }

      response = await globalCache.match(requestUrl);
      respond(!!response);
    } catch (error) {
      respond({ error: error.message }, "FS_FILE_EXISTS_ERROR");
    }
  },
});
