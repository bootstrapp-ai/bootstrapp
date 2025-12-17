import presetWind4 from "https://cdn.jsdelivr.net/npm/@unocss/preset-wind4@66.3.3/+esm";
import $APP from "/$app.js";

if (!$APP.settings.tailwind?.runtime) {
  $APP.devFiles.add(new URL(import.meta.url).pathname);
}
const fontFamily = "Manrope";

window.__unocss = {
  theme: {
    font: {
      family: fontFamily,
      icon: {
        family: "lucide",
      },
    },
  },
  extendTheme: (theme) =>
    $APP.theme.set({
      ...theme,
      ...$APP.theme,
      colors: {
        ...theme.colors,
        default: "var(--text-color)",
        muted: "var(--text-muted)",
        inverted: "var(--color-inverse)",
        // Base Content Colors
        // Maps 'bg-surface', 'text-surface', 'border-surface' to var(--color-surface)
        surface: {
          DEFAULT: "var(--color-surface)",
          lighter: "var(--color-surface-lighter)",
          light: "var(--color-surface-light)",
          dark: "var(--color-surface-dark)",
          darker: "var(--color-surface-darker)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          lighter: "var(--color-accent-lighter)",
          light: "var(--color-accent-light)",
          dark: "var(--color-accent-dark)",
          darker: "var(--color-accent-darker)",
        },
        // Maps 'bg-inverse', 'text-inverse' to var(--color-inverse)
        // Includes variants like 'bg-inverse-light' -> var(--color-inverse-light)
        inverse: {
          DEFAULT: "var(--color-inverse)",
          lighter: "var(--color-inverse-lighter)",
          light: "var(--color-inverse-light)",
          dark: "var(--color-inverse-dark)",
          darker: "var(--color-inverse-darker)",
        },

        // Primary Palette
        // Maps 'bg-primary', 'text-primary' etc.
        primary: {
          DEFAULT: "var(--color-primary)",
          lighter: "var(--color-primary-lighter)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
          darker: "var(--color-primary-darker)",
        },

        // Secondary Palette
        secondary: {
          DEFAULT: "var(--color-secondary)",
          lighter: "var(--color-secondary-lighter)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)",
          darker: "var(--color-secondary-darker)",
        },

        // Semantic / Status Colors
        success: {
          DEFAULT: "var(--color-success)",
          lighter: "var(--color-success-lighter)",
          light: "var(--color-success-light)",
          dark: "var(--color-success-dark)",
          darker: "var(--color-success-darker)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          lighter: "var(--color-danger-lighter)",
          light: "var(--color-danger-light)",
          dark: "var(--color-danger-dark)",
          darker: "var(--color-danger-darker)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          lighter: "var(--color-warning-lighter)",
          light: "var(--color-warning-light)",
          dark: "var(--color-warning-dark)",
          darker: "var(--color-warning-darker)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          lighter: "var(--color-info-lighter)",
          light: "var(--color-info-light)",
          dark: "var(--color-info-dark)",
          darker: "var(--color-info-darker)",
        },

        // Interaction States
        hover: "var(--color-hover)",
        focus: "var(--color-focus)",
      },

      // Extend textColor specifically if you want 'text-default' to map to your base text color
      textColor: {
        DEFAULT: "var(--text-color)",
      },

      // Extend backgroundColor specifically for the main app background
      backgroundColor: {
        DEFAULT: "var(--background-color)",
      },
    }),
  presets: [presetWind4({ preflights: { theme: true } })],
};

await import("https://cdn.jsdelivr.net/npm/@unocss/runtime/core.global.js");

// Send UnoCSS-generated CSS to Service Worker for extraction during deploy
const sendCSSToSW = () => {
  const css = Array.from(
    document.querySelectorAll("style[data-unocss-runtime-layer]"),
  )
    .map((s) => s.textContent)
    .join("\n");

  $APP.SW?.postMessage("SW:STORE_UNOCSS", { css });
};

// Observe UnoCSS style changes (debounced)
let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(sendCSSToSW, 100);
});
observer.observe(document.head, {
  childList: true,
  subtree: true,
  characterData: true,
});

// Send initial CSS
sendCSSToSW();
