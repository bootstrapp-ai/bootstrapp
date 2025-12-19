import T from "/$app/types/index.js";
import { render } from "/npm/lit-html";

const SANITIZE_KEYS = ["__proto__", "constructor", "prototype"];
const KNOWN_DEFINITION_KEYS = new Set([
  "properties",
  "icons",
  "static",
  "formAssociated",
  "dataQuery",
  "style",
  "css",
  "connected",
  "disconnected",
  "shadow",
  "willUpdate",
  "firstUpdated",
  "updated",
  "dataLoaded",
  "class",
  "role",
  "tag",
]);

export const settings = {};

class View extends HTMLElement {
  static properties = {};
  static components = new Map();
  static _attrs = {};
  static plugins = [];
  static shadowStylesInjected = new WeakMap();

  state = {};
  hasUpdated = false;
  _ignoreAttributeChange = false;
  _changedProps = new Map();
  _updatePromise = null;

  static createClass(tag, definition, BaseClass) {
    BaseClass ||= View;
    if (typeof definition === "function") {
      const renderFn = definition;
      const properties = renderFn.properties || {};
      definition = {
        properties,
        render() {
          return renderFn.call(this, this);
        },
      };
    }

    const {
      properties = {},
      icons,
      static: staticProps,
      formAssociated = false,
      dataQuery = false,
      style = false,
      css,
      connected,
      disconnected,
      shadow,
      willUpdate,
      firstUpdated,
      updated,
      dataLoaded,
      class: klass,
      role,
    } = definition;

    const prototypeMethods = {};
    for (const key of Object.keys(definition)) {
      if (KNOWN_DEFINITION_KEYS.has(key)) continue;
      if (SANITIZE_KEYS.includes(key)) continue;

      const descriptor = Object.getOwnPropertyDescriptor(definition, key);
      Object.defineProperty(prototypeMethods, key, descriptor);
    }

    const methodKeysToBind = Object.keys(prototypeMethods);
    const mergedPlugins = new Map();
    [...View.plugins, ...BaseClass.plugins].forEach((plugin) => {
      mergedPlugins.set(plugin.name, plugin);
    });
    const finalPlugins = [...mergedPlugins.values()];

    const component = class extends BaseClass {
      static icons = icons;
      static style = style;
      static css = css;
      static dataQuery = dataQuery;
      static formAssociated = formAssociated;
      static shadow = shadow ?? BaseClass.shadow;
      static plugins = finalPlugins;
      static _classTags = (() => {
        const tags = [];
        let proto = BaseClass;
        while (proto?.tag) {
          tags.unshift(proto.tag);
          proto = Object.getPrototypeOf(proto);
        }
        tags.push(tag);
        return tags;
      })();

      constructor() {
        super();
        methodKeysToBind.forEach((key) => {
          // This relies on the keys in prototypeMethods being safe (fixed above)
          if (typeof this[key] === "function") this[key] = this[key].bind(this);
        });

        if (klass) this.classList.add(...klass.split(" "));
        if (role) this.setAttribute("role", role);
      }

      static get observedAttributes() {
        return Object.keys(component.properties).filter(
          (key) => component.properties[key].attribute !== false,
        );
      }

      static properties = (() => {
        const baseProperties = BaseClass.properties || {};
        const merged = { ...baseProperties };

        // SECURITY FIX 2: Filter properties keys to prevent pollution during merge
        for (const key of Object.keys(properties)) {
          if (SANITIZE_KEYS.includes(key)) {
            // Skip keys that can access the prototype chain
            continue;
          }

          const config = properties[key];
          if (config.type === "object" && config.properties)
            config.properties = merged[key]?.properties
              ? {
                  ...merged[key]?.properties,
                  ...config.properties,
                }
              : config.properties;
          merged[key] = merged[key]
            ? { ...merged[key], ...config }
            : { ...config };
        }
        return merged;
      })();
    };

    if (staticProps && typeof staticProps === "object") {
      Object.assign(component, staticProps);
    }

    Object.defineProperty(component, "name", { value: tag });

    for (const [key, prop] of Object.entries(component.properties)) {
      const { type, sync, attribute, setter, getter } = prop;
      if (sync) continue;

      if (Object.hasOwn(component.prototype, key)) continue;

      Object.defineProperty(component.prototype, key, {
        configurable: true,
        enumerable: true,
        get: getter
          ? function () {
              return getter.call(this);
            }
          : function () {
              return this.state[key];
            },
        set: setter
          ? function (value) {
              setter.call(this, value);
            }
          : function (value) {
              const oldValue = this.state[key];
              if (oldValue === value) return;
              this.state[key] = value;
              if (attribute) {
                this.updateAttribute({
                  key,
                  value,
                  skipPropUpdate: true,
                  type,
                });
              }
              this.requestUpdate(key, oldValue);
            },
      });
    }
    // Copy prototype methods to component, preserving getters/setters
    for (const key of Object.keys(prototypeMethods)) {
      // Skip if it collides with a reactive property
      if (Object.hasOwn(component.properties, key)) continue;

      const descriptor = Object.getOwnPropertyDescriptor(prototypeMethods, key);

      // If it's a getter/setter, define it properly
      if (descriptor.get || descriptor.set) {
        Object.defineProperty(component.prototype, key, {
          configurable: true,
          enumerable: true,
          get: descriptor.get,
          set: descriptor.set,
        });
      } else {
        // Regular method/property - just assign
        component.prototype[key] = descriptor.value;
      }
    }

    component.tag = tag;
    component._attrs = Object.fromEntries(
      Object.keys(component.properties).map((prop) => [
        prop.toLowerCase(),
        prop,
      ]),
    );

    component.plugins = [
      ...component.plugins.filter(
        (plugin) => !plugin.test || plugin.test({ component: component }),
      ),
    ];

    component.plugins.push({
      events: { connected, disconnected, willUpdate, firstUpdated, updated, dataLoaded },
      name: "base",
    });

    return component;
  }

