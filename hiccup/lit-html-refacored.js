/**
 * Hiccup-style HTML builder for lit-html with proper template caching
 * This implementation maintains lit-html's performance by caching template structures
 */

const HTML_RESULT = 1;
const SVG_RESULT = 2;

// Cache for template strings - this is THE critical optimization
const templateCache = new Map();

// Special property names that need prefix transformation
const PROP_TRANSFORMS = {
	className: "class",
	htmlFor: "for",
};

// Event handler prefix
const EVENT_PREFIX = "on";

/**
 * Checks if a value is a primitive that should be rendered as text
 */
function isPrimitive(value) {
	return (
		value === null || (typeof value !== "object" && typeof value !== "function")
	);
}

/**
 * Checks if a value is a TemplateResult (from lit-html or our h functions)
 */
function isTemplateResult(value) {
	return value && typeof value === "object" && value._$litType$ !== undefined;
}

/**
 * Checks if a value is a DOM node
 */
function isDOMNode(value) {
	return value && typeof value === "object" && value.nodeType !== undefined;
}

/**
 * Improved heuristic to determine if first argument is props or children
 * Rules:
 * - If 2+ args: first is props, rest are children
 * - If 1 arg and it's a plain object (not TemplateResult, not DOM node, not Array): it's props
 * - If 1 arg and it's string, number, TemplateResult, DOM node, or Array: it's children
 * - If 0 args: no props, no children
 */
function parseArguments(args) {
	if (args.length === 0) {
		return { props: null, children: [] };
	}

	if (args.length === 1) {
		const arg = args[0];

		// Null or undefined
		if (arg == null) {
			return { props: null, children: [] };
		}

		// Primitive (string, number, boolean)
		if (isPrimitive(arg)) {
			return { props: null, children: [arg] };
		}

		// Array
		if (Array.isArray(arg)) {
			return { props: null, children: arg };
		}

		// TemplateResult
		if (isTemplateResult(arg)) {
			return { props: null, children: [arg] };
		}

		// DOM Node
		if (isDOMNode(arg)) {
			return { props: null, children: [arg] };
		}

		// Plain object - assume it's props
		// But check if it has _$litType$ or nodeType (safety check)
		return { props: arg, children: [] };
	}

	// 2+ arguments: first is props, rest are children
	return { props: args[0], children: args.slice(1) };
}

/**
 * Creates a stable cache key from element structure
 * This is crucial - same structure = same cache key = same template
 */
function createCacheKey(tag, attrKeys, childrenStructure) {
	// Create a deterministic string representation of the template structure
	const attrPart = attrKeys.sort().join(",");
	const childPart = childrenStructure
		.map((c) => (typeof c === "object" ? "dynamic" : "static"))
		.join(",");
	return `${tag}:${attrPart}:${childPart}`;
}

/**
 * Analyzes attributes to determine their structure (not values)
 */
function analyzeAttributes(attrs) {
	if (!attrs || typeof attrs !== "object") {
		return { keys: [], structure: [] };
	}

	const structure = [];
	const keys = [];

	for (let [key, value] of Object.entries(attrs)) {
		if (value == null) continue;

		key = PROP_TRANSFORMS[key] || key;
		keys.push(key);

		// Record the TYPE of binding, not the value
		if (key.startsWith(EVENT_PREFIX) && key.length > 2) {
			structure.push({ key, type: "event" });
		} else if (typeof value === "boolean") {
			structure.push({ key, type: "boolean" });
		} else if (key.startsWith(".")) {
			structure.push({ key, type: "property" });
		} else if (!isPrimitive(value)) {
			structure.push({ key, type: "property" });
		} else {
			structure.push({ key, type: "attribute" });
		}
	}

	return { keys, structure };
}

/**
 * Builds template strings and collects values
 * This is called ONCE per unique template structure and cached
 */
