import { html } from "lit";
import $APP from "/app";

$APP.fs.css("/node_modules/@bootstrapp/uix/theme.css", true);

const rgbToHSL = (r, g, b) => {
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * HELPER: HSL to CSS string
 */
const hslToCSS = (hsl) => `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;

/**
 * HELPER: Adjust HSL lightness (clamped to 0-100)
 */
const adjustLightness = (hsl, delta) => ({
  h: hsl.h,
  s: hsl.s,
  l: Math.max(0, Math.min(100, hsl.l + delta)),
});

/**
 * HELPER: Mix color with white or black
 * amount: 0-1 (0 = original color, 1 = full white/black)
 */
const mixWithColor = (hsl, mixWith, amount) => {
  if (mixWith === "white") {
    // Mix towards white: increase lightness, decrease saturation
    return {
      h: hsl.h,
      s: Math.round(hsl.s * (1 - amount * 0.5)),
      l: Math.round(hsl.l + (100 - hsl.l) * amount),
    };
  } else if (mixWith === "black") {
    // Mix towards black: decrease lightness, decrease saturation slightly
    return {
      h: hsl.h,
      s: Math.round(hsl.s * (1 - amount * 0.3)),
      l: Math.round(hsl.l * (1 - amount)),
    };
  }
  return hsl;
};

/**
 * HELPER: Parses Hex, RGB, or HSL strings into an HSL object
 * Returns null if the string isn't a recognizable color format
 */
const parseColor = (str) => {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();

  // 1. HEX
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return rgbToHSL(r, g, b);
  }

  // 2. RGB
  if (s.startsWith("rgb")) {
    const match = s.match(/\d+/g);
    if (!match || match.length < 3) return null;
    return rgbToHSL(match[0] / 255, match[1] / 255, match[2] / 255);
  }

  // 3. HSL
  if (s.startsWith("hsl")) {
    // Matches integer or float numbers
    const match = s.match(/[\d.]+/g);
    if (!match || match.length < 3) return null;
    return {
      h: Math.round(parseFloat(match[0])),
      s: Math.round(parseFloat(match[1])),
      l: Math.round(parseFloat(match[2])),
    };
  }

  return null;
};

/**
 * HELPER: Generate 5 shade variations from a base color
 * Supports both HSL lightness adjustment and color mixing
 * @param {Object} baseHSL - Base color in HSL format
 * @param {Object} config - Optional shade configuration
 * @returns {Object} Object with lighter, light, DEFAULT, dark, darker shades
 */
const generateShades = (baseHSL, config = {}) => {
  // Default configuration: HSL lightness adjustment
  const defaultConfig = {
    lighter: { lightness: 20 },
    light: { lightness: 10 },
    dark: { lightness: -10 },
    darker: { lightness: -20 },
  };

  const shadeConfig = { ...defaultConfig, ...config };
  const shades = { DEFAULT: hslToCSS(baseHSL) };

  for (const [shadeName, shadeOpts] of Object.entries(shadeConfig)) {
    if (shadeName === "DEFAULT") continue;

    if (shadeOpts.mix) {
      // Mix with white/black
      const mixed = mixWithColor(
        baseHSL,
        shadeOpts.mix,
        shadeOpts.amount || 0.3,
      );
      shades[shadeName] = hslToCSS(mixed);
    } else if (shadeOpts.lightness !== undefined) {
      // HSL lightness adjustment
      const adjusted = adjustLightness(baseHSL, shadeOpts.lightness);
      shades[shadeName] = hslToCSS(adjusted);
    }
  }

  return shades;
};

/**
 * GENERATOR: Traverses object and creates CSS variables
 * Automatically generates shades for colors defined in the 'color' block
 * unless explicit overrides are provided in the theme object.
 */
const generateThemeVariables = (themeObj, prefix = "-") => {
  const variables = {};
  const shadeSuffixes = ["lighter", "light", "dark", "darker"];

  const traverse = (obj, currentKey) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = currentKey ? `${currentKey}-${key}` : `${prefix}-${key}`;

      // Check if we are currently iterating through the 'color' object properties
      // prefix is usually "-" so we look for "-color"
      const isColorBlock = currentKey === `${prefix}-color`;

      if (typeof value === "object" && value !== null) {
        // Recursive step
        traverse(value, newKey);
      } else {
        // It's a value (string/number)
        variables[newKey] = value;

        // If we are in the color block and the value is a string (a color),
        // attempt to auto-generate shades.
        if (isColorBlock && typeof value === "string") {
          // Prevent generating shades of shades (e.g. don't gen primary-dark-dark)
          const isVariant = shadeSuffixes.some((suffix) =>
            key.endsWith(`-${suffix}`),
          );

          if (!isVariant) {
            const baseHSL = parseColor(value);
            if (baseHSL) {
              const generatedShades = generateShades(baseHSL);

              shadeSuffixes.forEach((shade) => {
                const variantKey = `${key}-${shade}`;

                // CRITICAL: Only add the generated shade if the theme
                // does NOT explicitly define it.
                if (obj[variantKey] === undefined) {
                  variables[`${newKey}-${shade}`] = generatedShades[shade];
                }
              });
            }
          }
        }
      }
    }
  };

  traverse(themeObj, "");
  return variables;
};

/**
 * INJECTOR: Updates the CSS variables in the DOM
 */
const injectThemeCSS = (variables) => {
  const styleId = "dynamic-theme-vars";
  let styleTag = document.getElementById(styleId);

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  const cssRules = Object.entries(variables)
    .map(([key, val]) => `${key}: ${val};`)
    .join("\n  ");

  styleTag.textContent = `:root {\n  ${cssRules}\n}`;
};

// 1. Lazy Loaders: Only import when the function is called
const availableThemes = {
  "gruvbox-dark": () => import("./themes/gruvbox-dark.js"),
  "gruvbox-light": () => import("./themes/gruvbox-light.js"),
};

/**
 * LOADER: Orchestrates fetching, generating, and injecting
 */
const loadTheme = async (themeName) => {
  // If no theme name provided, clear the theme
  if (!themeName) {
    const styleTag = document.getElementById("dynamic-theme-vars");
    if (styleTag) styleTag.remove();
    console.log("Theme removed.");
    return;
  }

  const themeLoader = availableThemes[themeName];

  if (!themeLoader) {
    console.warn(`Theme "${themeName}" not found.`);
    return;
  }

  try {
    // Dynamic import
    const module = await themeLoader();
    const themeData = module.default || module;

    // Generate and Inject
    const cssVars = generateThemeVariables(themeData);
    injectThemeCSS(cssVars);

    console.log(`Theme "${themeName}" loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load theme "${themeName}":`, error);
  }
};

/**
 * APPLY: Apply a theme object directly (for theme generator preview)
 */
const applyTheme = (themeData) => {
  const cssVars = generateThemeVariables(themeData);
  injectThemeCSS(cssVars);
};

$APP.loadTheme = loadTheme;
$APP.applyTheme = applyTheme;
loadTheme("gruvbox-dark");

$APP.routes.set({ "/showcase": () => html`<uix-showcase></uix-showcase>` });
$APP.routes.set({
  "/explorer": () => html`<uix-indexeddb-explorer></uix-indexeddb-explorer>`,
});

$APP.addModule({
  name: "uix",
  path: "/node_modules/@bootstrapp",
  root: true,
  i18n: {
    pt: () => import("./locales/pt.js"),
  },
  themes: availableThemes,
  components: {
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
    docs: [
      "showcase",
      "showcase-code-viewer",
      "showcase-property-editor",
      "showcase-sidebar",
      "theme-generator",
    ],
  },
});
