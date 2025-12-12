/**
 * i18n View Plugin
 * Adds component-level i18n support to View components
 *
 * Features:
 * - Extracts inline i18n from component definitions (serves as English default)
 * - Auto-namespaces translations by component tag name
 * - Injects helper methods: $t(), $n(), $d(), $r()
 * - Auto-updates components when language changes
 */

export default {
  name: "i18n",

  /**
   * Called when component is registered via $APP.define()
   * Extracts inline i18n and registers as English translations
   */
  init: ({ component, definition, tag }) => {
    // Extract inline i18n (this IS the English/default translation)
    if (definition.i18n && typeof definition.i18n === "object") {
      // Register under component tag name namespace
      const translations = { [tag]: definition.i18n };

      // Add to English locale (inline i18n is the source of truth for English)
      if (typeof $APP !== "undefined" && $APP.i18n) {
        $APP.i18n.addTranslations("en", translations);
      }
    }

    // Inject helper methods into component prototype

    /**
     * Translate a key with auto-namespacing
     * @param {string} key - Translation key (auto-prefixed with component name)
     * @param {Object} params - Parameters for interpolation/pluralization
     * @example
     * this.$t('submit')  // → 'my-component.submit'
     * this.$t('count', { n: 5 })  // → Pluralized translation
     */
    component.prototype.$t = function (key, params) {
      const componentName = this.tagName.toLowerCase();
      return $APP.i18n.t(`${componentName}.${key}`, params);
    };

    /**
     * Format a number with current locale
     * @param {number} number - Number to format
     * @param {Object} options - Intl.NumberFormat options
     */
    component.prototype.$n = (number, options) => $APP.i18n.n(number, options);

    /**
     * Format a date with current locale
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     */
    component.prototype.$d = (date, options) => $APP.i18n.d(date, options);

    /**
     * Format a relative date (today, yesterday, X days ago)
     * @param {Date|string|number} date - Date to format
     */
    component.prototype.$r = (date) => $APP.i18n.r(date);
  },

  /**
   * Component lifecycle events
   */
  events: {
    /**
     * Called when component instance connects to DOM
     * Sets up auto-update on language change
     */
    connected: function () {
      // Create handler that triggers re-render on language change
      this._i18nUpdateHandler = () => {
        this.requestUpdate();
      };

      // Listen to language change events
      if (typeof $APP !== "undefined" && $APP.events) {
        $APP.events.on("i18n:language-changed", this._i18nUpdateHandler);
      }
    },

    /**
     * Called when component instance disconnects from DOM
     * Cleans up event listeners
     */
    disconnected: function () {
      // Remove language change listener
      if (
        this._i18nUpdateHandler &&
        typeof $APP !== "undefined" &&
        $APP.events
      ) {
        $APP.events.off("i18n:language-changed", this._i18nUpdateHandler);
        this._i18nUpdateHandler = null;
      }
    },
  },
};
