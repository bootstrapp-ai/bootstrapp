/**
 * i18n Module
 * Provides internationalization support for Bootstrapp apps
 */
import Controller from "/node_modules/@bootstrapp/controller/index.js";
import View from "/node_modules/@bootstrapp/view/index.js";
import { I18n } from "./base.js";
import i18nViewPlugin from "./view-plugin.js";

// Initialize i18n instance
const i18nInstance = new I18n();

// Register view plugin for component-level i18n
View.plugins.push(i18nViewPlugin);
const base = {
  /**
   * Translate a key (with pluralization support)
   * @param {string} key - Translation key (dot-separated)
   * @param {Object} params - Parameters for interpolation (use 'n' or 'count' for plurals)
   * @example
   * $APP.i18n.t('welcome.title')
   * $APP.i18n.t('pushup', { n: 5 })  // "5 pushups"
   * $APP.i18n.t('greeting', { name: 'John' })  // "Hello, John!"
   */
  t: (key, params) => i18nInstance.t(key, params),

  /**
   * Format a number according to current locale
   * @param {number} number - Number to format
   * @param {Object} options - Intl.NumberFormat options
   * @example
   * $APP.i18n.n(1000)  // "1,000" (en) or "1.000" (pt)
   * $APP.i18n.n(0.5, { style: 'percent' })  // "50%"
   * $APP.i18n.n(99.99, { style: 'currency', currency: 'USD' })  // "$99.99"
   */
  n: (number, options) => i18nInstance.formatNumber(number, options),

  /**
   * Format a date according to current locale
   * @param {Date|string|number} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @example
   * $APP.i18n.d(new Date())  // "Jan 15, 2025"
   * $APP.i18n.d(date, { dateStyle: 'full' })  // "Wednesday, January 15, 2025"
   * $APP.i18n.d(date, { timeStyle: 'short' })  // "2:30 PM"
   */
  d: (date, options) => i18nInstance.formatDate(date, options),

  /**
   * Format a relative date (today, yesterday, X days ago)
   * @param {Date|string|number} date - Date to format
   * @example
   * $APP.i18n.r(new Date())  // "today"
   * $APP.i18n.r(yesterdayDate)  // "yesterday"
   * $APP.i18n.r(twoDaysAgo)  // "2 days ago"
   */
  r: (date) => i18nInstance.formatRelativeDate(date),

  /**
   * Set current language (with lazy loading)
   * @param {string} locale - Locale code
   */
  setLanguage: async (locale) => {
    console.log("i18n setLanguage called with:", locale);
    const newLocale = await i18nInstance.setLanguage(locale);
    console.log("Locale loaded:", newLocale);

    // Persist to localStorage via Controller
    if (Controller?.i18n) {
      Controller.i18n.set("currentLocale", newLocale);
    }

    // Auto re-render root component if enabled
    const autoRerender = $APP.settings.i18n.autoRerender;
    const rootComponent = $APP.settings.i18n.rootComponent;
    console.log("Auto-rerender settings:", { autoRerender, rootComponent });

    if (autoRerender && rootComponent) {
      try {
        const oldContainer = document.querySelector(rootComponent);
        console.log("Found container:", oldContainer);
        if (oldContainer) {
          // Use innerHTML to create custom element (createElement doesn't work for custom elements)
          const temp = document.createElement('div');
          temp.innerHTML = `<${rootComponent}></${rootComponent}>`;
          oldContainer.replaceWith(temp.firstElementChild);
          console.log("Replaced container");
        }
      } catch (error) {
        console.warn("Failed to auto-rerender root component:", error);
        console.warn("You may need to manually trigger re-render");
      }
    }

    return newLocale;
  },

  /**
   * Get current language
   */
  getLanguage: () => i18nInstance.getLanguage(),

  /**
   * Get available locales
   */
  getAvailableLocales: () => i18nInstance.getAvailableLocales(),

  /**
   * Register a locale loader for lazy loading
   * @param {string} locale - Locale code
   * @param {Function} loader - Function that returns Promise<translations>
   */
  registerLocale: (locale, loader) =>
    i18nInstance.registerLocale(locale, loader),

  /**
   * Add translations for a locale (used by modules)
   * @param {string} locale - Locale code
   * @param {Object} translations - Translation object
   */
  addTranslations: (locale, translations) =>
    i18nInstance.addTranslations(locale, translations),

  /**
   * Internal: Get i18n instance (for advanced use cases)
   */
  _instance: i18nInstance,
};
// Register module with Bootstrapp
$APP.addModule({
  name: "i18n",
  base,

  settings: {
    defaultLocale: "en",
    fallbackLocale: "en",
    persistLocale: true,
    autoRerender: true,
    rootComponent: "app-container",
  },

  events: () => ({
    /**
     * When a module is added, merge its i18n translations
     */
    moduleAdded({ module }) {
      if (module.i18n) {
        // Module provides translations: { locale: translations }
        for (const [locale, translations] of Object.entries(module.i18n)) {
          i18nInstance.addTranslations(locale, translations);
        }
      }
    },

    /**
     * On app init, restore saved language preference
     */
    async "APP:INIT"() {
      // Set up Controller adapter for persistence
      if (Controller && !Controller.i18n) {
        Controller.createAdapter("i18n", {
          storage: "localStorage",
          prefix: "i18n:",
        });
      }

      // Restore saved locale
      const savedLocale = Controller?.i18n?.get("currentLocale");
      if (savedLocale) {
        await i18nInstance.setLanguage(savedLocale);
      } else {
        // Use default locale from settings
        const defaultLocale = $APP.settings.get("i18n.defaultLocale") || "en";
        await i18nInstance.setLanguage(defaultLocale);
      }
    },
  }),
});

export default base;
