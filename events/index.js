/**
 * @bootstrapp/events
 * Lightweight event system with pub/sub pattern
 */

/**
 * Creates an event handler with on, off, emit, set, get
 * @param {Object} target - The target object to install event methods on (optional)
 * @param {Object} options - Configuration options
 * @param {boolean} options.getter - Whether to include the 'get' method (default: true)
 * @returns {Object} Event handler instance
 */
function createEventHandler(target = {}, { getter = true } = {}) {
  const listeners = new Map();

  target.listeners = listeners;
  target.hasListeners = (key) => listeners.has(key);

  target.on = (key, callback) => {
    if (!callback)
      return console.error(
        `Error adding listener to ${key}: no callback passed`,
      );
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);
  };

  target.set = (events) =>
    Object.entries(events).forEach(([key, callback]) =>
      target.on(key, callback),
    );

  if (getter) target.get = (key) => [...(listeners.get(key) ?? [])];

  target.off = (key, callback) => {
    const callbackSet = listeners.get(key);
    if (!callbackSet) return;
    callbackSet.delete(callback);
    if (callbackSet.size === 0) listeners.delete(key);
  };

  target.emit = (key, data) => {
    const results = [];
    listeners.get(key)?.forEach((callback) => {
      try {
        results.push(callback(data));
      } catch (error) {
        console.error(`Error in listener for key "${key}":`, error);
      }
    });
    return results;
  };

  return target;
}

export default createEventHandler;
