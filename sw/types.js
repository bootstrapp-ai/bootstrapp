import T from "../types/index.js";

export default {
  name: "@bootstrapp/sw",
  exports: {
    SWAdapter: {
      $interface: true,
      $APP: T.object({ description: "App instance reference" }),

      namespaceExists: T.function({
        description: "Check if a namespace exists (has any files)",
        args: [T.object({ name: "options", description: "{ namespace }" })],
        returns: T.boolean(),
      }),

      createFiles: T.function({
        description: "Create multiple files in batch",
        args: [T.object({ name: "options", description: "{ namespace, files, system? }" })],
        returns: T.object(),
      }),

      createFile: T.function({
        description: "Create a single file",
        args: [T.object({ name: "options", description: "{ namespace, path, content? }" })],
        returns: T.object(),
      }),

      saveFile: T.function({
        description: "Save a file (alias for writeFile)",
        args: [T.object({ name: "options", description: "{ namespace, path, content, system? }" })],
        returns: T.object(),
      }),

      writeFile: T.function({
        description: "Write content to a file",
        args: [T.object({ name: "options", description: "{ namespace, path, content, system? }" })],
        returns: T.object(),
      }),

      readFile: T.function({
        description: "Read content from a file",
        args: [T.object({ name: "options", description: "{ namespace, path, system? }" })],
        returns: T.string({ description: "File content" }),
      }),

      deleteFile: T.function({
        description: "Delete a file",
        args: [T.object({ name: "options", description: "{ namespace, path }" })],
        returns: T.object(),
      }),

      createFolder: T.function({
        description: "Create a folder (creates a placeholder file)",
        args: [T.object({ name: "options", description: "{ namespace, path }" })],
        returns: T.object(),
      }),

      deleteDirectory: T.function({
        description: "Delete a directory and all its contents",
        args: [T.object({ name: "options", description: "{ namespace, path }" })],
        returns: T.object(),
      }),

      listDirectory: T.function({
        description: "List files in a directory",
        args: [T.object({ name: "options", description: "{ namespace, path?, recursive? }" })],
        returns: T.array({ description: "List of files" }),
      }),

      deleteNamespace: T.function({
        description: "Delete an entire namespace",
        args: [T.object({ name: "options", description: "{ namespace }" })],
        returns: T.object(),
      }),
    },

    initSWBackend: T.function({
      description: "Initialize Service Worker backend with caching and fetch handling",
      args: [
        T.object({ name: "app", description: "$APP instance" }),
        T.object({ name: "config", description: "App configuration" }),
      ],
      returns: T.any(),
    }),

    initSWFrontend: T.function({
      description: "Initialize Service Worker frontend communication",
      args: [T.object({ name: "app", description: "$APP instance" })],
      returns: T.object({ description: "SW module with postMessage, request, etc." }),
    }),

    createFSHandlers: T.function({
      description: "Create filesystem event handlers for SW backend",
      args: [T.object({ name: "options", description: "{ getMimeType, fsCache, getLocalUrl }" })],
      returns: T.object({ description: "Event handlers object" }),
    }),

    setRegistration: T.function({
      description: "Set the SW registration reference",
      args: [T.object({ name: "registration", description: "ServiceWorkerRegistration" })],
      returns: T.any(),
    }),

    enableAutoUpdates: T.function({
      description: "Enable automatic update checking",
      args: [T.object({ name: "config", description: "{ onPageLoad?, pollingInterval?, onVisibilityChange? }" })],
      returns: T.any(),
    }),

    disableAutoUpdates: T.function({
      description: "Disable automatic update checking and clean up listeners",
      args: [],
      returns: T.any(),
    }),

    checkForUpdates: T.function({
      description: "Check for Service Worker updates",
      args: [],
      returns: T.boolean({ description: "True if update check was triggered" }),
    }),

    applyUpdate: T.function({
      description: "Apply pending update - activates waiting SW and reloads page",
      args: [T.number({ name: "timeout", description: "Timeout in ms (default: 10000)" })],
      returns: T.boolean({ description: "True if update was initiated" }),
    }),

    hasUpdate: T.function({
      description: "Check if an update is available",
      args: [],
      returns: T.boolean({ description: "True if a worker is waiting" }),
    }),

    SW: {
      $interface: true,
      postMessage: T.function({
        description: "Post a message to the Service Worker (fire and forget)",
        args: [T.string({ name: "type" }), T.any({ name: "payload" })],
        returns: T.any(),
      }),

      request: T.function({
        description: "Send a request to the Service Worker and wait for response",
        args: [
          T.string({ name: "type" }),
          T.any({ name: "payload" }),
          T.number({ name: "timeout", description: "Timeout in ms (default: 30000)" }),
        ],
        returns: T.any({ description: "Response from SW" }),
      }),

      setRegistration: T.function({
        description: "Set the SW registration reference",
        args: [T.object({ name: "registration" })],
        returns: T.any(),
      }),

      enableAutoUpdates: T.function({
        description: "Enable automatic update checking",
        args: [T.object({ name: "config" })],
        returns: T.any(),
      }),

      disableAutoUpdates: T.function({
        description: "Disable automatic update checking",
        args: [],
        returns: T.any(),
      }),

      checkForUpdates: T.function({
        description: "Check for updates",
        args: [],
        returns: T.boolean(),
      }),

      applyUpdate: T.function({
        description: "Apply pending update",
        args: [T.number({ name: "timeout" })],
        returns: T.boolean(),
      }),

      hasUpdate: T.function({
        description: "Check if update available",
        args: [],
        returns: T.boolean(),
      }),

      getRegistration: T.function({
        description: "Get the current registration",
        args: [],
        returns: T.object({ description: "ServiceWorkerRegistration or null" }),
      }),

      enableLocalCaching: T.function({
        description: "Enable local caching for builds",
        args: [],
        returns: T.object(),
      }),

      disableLocalCaching: T.function({
        description: "Disable local caching",
        args: [],
        returns: T.object(),
      }),

      clearLocalCache: T.function({
        description: "Clear local cache",
        args: [],
        returns: T.object(),
      }),
    },
  },
};
