export class I18n {
  constructor() {
    this.translations = {};
    this.currentLocale = "en";
    this.fallbackLocale = "en";
    this.loadedLocales = new Set();
    this.localeLoaders = {};
  }

  registerLocale(locale, loader) {
    this.localeLoaders[locale] = loader;
  }

  addTranslations(locale, translations) {
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
    this.loadedLocales.add(locale);
  }

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

  async loadLocale(locale) {
    const hasTranslations =
      this.translations[locale] &&
      Object.keys(this.translations[locale]).length > 0;

    if (this.loadedLocales.has(locale) && hasTranslations) {
      return;
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

  async setLanguage(locale) {
    await this.loadLocale(locale);
    this.currentLocale = locale;

    if (typeof $APP !== "undefined" && $APP.events) {
      $APP.events.emit("i18n:language-changed", { locale });
    }

    return locale;
  }

  getLanguage() {
    return this.currentLocale;
  }

  getAvailableLocales() {
    const locales = new Set([
      ...Object.keys(this.localeLoaders),
      ...Object.keys(this.translations),
    ]);
    return Array.from(locales);
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  getPluralCategory(count) {
    try {
      const pluralRules = new Intl.PluralRules(this.currentLocale);
      const category = pluralRules.select(count);
      return category;
    } catch (error) {
      if (count === 0) return "zero";
      if (count === 1) return "one";
      return "other";
    }
  }

  isPluralObject(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const pluralKeys = ["zero", "one", "two", "few", "many", "other"];
    const keys = Object.keys(obj);
    return keys.some((key) => pluralKeys.includes(key));
  }

  selectPlural(pluralObj, count) {
    const category = this.getPluralCategory(count);

    if (pluralObj[category]) {
      return pluralObj[category];
    }

    return pluralObj.other || pluralObj[Object.keys(pluralObj)[0]] || "";
  }

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

  formatRelativeDate(date) {
    const now = new Date();
    const target = new Date(date);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );

    const diffTime = targetDay - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return this.t("relative.today") || "today";
    } else if (diffDays === -1) {
      return this.t("relative.yesterday") || "yesterday";
    } else if (diffDays === 1) {
      return this.t("relative.tomorrow") || "tomorrow";
    } else if (diffDays < 0) {
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

  interpolate(str, params = {}) {
    if (!str || typeof str !== "string") return str;

    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  t(key, params = {}) {
    if (!key) return "";

    let translation = this.getNestedValue(
      this.translations[this.currentLocale],
      key,
    );

    if (
      translation === undefined &&
      this.currentLocale !== this.fallbackLocale
    ) {
      translation = this.getNestedValue(
        this.translations[this.fallbackLocale],
        key,
      );
    }

    if (translation === undefined) {
      console.warn(
        `Translation not found for key "${key}" in locale "${this.currentLocale}"`,
      );
      return key;
    }

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

    if (typeof translation !== "string") {
      console.warn(`Translation for key "${key}" is not a string`);
      return key;
    }

    return this.interpolate(translation, params);
  }
}

export default I18n;
