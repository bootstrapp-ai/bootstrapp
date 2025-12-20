import View from "./index.js";

// Initialize from production component map if available
// This is injected into index.html by the bundler at build time
if (typeof window !== "undefined" && window.__COMPONENT_MAP__) {
  for (const [tag, path] of Object.entries(window.__COMPONENT_MAP__)) {
    View.components.set(tag, { path });
  }
}

const Loader = {
  settings: {
    basePath: "/",
    modules: {},
    dev: false,
  },

  // Component mappings from package.json discovery
  // Format: { prefix: { folders: [...], base: "..." } }
  componentMappings: {},

  ssgTag: "ce-",

  configure(config) {
    Object.assign(Loader.settings, config || {});
  },

  /**
   * Initialize component mappings from package.json discovery
   * @param {Object} mappings - { prefix: { folders: [...], base: "..." } }
   */
  initMappings(mappings) {
    Loader.componentMappings = mappings;
  },

  /**
   * Register a module (for non-component features like i18n, events, base)
   * Component paths now come from package.json discovery
   */
  addModule(module) {
    Loader.settings.modules[module.name] = module;
    // Component paths come from package.json discovery now
    // addModule only handles module-level config (i18n, base, events, etc.)
  },

  /**
   * Resolve tag name to component path using package.json mappings
   */
  resolvePath(tagName) {
    // Check cache first
    const cached = View.components.get(tagName);
    if (cached?.path) return cached.path;

    // Extract prefix and component name
    const parts = tagName.split("-");
    const prefix = parts[0];
    const componentName = parts.slice(1).join("-");

    // Look up in componentMappings
    const mapping = Loader.componentMappings[prefix];
    if (!mapping) {
      console.warn(`[Loader] No component mapping for prefix: ${prefix}`);
      return null;
    }

    // New format: direct path lookup
    if (mapping.paths) {
      const relativePath = mapping.paths[componentName];
      if (relativePath) {
        return `${mapping.base}${relativePath}`;
      }
      console.warn(`[Loader] Component '${componentName}' not found in ${prefix} mappings`);
      return null;
    }

    // Legacy format: return first folder (loadDefinition will try others)
    if (mapping.folders) {
      const folder = mapping.folders[0];
      return `${mapping.base}${folder}${componentName}`;
    }

    return null;
  },

  /**
   * Load component definition
   */
  async loadDefinition(tag) {
    const cached = View.components.get(tag);
    if (cached?.definition) return cached.definition;

    // If we have a cached path (from production map or previous load), use it directly
    if (cached?.path) {
      try {
        const { default: definition } = await import(`${cached.path}.js`);
        if (definition) {
          cached.definition = definition;
          View.components.set(tag, cached);
          return definition;
        }
      } catch (err) {
        console.error(`[Loader] Failed to load ${tag} from cached path:`, cached.path, err);
        throw err;
      }
    }

    // Extract prefix and component name
    const parts = tag.split("-");
    const prefix = parts[0];
    const componentName = parts.slice(1).join("-");
    const mapping = Loader.componentMappings[prefix];

    if (!mapping) {
      console.error(`[Loader] No mapping for prefix: ${prefix}`);
      return null;
    }

    // New format: direct path lookup (single fetch, no 404s)
    if (mapping.paths) {
      const relativePath = mapping.paths[componentName];
      if (!relativePath) {
        console.error(`[Loader] Component '${componentName}' not found in ${prefix} mappings`);
        return null;
      }

      const path = `${mapping.base}${relativePath}`;
      try {
        const { default: definition } = await import(`${path}.js`);
        if (definition) {
          const entry = View.components.get(tag) || {};
          entry.path = path;
          entry.definition = definition;
          View.components.set(tag, entry);
          return definition;
        }
      } catch (err) {
        console.error(`[Loader] Failed to load ${tag} from ${path}:`, err);
        throw err;
      }
    }

    // Legacy format: try each folder until we find the component
    if (mapping.folders) {
      let lastError;
      for (const folder of mapping.folders) {
        const path = `${mapping.base}${folder}${componentName}`;
        try {
          const { default: definition } = await import(`${path}.js`);
          if (definition) {
            const entry = View.components.get(tag) || {};
            entry.path = path;
            entry.definition = definition;
            View.components.set(tag, entry);
            return definition;
          }
        } catch (err) {
          lastError = err;
          // Try next folder
        }
      }
      console.error(`[Loader] Component ${tag} not found in any folder:`, mapping.folders);
      if (lastError) throw lastError;
    }

    return null;
  },

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
