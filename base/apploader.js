import View from "/$app/view/index.js";
import Loader from "/$app/view/loader.js";
import $APP from "/$app.js";

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
$APP.View = View;
