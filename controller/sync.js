/**
 * @bootstrapp/controller - Sync Utilities
 * Generic sync logic with extensible type system
 */

// Sync type registry for custom types (ModelType, etc.)
const syncTypes = new Map();

/**
 * Register a custom sync type
 * @param {Function} check - Function that returns true if adapter matches this type
 * @param {Function} handler - Function that returns sync info for this type
 *
 * @example
 * registerSyncType(
 *   (adapter) => adapter instanceof ModelType,
 *   (adapter) => ({ adapter: adapter.name, syncObj: adapter })
 * )
 */
export function registerSyncType(check, handler) {
  syncTypes.set(check, handler);
}

/**
 * Get sync info for an adapter with pluggable type checking
 * @param {string|Object} adapter - Adapter name or sync object
 * @returns {Object|null} Sync info with adapter name and sync object
 */
export function getSyncInfo(adapter) {
  if (typeof adapter === "string") return { adapter, syncObj: null };
  for (const [check, handler] of syncTypes)
    if (check(adapter)) return handler(adapter);
  if (adapter?.$sync)
    return { adapter: adapter.$sync.adapter, syncObj: adapter.$sync };
  return null;
}

/**
 * Check if sync object requires async loading
 * @param {Object} syncObj - Sync object to check
 * @returns {boolean} True if async loading needed (has getAll method)
 */
export function needsAsyncLoad(syncObj) {
  return typeof syncObj?.getAll === "function";
}

/**
 * Get scoped key for component instance
 * @param {string} base - Base key name
 * @param {Object} prop - Property definition
 * @param {Object} inst - Component instance
 * @returns {string} Scoped key
 */
export function getScopedKey(base, prop, inst) {
  const { scope } = prop;
  if (!scope) return base;

  if (scope.includes(".")) {
    const [obj, key] = scope.split(".");
    if (inst[obj]?.[key]) return `${inst[obj][key]}:${base}`;
  }

  return inst[scope] ? `${inst[scope]}:${base}` : base;
}

/**
 * Update component state and trigger re-render
 * @param {Object} inst - Component instance
 * @param {string} key - Property key
 * @param {*} val - New value
 */
export function updateState(instance, key, val) {
  const oldValue = instance.state[key];
  instance.state[key] = val;
  if (!instance.isConnected) return;
  instance.requestUpdate(key, oldValue);
}

/**
 * Sync URL adapter when browser history changes
 * @param {Object} adapter - URL adapter (querystring or hash)
 */
export function syncUrl(adapter) {
  const current = new Map(adapter.entries());
  const old = new Set(adapter.listeners.keys());

  current.forEach((v, k) => {
    adapter.emit(k, v);
    old.delete(k);
  });

  old.forEach((k) => adapter.emit(k, undefined));
}

/**
 * Bind a custom sync object to a component property
 * @param {Object} options - Binding options
 * @param {Object} options.instance - Component instance
 * @param {string} options.key - Property key
 * @param {Object} options.prop - Property definition
 * @param {Object} options.syncObj - Sync object
 * @param {Function} options.onAsyncLoad - Optional async loading handler for special sync types
 */
export function bindCustomSync({ instance, key, prop, syncObj, onAsyncLoad }) {
  instance._customSyncUnsubscribers ||= [];
  instance._syncReloaders ||= {};

  Object.defineProperty(instance, key, {
    get: () => instance.state[key],
    set: (v) => {
      if (instance.state[key] === v) return;
      instance.state[key] = v;
      if (!prop.query && v !== syncObj.get(key)) syncObj.set(key, v);
    },
  });

  if (onAsyncLoad && prop.query) {
    // Store reloader function for dependsOn support
    if (prop.dependsOn) {
      instance._syncReloaders[key] = () => {
        // Cleanup old subscription for this key
        const oldUnsubIdx = instance._customSyncUnsubscribers.findIndex(
          (fn) => fn._syncKey === key
        );
        if (oldUnsubIdx > -1) {
          instance._customSyncUnsubscribers[oldUnsubIdx]();
          instance._customSyncUnsubscribers.splice(oldUnsubIdx, 1);
        }
        // Re-run async load with new query values
        onAsyncLoad({ instance, key, prop, syncObj, updateState });
      };
    }
    onAsyncLoad({ instance, key, prop, syncObj, updateState });
  } else {
    const val = syncObj.get(key);
    instance._customSyncUnsubscribers.push(
      syncObj.subscribe(key, (v) => updateState(instance, key, v)),
    );
    updateState(instance, key, val ?? prop.defaultValue);
  }
}

/**
 * Check if any dependency properties have changed and re-run queries
 * @param {Object} instance - Component instance
 * @param {Object} component - Component definition
 * @param {Map} changedProps - Map of changed property names
 */
export function checkDependsOn(instance, component, changedProps) {
  if (!instance._syncReloaders) return;

  Object.entries(component.properties || {})
    .filter(([, p]) => p.sync && p.dependsOn)
    .forEach(([key, prop]) => {
      const depsChanged = prop.dependsOn.some((dep) => changedProps.has(dep));
      if (depsChanged && instance._syncReloaders[key]) {
        instance._syncReloaders[key]();
      }
    });
}

/**
 * Bind an adapter to a component property
 * @param {Object} options - Binding options
 * @param {Object} options.instance - Component instance
 * @param {string} options.key - Property key
 * @param {Object} options.prop - Property definition
 * @param {string} options.adapterName - Adapter name
 * @param {Object} options.Controller - Controller instance
 * @param {Function} options.onBroadcast - Optional broadcast callback for cross-tab sync
 */
export function bindAdapterSync({
  instance,
  key,
  prop,
  adapterName,
  Controller,
  onBroadcast,
}) {
  const adapter = Controller[adapterName];
  if (!adapter) return;
  const sKey = getScopedKey(key, prop, instance);
  if (onBroadcast && adapterName === "local" && !adapter.hasListeners(sKey)) {
    adapter.on(sKey, (value, opts) => {
      if (!opts?.skipBroadcast) {
        onBroadcast({ value, sync: adapterName, key: sKey });
      }
    });
  }

  const listener = (v) => updateState(instance, key, v);
  (instance._listeners ||= {})[adapterName] ||= {};
  instance._listeners[adapterName][sKey] = listener;

  Object.defineProperty(instance, key, {
    get: () => instance.state[key],
    set: (v) => {
      if (instance.state[key] === v) return;
      instance.state[key] = v;
      if (v !== adapter.get(sKey)) adapter.set(sKey, v);
    },
  });

  adapter.on(sKey, listener);
  updateState(instance, key, adapter.get(sKey) ?? prop.defaultValue);
}

/**
 * Cleanup sync bindings when component disconnects
 * @param {Object} instance - Component instance
 * @param {Object} Controller - Controller instance
 */
export function cleanupSyncBindings(instance, Controller) {
  if (instance._listeners) {
    Object.entries(instance._listeners).forEach(([name, fns]) => {
      const adapter = Controller[name];
      if (adapter) Object.entries(fns).forEach(([k, fn]) => adapter.off(k, fn));
    });
  }

  if (instance._customSyncUnsubscribers) {
    instance._customSyncUnsubscribers.forEach((unsubscribe) => unsubscribe());
    instance._customSyncUnsubscribers = null;
  }
}
