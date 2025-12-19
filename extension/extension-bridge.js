import { createExtensionBridge } from "/$app/extension/admin-bridge.js";

const STORAGE_KEY = "bootstrapp-extension-id";

let bridge = null;
let connectionPromise = null;
let disconnectHandler = null;
const listeners = new Set();

export const getExtensionBridge = () => {
  if (bridge?.isConnected()) {
    return bridge;
  }
  return null;
};

const handleDisconnect = () => {
  console.log("[ExtBridge] Connection lost");
  bridge = null;
  connectionPromise = null;
  notifyListeners({ type: "disconnected" });
};

export const connectExtension = async (extensionId) => {
  if (extensionId) {
    localStorage.setItem(STORAGE_KEY, extensionId);
  }

  const id = extensionId || localStorage.getItem(STORAGE_KEY);
  if (!id) {
    throw new Error("Extension ID required");
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (bridge?.isConnected()) {
    return bridge;
  }

  bridge = createExtensionBridge(id);

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

export const disconnectExtension = () => {
  if (bridge) {
    bridge.disconnect();
    bridge = null;
    notifyListeners({ type: "disconnected" });
  }
};

export const isConnected = () => bridge?.isConnected() ?? false;

export const getExtensionId = () => localStorage.getItem(STORAGE_KEY) || "";

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
