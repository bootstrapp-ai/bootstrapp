
import { matchesWhere } from "./query-builder.js";

export class QuerySubscription {
  constructor(model, where, filterString) {
    this.model = model; // Model name (e.g., "users")
    this.where = where; // Where clause object (e.g., { status: "active" })
    this.filterString = filterString; // Adapter-specific filter string
    this.queryHash = null; // Unique hash for this query
    this.callbacks = new Set(); // Set of callback functions
    this.refCount = 0; // Number of active subscribers
  }

  addCallback(callback) {
    this.callbacks.add(callback);
    this.refCount++;
  }

  removeCallback(callback) {
    this.callbacks.delete(callback);
    this.refCount--;
  }

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

const defaultFilterBuilder = (where) => {
  if (!where || Object.keys(where).length === 0) {
    return "";
  }
  return JSON.stringify(where);
};

export class SubscriptionManager {
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

  setFilterBuilder(builder) {
    this.buildFilterString = builder;
  }

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

  unsubscribe(queryHash, callback) {
    const subscription = this.subscriptions.get(queryHash);
    if (!subscription) return;

    subscription.removeCallback(callback);

    // If no more subscribers, cleanup
    if (subscription.refCount === 0) {
      this.cleanupSubscription(queryHash);
    }
  }

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

  cleanup() {
    for (const queryHash of this.subscriptions.keys()) {
      this.cleanupSubscription(queryHash);
    }
  }

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
