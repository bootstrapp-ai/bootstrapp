/**
 * @bootstrapp/controller - Core
 * State management system with reactive adapters
 */

import createEventHandler from "@bootstrapp/events";

const adapters = {};
const adapterCache = new Map();

const parseKey = (k) =>
  typeof k === "string" && k.includes(".") ? k.split(".", 2) : [k, null];

/**
 * Creates an adapter with event capabilities
 * @param {Object} store - The storage backend
 * @param {string} name - Adapter name
 * @returns {Object} Adapter instance
 */
export const createAdapter = (store, name) => {
  const adapter =
    typeof store === "function"
      ? store
      : (k, v) => (v !== undefined ? adapter.set(k, v) : adapter.get(k));

  // Install event system
  createEventHandler(adapter);

  // Emit handler - will be overridden by app.js if needed
  const emit = (k, v) => adapter.emit(k, v);

  adapter.get = (key) => {
    const [k, path] = parseKey(key);
    const val = store.get(k);
    return path && val && typeof val === "object" ? val[path] : val;
  };

  adapter.set = (key, val) => {
    const [k, path] = parseKey(key);
    if (path) {
      const obj = { ...(store.get(k) || {}), [path]: val };
      store.set(k, obj);
      emit(k, obj);
      return obj;
    }
    store.set(k, val);
    emit(k, val);
    return val;
  };

  adapter.remove = (key) => {
    const [k, path] = parseKey(key);
    if (path) {
      const obj = store.get(k);
      if (obj && typeof obj === "object") {
        delete obj[path];
        store.set(k, obj);
        emit(k, obj);
      }
    } else {
      store.remove(k);
      emit(k, undefined);
    }
    return { key: k };
  };

  Object.assign(adapter, {
    has: store.has,
    keys: store.keys,
    entries: store.entries,
    broadcast: store.broadcast,
  });

  adapterCache.set(name, adapter);
  return adapter;
};

/**
 * Controller proxy for lazy adapter creation
 */
export const createController = (initialAdapters = {}) => {
  Object.assign(adapters, initialAdapters);

  const Controller = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (adapterCache.has(prop)) return adapterCache.get(prop);
        return adapters[prop] ? createAdapter(adapters[prop], prop) : undefined;
      },
    },
  );

  Controller.add = (n, a) =>
    typeof n === "object" ? Object.assign(adapters, n) : (adapters[n] = a);

  Controller.createAdapter = createAdapter;

  return Controller;
};

export default createController;
