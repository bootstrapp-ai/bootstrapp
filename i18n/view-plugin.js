export default {
  name: "i18n",

  init: ({ component, definition, tag }) => {
    if (definition.i18n && typeof definition.i18n === "object") {
      const translations = { [tag]: definition.i18n };

      if (typeof $APP !== "undefined" && $APP.i18n) {
        $APP.i18n.addTranslations("en", translations);
      }
    }

    component.prototype.$t = function (key, params) {
      const componentName = this.tagName.toLowerCase();
      return $APP.i18n.t(`${componentName}.${key}`, params);
    };

    component.prototype.$n = (number, options) => $APP.i18n.n(number, options);

    component.prototype.$d = (date, options) => $APP.i18n.d(date, options);

    component.prototype.$r = (date) => $APP.i18n.r(date);
  },

  events: {
    connected: function () {
      this._i18nUpdateHandler = () => {
        this.requestUpdate();
      };

      if (typeof $APP !== "undefined" && $APP.events) {
        $APP.events.on("i18n:language-changed", this._i18nUpdateHandler);
      }
    },

    disconnected: function () {
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
