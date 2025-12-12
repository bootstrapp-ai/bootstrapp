/**
 * A hiccup-style factory for lit-html.
 *
 * This file provides a default export `h` which is a proxy.
 * Accessing any property on `h` (e.g., `h.div`, `h.p`) returns a
 * function that generates a lit-html `TemplateResult`.
 *
 * It preserves lit-html's template caching by caching the generated
 * TemplateStringsArray based on the "shape" of the call
 * (tag, attribute keys, and child count).
 */

// We MUST import the *exact same* 'html' function (which is the
// `tag` function factory) that your framework is using.
import { html as litHtmlInternal } from "/npm/lit-html";

// A global cache for our generated TemplateStringsArrays.
// The key is a string like "div|class,id|2" (tag|attr_keys|child_count)
const templateCache = new Map();

/**
 * Checks if a value is a plain object, and not an array or
 * a lit-html TemplateResult.
 */
function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  // Check if it's a lit-html TemplateResult, which is not a plain object
  if (value["_$litType$"] !== undefined) {
    return false;
  }
  // Check for a constructor prototype, which is a good sign of a plain object
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Converts a camelCase string to kebab-case.
 * e.g., "appDailyTotal" -> "app-daily-total"
 * @param {string} str
 * @returns {string}
 */
function camelToKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * Creates a factory function for a specific HTML tag.
 * @param {string} tag - The tag name (e.g., "div", "p").
 * @returns {function(...args): TemplateResult}
 */
function createHiccupFactory(tag) {
  /**
   * @param {...any} args - Arguments, starting with an optional
   * attributes object, followed by children.
   * @returns {TemplateResult} A lit-html TemplateResult.
   */
  return (...args) => {
    let attrs = {};
    let children = args;

    // Check if the first argument is an attributes object
    if (args.length > 0 && isPlainObject(args[0])) {
      attrs = args[0];
      children = args.slice(1);
    }

    // Flatten children arrays completely
    children = children.flat(Number.POSITIVE_INFINITY);

    // --- Caching Logic ---
    // Create a stable cache key based on:
    // 1. The tag name (e.g., "div")
    // 2. The *keys* of the attributes, sorted (e.g., "class,id")
    // 3. The number of children (e.g., "2")
    const attrKeys = Object.keys(attrs).sort();
    const cacheKey = `${tag}|${attrKeys.join(",")}|${children.length}`;

    let strings = templateCache.get(cacheKey);

    if (!strings) {
      // This is the first time seeing this *structure*.
      // Generate and cache the `strings` array.
      strings = [];
      let s = `<${tag}`;

      // Add static string parts for attributes
      for (const key of attrKeys) {
        // Add the attribute part to the string, e.g., ' class='
        // The value will be a dynamic part.
        s += ` ${key}=`; // lit-html handles .prop, @event, ?bool
        strings.push(s);
        s = ""; // Reset string for the next part
      }

      // Add the closing of the opening tag
      s += ">";
      strings.push(s);

      // Add markers for each child
      for (let i = 0; i < children.length; i++) {
        strings.push(""); // A marker for the child
      }

      // Add the closing tag
      strings.push(`</${tag}>`);

      // --- This is CRITICAL ---
      // We must fake a TemplateStringsArray by adding a .raw property
      // so that lit-html's security check (`trustFromTemplateString`) passes.
      // The .raw array just needs to be an array-like object (ideally
      // the same strings).
      Object.defineProperty(strings, "raw", {
        value: strings,
        enumerable: false,
        configurable: false,
        writable: false,
      });

      // Save this TemplateStringsArray instance in our cache.
      templateCache.set(cacheKey, strings);
    }

    // --- Value Assembling ---
    // Now, build the `values` array
    const values = [];

    // Add attribute values *in the sorted key order*
    for (const key of attrKeys) {
      values.push(attrs[key]);
    }

    // Add all children as values
    values.push(...children);

    // Call lit-html's internal tag function to create the TemplateResult
    // This is what `html\`...\`` desugars to.
    return litHtmlInternal(strings, ...values);
  };
}

