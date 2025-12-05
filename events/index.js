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

  /**
   * Registers an event listener.
   * @param {string} key - The event key.
   * @param {Function} callback - The listener function (can be async).
   */
  target.on = (key, callback) => {
    if (!callback)
      return console.error(
        `Error adding listener to ${key}: no callback passed`,
      );
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(callback);
  };

  /**
   * Registers multiple event listeners from an object.
   * @param {Object<string, Function>} events - Key-value pairs of events and callbacks.
   */
  target.set = (events) =>
    Object.entries(events).forEach(([key, callback]) =>
      target.on(key, callback),
    );

  /**
   * Gets all registered callbacks for a specific key.
   * @param {string} key - The event key.
   * @returns {Function[]} An array of callback functions.
   */
  if (getter) target.get = (key) => [...(listeners.get(key) ?? [])];

  /**
   * Unregisters an event listener.
   * @param {string} key - The event key.
   * @param {Function} callback - The listener function to remove.
   */
  target.off = (key, callback) => {
    const callbackSet = listeners.get(key);
    if (!callbackSet) return;
    callbackSet.delete(callback);
    if (callbackSet.size === 0) listeners.delete(key);
  };

  /**
   * Executes all listeners for a key and returns a Promise
   * that resolves when all listeners (sync or async) have completed.
   * @param {string} key - The event key.
   * @param {*} data - The data to pass to the listeners.
   * @returns {Promise<Array<*>>} A promise resolving to an array of results from the listeners.
   */
  target.emit = async (key, data) => {
    const results = [];
    listeners.get(key)?.forEach((callback) => {
      try {
        results.push(callback(data));
      } catch (error) {
        console.error(`Error in listener for key "${key}":`, error);
      }
    });
    return Promise.all(results);
  };

  return target;
}

export default createEventHandler;
