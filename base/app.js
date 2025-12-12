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
const ObjectStorageFunctions = {
  set: function (...args) {
    if (args.length === 1 && typeof args[0] === "object" && args[0] !== null)
      Object.entries(args[0]).forEach(([k, v]) => {
        this[k] =
          !Array.isArray(this[k]) &&
          typeof this[k] === "object" &&
          typeof v === "object"
            ? { ...this[k], ...v }
            : v;
      });
    if (args.length === 2 && typeof args[0] === "string")
      this[args[0]] = args[1];
    return this;
  },
  get: function (...args) {
    const [key1, key2] = args;
    if (args.length === 0) return undefined;
    if (args.length === 2) return this[key1]?.[key2];
    return this[key1];
  },
  remove: function (...args) {
    args.length === 2 ? delete this[args[0]][args[1]] : delete this[args[0]];
    return this;
  },
  keys: function () {
    return Object.keys(this);
  },
};
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

const installModulePrototype = (base) => {
  if (base instanceof Set || base instanceof Map || Array.isArray(base)) return;
  if (!base) base = {};
  const proto = Object.create(Object.getPrototypeOf(base));
  Object.assign(proto, ObjectStorageFunctions);
  Object.setPrototypeOf(base, proto);
  return base;
};

const coreModules = {
  events: createEventHandler({}),
  app: {},
  assetFiles: new Set(),
  components: {},
  data: {},
  devFiles: new Set(),
  error: console.error,
  fs: fs,
  log: console.log,
  models: {},
  modules: {},
  routes: {},
  settings: {
    base: {
      runtime,
      dev: true,
      backend: false,
      frontend: true,
      basePath: "",
    },
    events: ({ context }) => ({
      moduleAdded({ module }) {
        if (module.settings) context[module.name] = module.settings;
      },
    }),
  },
};

if (runtime === "frontend") {
  coreModules.routes = {};
  coreModules.icons = {
    alias: "Icons",
    base: new Map(Object.entries(globalThis.__icons || {})),
  };
  coreModules.theme = {
    base: {
      font: {
        icon: {
          family: "lucide",
        },
      },
    },
    events: ({ context }) => ({
      moduleAdded({ module }) {
        if (module.theme) context[module.name] = module.theme;
      },
    }),
  };
}

const prototypeAPP = {
  async load(production) {
    try {
      const response = await fetch("/package.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const appConfig = await response.json();
      await this.bootstrap({ ...appConfig, production });
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
      frontend: !backend,
      production,
      dev: !production,
    }))
      this.settings.set(key, value);
    if (!backend && theme) this.theme.set(theme);
    try {
      await import("/index.js");
      await import(
        backend ? "/$app/base/backend/backend.js" : "/$app/base/frontend.js"
      );
      await this.events.emit("APP:INIT");
    } catch (error) {
      console.warn(error);
    }
    return this;
  },
  addModule(module) {
    if (
      (module.dev && this.settings.dev !== true) ||
      !!this?.modules?.[module.name]
    )
      return;
    if (!module.base) module.base = {};
    const { alias, name, events } = module;
    const base = module.base ?? this[name];
    if (this.modules && !this.modules[name]) this.modules.set(name, module);
    installModulePrototype(base);
    this[name] = base;
    if (alias) this[alias] = base;
    if (events)
      Object.entries(
        typeof events === "function"
          ? events({ $APP: this, context: base })
          : events,
      ).map(([name, fn]) => this.events.on(name, fn));
    this.events
      .get("moduleAdded")
      .map((fn) => fn.bind(this[module.name])({ module }));

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
export default $APP;
