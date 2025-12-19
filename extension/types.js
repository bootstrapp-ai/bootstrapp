import T from "../types/index.js";

export default {
  name: "@bootstrapp/extension",
  exports: {
    createExtensionBridge: T.function({
      description: "Create a bridge to communicate with the Bootstrapp Chrome extension",
      args: [
        T.string({ name: "extensionId", description: "The Chrome extension ID (found in chrome://extensions)" }),
      ],
      returns: T.object({ description: "Bridge API object" }),
    }),

    getExtensionBridge: T.function({
      description: "Get the shared bridge instance (only if connected)",
      args: [],
      returns: T.object({ description: "Bridge instance or null" }),
    }),

    connectExtension: T.function({
      description: "Connect to the extension (or return existing connection)",
      args: [
        T.string({ name: "extensionId", description: "Extension ID (saved to localStorage if provided)" }),
      ],
      returns: T.object({ description: "Connected bridge instance" }),
    }),

    disconnectExtension: T.function({
      description: "Disconnect from extension",
      args: [],
      returns: T.any(),
    }),

    isConnected: T.function({
      description: "Check if currently connected to extension",
      args: [],
      returns: T.boolean(),
    }),

    getExtensionId: T.function({
      description: "Get saved extension ID from localStorage",
      args: [],
      returns: T.string({ description: "Extension ID or empty string" }),
    }),

    onConnectionChange: T.function({
      description: "Subscribe to connection state changes",
      args: [
        T.function({ name: "callback", description: "Called with { type: 'connected' | 'disconnected' }" }),
      ],
      returns: T.function({ description: "Unsubscribe function" }),
    }),

    ExtensionBridge: {
      $interface: true,

      isAvailable: T.function({
        description: "Check if extension communication is available",
        args: [],
        returns: T.boolean(),
      }),

      isConnected: T.function({
        description: "Check if currently connected",
        args: [],
        returns: T.boolean(),
      }),

      connect: T.function({
        description: "Connect to the extension",
        args: [],
        returns: T.boolean({ description: "Promise resolving to true on success" }),
      }),

      disconnect: T.function({
        description: "Disconnect from the extension",
        args: [],
        returns: T.any(),
      }),

      getTabs: T.function({
        description: "Get all open tabs",
        args: [],
        returns: T.array({ description: "List of tabs" }),
      }),

      scrape: T.function({
        description: "Scrape content from a tab",
        args: [
          T.number({ name: "tabId", description: "Tab ID" }),
          T.any({ name: "selector", description: "CSS selector string or object of selectors" }),
          T.object({ name: "options", description: "Scraping options" }),
        ],
        returns: T.object({ description: "Scraped data" }),
      }),

      scrapeInstagram: T.function({
        description: "Scrape Instagram profile data from a tab (CSP-safe)",
        args: [T.number({ name: "tabId", description: "Tab ID with Instagram profile page" })],
        returns: T.object({ description: "Instagram profile data" }),
      }),

      fetchInstagramProfile: T.function({
        description: "Fetch Instagram profile via direct API call",
        args: [
          T.number({ name: "tabId", description: "Tab ID (must be on instagram.com for cookies)" }),
          T.string({ name: "username", description: "Instagram username to fetch" }),
        ],
        returns: T.object({ description: "{ success, user, source } or { success: false, error }" }),
      }),

      updateDocId: T.function({
        description: "Update a doc_id in the registry",
        args: [
          T.number({ name: "tabId" }),
          T.string({ name: "type", description: "Type of doc_id (profile, post, reel, etc)" }),
          T.string({ name: "docId", description: "The new doc_id value" }),
        ],
        returns: T.object(),
      }),

      startIntercept: T.function({
        description: "Start request interception on a tab",
        args: [T.number({ name: "tabId" })],
        returns: T.object({ description: "{ status: 'started' | 'already_active' }" }),
      }),

      stopIntercept: T.function({
        description: "Stop request interception on a tab",
        args: [T.number({ name: "tabId" })],
        returns: T.object({ description: "{ status: 'stopped' }" }),
      }),

      onInterceptedData: T.function({
        description: "Register a callback for intercepted data",
        args: [T.function({ name: "callback" })],
        returns: T.function({ description: "Unsubscribe function" }),
      }),

      inject: T.function({
        description: "Inject HTML into a tab",
        args: [
          T.number({ name: "tabId" }),
          T.string({ name: "html", description: "HTML to inject" }),
          T.string({ name: "target", description: "Target selector (default: 'body')" }),
          T.object({ name: "options", description: "Injection options" }),
        ],
        returns: T.object({ description: "Injection result" }),
      }),

      execute: T.function({
        description: "Execute JavaScript in a tab",
        args: [
          T.number({ name: "tabId" }),
          T.string({ name: "script", description: "JavaScript code to execute" }),
          T.array({ name: "args", description: "Arguments to pass to the script" }),
        ],
        returns: T.any({ description: "Execution result" }),
      }),

      observe: T.function({
        description: "Observe DOM changes in a tab",
        args: [
          T.number({ name: "tabId" }),
          T.string({ name: "selector", description: "Element selector to observe" }),
          T.function({ name: "callback", description: "Callback for changes" }),
          T.array({ name: "events", description: "Events to observe (default: ['mutation'])" }),
        ],
        returns: T.string({ description: "Observer ID" }),
      }),

      stopObserving: T.function({
        description: "Stop observing",
        args: [T.string({ name: "observerId", description: "Observer ID from observe()" })],
        returns: T.any(),
      }),

      ping: T.function({
        description: "Ping the extension",
        args: [],
        returns: T.boolean(),
      }),

      onDisconnect: T.function({
        description: "Register a disconnect callback",
        args: [T.function({ name: "callback" })],
        returns: T.function({ description: "Unsubscribe function" }),
      }),
    },
  },
};
