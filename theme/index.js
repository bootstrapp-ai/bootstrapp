import View, { settings } from "@bootstrapp/view";

View.plugins.push({
  name: "theme",
  init: async ({ tag, component }) => {
    if (component.style && settings.loadStyle) {
      const path = View.getComponentPath(tag);
      await loadComponentCSS(`${path}.css`, tag);
    }
  },
  events: {
    connected: (opts) => {
      const { tag, component, instance } = opts;
      if (!component.style) return;
      const root = instance.getRootNode();
      if (!(root instanceof ShadowRoot)) return;
      const entry = View.components.get(tag);
      if (!entry?.cssContent) return;
      let injected = View.shadowStylesInjected.get(root);
      if (!injected) {
        injected = new Set();
        View.shadowStylesInjected.set(root, injected);
      }
      if (injected.has(component)) return;
      const style = document.createElement("style");
      style.setAttribute("data-component-style", component.tag);
      style.textContent = entry.cssContent;
      root.prepend(style);
      injected.add(component);
    },
  },
});
// CSS Loading Utility (replaces $APP.fs.css)
const loadedCSSFiles = new Set();
/**
 * Fetch CSS content as text (for shadow DOM injection)
 * @param {string} url - URL or path to CSS file
 * @returns {Promise<string|null>} CSS content as string, or null if fetch fails
 */
const fetchCSS = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch CSS from ${url}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching CSS from ${url}:`, error);
    return null;
  }
};

const loadCSS = (href, prepend = false) => {
  if (loadedCSSFiles.has(href)) {
    return; // Already loaded
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;

  if (prepend) {
    document.head.prepend(link);
  } else {
    document.head.appendChild(link);
  }

  loadedCSSFiles.add(href);
};

const loadComponentCSS = async (file, tag) => {
  const css = await fetchCSS(file);
  if (css) {
    globalStyleTag.textContent += css;
    const entry = View.components.get(tag);
    if (entry) entry.cssContent = css;
  }
};

const globalStyleTag = document.createElement("style");
globalStyleTag.id = "compstyles";
document.head.appendChild(globalStyleTag);

// Font Loading Utility (moved from base/frontend.js)
const loadedFonts = new Set();

const loadFont = (fontFamily) => {
  if (!fontFamily || loadedFonts.has(fontFamily)) {
    return; // Skip if no font or already loaded
  }

  // Load from Google Fonts
  const fontName = fontFamily.replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800&display=swap`;

  loadCSS(url);

  // Inject CSS variables for font
  const styleId = "theme-font-vars";
  let styleTag = document.getElementById(styleId);

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --font-family-base: '${fontFamily}', sans-serif;
    }
    body {
      font-family: var(--font-family-base);
    }
  `;

  loadedFonts.add(fontFamily);
};

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

// Theme registry
const availableThemes = {};

const registerTheme = (name, loader) => {
  availableThemes[name] = loader;
};

/**
 * APPLY: Apply a theme object directly (for theme generator preview)
 */
const applyTheme = (themeData) => {
  const cssVars = generateThemeVariables(themeData);
  injectThemeCSS(cssVars);

  if (themeData?.font?.family) loadFont(themeData.font.family);
};

/**
 * LOADER: Load a theme by name (string) or apply a theme object directly (object)
 * @param {string|object} themeInput - The name of a registered theme or a theme object.
 */
const loadTheme = async (themeInput) => {
  if (!themeInput) {
    const styleTag = document.getElementById("dynamic-theme-vars");
    if (styleTag) styleTag.remove();
    console.log("Theme removed.");
    return;
  }

  // 1. If it's an object, apply it directly using the existing logic
  if (typeof themeInput === "object" && themeInput !== null) {
    applyTheme(themeInput);
    console.log("Custom theme object applied successfully.");
    return;
  }

  // 2. If it's a string, proceed with loading a registered theme
  const themeName = themeInput;
  const themeLoader = availableThemes[themeName];

  if (!themeLoader) {
    console.warn(`Theme "${themeName}" not found.`);
    return;
  }

  try {
    const module = await themeLoader();
    const themeData = module.default || module;

    // Use applyTheme to reuse the core injection logic
    applyTheme(themeData);

    console.log(`Theme "${themeName}" loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load theme "${themeName}":`, error);
  }
};

// Register default themes
// NOTE: These imports will need to be correctly resolved in your environment
registerTheme("gruvbox-dark", () => import("./themes/gruvbox-dark.js"));
registerTheme("gruvbox-light", () => import("./themes/gruvbox-light.js"));

// Public API
export default {
  // Core functions
  parseColor,
  generateShades,
  generateThemeVariables,
  injectThemeCSS,

  // Theme management
  registerTheme,
  loadTheme, // Refactored
  applyTheme,
  availableThemes,
  fetchCSS,
  // Resource loading
  loadCSS,
  loadFont,
  loadComponentCSS,
  // Utility functions
  rgbToHSL,
  hslToCSS,
  adjustLightness,
  mixWithColor,
};

export {
  parseColor,
  generateShades,
  generateThemeVariables,
  injectThemeCSS,
  registerTheme,
  loadTheme,
  applyTheme,
  availableThemes,
  loadCSS,
  loadFont,
  rgbToHSL,
  hslToCSS,
  adjustLightness,
  mixWithColor,
};
