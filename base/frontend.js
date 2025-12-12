import { html } from "/npm/lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";

import "/node_modules/@bootstrapp/base/apploader.js";
import Controller from "/node_modules/@bootstrapp/controller/index.js";
import { initSWFrontend } from "/node_modules/@bootstrapp/sw/frontend.js";
import View, { settings } from "/node_modules/@bootstrapp/view/index.js";
import Loader from "/node_modules/@bootstrapp/view/loader.js";
import T from "/node_modules/@bootstrapp/types/index.js";

// Initialize SW frontend with $APP injection
initSWFrontend($APP);
import initControllerApp, {
  registerModelType,
} from "/node_modules/@bootstrapp/controller/app.js";
import { ModelType } from "/node_modules/@bootstrapp/model/index.js";
import { initModelFrontend } from "/node_modules/@bootstrapp/model/frontend.js";
import Router from "/node_modules/@bootstrapp/router/index.js";
import initRouterApp from "/node_modules/@bootstrapp/router/app.js";
import Backend from "/node_modules/@bootstrapp/base/backend/frontend.js";
import "/node_modules/@bootstrapp/base/app/index.js";

// Initialize model frontend with $APP injection
initModelFrontend($APP);
import "/frontend.js";
settings.iconFontFamily = `/node_modules/@bootstrapp/icon-${$APP.theme.font.icon.family}/${$APP.theme.font.icon.family}`;
Controller.add("backend", Backend);
registerModelType(ModelType);
initControllerApp($APP, Controller, View);
initRouterApp($APP, Router, Controller);

$APP.events.on("APP:INIT", () => {
  if (!View.components.has("app-container"))
    $APP.define("app-container", {
      tag: "app-container",
      class: "flex flex-grow",
      extends: "router-ui",
      properties: {
        routes: T.object({ defaultValue: $APP.routes }),
        full: T.boolean(true),
      },
    });
});

$APP.addModule({ name: "template", path: "/views/templates" });
$APP.addModule({ name: "view", path: "/views" });

const getComponentPath = (tag) => {
  return View.components.get(tag)?.path || Loader.resolvePath(tag);
};

View.getComponentPath = getComponentPath;
settings.loadStyle = !$APP.settings.production;
View.reloadComponents = !!$APP.settings.preview;

View.plugins.push({
  name: "hydrate",
  willUpdate: ({ instance }) => {
    if (
      $APP.settings.production &&
      !instance.hasUpdated &&
      instance.hasAttribute("client:hydrate")
    ) {
      instance.innerHTML = "";
      instance.removeAttribute("client:hydrate");
    }
  },
});

if (!$APP.routes["/"])
  $APP.routes.set({
    "/": { name: "index", component: () => html`<app-index></app-index>` },
  });
