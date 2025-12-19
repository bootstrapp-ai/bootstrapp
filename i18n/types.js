import T from "../types/index.js";

export default {
  name: "@bootstrapp/i18n",
  exports: {
    default: T.object({ description: "i18n module with translation and formatting methods" }),

    NumberFormatOptions: {
      $interface: true,
      style: T.string({ description: "'decimal', 'currency', or 'percent'" }),
      currency: T.string({ description: "Currency code (e.g., 'USD')" }),
      minimumFractionDigits: T.number({ description: "Minimum decimal places" }),
      maximumFractionDigits: T.number({ description: "Maximum decimal places" }),
    },

    DateFormatOptions: {
      $interface: true,
      dateStyle: T.string({ description: "'full', 'long', 'medium', or 'short'" }),
      timeStyle: T.string({ description: "'full', 'long', 'medium', or 'short'" }),
    },

    t: T.function({
      description: "Translate a key with interpolation and pluralization support",
      args: [
        T.string({ name: "key", description: "Translation key (dot-separated)" }),
        T.object({ name: "params", description: "Parameters for interpolation (use 'n' or 'count' for plurals)" }),
      ],
      returns: T.string({ description: "Translated string" }),
    }),

    n: T.function({
      description: "Format a number according to current locale",
      args: [
        T.number({ name: "number", description: "Number to format" }),
        T.object({ name: "options", description: "Intl.NumberFormat options" }),
      ],
      returns: T.string({ description: "Formatted number string" }),
    }),

    d: T.function({
      description: "Format a date according to current locale",
      args: [
        T.any({ name: "date", description: "Date, string, or timestamp" }),
        T.object({ name: "options", description: "Intl.DateTimeFormat options" }),
      ],
      returns: T.string({ description: "Formatted date string" }),
    }),

    r: T.function({
      description: "Format a relative date (today, yesterday, X days ago)",
      args: [T.any({ name: "date", description: "Date, string, or timestamp" })],
      returns: T.string({ description: "Relative date string" }),
    }),

    setLanguage: T.function({
      description: "Set current language with lazy loading and optional auto-rerender",
      args: [T.string({ name: "locale", description: "Locale code (e.g., 'en', 'pt')" })],
      returns: T.string({ description: "Loaded locale code" }),
    }),

    getLanguage: T.function({
      description: "Get current language locale code",
      args: [],
      returns: T.string({ description: "Current locale code" }),
    }),

    getAvailableLocales: T.function({
      description: "Get list of available locales",
      args: [],
      returns: T.array({ description: "Array of locale codes" }),
    }),

    registerLocale: T.function({
      description: "Register a locale loader for lazy loading translations",
      args: [
        T.string({ name: "locale", description: "Locale code" }),
        T.function({ name: "loader", description: "Async function returning translations" }),
      ],
      returns: T.any(),
    }),

    addTranslations: T.function({
      description: "Add translations for a locale (merges with existing)",
      args: [
        T.string({ name: "locale", description: "Locale code" }),
        T.object({ name: "translations", description: "Translation object" }),
      ],
      returns: T.any(),
    }),

    I18n: {
      $interface: true,
      translations: T.object({ description: "All loaded translations { locale: { key: value } }" }),
      currentLocale: T.string({ description: "Current active locale" }),
      fallbackLocale: T.string({ description: "Fallback locale when translation not found" }),
      loadedLocales: T.object({ description: "Set of loaded locale codes" }),
      localeLoaders: T.object({ description: "Registered locale loaders" }),

      registerLocale: T.function({
        description: "Register a locale loader",
        args: [T.string({ name: "locale" }), T.function({ name: "loader" })],
        returns: T.any(),
      }),

      addTranslations: T.function({
        description: "Add translations for a locale",
        args: [T.string({ name: "locale" }), T.object({ name: "translations" })],
        returns: T.any(),
      }),

      loadLocale: T.function({
        description: "Load a locale (triggers lazy loader if registered)",
        args: [T.string({ name: "locale" })],
        returns: T.any(),
      }),

      setLanguage: T.function({
        description: "Set current language",
        args: [T.string({ name: "locale" })],
        returns: T.string(),
      }),

      getLanguage: T.function({
        description: "Get current language",
        args: [],
        returns: T.string(),
      }),

      getAvailableLocales: T.function({
        description: "Get available locales",
        args: [],
        returns: T.array(),
      }),

      t: T.function({
        description: "Translate a key",
        args: [T.string({ name: "key" }), T.object({ name: "params" })],
        returns: T.string(),
      }),

      formatNumber: T.function({
        description: "Format a number",
        args: [T.number({ name: "number" }), T.object({ name: "options" })],
        returns: T.string(),
      }),

      formatDate: T.function({
        description: "Format a date",
        args: [T.any({ name: "date" }), T.object({ name: "options" })],
        returns: T.string(),
      }),

      formatRelativeDate: T.function({
        description: "Format a relative date",
        args: [T.any({ name: "date" })],
        returns: T.string(),
      }),
    },
  },
};