  static define(tag, definition) {
    if (tag === "app-template") console.error({ tag, definition });
    const component = View.createClass(tag, definition);
    if (!customElements.get(tag)) customElements.define(tag, component);
    return component;
  }

  on(eventName, listener) {
    if (typeof listener !== "function")
      return console.error(
        `Error adding listener to ${eventName}: callback is not a function.`,
      );

    if (eventName.includes("#")) {
      const [selector, eventType] = eventName.split("#");
      const delegatedListener = (event) => {
        const target = event.target.closest(selector);
        if (target && this.contains(target)) listener(event);
      };
      this.addEventListener(eventType, delegatedListener);
      return delegatedListener;
    }
    const wrapper = ({ detail }) => {
      listener(detail);
    };
    this.addEventListener(eventName, wrapper);
    return wrapper;
  }

  off(eventName, listener) {
    if (eventName.includes("#")) {
      const [, eventType] = eventName.split("#");
      this.removeEventListener(eventType, listener);
    } else this.removeEventListener(eventName, listener);
  }

  emit(eventName, data) {
    const event = new CustomEvent(eventName, {
      detail: data,
    });
    this.dispatchEvent(event);
  }

  $ = (element) => this.querySelector(element);
  $$ = (element) => this.querySelectorAll(element);

  connectedCallback() {
    if (this.constructor.shadow) {
      const shadowRoot = this._ensureShadowRoot();
      if (this.constructor.css) {
        if (!shadowRoot.querySelector("style[data-component-style]")) {
          const style = document.createElement("style");
          style.setAttribute("data-component-style", "");
          style.textContent = this.constructor.css;
          shadowRoot.prepend(style);
        }
      }
    }
    if (this.constructor.properties) this.initProps();
    if (this.constructor._classTags.length > 0)
      this.classList.add(...this.constructor._classTags);

    for (const plugin of this.constructor.plugins) {
      const { events = {} } = plugin;
      Object.entries(events).map(
        ([event, fn]) => fn && this.on(event, fn.bind(this)),
      );
    }
    this.emit("connected", {
      instance: this,
      component: this.constructor,
      tag: this.constructor.tag,
    });

    this.requestUpdate();
  }

  disconnectedCallback() {
    this.emit("disconnected", {
      instance: this,
      component: this.constructor,
      tag: this.constructor.tag,
    });
  }

