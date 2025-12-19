

export class DatabaseAdapterBase {
  constructor({ name, version, models, system, onConnected }) {
    this.name = name;
    this.version = version;
    this.models = models;
    this.system = system;
    this.onConnected = onConnected;
  }

  async init() {
    throw new Error("init() must be implemented by adapter");
  }

  async get(model, id, options = {}) {
    throw new Error("get() must be implemented by adapter");
  }

  async getAll(model, options = {}) {
    throw new Error("getAll() must be implemented by adapter");
  }

  async add(model, data) {
    throw new Error("add() must be implemented by adapter");
  }

  async addMany(model, dataArray) {
    const results = [];
    for (const data of dataArray) {
      results.push(await this.add(model, data));
    }
    return results;
  }

  async edit(model, id, data) {
    throw new Error("edit() must be implemented by adapter");
  }

  async remove(model, id) {
    throw new Error("remove() must be implemented by adapter");
  }

  async count(model, options = {}) {
    throw new Error("count() must be implemented by adapter");
  }

  async transaction(callback) {
    throw new Error("transaction() must be implemented by adapter");
  }

  async close() {
    throw new Error("close() must be implemented by adapter");
  }

  async exportData() {
    return {};
  }

  async importData(dump, options = {}) {}

  getSystemModelManager() {
    return null;
  }

  getMetadata() {
    return {
      name: this.constructor.name,
      type: "unknown",
      version: this.version,
      models: Object.keys(this.models || {}),
      system: this.system,
    };
  }

  // ============================================
  // Hook System - Call these from concrete adapters
  // ============================================

  async runBeforeAdd(model, data) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeAdd) {
      return await schema.$hooks.beforeAdd(data, {
        model,
        adapter: this,
        operation: "add",
      });
    }
    return data;
  }

  async runAfterAdd(model, result) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterAdd) {
      await schema.$hooks.afterAdd(result, {
        model,
        adapter: this,
        operation: "add",
      });
    }
    return result;
  }

  async runBeforeEdit(model, data) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeEdit) {
      return await schema.$hooks.beforeEdit(data, {
        model,
        adapter: this,
        operation: "edit",
      });
    }
    return data;
  }

  async runAfterEdit(model, result) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterEdit) {
      await schema.$hooks.afterEdit(result, {
        model,
        adapter: this,
        operation: "edit",
      });
    }
    return result;
  }

  async runBeforeRemove(model, id, record) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.beforeRemove) {
      const result = await schema.$hooks.beforeRemove(record, {
        model,
        adapter: this,
        operation: "remove",
        id,
      });
      // Return false to cancel deletion
      if (result === false) return false;
    }
    return true;
  }

  async runAfterRemove(model, id, record) {
    const schema = this.models?.[model];
    if (schema?.$hooks?.afterRemove) {
      await schema.$hooks.afterRemove(record, {
        model,
        adapter: this,
        operation: "remove",
        id,
      });
    }
  }

  stripImmutableFields(model, data) {
    const schema = this.models?.[model];
    if (!schema) return data;

    const result = { ...data };
    for (const [field, prop] of Object.entries(schema)) {
      if (field.startsWith("$")) continue; // Skip special keys like $hooks
      if (prop?.immutable && field in result && field !== "id") {
        delete result[field];
      }
    }
    return result;
  }
}

export function validateAdapter(adapter) {
  const requiredMethods = [
    "init",
    "get",
    "getAll",
    "add",
    "edit",
    "remove",
    "count",
    "transaction",
    "close",
  ];

  const missing = requiredMethods.filter(
    (method) => typeof adapter[method] !== "function",
  );

  if (missing.length > 0) {
    throw new Error(
      `Adapter ${adapter.constructor.name} is missing required methods: ${missing.join(", ")}`,
    );
  }

  return true;
}

export default DatabaseAdapterBase;