function buildTemplate(
	tag,
	attrStructure,
	childrenStructure,
	type = HTML_RESULT,
) {
	const strings = [`<${tag}`];
	let valueCount = 0;

	// Build attributes part
	for (const { key, type: attrType } of attrStructure) {
		if (attrType === "event") {
			const eventName = key.slice(2).toLowerCase();
			strings[strings.length - 1] += ` @${eventName}="`;
			strings.push(`"`);
			valueCount++;
		} else if (attrType === "boolean") {
			strings[strings.length - 1] += ` ?${key}="`;
			strings.push(`"`);
			valueCount++;
		} else if (attrType === "property") {
			const propKey = key.startsWith(".") ? key : `.${key}`;
			strings[strings.length - 1] += ` ${propKey}="`;
			strings.push(`"`);
			valueCount++;
		} else {
			// Regular attribute
			strings[strings.length - 1] += ` ${key}="`;
			strings.push(`"`);
			valueCount++;
		}
	}

	strings[strings.length - 1] += ">";

	// Build children part
	for (const childType of childrenStructure) {
		if (childType === "static") {
			// Static content is part of the string
			// Will be filled in later
			strings[strings.length - 1] += "\x00STATIC\x00";
		} else {
			// Dynamic content needs interpolation
			strings.push("");
			valueCount++;
		}
	}

	strings[strings.length - 1] += `</${tag}>`;

	// Make it a proper TemplateStringsArray
	Object.defineProperty(strings, "raw", {
		value: strings.slice(),
		writable: false,
		enumerable: false,
		configurable: false,
	});

	// Freeze it to ensure identity is stable
	Object.freeze(strings);
	Object.freeze(strings.raw);

	return { strings, valueCount };
}

/**
 * Processes children and returns structure info + processed children
 */
function processChildren(children) {
	const result = [];
	const structure = [];

	for (const child of children) {
		if (Array.isArray(child)) {
			const nested = processChildren(child);
			result.push(...nested.children);
			structure.push(...nested.structure);
		} else if (child != null && child !== false) {
			if (isPrimitive(child)) {
				result.push(String(child));
				structure.push("static");
			} else {
				result.push(child);
				structure.push("dynamic");
			}
		}
	}

	return { children: result, structure };
}

/**
 * Extracts values from attributes in the correct order
 */
function extractAttributeValues(attrs, attrStructure) {
	if (!attrs) return [];

	const values = [];
	for (const { key, type } of attrStructure) {
		const originalKey =
			Object.keys(PROP_TRANSFORMS).find((k) => PROP_TRANSFORMS[k] === key) ||
			key;

		let value = attrs[originalKey] || attrs[key];

		// For event handlers, need to check with 'on' prefix
		if (type === "event" && !value) {
			const eventKey = "on" + key.charAt(0).toUpperCase() + key.slice(1);
			value = attrs[eventKey];
		}

		values.push(value);
	}
	return values;
}

/**
 * Creates an element builder function with proper caching
 */
