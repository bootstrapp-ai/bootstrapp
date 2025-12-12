import View from "/node_modules/@bootstrapp/view/index.js";
import Theme from "/node_modules/@bootstrapp/theme/index.js";

// Component registry: category → component names
const COMPONENTS = {
  navigation: [
    "accordion",
    "breadcrumbs",
    "menu",
    "navbar",
    "nav-item",
    "pagination",
    "sidebar",
    "tabs",
    "tree",
    "tree-item",
  ],
  overlay: [
    "alert-dialog",
    "drawer",
    "dropdown",
    "modal",
    "overlay",
    "popover",
    "tooltip",
    "popover-controller",
  ],
  display: [
    "avatar",
    "badge",
    "button",
    "calendar",
    "circle",
    "editable",
    "heading",
    "icon",
    "image",
    "link",
    "list",
    "list-item",
    "markdown",
    "media",
    "pattern",
    "stat",
    "table",
    "tag",
    "text",
  ],
  layout: [
    "card",
    "container",
    "data-table",
    "divider",
    "flex",
    "grid",
    "page",
    "panel",
    "section",
    "split-pane",
  ],
  app: ["app-container", "app-header", "bottom-nav", "title-bar"],
  page: [
    "cta-section",
    "faq-section",
    "feature-grid",
    "footer",
    "hero-section",
    "logo-cloud",
    "newsletter-section",
    "pricing-card",
    "pricing-table",
    "stats-section",
    "stat-card",
    "contact-avatar",
    "metric-hero-card",
    "testimonial-card",
    "testimonial-section",
  ],
  feedback: [
    "circular-progress",
    "progress-bar",
    "skeleton",
    "spinner",
    "toast",
  ],
  utility: [
    "device",
    "clipboard",
    "darkmode",
    "draggable",
    "droparea",
    "indexeddb-explorer",
    "seo",
    "theme-toggle",
  ],
  form: [
    "checkbox",
    "code",
    "file-upload",
    "form",
    "input",
    "form-input",
    "join",
    "number-input",
    "radio",
    "radio-group",
    "rating",
    "select",
    "slider",
    "switch",
    "textarea",
    "time",
  ],
};

// Build reverse lookup: component name → { category, tag, path }
const buildComponentMap = () => {
  const map = new Map();

  for (const [category, names] of Object.entries(COMPONENTS)) {
    for (const name of names) {
      const tag = `uix-${name}`;
      map.set(name, {
        category,
        tag,
        path: `./${category}/${name}.js`,
      });
    }
  }

  return map;
};

const COMPONENT_MAP = buildComponentMap();

// Helper function to load CSS for a component (uses Theme's CSS loader)
const loadComponentStyles = (cssPath) => {
  Theme.loadCSS(`../uix/${cssPath}`);
};

// Parse query parameters
const moduleUrl = new URL(import.meta.url);
const componentsParam = moduleUrl.searchParams.get("components");

// Load and define components
if (componentsParam) {
  // Selective loading
  const requestedNames = componentsParam.split(",").map((s) => s.trim());

  (async () => {
    for (const name of requestedNames) {
      const info = COMPONENT_MAP.get(name);

      if (!info) {
        console.error(`[UIX] Component not found: ${name}`);
        continue;
      }

      try {
        // Dynamic import the component definition
        const module = await import(info.path);
        const definition = module.default;

        // Import CSS if component has style: true
        if (definition.style) {
          const cssPath = info.path.replace(".js", ".css");
          console.log(cssPath, info.path);
          loadComponentStyles(cssPath);
        }

        // Define with View
        const tag = definition.tag || info.tag;
        View.define(tag, definition);
        console.log({ tag, definition });
        console.log(`[UIX] Registered: ${tag}`);
      } catch (error) {
        console.error(`[UIX] Failed to load ${name}:`, error);
      }
    }
  })();
} else {
  // No query params = load all components
  (async () => {
    for (const [name, info] of COMPONENT_MAP) {
      try {
        const module = await import(info.path);
        const definition = module.default;

        // Import CSS if component has style: true
        if (definition.style) {
          const cssPath = info.path.replace(".js", ".css");
          loadComponentStyles(cssPath);
        }

        const tag = definition.tag || info.tag;
        View.define(tag, definition);
      } catch (error) {
        console.error(`[UIX] Failed to load ${name}:`, error);
      }
    }
  })();
}

// Export for programmatic access
export { COMPONENT_MAP, COMPONENTS };
export default View;
