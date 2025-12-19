import T from "../types/index.js";

export default {
  name: "@bootstrapp/theme",
  exports: {
    default: T.object({ description: "Theme module with color utilities and theme management" }),

    HSL: {
      $interface: true,
      h: T.number({ description: "Hue (0-360)" }),
      s: T.number({ description: "Saturation (0-100)" }),
      l: T.number({ description: "Lightness (0-100)" }),
    },

    ShadeConfig: {
      $interface: true,
      lightness: T.number({ description: "Lightness delta (-100 to 100)" }),
      mix: T.string({ description: "'white' or 'black'" }),
      amount: T.number({ description: "Mix amount (0-1)" }),
    },

    parseColor: T.function({
      description: "Parse color string (HEX, RGB, HSL) to HSL object",
      args: [T.string({ name: "colorString", description: "#hex, rgb(), or hsl() format" })],
      returns: T.object({ description: "HSL object { h, s, l } or null" }),
    }),

    generateShades: T.function({
      description: "Generate shade variants (lighter, light, dark, darker) from base HSL",
      args: [
        T.object({ name: "baseHSL", description: "Base HSL object" }),
        T.object({ name: "config", description: "Shade config overrides" }),
      ],
      returns: T.object({ description: "Object with DEFAULT and shade variants as CSS strings" }),
    }),

    generateThemeVariables: T.function({
      description: "Generate CSS variables from theme object, auto-generating color shades",
      args: [
        T.object({ name: "themeObj", description: "Theme configuration object" }),
        T.string({ name: "prefix", description: "CSS variable prefix (default: '-')" }),
      ],
      returns: T.object({ description: "Object of CSS variable names to values" }),
    }),

    injectThemeCSS: T.function({
      description: "Inject CSS variables into :root via style tag",
      args: [T.object({ name: "variables", description: "CSS variables object" })],
      returns: T.any(),
    }),

    registerTheme: T.function({
      description: "Register a theme with lazy loader function",
      args: [
        T.string({ name: "name", description: "Theme name" }),
        T.function({ name: "loader", description: "Async loader returning theme module" }),
      ],
      returns: T.any(),
    }),

    loadTheme: T.function({
      description: "Load and apply a theme by name or object, or remove if null",
      args: [{ ...T.union(T.string(), T.object()), name: "themeInput", description: "Theme name, object, or null" }],
      returns: T.any(),
    }),

    applyTheme: T.function({
      description: "Apply theme data directly (generates variables and loads font)",
      args: [T.object({ name: "themeData", description: "Theme configuration object" })],
      returns: T.any(),
    }),

    availableThemes: T.object({ description: "Registry of registered theme loaders" }),

    loadCSS: T.function({
      description: "Load CSS file into document head",
      args: [
        T.string({ name: "href", description: "CSS file URL" }),
        T.boolean({ name: "prepend", description: "Prepend instead of append (default: false)" }),
      ],
      returns: T.any(),
    }),

    loadFont: T.function({
      description: "Load Google Font and set as --font-family-base",
      args: [T.string({ name: "fontFamily", description: "Font family name" })],
      returns: T.any(),
    }),

    getComponentCSS: T.function({
      description: "Get component CSS content for Shadow DOM injection",
      args: [T.string({ name: "tag", description: "Component tag name" })],
      returns: T.string({ description: "CSS content or null" }),
    }),

    rgbToHSL: T.function({
      description: "Convert RGB values (0-1) to HSL object",
      args: [
        T.number({ name: "r", description: "Red (0-1)" }),
        T.number({ name: "g", description: "Green (0-1)" }),
        T.number({ name: "b", description: "Blue (0-1)" }),
      ],
      returns: T.object({ description: "HSL object { h, s, l }" }),
    }),

    hslToCSS: T.function({
      description: "Convert HSL object to CSS hsl() string",
      args: [T.object({ name: "hsl", description: "HSL object { h, s, l }" })],
      returns: T.string({ description: "CSS hsl() string" }),
    }),

    adjustLightness: T.function({
      description: "Adjust HSL lightness by delta",
      args: [
        T.object({ name: "hsl", description: "HSL object" }),
        T.number({ name: "delta", description: "Lightness change (-100 to 100)" }),
      ],
      returns: T.object({ description: "New HSL object" }),
    }),

    mixWithColor: T.function({
      description: "Mix HSL with white or black",
      args: [
        T.object({ name: "hsl", description: "HSL object" }),
        T.string({ name: "mixWith", description: "'white' or 'black'" }),
        T.number({ name: "amount", description: "Mix amount (0-1)" }),
      ],
      returns: T.object({ description: "New HSL object" }),
    }),
  },
};