function createElement(tag, type = HTML_RESULT) {
	return (...args) => {
		// Use improved heuristics to parse arguments
		const { props, children: rawChildren } = parseArguments(args);

		// Analyze structure (not values)
		const { keys: attrKeys, structure: attrStructure } =
			analyzeAttributes(props);
		const { children: processedChildren, structure: childrenStructure } =
			processChildren(rawChildren);

		// Create cache key based on structure
		const cacheKey = createCacheKey(tag, attrKeys, childrenStructure);

		// Get or create cached template
		let cached = templateCache.get(cacheKey);
		if (!cached) {
			cached = buildTemplate(tag, attrStructure, childrenStructure, type);
			templateCache.set(cacheKey, cached);
		}

		// Now extract the actual values in the correct order
		const values = [];

		// Add attribute values
		values.push(...extractAttributeValues(props, attrStructure));

		// Add children values
		for (let i = 0; i < processedChildren.length; i++) {
			if (childrenStructure[i] === "dynamic") {
				values.push(processedChildren[i]);
			}
		}

		// Fill in static children in the strings
		const strings = cached.strings.slice();
		let staticIndex = 0;
		for (let i = 0; i < strings.length; i++) {
			if (strings[i].includes("\x00STATIC\x00")) {
				const staticChildren = [];
				while (
					staticIndex < processedChildren.length &&
					childrenStructure[staticIndex] === "static"
				) {
					staticChildren.push(processedChildren[staticIndex]);
					staticIndex++;
				}
				strings[i] = strings[i].replace(
					"\x00STATIC\x00",
					staticChildren.join(""),
				);
			}
		}

		// Use the CACHED strings array (this is the key!)
		// We modify a copy only if there's static content, otherwise use cached directly
		const hasStaticContent = childrenStructure.some((s) => s === "static");
		const finalStrings = hasStaticContent ? strings : cached.strings;

		// For static content, we need to create a new strings array, but we can
		// still cache based on the static content pattern
		if (hasStaticContent) {
			const staticKey =
				cacheKey +
				":" +
				processedChildren
					.filter((_, i) => childrenStructure[i] === "static")
					.join("|");

			let staticCached = templateCache.get(staticKey);
			if (!staticCached) {
				Object.defineProperty(strings, "raw", {
					value: strings.slice(),
					writable: false,
				});
				Object.freeze(strings);
				Object.freeze(strings.raw);
				staticCached = strings;
				templateCache.set(staticKey, staticCached);
			}

			return {
				_$litType$: type,
				strings: staticCached,
				values: values,
			};
		}

		return {
			_$litType$: type,
			strings: cached.strings,
			values: values,
		};
	};
}

/**
 * Creates a fragment (no wrapper element)
 */
function fragment(...children) {
	const { children: processedChildren, structure: childrenStructure } =
		processChildren(children);

	if (processedChildren.length === 0) {
		const emptyStrings = [""];
		Object.defineProperty(emptyStrings, "raw", { value: [""] });
		return { _$litType$: HTML_RESULT, strings: emptyStrings, values: [] };
	}

	if (processedChildren.length === 1 && !isPrimitive(processedChildren[0])) {
		return processedChildren[0];
	}

	// Create cache key for fragment
	const cacheKey = `fragment:${childrenStructure.join(",")}`;
	let cached = templateCache.get(cacheKey);

	if (!cached) {
		const strings = [""];
		for (const type of childrenStructure) {
			if (type === "dynamic") {
				strings.push("");
			}
		}

		Object.defineProperty(strings, "raw", {
			value: strings.slice(),
			writable: false,
		});
		Object.freeze(strings);
		Object.freeze(strings.raw);

		cached = { strings };
		templateCache.set(cacheKey, cached);
	}

	// Build values array with dynamic content
	const values = processedChildren.filter(
		(_, i) => childrenStructure[i] === "dynamic",
	);

	// Handle static content
	if (childrenStructure.some((s) => s === "static")) {
		const strings = cached.strings.slice();
		let dynamicIndex = 0;
		let staticContent = "";

		for (let i = 0; i < childrenStructure.length; i++) {
			if (childrenStructure[i] === "static") {
				staticContent += processedChildren[i];
			} else {
				strings[dynamicIndex] += staticContent;
				staticContent = "";
				dynamicIndex++;
			}
		}
		if (staticContent) {
			strings[strings.length - 1] += staticContent;
		}

		const staticKey =
			cacheKey +
			":" +
			processedChildren
				.filter((_, i) => childrenStructure[i] === "static")
				.join("|");

		let staticCached = templateCache.get(staticKey);
		if (!staticCached) {
			Object.defineProperty(strings, "raw", { value: strings.slice() });
			Object.freeze(strings);
			staticCached = strings;
			templateCache.set(staticKey, staticCached);
		}

		return {
			_$litType$: HTML_RESULT,
			strings: staticCached,
			values: values,
		};
	}

	return {
		_$litType$: HTML_RESULT,
		strings: cached.strings,
		values: values,
	};
}

