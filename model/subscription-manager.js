/**
 * @file Subscription Manager
 * @description Manages query-level subscriptions for efficient data synchronization
 * Tracks unique queries (model + where clause) and routes notifications only to matching subscribers
 */

import { matchesWhere } from "./query-builder.js";

/**
 * Represents a single query subscription
 */
export class QuerySubscription {
  constructor(model, where, filterString) {
    this.model = model; // Model name (e.g., "users")
    this.where = where; // Where clause object (e.g., { status: "active" })
    this.filterString = filterString; // Adapter-specific filter string
    this.queryHash = null; // Unique hash for this query
    this.callbacks = new Set(); // Set of callback functions
    this.refCount = 0; // Number of active subscribers
  }

  /**
   * Add a callback to this subscription
   */
  addCallback(callback) {
    this.callbacks.add(callback);
    this.refCount++;
  }

  /**
   * Remove a callback from this subscription
   */
  removeCallback(callback) {
    this.callbacks.delete(callback);
    this.refCount--;
  }

  /**
   * Notify all callbacks with an event
   */
  notify(event) {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in query subscription callback:", error);
      }
    });
  }
}

/**
 * Generate a stable hash for a query (model + where clause)
 * @param {string} model - Model name
 * @param {object} where - Where clause object
 * @returns {string} Query hash
 */
export function hashQuery(model, where) {
  if (!where || Object.keys(where).length === 0) {
    return `${model}::*`; // All records
  }

  // Sort keys for stable hashing
  const sortedKeys = Object.keys(where).sort();
  const sortedWhere = {};
  sortedKeys.forEach((key) => {
    sortedWhere[key] = where[key];
  });

  const whereString = JSON.stringify(sortedWhere);
  return `${model}::${whereString}`;
}

/**
 * Default filter builder (identity function)
 * Can be replaced by adapter-specific builders (e.g., PocketBase filter syntax)
 * @param {object} where - Where clause object
 * @returns {string} Filter string
 */
const defaultFilterBuilder = (where) => {
  if (!where || Object.keys(where).length === 0) {
    return "";
  }
  return JSON.stringify(where);
};

/**
 * Centralized subscription manager for query-level subscriptions
 */
export class SubscriptionManager {
  /**
   * @param {object} database - Database adapter instance (optional)
   * @param {object} [options={}] - Configuration options
   * @param {function} [options.buildFilterString] - Custom filter string builder
   */
  constructor(database, options = {}) {
    this.database = database; // Database adapter instance

    // Allow custom filter builder (e.g., for PocketBase)
    this.buildFilterString = options.buildFilterString || defaultFilterBuilder;

    // Map: queryHash -> QuerySubscription
    this.subscriptions = new Map();

    // Map: model -> Set<queryHash>
    this.modelToQueries = new Map();

    // Map: queryHash -> adapter-specific unsubscribe function
    this.adapterUnsubscribers = new Map();
  }

  /**
   * Set a custom filter builder function
   * @param {function} builder - Filter builder function (where) => filterString
   */
  setFilterBuilder(builder) {
    this.buildFilterString = builder;
  }

