/**
 * @file Component Loader (Core)
 * @description Handles dynamic loading, caching, registration of components,
 * and DOM observation.
 */

import View from "./index.js";

const Loader = {
  settings: {
    basePath: "/",
    modules: {},
    dev: false,
  },

  // Tag prefix to ignore (Server Side Generated)
  ssgTag: "ce-",

  /**
   * Configure the loader with app settings
   * @param {Object} config
   */
  configure(config) {
    Object.assign(Loader.settings, config || {});
  },

  /**
   * Registers a module and its components into the View registry.
   * Maps module component definitions to file paths.
   * @param {Object} module - The module object containing definition and path
   */
  addModule(module) {
    Loader.settings.modules[module.name] = module;
    if (!module.components) return;

    Object.entries(module.components).forEach(([name, value]) => {
      if (Array.isArray(value)) {
        value.forEach((componentName) => {
          const tag = `${module.name}-${componentName}`;
          const entry = View.components.get(tag) || {};
          entry.path = [module.path, module.name, name, componentName]
            .filter(Boolean)
            .join("/");
          View.components.set(tag, entry);
        });
      } else {
        const tag = `${module.name}-${name}`;
        const entry = View.components.get(tag) || {};
        const rootPath = module.root ? module.root.replace(/\/$/, "") : "";
        entry.path = [rootPath, module.path, module.name, name]
          .filter(Boolean)
          .join("/");
        View.components.set(tag, entry);
      }
    });
  },

  resolvePath(tagName) {
    const cached = View.components.get(tagName);
    if (cached?.path) return cached.path;
    const parts = tagName.split("-");
    const moduleName = parts[0];
    const module = Loader.settings.modules[moduleName];
    const componentName = parts.slice(1).join("-");
    return (
      module
        ? [module.path ?? moduleName, componentName]
        : [Loader.settings.basePath, tagName]
    )
      .filter(Boolean)
      .join("/");
  },

  /**
   * Loads the raw definition object from the file system
   */
  async loadDefinition(tag) {
    const cached = View.components.get(tag);
    if (cached?.definition) return cached.definition;

    const path = Loader.resolvePath(tag);
    const { default: definition } = await import(`${path}.js`);

    if (!definition)
      return console.warn(
        `[Loader] No default export found for component ${tag} at ${path}.js`,
      );

    const entry = View.components.get(tag) || {};
    entry.path = path;
    entry.definition = definition;
    View.components.set(tag, entry);
    return definition;
  },

  /**
   * Main orchestration method.
   * Loads definition, resolves parent (extends), builds class, and defines element.
   */
  async get(tag) {
    tag = tag.toLowerCase();
    if (customElements.get(tag)) {
      const cached = View.components.get(tag);
      if (!cached?._constructor) {
        const entry = View.components.get(tag) || {};
        entry._constructor = customElements.get(tag);
        View.components.set(tag, entry);
      }
      return View.components.get(tag)._constructor;
    }

    const cached = View.components.get(tag);
    if (cached?._constructor && !cached?.loadPromise)
      return cached._constructor;
    if (cached?.loadPromise) return cached.loadPromise;

    const loadPromise = (async () => {
      try {
        const definition = await Loader.loadDefinition(tag);
        if (!definition) throw new Error(`Definition for ${tag} not found.`);

        let BaseClass = View;
        let extendsTag =
          definition.extends ||
          (definition.prototype instanceof HTMLElement ? null : undefined);

        if (typeof definition === "function" && definition.extends)
          extendsTag = definition.extends;

        if (extendsTag) BaseClass = await Loader.get(extendsTag);

        const component = View.createClass(tag, definition, BaseClass);
        const entry = View.components.get(tag) || {};
        entry._constructor = component;
        View.components.set(tag, entry);
        if (BaseClass?.plugins)
          for (const { init } of BaseClass.plugins) {
            if (init && typeof init === "function")
              await init({ View, component, definition, tag });
          }

        if (!customElements.get(tag) || View.reloadComponents)
          customElements.define(tag, component);

        return component;
      } catch (error) {
        console.error(`[Loader] Failed to define component ${tag}:`, error);
        const entry = View.components.get(tag);
        if (entry) {
          delete entry.loadPromise;
          View.components.set(tag, entry);
        }
        return null;
      }
    })();

    const entry = View.components.get(tag) || {};
    entry.loadPromise = loadPromise;
    View.components.set(tag, entry);
    return loadPromise;
  },

  define(...args) {
    if (typeof args[0] === "string") {
      const tag = args[0].toLowerCase();
      const definition = args[1];
      const entry = View.components.get(tag) || {};
      entry.definition = definition;
      View.components.set(tag, entry);

      if (!Loader.settings.dev) {
        Loader.get(tag).catch((e) =>
          console.error(
            `[Loader] Error during manual definition for ${tag}:`,
            e,
          ),
        );
      }
    } else if (typeof args[0] === "object" && args[0] !== null) {
      Object.entries(args[0]).forEach(([tag, definition]) =>
        Loader.define(tag, definition),
      );
    }
  },

  /**
   * Scans a root element for undefined custom elements and loads them.
   */
  async traverseDOM(rootElement = document.body) {
    if (!rootElement || typeof rootElement.querySelectorAll !== "function")
      return;
    const undefinedElements = rootElement.querySelectorAll(":not(:defined)");
    const tagsToProcess = new Set();

    undefinedElements.forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName.includes("-") && !tagName.startsWith(Loader.ssgTag))
        tagsToProcess.add(tagName);
    });

    await Promise.allSettled(
      Array.from(tagsToProcess).map((tag) => Loader.get(tag)),
    );
  },

  /**
   * Sets up a MutationObserver to detect new elements added to the DOM.
   */
  observeDOMChanges() {
    const observer = new MutationObserver(async (mutationsList) => {
      const tagsToProcess = new Set();
      for (const mutation of mutationsList) {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
          continue;
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const processNode = (el) => {
            const tagName = el.tagName.toLowerCase();
            const cached = View.components.get(tagName);
            if (
              tagName.includes("-") &&
              !customElements.get(tagName) &&
              !cached?.loadPromise
            )
              tagsToProcess.add(tagName);
          };
          processNode(node);
          if (typeof node.querySelectorAll === "function")
            node.querySelectorAll(":not(:defined)").forEach(processNode);
        });
      }
      if (tagsToProcess.size > 0)
        await Promise.allSettled(
          Array.from(tagsToProcess).map((tag) => Loader.get(tag)),
        );
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },

  /**
   * Convenience initializer for the DOM
   */
  initDOM() {
    Loader.traverseDOM(document.body);
    Loader.observeDOMChanges();
  },
};

const getComponentPath = (tag) => {
  return View.components.get(tag)?.path || Loader.resolvePath(tag);
};

View.getComponentPath = getComponentPath;

export default Loader;
