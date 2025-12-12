/**
 * Core i18n Engine
 * Provides translation management with lazy loading support
 */

export class I18n {
  constructor() {
    this.translations = {}; // { locale: { key: value } }
    this.currentLocale = "en";
    this.fallbackLocale = "en";
    this.loadedLocales = new Set();
    this.localeLoaders = {}; // { locale: () => Promise<translations> }
  }

  /**
   * Register a locale loader function for lazy loading
   * @param {string} locale - Locale code (e.g., 'en', 'pt')
   * @param {Function} loader - Function that returns Promise<translations>
   */
  registerLocale(locale, loader) {
    this.localeLoaders[locale] = loader;
  }

  /**
   * Add translations for a locale (used by modules to contribute translations)
   * @param {string} locale - Locale code
   * @param {Object} translations - Translation object
   */
  addTranslations(locale, translations) {
    // Skip if translations is empty, null, or undefined
    if (
      !translations ||
      (typeof translations === "object" &&
        Object.keys(translations).length === 0)
    ) {
      return;
    }

    if (!this.translations[locale]) {
      this.translations[locale] = {};
    }
    this.translations[locale] = this.deepMerge(
      this.translations[locale],
      translations,
    );
    this.loadedLocales.add(locale); // Only mark as loaded if we actually added translations
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * Load a locale (lazy loading if loader is registered)
   * @param {string} locale - Locale code
   */
  async loadLocale(locale) {
    // Check if locale has actual translations, not just marked as loaded
    const hasTranslations =
      this.translations[locale] &&
      Object.keys(this.translations[locale]).length > 0;

    if (this.loadedLocales.has(locale) && hasTranslations) {
      return; // Already loaded with actual content
    }

    if (this.localeLoaders[locale]) {
      try {
        const translations = await this.localeLoaders[locale]();
        this.addTranslations(locale, translations.default || translations);
      } catch (error) {
        console.warn(`Failed to load locale "${locale}":`, error);
      }
    }
  }

  /**
   * Set current language
   * @param {string} locale - Locale code
   */
  async setLanguage(locale) {
    await this.loadLocale(locale);
    this.currentLocale = locale;

    // Emit event for reactive updates
    if (typeof $APP !== "undefined" && $APP.events) {
      $APP.events.emit("i18n:language-changed", { locale });
    }

    return locale;
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLocale;
  }

  /**
   * Get available locales (registered loaders + loaded translations)
   */
  getAvailableLocales() {
    const locales = new Set([
      ...Object.keys(this.localeLoaders),
      ...Object.keys(this.translations),
    ]);
    return Array.from(locales);
  }

  /**
   * Get value from nested object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Dot-separated path (e.g., 'welcome.title')
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get plural category for a number (zero, one, two, few, many, other)
   * @param {number} count - The number to get plural category for
   * @returns {string} - Plural category (zero, one, other, etc.)
   */
  getPluralCategory(count) {
    try {
      const pluralRules = new Intl.PluralRules(this.currentLocale);
      const category = pluralRules.select(count);
      return category;
    } catch (error) {
      // Fallback to simple English rules
      if (count === 0) return "zero";
      if (count === 1) return "one";
      return "other";
    }
  }

  /**
   * Check if an object is a plural form object
   * @param {*} obj - Object to check
   * @returns {boolean}
   */
  isPluralObject(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    // Check if it has plural keys like 'one', 'other', 'zero', 'few', 'many'
    const pluralKeys = ["zero", "one", "two", "few", "many", "other"];
    const keys = Object.keys(obj);
    return keys.some((key) => pluralKeys.includes(key));
  }

  /**
   * Select plural form from plural object
   * @param {Object} pluralObj - Object with plural forms
   * @param {number} count - Number to select plural for
   * @returns {string}
   */
  selectPlural(pluralObj, count) {
    const category = this.getPluralCategory(count);

    // Try exact match first
    if (pluralObj[category]) {
      return pluralObj[category];
    }

    // Fallback chain: category -> other -> first available
    return pluralObj.other || pluralObj[Object.keys(pluralObj)[0]] || "";
  }

  /**
   * Format a number according to locale
   * @param {number} number - Number to format
   * @param {Object} options - Intl.NumberFormat options
   * @returns {string}
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLocale, {
        style: options.style || "decimal",
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
        currency: options.currency,
        ...options,
      }).format(number);
    } catch (error) {
      console.warn("Number formatting failed:", error);
      return String(number);
    }
  }

  /**
   * Format a date according to locale
   * @param {Date|string|number} date - Date to format
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string}
   */
  formatDate(date, options = {}) {
    try {
      return new Intl.DateTimeFormat(this.currentLocale, {
        dateStyle: options.dateStyle || "medium",
        timeStyle: options.timeStyle,
        ...options,
      }).format(new Date(date));
    } catch (error) {
      console.warn("Date formatting failed:", error);
      return String(date);
    }
  }

  /**
   * Format a relative date (today, yesterday, X days ago)
   * @param {Date|string|number} date - Date to format
   * @returns {string}
   */
  formatRelativeDate(date) {
    const now = new Date();
    const target = new Date(date);

    // Reset time to midnight for day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    const diffTime = targetDay - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Handle special cases with translations
    if (diffDays === 0) {
      return this.t("relative.today") || "today";
    } else if (diffDays === -1) {
      return this.t("relative.yesterday") || "yesterday";
    } else if (diffDays === 1) {
      return this.t("relative.tomorrow") || "tomorrow";
    } else if (diffDays < 0) {
      // Use Intl.RelativeTimeFormat if available
      try {
        const rtf = new Intl.RelativeTimeFormat(this.currentLocale, {
          numeric: "auto",
        });
        return rtf.format(diffDays, "day");
      } catch (error) {
        return (
          this.t("relative.daysAgo", { n: Math.abs(diffDays) }) ||
          `${Math.abs(diffDays)} days ago`
        );
      }
    } else {
      try {
        const rtf = new Intl.RelativeTimeFormat(this.currentLocale, {
          numeric: "auto",
        });
        return rtf.format(diffDays, "day");
      } catch (error) {
        return (
          this.t("relative.inDays", { n: diffDays }) || `in ${diffDays} days`
        );
      }
    }
  }

  /**
   * Interpolate parameters in translation string
   * @param {string} str - Translation string with {param} placeholders
   * @param {Object} params - Parameters to interpolate
   */
  interpolate(str, params = {}) {
    if (!str || typeof str !== "string") return str;

    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Translate a key (with pluralization support)
   * @param {string} key - Translation key (dot-separated)
   * @param {Object} params - Parameters for interpolation (use 'n' or 'count' for plurals)
   * @returns {string}
   */
  t(key, params = {}) {
    if (!key) return "";

    // Try current locale
    let translation = this.getNestedValue(
      this.translations[this.currentLocale],
      key,
    );

    // Fallback to fallback locale
    if (
      translation === undefined &&
      this.currentLocale !== this.fallbackLocale
    ) {
      translation = this.getNestedValue(
        this.translations[this.fallbackLocale],
        key,
      );
    }

    // If still not found, return the key
    if (translation === undefined) {
      console.warn(
        `Translation not found for key "${key}" in locale "${this.currentLocale}"`,
      );
      return key;
    }

    // Check if translation is a plural object
    if (this.isPluralObject(translation)) {
      const count = params.n !== undefined ? params.n : params.count;
      if (count === undefined) {
        console.warn(
          `Plural translation "${key}" requires 'n' or 'count' parameter`,
        );
        return key;
      }
      translation = this.selectPlural(translation, count);
    }

    // Handle nested objects (return key if not a string)
    if (typeof translation !== "string") {
      console.warn(`Translation for key "${key}" is not a string`);
      return key;
    }

    // Interpolate parameters
    return this.interpolate(translation, params);
  }
}

export default I18n;
