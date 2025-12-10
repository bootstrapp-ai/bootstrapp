/**
 * @file Hybrid Database Adapter
 * @description Combines IndexedDB (local cache) with PocketBase (remote source of truth)
 * Provides offline-first architecture with automatic sync
 */

/**
 * Hybrid Adapter Configuration
 * @typedef {Object} HybridConfig
 * @property {string} name - Database name
 * @property {number} version - Database version
 * @property {Object} models - Model schemas
 * @property {string} url - PocketBase server URL
 * @property {string} [userId] - Current user ID for scoping data
 * @property {boolean} [syncOnInit=true] - Download all user data on init
 * @property {string} [conflictStrategy='remote-wins'] - Conflict resolution strategy
 * @property {Object} IndexedDBAdapter - IndexedDB adapter class (injected)
 * @property {Object} PocketBaseAdapter - PocketBase adapter class (injected)
 * @property {Function} [eventEmitter] - Event emitter for reactivity
 */

export class HybridAdapter {
  /**
   * @param {HybridConfig} config - Configuration options
   */
  constructor(config) {
    // Store base config
    this.name = config.name;
    this.version = config.version;
    this.models = config.models;
    this.system = config.system;
    this.onConnected = config.onConnected;

    // Hybrid-specific config
    this.userId = config.userId;
    this.syncOnInit = config.syncOnInit !== false;
    this.conflictStrategy = config.conflictStrategy || "remote-wins";
    this.writeQueue = [];
    this.isOnline = typeof navigator !== "undefined" && navigator.onLine;
    this.subscriptions = new Map();

    // Injected adapter classes
    const IndexedDBAdapter = config.IndexedDBAdapter;
    const PocketBaseAdapter = config.PocketBaseAdapter;

    if (!IndexedDBAdapter) {
      throw new Error("IndexedDBAdapter class not provided");
    }
    if (!PocketBaseAdapter) {
      throw new Error("PocketBaseAdapter class not provided");
    }

    // Create adapter instances
    this.local = new IndexedDBAdapter({
      ...config,
      system: true, // Prevent local from emitting events
    });
    this.remote = new PocketBaseAdapter({
      ...config,
      system: true, // Prevent remote from emitting events
    });

    // Event emitter
    this.eventEmitter = config.eventEmitter || null;

    this.loadQueue();
  }

  /**
   * Initialize both adapters and sync
   * @returns {Promise<void>}
   */
  async init() {
    await this.local.init();

    try {
      await this.remote.init();
      this.isOnline = true;
    } catch (error) {
      console.warn(
        "HybridDB: Remote database unavailable, running offline",
        error,
      );
      this.isOnline = false;
    }

    // Initial sync if online and configured
    if (this.isOnline && this.syncOnInit) {
      if (this.conflictStrategy === "local-wins") {
        await this.syncToRemote();
      } else {
        await this.syncFromRemote();
      }
    }

    // Process queued writes
    if (this.isOnline) {
      await this.processWriteQueue();
    }

    // Setup real-time subscriptions
    if (this.isOnline) {
      this.setupRealtimeSync();
    }

    // Listen for online/offline events
    if (typeof window !== "undefined") {
      this._onlineHandler = () => this.handleOnline();
      this._offlineHandler = () => this.handleOffline();
      window.addEventListener("online", this._onlineHandler);
      window.addEventListener("offline", this._offlineHandler);
    }

    console.info("HybridDB: Initialized (local + remote)");

    if (this.onConnected && typeof this.onConnected === "function") {
      this.onConnected();
    }
  }

  /**
   * Emit an event if eventEmitter is available
   * @private
   */
  _emit(event, data) {
    if (this.eventEmitter && typeof this.eventEmitter === "function") {
      this.eventEmitter(event, data);
    }
  }

  /**
   * Emit events for Model API hooks
   * @param {string} eventName - Event name (onAddRecord, onEditRecord, etc.)
   * @param {Object} data - Event data
   * @private
   */
  emitEvent(eventName, data) {
    if (!this.system) {
      const { model } = data;
      this._emit(`Model${eventName.replace("on", "")}-${model}`, data);
      this._emit(eventName, data);
    }
  }