  initProps() {
    for (const attr of this.attributes) {
      const key = this.constructor._attrs[attr.name];
      const prop = this.constructor.properties[key];
      if (prop && prop.type !== "boolean" && attr.value === "") {
        this.removeAttribute(attr.name);
        continue;
      }
      if (key) {
        this.state[key] = prop
          ? T.parse(attr.value, { ...prop, attribute: true })
          : attr.value;
      }
    }

    for (const [key, prop] of Object.entries(this.constructor.properties)) {
      const { type, sync, defaultValue, attribute } = prop;
      if (sync) continue;
      if (Object.hasOwn(this, key)) {
        const value = this[key];
        delete this[key];
        this[key] = value;
        continue;
      }

      this.state[key] ??= defaultValue;

      const value = this.state[key];
      const isComplex = ["array", "object", "function"].includes(type);

      if (
        attribute &&
        value !== undefined &&
        !this.hasAttribute(key) &&
        !isComplex
      ) {
        this.updateAttribute({
          key,
          value,
          skipPropUpdate: true,
          type,
        });
      }

      this._changedProps.set(key, undefined);
    }
  }

  requestUpdate(key, oldValue) {
    if (key) this._changedProps.set(key, oldValue);

    if (this._updatePromise) return this._updatePromise;

    this._updatePromise = this.enqueueUpdate();
    return this._updatePromise;
  }

  async enqueueUpdate() {
    await Promise.resolve();
    const result = this.performUpdate(false);
    this._updatePromise = null;
    return result;
  }

  performUpdate(forceUpdate) {
    const changedProps = this._changedProps;

    if (this.hasUpdated && !forceUpdate && !this.shouldUpdate(changedProps))
      return;
    this.emit("willUpdate", {
      changedProps,
      instance: this,
      component: this.constructor,
    });
    this.update(changedProps);
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.emit("firstUpdated", {
        changedProps,
        instance: this,
        component: this.constructor,
      });
    }
    this.emit("updated", {
      changedProps,
      instance: this,
      component: this.constructor,
    });
    this._changedProps = new Map();
  }

  shouldUpdate(_changedProps) {
    const changedProps = new Map(_changedProps);
    if (!this.hasUpdated) return true;
    for (const [key, oldValue] of changedProps) {
      const newValue = this[key];
      const prop = this.constructor.properties[key];
      const hasChanged = prop?.hasChanged
        ? prop.hasChanged(newValue, oldValue)
        : oldValue !== newValue;
      if (!hasChanged) changedProps.delete(key);
      else
        this.emit(`${key}Changed`, {
          oldValue,
          value: newValue,
          instance: this,
          component: this.constructor,
        });
    }
    this._changedProps = new Map();
    return changedProps.size > 0;
  }

  _ensureShadowRoot() {
    if (!this.shadowRoot) {
      const opts = { mode: "open" };
      if (typeof this.constructor.shadow === "object")
        Object.assign(opts, this.constructor.shadow);
      this.attachShadow(opts);
    }
    return this.shadowRoot;
  }

  update() {
    const container = this.constructor.shadow ? this._ensureShadowRoot() : this;
    render(this.render(), container);
  }

  render() {
    return null;
  }

  attributeChangedCallback(key, oldValue, value) {
    if (oldValue === value) return;
    this.emit("attributeChangedCallback", {
      instance: this,
      component: this.constructor,
      key,
      value,
      oldValue,
    });
    if (this._ignoreAttributeChange) return;
    this.state[key] = T.parse(value, this.constructor.properties[key]);
    if (this.hasUpdated) this.requestUpdate(key, oldValue);
  }

  updateAttribute({ key, value, type, skipPropUpdate = false }) {
    this._ignoreAttributeChange = skipPropUpdate;
    const isReflectable = type && typeof value !== "function";
    if (isReflectable) {
      if (type === "boolean")
        value ? this.setAttribute(key, "") : this.removeAttribute(key);
      else if (["array", "object"].includes(type))
        this.setAttribute(key, JSON.stringify(value));
      else if (value === null) this.removeAttribute(key);
      else if (type === "string" && String(value).trim().length > 0)
        this.setAttribute(key, String(value));
    }
    if (!skipPropUpdate) this[key] = value;
    else this._ignoreAttributeChange = false;
  }
}

export default View;
