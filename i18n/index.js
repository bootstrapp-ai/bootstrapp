import Controller from "/$app/controller/index.js";
import View from "/$app/view/index.js";
import { I18n } from "./base.js";
import i18nViewPlugin from "./view-plugin.js";

const i18nInstance = new I18n();

View.plugins.push(i18nViewPlugin);

const base = {
  t: (key, params) => i18nInstance.t(key, params),

  n: (number, options) => i18nInstance.formatNumber(number, options),

  d: (date, options) => i18nInstance.formatDate(date, options),

  r: (date) => i18nInstance.formatRelativeDate(date),

  setLanguage: async (locale) => {
    console.log("i18n setLanguage called with:", locale);
    const newLocale = await i18nInstance.setLanguage(locale);
    console.log("Locale loaded:", newLocale);

    if (Controller?.i18n) {
      Controller.i18n.set("currentLocale", newLocale);
    }

    const autoRerender = $APP.settings.i18n.autoRerender;
    const rootComponent = $APP.settings.i18n.rootComponent;
    console.log("Auto-rerender settings:", { autoRerender, rootComponent });

    if (autoRerender && rootComponent) {
      try {
        const oldContainer = document.querySelector(rootComponent);
        console.log("Found container:", oldContainer);
        if (oldContainer) {
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

  getLanguage: () => i18nInstance.getLanguage(),

  getAvailableLocales: () => i18nInstance.getAvailableLocales(),

  registerLocale: (locale, loader) =>
    i18nInstance.registerLocale(locale, loader),

  addTranslations: (locale, translations) =>
    i18nInstance.addTranslations(locale, translations),

  _instance: i18nInstance,
};

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
    moduleAdded({ module }) {
      if (module.i18n) {
        for (const [locale, translations] of Object.entries(module.i18n)) {
          i18nInstance.addTranslations(locale, translations);
        }
      }
    },

    async "APP:INIT"() {
      if (Controller && !Controller.i18n) {
        Controller.createAdapter("i18n", {
          storage: "localStorage",
          prefix: "i18n:",
        });
      }

      const savedLocale = Controller?.i18n?.get("currentLocale");
      if (savedLocale) {
        await i18nInstance.setLanguage(savedLocale);
      } else {
        const defaultLocale = $APP.settings.get("i18n.defaultLocale") || "en";
        await i18nInstance.setLanguage(defaultLocale);
      }
    },
  }),
});

export default base;
