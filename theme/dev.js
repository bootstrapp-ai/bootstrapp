/**
 * Theme Dev Module - Development-only CSS loading utilities
 * This file is excluded from production builds via $APP.devFiles
 */
import $APP from "/$app.js";
import View, { settings } from "/$app/view/index.js";

// Track loaded CSS files to prevent duplicates
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

/**
 * Load a CSS file via link tag
 */
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

// Global style tag for component CSS in dev mode
const globalStyleTag = document.createElement("style");
globalStyleTag.id = "compstyles";
document.head.appendChild(globalStyleTag);

/**
 * Load component CSS file and cache it for Shadow DOM injection
 * @param {string} file - Path to CSS file
 * @param {string} tag - Component tag name
 */
const loadComponentCSS = async (file, tag) => {
  const css = await fetchCSS(file);
  if (css) {
    globalStyleTag.textContent += css;
    const entry = View.components.get(tag);
    if (entry) entry.cssContent = css;
  }
};

// Register the dev init plugin that fetches CSS during component definition
View.plugins.push({
  name: "theme-dev",
  init: async ({ tag, component }) => {
    if (component.style && settings.loadStyle) {
      const path = View.getComponentPath(tag);
      await loadComponentCSS(`${path}.css`, tag);
    }
  },
});

// Register as dev file so it's excluded from production bundle
$APP.devFiles.add(new URL(import.meta.url).pathname);

export { fetchCSS, loadCSS, loadComponentCSS, globalStyleTag };
