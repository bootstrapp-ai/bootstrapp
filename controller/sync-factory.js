/**
 * Creates a sync object for any class instance and installs subscribe/notify pattern
 * @param {Object} instance - The instance to sync with
 * @param {string} adapterName - The name of the adapter to use in the Controller
 * @param {Array<string>} syncableProps - Array of property names that can be synced (optional, defaults to all)
 * @returns {Object} A sync object compatible with the property sync system
 */
export const createSync = (instance, adapterName, syncableProps = null) => {
  if (!instance._listeners) instance._listeners = new Map();
  if (!instance.subscribe) {
    instance.subscribe = function (key, callback) {
      if (!this._listeners.has(key)) this._listeners.set(key, new Set());
      const listeners = this._listeners.get(key);
      listeners.add(callback);
      return () => listeners.delete(callback);
    };
  }
  if (!instance._notify) {
    instance._notify = function (key, value) {
      if (this._listeners.has(key))
        this._listeners.get(key).forEach((callback) => callback(value));
    };
  }
  const allowedProps = syncableProps ? new Set(syncableProps) : null;
  const validateProp = (key) => {
    if (allowedProps && !allowedProps.has(key)) {
      console.warn(
        `Property "${key}" is not in the list of syncable properties for ${adapterName}`,
      );
      return false;
    }
    return true;
  };
  if (syncableProps) {
    syncableProps.forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(instance, key);
      if (descriptor && typeof descriptor.set === "function") return;
      const currentValue = instance[key];
      const privateKey = `_${key}`;
      instance[privateKey] = currentValue;
      Object.defineProperty(instance, key, {
        get() {
          return this[privateKey];
        },
        set(value) {
          if (this[privateKey] === value) return;
          this[privateKey] = value;
          this._notify(key, value);
        },
        enumerable: true,
        configurable: true,
      });
    });
  }

  return {
    adapter: adapterName,
    get: (key) => {
      if (!validateProp(key)) return undefined;
      return instance[key];
    },
    set: (key, value) => {
      if (!validateProp(key)) return;
      instance[key] = value;
    },
    subscribe: (key, callback) => {
      if (!validateProp(key)) return () => {};
      return instance.subscribe(key, callback);
    },
  };
};