  /**
   * Get a single record by ID (cache-first)
   * @param {string} model - Model name
   * @param {string|number|Object} idOrWhere - Record ID or where clause
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Object|null>}
   */
  async get(model, idOrWhere, options = {}) {
    let record = await this.local.get(model, idOrWhere, options);

    if (!record && this.isOnline) {
      try {
        record = await this.remote.get(model, idOrWhere, options);

        if (record) {
          await this.local.add(model, record).catch(() => {});
        }
      } catch (error) {
        console.warn(
          `HybridDB: Failed to fetch from remote for ${model}`,
          error,
        );
      }
    }

    return record;
  }

  /**
   * Get all records matching criteria (remote-first when online)
   * @param {string} model - Model name
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Object>>}
   */
  async getAll(model, options = {}) {
    if (this.isOnline) {
      try {
        const remoteOptions = this.addUserScope(model, options);
        const records = await this.remote.getAll(model, remoteOptions);

        await this.updateLocalCache(model, records);

        return records;
      } catch (error) {
        console.warn(
          `HybridDB: Failed to fetch from remote, using cache`,
          error,
        );
      }
    }

    return await this.local.getAll(model, options);
  }

  /**
   * Add a new record (remote-first with queue)
   * @param {string} model - Model name
   * @param {Object} data - Record data
   * @returns {Promise<Object>} Created record
   */
  async add(model, data) {
    if (this.isOnline) {
      try {
        const record = await this.remote.add(model, data);
        await this.local.add(model, record);
        this.emitEvent("onAddRecord", { model, row: record });
        return record;
      } catch (error) {
        console.warn(`HybridDB: Remote write failed, queuing`, error);
      }
    }

    const optimisticId = this.generateOptimisticId();
    const optimisticRecord = { ...data, id: optimisticId, _pending: true };

    await this.local.add(model, optimisticRecord);
    this.queueWrite({ operation: "add", model, data: optimisticRecord });

    return optimisticRecord;
  }

  /**
   * Add multiple records in a batch
   * @param {string} model - Model name
   * @param {Array<Object>} dataArray - Array of records to create
   * @returns {Promise<Array<Object>>} Array of created records
   */
  async addMany(model, dataArray) {
    const results = [];
    for (const data of dataArray) {
      const record = await this.add(model, data);
      results.push(record);
    }
    return results;
  }

  /**
   * Update an existing record (remote-first with queue)
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated record
   */
  async edit(model, id, data) {
    if (this.isOnline) {
      try {
        const record = await this.remote.edit(model, id, data);
        await this.local.edit(model, id, data);
        this.emitEvent("onEditRecord", { model, row: record });
        return record;
      } catch (error) {
        console.warn(`HybridDB: Remote update failed, queuing`, error);
      }
    }

    await this.local.edit(model, id, { ...data, _pending: true });
    this.queueWrite({ operation: "edit", model, id, data });

    return { id, ...data };
  }

  /**
   * Delete a record (remote-first with queue)
   * @param {string} model - Model name
   * @param {string|number} id - Record ID
   * @returns {Promise<boolean>} True if deleted
   */
  async remove(model, id) {
    if (this.isOnline) {
      try {
        await this.remote.remove(model, id);
        await this.local.remove(model, id);
        this.emitEvent("onRemoveRecord", { model, id });
        return true;
      } catch (error) {
        console.warn(`HybridDB: Remote delete failed, queuing`, error);
      }
    }

    await this.local.edit(model, id, { _deleted: true, _pending: true });
    this.queueWrite({ operation: "remove", model, id });

    return true;
  }

  /**
   * Count records matching criteria
   * @param {string} model - Model name
   * @param {Object} [options={}] - Query options (where clause)
   * @returns {Promise<number>}
   */
  async count(model, options = {}) {
    if (this.isOnline) {
      try {
        const remoteOptions = this.addUserScope(model, options);
        return await this.remote.count(model, remoteOptions);
      } catch (error) {
        console.warn(`HybridDB: Remote count failed, using local`, error);
      }
    }

    return await this.local.count(model, options);
  }

  /**
   * Execute operations in a transaction
   * @param {Function} callback - Async function to execute
   * @returns {Promise<*>}
   */
  async transaction(callback) {
    console.warn(
      "HybridDB: Transactions not fully supported, executing sequentially",
    );
    return callback(this);
  }

