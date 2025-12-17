import $APP from "/$app.js";
import { html } from "/npm/lit-html";

import "/$app/base/apploader.js";
import Controller from "/$app/controller/index.js";
import { initSWFrontend } from "/$app/sw/frontend.js";
import T from "/$app/types/index.js";
import View, { settings } from "/$app/view/index.js";
import Loader from "/$app/view/loader.js";

// Initialize SW frontend with $APP injection
initSWFrontend($APP);

import Backend from "/$app/base/backend/frontend.js";
import initControllerApp, { registerModelType } from "/$app/controller/app.js";
import { initModelFrontend } from "/$app/model/frontend.js";
import { ModelType } from "/$app/model/index.js";
import initRouterApp from "/$app/router/app.js";
import Router from "/$app/router/index.js";
import "/$app/base/app/index.js";

// Initialize model frontend with $APP injection
initModelFrontend($APP);
import "/frontend.js";
settings.iconFontFamily = `/$app/icon-${$APP.theme.font.icon.family}/${$APP.theme.font.icon.family}`;
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

// Load theme dev module in dev mode (CSS fetching for components)
if (settings.loadStyle) {
  import("/$app/theme/dev.js");
}

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
