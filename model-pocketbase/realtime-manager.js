/**
 * @file PocketBase Realtime Manager
 * @description Manages real-time subscriptions for PocketBase collections with filter support
 */

export class RealtimeManager {
  constructor(pb) {
    this.pb = pb;
    // Map<filterKey, { filter, callbacks, unsubscribe }>
    this.subscriptions = new Map();
  }

  /**
   * Subscribe to changes for a model/collection with optional filter
   * @param {string} model - Model name
   * @param {string} filter - PocketBase filter string (e.g., "status = 'active'") or null for all records
   * @param {Function} callback - Callback function (event) => void where event = { action, record }
   * @returns {Function} Unsubscribe function
   */
  subscribe(model, filter, callback) {
    const filterKey = `${model}::${filter || "*"}`;

    if (!this.subscriptions.has(filterKey)) {
      // Create subscription object immediately
      this.subscriptions.set(filterKey, {
        filter,
        callbacks: new Set(),
        unsubscribe: null,
      });
      // Setup listener asynchronously
      this._setupFilteredListener(model, filter, filterKey);
    }

    const sub = this.subscriptions.get(filterKey);
    sub.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      const sub = this.subscriptions.get(filterKey);
      if (sub) {
        sub.callbacks.delete(callback);

        // If no more subscribers, cleanup
        if (sub.callbacks.size === 0) {
          this._cleanupFilteredListener(filterKey);
        }
      }
    };
  }

  /**
   * Setup real-time listener for a collection with filter
   * @private
   */
  async _setupFilteredListener(model, filter, filterKey) {
    try {
      // Subscribe with filter parameter (or wildcard for all records)
      const unsubscribe = await this.pb
        .collection(model)
        .subscribe(filter || "*", (e) => {
          const { action, record } = e;

          // Notify all subscribers for this filter
          const sub = this.subscriptions.get(filterKey);
          if (sub) {
            sub.callbacks.forEach((callback) => {
              try {
                callback({ action, record });
              } catch (error) {
                console.error(
                  `PocketBase: Error in realtime callback for ${filterKey}:`,
                  error,
                );
              }
            });
          }
        });

      // Update the existing subscription with the unsubscribe function
      const sub = this.subscriptions.get(filterKey);
      if (sub) {
        sub.unsubscribe = unsubscribe;
      }

      console.log(
        `PocketBase: Subscribed to realtime updates for "${model}" with filter: "${filter || "*"}"`,
      );
    } catch (error) {
      console.error(
        `PocketBase: Failed to setup filtered listener for "${model}"`,
        error,
      );
    }
  }

  /**
   * Cleanup real-time listener for a specific filter
   * @private
   */
  _cleanupFilteredListener(filterKey) {
    const sub = this.subscriptions.get(filterKey);
    if (sub) {
      if (sub.unsubscribe && typeof sub.unsubscribe === "function") {
        sub.unsubscribe();
      }
      this.subscriptions.delete(filterKey);
      console.log(
        `PocketBase: Unsubscribed from realtime updates for "${filterKey}"`,
      );
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup() {
    for (const filterKey of this.subscriptions.keys()) {
      this._cleanupFilteredListener(filterKey);
    }
  }
}

export default RealtimeManager;
