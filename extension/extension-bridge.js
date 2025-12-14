/**
 * Shared Extension Bridge Singleton
 * Single connection instance shared across all admin components
 */

import { createExtensionBridge } from "/$app/extension/admin-bridge.js";

const STORAGE_KEY = "bootstrapp-extension-id";

// Singleton state
let bridge = null;
let connectionPromise = null;
let disconnectHandler = null;
const listeners = new Set();

/**
 * Get or create the shared bridge instance (only if connected)
 */
export const getExtensionBridge = () => {
  if (bridge?.isConnected()) {
    return bridge;
  }
  return null;
};

/**
 * Handle disconnect event from bridge
 */
const handleDisconnect = () => {
  console.log("[ExtBridge] Connection lost");
  bridge = null;
  connectionPromise = null;
  notifyListeners({ type: "disconnected" });
};

/**
 * Connect to the extension (or return existing connection)
 */
export const connectExtension = async (extensionId) => {
  // Save extension ID
  if (extensionId) {
    localStorage.setItem(STORAGE_KEY, extensionId);
  }

  const id = extensionId || localStorage.getItem(STORAGE_KEY);
  if (!id) {
    throw new Error("Extension ID required");
  }

  // If already connecting, wait for that
  if (connectionPromise) {
    return connectionPromise;
  }

  // If already connected, return
  if (bridge?.isConnected()) {
    return bridge;
  }

  // Create new bridge and connect
  bridge = createExtensionBridge(id);

  // Set up disconnect handler
  if (bridge.onDisconnect) {
    bridge.onDisconnect(handleDisconnect);
  }

  connectionPromise = bridge.connect()
    .then(() => {
      connectionPromise = null;
      console.log("[ExtBridge] Connected successfully");
      notifyListeners({ type: "connected" });
      return bridge;
    })
    .catch((err) => {
      connectionPromise = null;
      bridge = null;
      console.error("[ExtBridge] Connection failed:", err);
      throw err;
    });

  return connectionPromise;
};

/**
 * Disconnect from extension
 */
export const disconnectExtension = () => {
  if (bridge) {
    bridge.disconnect();
    bridge = null;
    notifyListeners({ type: "disconnected" });
  }
};

/**
 * Check if connected
 */
export const isConnected = () => bridge?.isConnected() ?? false;

/**
 * Get saved extension ID
 */
export const getExtensionId = () => localStorage.getItem(STORAGE_KEY) || "";

/**
 * Subscribe to connection changes
 */
export const onConnectionChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyListeners = (event) => {
  listeners.forEach((cb) => cb(event));
};

export default {
  getExtensionBridge,
  connectExtension,
  disconnectExtension,
  isConnected,
  getExtensionId,
  onConnectionChange,
};
