import View, { settings } from "/$app/view/index.js";

const productionCSSCache = new Map();

const getComponentCSS = async (tag) => {
  const entry = View.components.get(tag);
  if (entry?.cssContent) {
    return entry.cssContent;
  }

  if (productionCSSCache.has(tag)) {
    return productionCSSCache.get(tag);
  }

  try {
    const response = await fetch(`/styles/${tag}.css`);
    if (response.ok) {
      const css = await response.text();
      productionCSSCache.set(tag, css);
      return css;
    }
  } catch (e) {
  }

  return null;
};

View.plugins.push({
  name: "theme",
  events: {
    connected: async (opts) => {
      const { tag, component, instance } = opts;
      if (!component.style) return;

      const root = instance.getRootNode();
      if (!(root instanceof ShadowRoot)) return;

      let injected = View.shadowStylesInjected.get(root);
      if (!injected) {
        injected = new Set();
        View.shadowStylesInjected.set(root, injected);
      }
      if (injected.has(component)) return;

      const cssContent = await getComponentCSS(tag);
      if (!cssContent) return;

      const style = document.createElement("style");
      style.setAttribute("data-component-style", component.tag);
      style.textContent = cssContent;
      root.prepend(style);
      injected.add(component);
    },
  },
});

const loadedFonts = new Set();
const loadedCSSFiles = new Set();

const loadCSS = (href, prepend = false) => {
  if (loadedCSSFiles.has(href)) {
    return;
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

const loadFont = (fontFamily) => {
  if (!fontFamily || loadedFonts.has(fontFamily)) {
    return;
  }

  const fontName = fontFamily.replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800&display=swap`;

  loadCSS(url);

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

const hslToCSS = (hsl) => `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;

const adjustLightness = (hsl, delta) => ({
  h: hsl.h,
  s: hsl.s,
  l: Math.max(0, Math.min(100, hsl.l + delta)),
});

const mixWithColor = (hsl, mixWith, amount) => {
  if (mixWith === "white") {
    return {
      h: hsl.h,
      s: Math.round(hsl.s * (1 - amount * 0.5)),
      l: Math.round(hsl.l + (100 - hsl.l) * amount),
    };
  } else if (mixWith === "black") {
    return {
      h: hsl.h,
      s: Math.round(hsl.s * (1 - amount * 0.3)),
      l: Math.round(hsl.l * (1 - amount)),
    };
  }
  return hsl;
};

const parseColor = (str) => {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();

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

  if (s.startsWith("rgb")) {
    const match = s.match(/\d+/g);
    if (!match || match.length < 3) return null;
    return rgbToHSL(match[0] / 255, match[1] / 255, match[2] / 255);
  }

  if (s.startsWith("hsl")) {
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

const generateShades = (baseHSL, config = {}) => {
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
      const mixed = mixWithColor(
        baseHSL,
        shadeOpts.mix,
        shadeOpts.amount || 0.3,
      );
      shades[shadeName] = hslToCSS(mixed);
    } else if (shadeOpts.lightness !== undefined) {
      const adjusted = adjustLightness(baseHSL, shadeOpts.lightness);
      shades[shadeName] = hslToCSS(adjusted);
    }
  }

  return shades;
};

const generateThemeVariables = (themeObj, prefix = "-") => {
  const variables = {};
  const shadeSuffixes = ["lighter", "light", "dark", "darker"];

  const traverse = (obj, currentKey) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = currentKey ? `${currentKey}-${key}` : `${prefix}-${key}`;
      const isColorBlock = currentKey === `${prefix}-color`;

      if (typeof value === "object" && value !== null) {
        traverse(value, newKey);
      } else {
        variables[newKey] = value;

        if (isColorBlock && typeof value === "string") {
          const isVariant = shadeSuffixes.some((suffix) =>
            key.endsWith(`-${suffix}`),
          );

          if (!isVariant) {
            const baseHSL = parseColor(value);
            if (baseHSL) {
              const generatedShades = generateShades(baseHSL);

              shadeSuffixes.forEach((shade) => {
                const variantKey = `${key}-${shade}`;
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

const availableThemes = {};

const registerTheme = (name, loader) => {
  availableThemes[name] = loader;
};

const applyTheme = (themeData) => {
  const cssVars = generateThemeVariables(themeData);
  injectThemeCSS(cssVars);

  if (themeData?.font?.family) loadFont(themeData.font.family);
};

const loadTheme = async (themeInput) => {
  if (!themeInput) {
    const styleTag = document.getElementById("dynamic-theme-vars");
    if (styleTag) styleTag.remove();
    console.log("Theme removed.");
    return;
  }

  if (typeof themeInput === "object" && themeInput !== null) {
    applyTheme(themeInput);
    console.log("Custom theme object applied successfully.");
    return;
  }

  const themeName = themeInput;
  const themeLoader = availableThemes[themeName];

  if (!themeLoader) {
    console.warn(`Theme "${themeName}" not found.`);
    return;
  }

  try {
    const module = await themeLoader();
    const themeData = module.default || module;
    applyTheme(themeData);
    console.log(`Theme "${themeName}" loaded successfully.`);
  } catch (error) {
    console.error(`Failed to load theme "${themeName}":`, error);
  }
};

registerTheme("gruvbox-dark", () => import("./themes/gruvbox-dark.js"));
registerTheme("gruvbox-light", () => import("./themes/gruvbox-light.js"));
registerTheme("nbs", () => import("./themes/nbs.js"));

export default {
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
  getComponentCSS,
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
  getComponentCSS,
  rgbToHSL,
  hslToCSS,
  adjustLightness,
  mixWithColor,
};
