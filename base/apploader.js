/**
 * @file Component Loader Integration
 * @description Bridges the $APP framework events to the Core Loader.
 */

import Loader from "/$app/view/loader.js";
import $APP from "/$app.js";

/**
 * Initialize Loader with App settings and start DOM observation
 */
const init = () => {
  Loader.configure({
    basePath: $APP.settings.basePath || "/",
    modules: $APP.modules || {},
    dev: $APP.settings.dev || false,
  });
  Loader.initDOM();
};

$APP.events.on("APP:READY", init);

$APP.events.set({
  moduleAdded({ module }) {
    Loader.addModule(module);
  },
});

$APP.define = Loader.define;