  /**
   * Initial sync: Download all user-scoped data from PocketBase
   * @returns {Promise<void>}
   * @private
   */
  async syncFromRemote() {
    console.log("HybridDB: Starting initial sync from remote...");

    for (const modelName of Object.keys(this.models)) {
      try {
        const options = this.addUserScope(modelName, {});
        const records = await this.remote.getAll(modelName, options);

        console.log(
          `HybridDB: Syncing ${records.length} ${modelName} records...`,
        );

        const localRecords = await this.local.getAll(modelName);
        for (const record of localRecords) {
          await this.local.remove(modelName, record.id);
        }

        if (records.length > 0) {
          await this.local.addMany(modelName, records);
        }
      } catch (error) {
        console.error(`HybridDB: Failed to sync ${modelName}`, error);
      }
    }

    console.log("HybridDB: Initial sync complete");
  }

  /**
   * Upload all local data to remote (local-wins strategy)
   * @returns {Promise<void>}
   * @private
   */
  async syncToRemote() {
    console.log("HybridDB: Starting upload sync to remote (local-wins)...");

    for (const modelName of Object.keys(this.models)) {
      try {
        const localRecords = await this.local.getAll(modelName);

        console.log(
          `HybridDB: Uploading ${localRecords.length} ${modelName} records...`,
        );

        if (localRecords.length === 0) continue;

        const remoteOptions = this.addUserScope(modelName, {});
        const remoteRecords = await this.remote.getAll(modelName, remoteOptions);
        const remoteIds = new Set(remoteRecords.map((r) => r.id));
        const localIds = new Set(localRecords.map((r) => r.id));

        for (const remoteRecord of remoteRecords) {
          if (!localIds.has(remoteRecord.id)) {
            await this.remote.remove(modelName, remoteRecord.id);
          }
        }

        for (const localRecord of localRecords) {
          const cleanRecord = { ...localRecord };
          delete cleanRecord._pending;
          delete cleanRecord._deleted;

          if (remoteIds.has(localRecord.id)) {
            await this.remote.edit(modelName, localRecord.id, cleanRecord);
          } else {
            await this.remote.add(modelName, cleanRecord);
          }
        }

        console.log(
          `HybridDB: Uploaded ${localRecords.length} ${modelName} records`,
        );
      } catch (error) {
        console.error(`HybridDB: Failed to upload ${modelName}`, error);
      }
    }

    console.log("HybridDB: Upload sync complete");
  }

  /**
   * Add user scope filter to queries
   * @param {string} model - Model name
   * @param {Object} options - Query options
   * @returns {Object} Options with user scope filter
   * @private
   */
  addUserScope(model, options) {
    if (!this.userId) return options;

    const modelSchema = this.models[model];
    const hasUserId = modelSchema?.userId;
    const hasCreatedBy = modelSchema?.createdBy;
    const userField = hasUserId ? "userId" : hasCreatedBy ? "createdBy" : null;

    if (!userField) return options;

    return {
      ...options,
      where: {
        ...options.where,
        [userField]: this.userId,
      },
    };
  }

  /**
   * Update local cache with remote records
   * @param {string} model - Model name
   * @param {Array<Object>} records - Records from remote
   * @returns {Promise<void>}
   * @private
   */
  async updateLocalCache(model, records) {
    for (const record of records) {
      try {
        const existing = await this.local.get(model, record.id);

        if (existing) {
          await this.local.edit(model, record.id, record);
        } else {
          await this.local.add(model, record);
        }
      } catch (error) {
        console.warn(
          `HybridDB: Failed to update cache for ${model}:${record.id}`,
          error,
        );
      }
    }
  }

  /**
   * Queue a write operation for later
   * @param {Object} operation - Operation to queue
   * @private
   */
  queueWrite(operation) {
    this.writeQueue.push({
      ...operation,
      timestamp: Date.now(),
    });
    this.persistQueue();
  }

  /**
   * Process queued writes when back online
   * @returns {Promise<void>}
   * @private
   */
  async processWriteQueue() {
    if (this.writeQueue.length === 0) return;

    console.log(
      `HybridDB: Processing ${this.writeQueue.length} queued operations...`,
    );

    const queue = [...this.writeQueue];
    this.writeQueue = [];

    for (const op of queue) {
      try {
        switch (op.operation) {
          case "add":
            await this.remote.add(op.model, op.data);
            await this.local.edit(op.model, op.data.id, { _pending: false });
            break;

          case "edit":
            await this.remote.edit(op.model, op.id, op.data);
            await this.local.edit(op.model, op.id, { _pending: false });
            break;

          case "remove":
            await this.remote.remove(op.model, op.id);
            await this.local.remove(op.model, op.id);
            break;
        }
      } catch (error) {
        console.error(`HybridDB: Failed to process queued operation`, error);
        this.writeQueue.push(op);
      }
    }

    this.persistQueue();
    console.log("HybridDB: Queue processing complete");
  }