// Common HTML elements
const tags = [
	"div",
	"span",
	"p",
	"a",
	"button",
	"input",
	"textarea",
	"select",
	"option",
	"label",
	"form",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"ul",
	"ol",
	"li",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
	"header",
	"footer",
	"nav",
	"section",
	"article",
	"aside",
	"main",
	"img",
	"video",
	"audio",
	"canvas",
	"svg",
	"path",
	"circle",
	"rect",
	"strong",
	"em",
	"code",
	"pre",
	"blockquote",
	"hr",
	"br",
	"iframe",
	"script",
	"style",
	"link",
	"meta",
	"details",
	"summary",
	"dialog",
];

// Create the h namespace with Proxy for custom elements
const h = new Proxy(
	{
		fragment,
		tag: (name, type = HTML_RESULT) => createElement(name, type),
		// Expose cache for debugging/testing
		_cache: templateCache,
	},
	{
		get(target, prop) {
			// Return existing property if it exists
			if (prop in target) {
				return target[prop];
			}

			// For any other property, treat it as a custom element tag
			// Cache the created element function
			if (typeof prop === "string") {
				if (!target[prop]) {
					target[prop] = createElement(prop);
				}
				return target[prop];
			}

			return undefined;
		},
	},
);

// Add all common tags (for better performance on common elements)
for (const tag of tags) {
	h[tag] = createElement(tag);
}

// SVG namespace
h.svg = {
	svg: createElement("svg", SVG_RESULT),
	path: createElement("path", SVG_RESULT),
	circle: createElement("circle", SVG_RESULT),
	rect: createElement("rect", SVG_RESULT),
	line: createElement("line", SVG_RESULT),
	polyline: createElement("polyline", SVG_RESULT),
	polygon: createElement("polygon", SVG_RESULT),
	ellipse: createElement("ellipse", SVG_RESULT),
	g: createElement("g", SVG_RESULT),
	text: createElement("text", SVG_RESULT),
	defs: createElement("defs", SVG_RESULT),
	use: createElement("use", SVG_RESULT),
};

export default h;

/**
 * USAGE EXAMPLES - Now with improved heuristics!
 *
 * // Single string argument - treated as children
 * h.span("Test")
 *
 * // Single element argument - treated as children
 * h.div(h.span("Test"))
 *
 * // Object argument - treated as props
 * h.div({ class: 'container' })
 *
 * // Two arguments - first is props, second is children
 * h.div({ class: 'container' }, 'Hello')
 *
 * // Multiple children
 * h.div({ class: 'parent' },
 *   h.span('Child 1'),
 *   h.span('Child 2')
 * )
 *
 * // No props, just children
 * h.div('Hello', 'World')
 *
 * // Custom elements via Proxy - auto-creates element functions!
 * h.uixButton({ label: "Start New Chat" })
 * h.myCustomElement({ prop: 'value' }, 'content')
 * h['web-component']({ attr: 'test' })
 *
 * // Event handlers
 * h.button({
 *   onClick: () => console.log('clicked'),
 *   class: 'btn'
 * }, 'Click Me')
 *
 * // Boolean attributes
 * h.input({
 *   type: 'checkbox',
 *   checked: true
 * })
 *
 * // Property bindings
 * h.div({
 *   '.customProp': { some: 'object' }
 * })
 *
 * // Arrays of children
 * h.ul(
 *   items.map(item => h.li(item.name))
 * )
 *
 * // Mixed content
 * h.div(
 *   'Static text',
 *   h.span('Dynamic'),
 *   someVariable,
 *   items.map(i => h.p(i))
 * )
 *
 * // Test the heuristics
 * h.div("Just text")                    // props: null, children: ["Just text"]
 * h.div({ class: 'x' })                 // props: {class: 'x'}, children: []
 * h.div({ class: 'x' }, "text")         // props: {class: 'x'}, children: ["text"]
 * h.div(h.span("nested"))               // props: null, children: [<span>...]
 * h.div(["item1", "item2"])             // props: null, children: ["item1", "item2"]
 *
 * // Check cache size for debugging
 * console.log('Template cache size:', h._cache.size);
 */