/**
 * The 'h' object.
 * We use a Proxy to dynamically create and cache tag factories on demand.
 * Accessing any property (e.g., `h.div`, `h.appDailyTotal`) will:
 * 1. Convert the property name to kebab-case (e.g., "div", "app-daily-total").
 * 2. Return a memoized factory function for that tag.
 */
const h = new Proxy(
  {},
  {
    get(target, prop) {
      // Check for symbols or non-string properties
      if (typeof prop !== "string") {
        return Reflect.get(target, prop);
      }

      // Check if we've already cached this factory
      // We cache on the original prop name (e.g., "appDailyTotal")
      if (target[prop]) {
        return target[prop];
      }

      // Convert the prop name (e.g., appDailyTotal) to kebab-case (e.g., app-daily-total)
      const tagName = camelToKebab(prop);

      // Create and cache the factory
      const factory = createHiccupFactory(tagName);
      target[prop] = factory; // Cache using the original prop name

      return factory;
    },
  },
);

export default h;

/**
 * --- USAGE EXAMPLES ---
 *
 * This 'h' helper creates lit-html templates with a functional syntax.
 * It fully supports lit-html's reactivity, caching, and special directives.
 *
 * --- 1. Basic Elements ---
 *
 * // Element with no attributes or children
 * h.div()
 *
 * // Element with just a string child
 * h.p("Hello World")
 *
 * // Element with attributes, no children
 * h.div({ class: "container" })
 *
 * // Element with attributes and one child
 * h.h1({ class: "title" }, "My Page")
 *
 * // Element with attributes and multiple children
 * h.div(
 * { class: "parent" },
 * h.span("Child 1"),
 * h.span("Child 2")
 * )
 *
 * // Element with no attributes and multiple children
 * h.div(
 * h.h1("Title"),
 * h.p("Paragraph")
 * )
 *
 * --- 2. lit-html Special Syntaxes ---
 *
 * // Event binding: @event
 * h.button({
 * "@click": (e) => console.log("Clicked!", e)
 * }, "Click Me")
 *
 * // Property binding: .property
 * // Use this for complex data like objects, arrays, or to set .value
 * h.input({
 * ".value": this.someValue,
 * "@input": (e) => (this.someValue = e.target.value)
 * })
 *
 * // Boolean attribute binding: ?attribute
 * h.input({
 * type: "checkbox",
 * "?checked": this.isChecked
 * })
 *
 * --- 3. Custom Elements (camelCase to kebab-case) ---
 *
 * // Renders <my-web-component>
 * h.myWebComponent()
 *
 * // Renders <app-daily-total> and passes a property
 * h.appDailyTotal({
 * ".dataQuery": { model: "sessions", key: "rows" }
 * })
 *
 * --- 4. Arrays & Iteration ---
 *
 * // The .map() operator works automatically
 * h.ul(
 * items.map(item =>
 * h.li({ class: "item" }, item.name)
 * )
 * )
 *
 * // Nested arrays are automatically flattened
 * h.div(
 * h.h1("Title"),
 * [ // This array
 * h.p("Item 1"),
 * h.p("Item 2")
 * ],
 * h.footer("Footer")
 * )
 *
 * --- 5. Conditional Rendering ---
 *
 * // Use ternary operators or `null` to conditionally show content.
 * // `false` will be rendered as the string "false", so use `null` instead.
 *
 * h.div(
 * this.isLoggedIn
 * ? h.span("Welcome!")
 * : null, // Renders nothing
 *
 * this.showError &&
 * h.div({ class: "error" }, "An error occurred") // Renders `false` if showError is false
 * )
 *
 * // Better pattern for conditional rendering:
 * h.div(
 * this.isLoggedIn ? h.span("Welcome!") : null,
 * this.showError ? h.div({ class: "error" }, "An error occurred") : null
 * )
 *
 * --- 6. Mixing with native lit-html ---
 *
 * // You can nest native html\`...\` templates inside `h` calls
 *
 * import { html } from "/node_modules/@bootstrapp/base/view/html/index.js";
 *
 * h.div(
 * h.h1("Hiccup Title"),
 * html\`<p>This is a <strong>native lit-html</strong> template.</p>\`,
 * h.p("Hiccup paragraph")
 * )
 *
 */
