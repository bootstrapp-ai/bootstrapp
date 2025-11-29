/**
 * @file Component Loader
 * @description Handles dynamic loading, caching, and registration of components.
 * Connects the loading logic to the View class.
 */

import logger from "/app/logger.js";
import View from "/app/view";
import $APP from "../app.js";

/**
 * Shared registry for components.
 * We overwrite View.components with this registry so both the Loader
 * and the View class (for styles) share the same source of truth.
 */
const components = new Map();

const ssgTag = "ce-";

/**
 * Component Loader Closure
 * Handles file resolution, fetching, caching, and registration orchestration.
 */
const Loader = {
  components,
  /**
   * Resolves the file path for a component based on its tag name
   * @param {string} tagName
   * @returns {string}
   */
  resolvePath(tagName) {
    const cached = components.get(tagName);
    if (cached?.path) return cached.path;
    const parts = tagName.split("-");
    const moduleName = parts[0];
    const module = $APP.modules[moduleName];
    const componentName = parts.slice(1).join("-");

    return (
      module
        ? [module.path ?? moduleName, componentName]
        : [$APP.settings.basePath, tagName]
    )
      .filter(Boolean)
      .join("/");
  },

  /**
   * Loads the raw definition object from the file system
   * @param {string} tag
   * @returns {Promise<Object>}
   */
  async loadDefinition(tag) {
    const cached = components.get(tag);
    if (cached?.definition) return cached.definition;

    const path = Loader.resolvePath(tag);
    const { default: definition } = await import(`${path}.js`);

    if (!definition)
      return console.warn(
        `[Loader] No default export found for component ${tag} at ${path}.js`,
      );

    const entry = components.get(tag) || {};
    entry.path = path;
    entry.definition = definition;
    components.set(tag, entry);
    return definition;
  },

  /**
   * Main orchestration method.
   * Loads definition, resolves parent (extends), builds class, and defines element.
   * @param {string} tag
   * @returns {Promise<typeof View>}
   */
  async get(tag) {
    tag = tag.toLowerCase();
    // 1. Check CustomElements Registry
    if (customElements.get(tag)) {
      const cached = components.get(tag);
      if (!cached?._constructor) {
        const entry = components.get(tag) || {};
        entry._constructor = customElements.get(tag);
        components.set(tag, entry);
      }
      return components.get(tag)._constructor;
    }

    const cached = components.get(tag);
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
        const entry = components.get(tag) || {};
        entry._constructor = component;
        components.set(tag, entry);
        for (const { init } of BaseClass.plugins) {
          if (init && typeof init === "function")
            await init({ View, component, definition, tag });
        }
        if (!customElements.get(tag) || View.reloadComponents)
          customElements.define(tag, component);
        return component;
      } catch (error) {
        console.error(`[Loader] Failed to define component ${tag}:`, error);
        const entry = components.get(tag);
        if (entry) {
          delete entry.loadPromise;
          components.set(tag, entry);
        }
        return null;
      }
    })();

    const entry = components.get(tag) || {};
    entry.loadPromise = loadPromise;
    components.set(tag, entry);
    return loadPromise;
  },

  /**
   * Defines components manually
   */
  define(...args) {
    if (typeof args[0] === "string") {
      const tag = args[0].toLowerCase();
      const definition = args[1];
      const entry = components.get(tag) || {};
      entry.definition = definition;
      components.set(tag, entry);

      // Trigger loading mechanism
      if (!$APP.settings.dev) {
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
};

// --- DOM Auto-Discovery Logic ---

const traverseDOM = async (rootElement = document.body) => {
  if (!rootElement || typeof rootElement.querySelectorAll !== "function")
    return;
  const undefinedElements = rootElement.querySelectorAll(":not(:defined)");
  const tagsToProcess = new Set();
  undefinedElements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    if (tagName.includes("-") && !tagName.startsWith(ssgTag))
      tagsToProcess.add(tagName);
  });
  await Promise.allSettled(
    Array.from(tagsToProcess).map((tag) => Loader.get(tag)),
  );
};

const observeDOMChanges = () => {
  const observer = new MutationObserver(async (mutationsList) => {
    const tagsToProcess = new Set();
    for (const mutation of mutationsList) {
      if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
        continue;
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const processNode = (el) => {
          const tagName = el.tagName.toLowerCase();
          const cached = components.get(tagName);
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
};

const init = () => {
  traverseDOM(document.body);
  observeDOMChanges();
};

if ($APP.settings.dev) $APP.events.on("APP:INIT", init);
$APP.events.on("APP:READY", init);
$APP.events.set({
  moduleAdded({ module }) {
    if (module.components) {
      Object.entries(module.components).forEach(([name, value]) => {
        if (Array.isArray(value)) {
          value.forEach((componentName) => {
            const tag = `${module.name}-${componentName}`;
            const entry = components.get(tag) || {};
            entry.path = [module.path, module.name, name, componentName]
              .filter(Boolean)
              .join("/");
            components.set(tag, entry);
          });
        } else {
          const tag = `${module.name}-${name}`;
          const entry = components.get(tag) || {};
          const rootPath = module.root ? module.root.replace(/\/$/, "") : "";
          entry.path = [rootPath, module.path, module.name, name]
            .filter(Boolean)
            .join("/");
          if (logger) logger.debug("Registered component", { tag, entry });
          components.set(tag, entry);
        }
      });
    }
  },
});

$APP.define = Loader.define;

export default Loader;
