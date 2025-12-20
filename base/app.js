import createEventHandler from "/$app/events/index.js";

const runtime = (() => {
  if (
    typeof ServiceWorkerGlobalScope !== "undefined" &&
    globalThis instanceof ServiceWorkerGlobalScope
  )
    return "serviceworker";

  if (
    typeof WorkerGlobalScope !== "undefined" &&
    globalThis instanceof WorkerGlobalScope
  )
    return "worker";
  return "frontend";
})();

globalThis.sleep = (ms = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a collection with .set()/.get()/.remove()/.keys() methods
 * while allowing direct property access via Proxy.
 * Replaces the old prototype-based ObjectStorageFunctions approach.
 */
function createCollection(initial = {}) {
  const data = { ...initial };

  // Deep merge helper - merges objects, replaces arrays/primitives
  const deepMerge = (target, source) => {
    if (!target || typeof target !== "object" || Array.isArray(target))
      return source;
    if (!source || typeof source !== "object" || Array.isArray(source))
      return source;
    return { ...target, ...source };
  };

  const handler = {
    get(target, prop) {
      // Collection methods
      if (prop === "set") {
        return (...args) => {
          if (
            args.length === 1 &&
            typeof args[0] === "object" &&
            args[0] !== null
          ) {
            for (const [k, v] of Object.entries(args[0])) {
              data[k] = deepMerge(data[k], v);
            }
          } else if (args.length === 2 && typeof args[0] === "string") {
            data[args[0]] = args[1];
          }
          return proxy;
        };
      }
      if (prop === "get")
        return (k, n) => (n !== undefined ? data[k]?.[n] : data[k]);
      if (prop === "remove") {
        return (...args) => {
          if (args.length === 2) delete data[args[0]]?.[args[1]];
          else delete data[args[0]];
          return proxy;
        };
      }
      if (prop === "keys") return () => Object.keys(data);
      if (prop === "values") return () => Object.values(data);
      if (prop === "entries") return () => Object.entries(data);
      if (prop === "has") return (k) => k in data;
      if (prop === "_isCollection") return true;
      if (prop === "_data") return data;

      // Direct property access: $APP.models.users
      return data[prop];
    },

    set(target, prop, value) {
      data[prop] = value;
      return true;
    },

    has(target, prop) {
      return (
        prop in data ||
        ["set", "get", "remove", "keys", "values", "entries", "has"].includes(
          prop,
        )
      );
    },

    ownKeys() {
      return Reflect.ownKeys(data);
    },

    getOwnPropertyDescriptor(target, prop) {
      if (prop in data) {
        return { enumerable: true, configurable: true, value: data[prop] };
      }
      return undefined;
    },
  };

  const proxy = new Proxy({}, handler);
  return proxy;
}
const fs = {
  async fetchResource(path, handleResponse, extension) {
    try {
      const response = await fetch(path);
      this[path] = {
        path,
        extension,
      };
      if (response.ok) return await handleResponse(response);
    } catch (error) {
      console.warn(`Resource not found at: ${path}`, error);
    }
    return null;
  },
  text(path) {
    return fs.fetchResource(path, (res) => res.text(), "text");
  },
  json(path) {
    return fs.fetchResource(path, (res) => res.json(), "json");
  },
  getFilePath(file) {
    return `${$APP.settings.basePath}${file.startsWith("/") ? file : `/${file}`}`;
  },
  getRequestPath(urlString) {
    const url = new URL(urlString);
    return url.pathname + url.search;
  },
};

const coreModules = {
  events: createEventHandler({}),
  app: {},
  assetFiles: new Set(),
  components: createCollection(),
  data: createCollection(),
  devFiles: new Set(),
  error: console.error,
  fs: fs,
  log: console.log,
  models: createCollection(),
  modules: createCollection(),
  routes: createCollection(),
  settings: {
    base: createCollection({
      runtime,
      dev: true,
      backend: false,
      frontend: true,
      basePath: "",
    }),
    events: ({ context }) => ({
      moduleAdded({ module }) {
        if (module.settings) context[module.name] = module.settings;
      },
    }),
  },
};

if (runtime === "frontend") {
  coreModules.icons = {
    alias: "Icons",
    base: new Map(Object.entries(globalThis.__icons || {})),
  };
  coreModules.theme = {
    base: createCollection({
      font: {
        icon: {
          family: "lucide",
        },
      },
    }),
    events: ({ context }) => ({
      moduleAdded({ module }) {
        if (module.theme) context[module.name] = module.theme;
      },
    }),
  };
}

const prototypeAPP = {
  async load(production, backend = false) {
    try {
      const response = await fetch("/package.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const appConfig = await response.json();
      this._packageJson = appConfig;
      await this.bootstrap({ ...appConfig, production, backend });
    } catch (error) {
      console.error("Could not load 'package.json'. Bootstrap failed.", {
        error,
      });
    }
  },
  async bootstrap({
    backend = false,
    production = false,
    settings = {},
    theme,
  } = {}) {
    for (const [key, value] of Object.entries({
      ...settings,
      backend,
      runtime,
      frontend: !backend,
      production,
      dev: !production,
    }))
      this.settings.set(key, value);
    if (!backend && theme) this.theme.set(theme);
    try {
      await import("/index.js");
      await this.loadModuleSchemas();
      await this.loadModuleData();
      await import(
        backend ? "/$app/base/backend/backend.js" : "/$app/base/frontend.js"
      );
      await this.events.emit("APP:INIT");
    } catch (error) {
      console.warn(error);
    }
    return this;
  },
  async loadModuleSchemas() {
    if (!this._packageJson) return;

    const { discoverSchemaModules, namespaceModels } = await import(
      "/$app/model/schema-loader.js"
    );

    // Load package schemas
    const modules = await discoverSchemaModules(this._packageJson);
    for (const mod of modules) {
      try {
        const schemaPath = `/node_modules/${mod.packageName}/models/schema.js`;
        const schemaModule = await import(schemaPath);
        const models = schemaModule.default;

        if (models) {
          const namespace = mod.namespace ? mod.name : null;
          const namespacedModels = namespaceModels(models, namespace);
          this.models.set(namespacedModels);
          this.log?.(
            `Loaded schema from ${mod.packageName}` +
              (namespace ? ` (namespace: ${namespace}_*)` : ""),
          );
        }
      } catch (e) {
        console.warn(`Failed to load schema from ${mod.packageName}:`, e);
      }
    }

    // Load project schema (supports both default export and legacy $APP.models.set)
    try {
      const projectSchema = await import("/models/schema.js");
      if (projectSchema.default) {
        // New pattern: export default {}
        this.models.set(projectSchema.default);
        this.log?.("Loaded project schema from /models/schema.js");
      }
      // else: legacy pattern already called $APP.models.set()
    } catch (e) {
      // No project schema found, that's ok
    }
  },
  async loadModuleData() {
    if (!this._packageJson) return;

    const { discoverSchemaModules, namespaceData } = await import(
      "/$app/model/schema-loader.js"
    );

    // Load package seed data
    const modules = await discoverSchemaModules(this._packageJson);
    for (const mod of modules) {
      try {
        const seedPath = `/node_modules/${mod.packageName}/models/seed.js`;
        const seedModule = await import(seedPath);
        const data = seedModule.default;

        if (data) {
          const namespace = mod.namespace ? mod.name : null;
          const namespacedData = namespaceData(data, namespace);
          this.data.set(namespacedData);
          this.log?.(
            `Loaded seed data from ${mod.packageName}` +
              (namespace ? ` (namespace: ${namespace}_*)` : ""),
          );
        }
      } catch (e) {
        // seed.js is optional, don't warn if not found
        if (!e.message?.includes("Failed to fetch")) {
          console.warn(`Failed to load seed from ${mod.packageName}:`, e);
        }
      }
    }

    // Load project seed data (supports both default export and legacy $APP.data.set)
    try {
      const projectSeed = await import("/models/seed.js");
      if (projectSeed.default) {
        // New pattern: export default {}
        this.data.set(projectSeed.default);
        this.log?.("Loaded project seed from /models/seed.js");
      }
      // else: legacy pattern already called $APP.data.set()
    } catch (e) {
      // No project seed found, that's ok
    }
  },
  addModule(module) {
    // Skip if dev-only module in production, or already registered
    if (module.dev && !this.settings.dev) return;
    if (this.modules?.has(module.name)) return;

    const { alias, name, events, base = {} } = module;

    // Register the module - no prototype manipulation!
    this.modules?.set(name, module);
    this[name] = base;
    if (alias) this[alias] = base;

    // Register event handlers
    if (events) {
      const handlers =
        typeof events === "function"
          ? events({ $APP: this, context: base })
          : events;
      for (const [eventName, fn] of Object.entries(handlers)) {
        this.events.on(eventName, fn);
      }
    }

    // Emit moduleAdded event
    const moduleAddedHandlers = this.events.get("moduleAdded") || [];
    for (const fn of moduleAddedHandlers) {
      fn.call(base, { module });
    }

    if (this.log) this.log(`Module '${module.name}' added successfully`);
    return base;
  },
};

const $APP = Object.create(prototypeAPP);

for (const [name, base = {}] of Object.entries(coreModules))
  $APP.addModule({
    name,
    ...(base.base ? base : { base }),
  });
globalThis.$APP = $APP;
export { createCollection };
export default $APP;