  /**
   * Persist queue to localStorage
   * @private
   */
  persistQueue() {
    if (typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(
        `hybrid_queue_${this.name}`,
        JSON.stringify(this.writeQueue),
      );
    } catch (error) {
      console.warn("HybridDB: Failed to persist queue", error);
    }
  }

  /**
   * Load queue from localStorage
   * @private
   */
  loadQueue() {
    if (typeof localStorage === "undefined") return;

    try {
      const stored = localStorage.getItem(`hybrid_queue_${this.name}`);
      if (stored) {
        this.writeQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("HybridDB: Failed to load queue", error);
    }
  }

  /**
   * Generate optimistic ID for offline writes
   * @returns {number} Temporary ID
   * @private
   */
  generateOptimisticId() {
    return Number(`${Date.now()}${Math.random().toString(10).substr(2, 4)}`);
  }

  /**
   * Setup real-time subscriptions for automatic sync
   * @private
   */
  setupRealtimeSync() {
    for (const modelName of Object.keys(this.models)) {
      const unsubscribe = this.remote.subscribe(modelName, async (event) => {
        await this.handleRealtimeUpdate(modelName, event);
      });

      this.subscriptions.set(modelName, unsubscribe);
    }

    console.log("HybridDB: Real-time sync enabled");
  }

  /**
   * Handle real-time updates from PocketBase
   * @param {string} model - Model name
   * @param {Object} event - Real-time event
   * @private
   */
  async handleRealtimeUpdate(model, event) {
    try {
      switch (event.action) {
        case "create":
          await this.local.add(model, event.record);
          this.emitEvent("onAddRecord", { model, row: event.record });
          break;

        case "update":
          await this.local.edit(model, event.record.id, event.record);
          this.emitEvent("onEditRecord", { model, row: event.record });
          break;

        case "delete":
          await this.local.remove(model, event.record.id);
          this.emitEvent("onRemoveRecord", { model, id: event.record.id });
          break;
      }
    } catch (error) {
      console.warn(`HybridDB: Failed to handle real-time update`, error);
    }
  }

  /**
   * Handle coming back online
   * @private
   */
  async handleOnline() {
    console.log("HybridDB: Back online");
    this.isOnline = true;

    try {
      await this.remote.init();
    } catch (error) {
      console.error("HybridDB: Failed to reconnect", error);
      return;
    }

    await this.processWriteQueue();
    this.setupRealtimeSync();
  }

  /**
   * Handle going offline
   * @private
   */
  handleOffline() {
    console.log("HybridDB: Offline mode");
    this.isOnline = false;

    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Close connection and cleanup
   * @returns {Promise<void>}
   */
  async close() {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this._onlineHandler);
      window.removeEventListener("offline", this._offlineHandler);
    }

    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }

    await this.local.close();
    await this.remote.close();

    console.log("HybridDB: Connection closed");
  }

  /**
   * Export all data from local cache
   * @returns {Promise<Object>} Data dump object
   */
  async exportData() {
    return await this.local.exportData();
  }

  /**
   * Import data to both local and remote
   * @param {Object} dump - Data dump object
   * @param {Object} options - Import options
   * @returns {Promise<void>}
   */
  async importData(dump, options = {}) {
    await this.local.importData(dump, options);

    if (this.isOnline) {
      for (const [modelName, entries] of Object.entries(dump)) {
        for (const entry of entries) {
          await this.remote.add(modelName, entry).catch(console.warn);
        }
      }
    }
  }

  /**
   * Get system model manager from local adapter
   * @returns {Object|null}
   */
  getSystemModelManager() {
    return this.local.getSystemModelManager?.();
  }

  /**
   * Get adapter metadata
   * @returns {Object}
   */
  getMetadata() {
    return {
      name: this.constructor.name,
      type: "hybrid",
      version: this.version,
      models: Object.keys(this.models || {}),
      system: this.system,
      isOnline: this.isOnline,
      queuedOperations: this.writeQueue.length,
      local: this.local.getMetadata(),
      remote: this.remote.getMetadata(),
    };
  }
}

export default HybridAdapter;