  /**
   * Subscribe to a query (model + where clause)
   * @param {string} model - Model name
   * @param {object} where - Where clause object
   * @param {function} callback - Callback function (event) => void
   * @returns {function} Unsubscribe function
   */
  async subscribe(model, where, callback) {
    if (typeof callback !== "function") {
      console.error("Subscription callback must be a function");
      return () => {};
    }

    const queryHash = hashQuery(model, where);
    let subscription = this.subscriptions.get(queryHash);
    let isNew = false;

    if (!subscription) {
      // First subscriber for this query - create new subscription
      const filterString = this.buildFilterString(where);
      subscription = new QuerySubscription(model, where, filterString);
      subscription.queryHash = queryHash;
      isNew = true;
    }

    // Add callback BEFORE adding to maps (prevents race condition where
    // notifyMatchingQueries finds subscription but callbacks is empty)
    subscription.addCallback(callback);

    if (isNew) {
      // Now add to tracking maps
      this.subscriptions.set(queryHash, subscription);

      if (!this.modelToQueries.has(model)) {
        this.modelToQueries.set(model, new Set());
      }
      this.modelToQueries.get(model).add(queryHash);

      // Create adapter-specific subscription (PocketBase realtime)
      await this.createAdapterSubscription(subscription);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(queryHash, callback);
  }

  /**
   * Unsubscribe a callback from a query
   * @param {string} queryHash - Query hash
   * @param {function} callback - Callback to remove
   */
  unsubscribe(queryHash, callback) {
    const subscription = this.subscriptions.get(queryHash);
    if (!subscription) return;

    subscription.removeCallback(callback);

    // If no more subscribers, cleanup
    if (subscription.refCount === 0) {
      this.cleanupSubscription(queryHash);
    }
  }

  /**
   * Create adapter-specific subscription (PocketBase, IndexedDB, Hybrid)
   * @param {QuerySubscription} subscription
   * @private
   */
  async createAdapterSubscription(subscription) {
    const { model, filterString } = subscription;

    // Check if database adapter supports realtime subscriptions
    if (
      this.database?.realtimeManager &&
      typeof this.database.realtimeManager.subscribe === "function"
    ) {
      // PocketBase or Hybrid adapter with realtime support
      try {
        const unsubscribe = await this.database.realtimeManager.subscribe(
          model,
          filterString,
          (event) => {
            // Route event to subscription callbacks
            subscription.notify(event);
          },
        );

        this.adapterUnsubscribers.set(subscription.queryHash, unsubscribe);
      } catch (error) {
        console.error(
          "SubscriptionManager: Failed to create realtime subscription",
          error,
        );
      }
    }
    // IndexedDB adapter uses event-based notifications (no native realtime)
  }

  /**
   * Cleanup a subscription when no more subscribers
   * @param {string} queryHash
   * @private
   */
  cleanupSubscription(queryHash) {
    const subscription = this.subscriptions.get(queryHash);
    if (!subscription) return;

    // Unsubscribe from adapter
    const adapterUnsub = this.adapterUnsubscribers.get(queryHash);
    if (adapterUnsub && typeof adapterUnsub === "function") {
      adapterUnsub();
      this.adapterUnsubscribers.delete(queryHash);
    }

    // Remove from tracking
    this.subscriptions.delete(queryHash);

    const modelQueries = this.modelToQueries.get(subscription.model);
    if (modelQueries) {
      modelQueries.delete(queryHash);
      if (modelQueries.size === 0) {
        this.modelToQueries.delete(subscription.model);
      }
    }
  }

  /**
   * Notify all query subscriptions that match a record change
   * Used by IndexedDB adapter and frontend event handler
   * @param {string} model - Model name
   * @param {string} action - Action type: 'add', 'update', 'delete'
   * @param {object} record - Changed record
   */
  notifyMatchingQueries(model, action, record) {
    const queryHashes = this.modelToQueries.get(model);
    if (!queryHashes) return;

    for (const queryHash of queryHashes) {
      const subscription = this.subscriptions.get(queryHash);
      if (!subscription) continue;

      // For deletes, always notify (can't check match on deleted record)
      // For add/update, check if record matches the where clause
      const shouldNotify =
        action === "delete" ||
        action === "remove" ||
        !subscription.where ||
        Object.keys(subscription.where).length === 0 ||
        matchesWhere(record, subscription.where);
      if (shouldNotify) {
        subscription.notify({
          action,
          record,
          model,
        });
      }
    }
  }

  /**
   * Cleanup all subscriptions (called on app shutdown)
   */
  cleanup() {
    for (const queryHash of this.subscriptions.keys()) {
      this.cleanupSubscription(queryHash);
    }
  }

  /**
   * Get subscription statistics (for debugging)
   */
  getStats() {
    const stats = {
      totalSubscriptions: this.subscriptions.size,
      byModel: {},
    };

    for (const [model, queryHashes] of this.modelToQueries) {
      stats.byModel[model] = {
        queries: queryHashes.size,
        totalCallbacks: 0,
      };

      for (const queryHash of queryHashes) {
        const subscription = this.subscriptions.get(queryHash);
        if (subscription) {
          stats.byModel[model].totalCallbacks += subscription.refCount;
        }
      }
    }

    return stats;
  }
}

export default SubscriptionManager;
