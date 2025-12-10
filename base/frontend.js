import { html } from "lit-html";
import $APP from "/app";

import "/app/apploader.js";
import Controller from "@bootstrapp/controller";
import { initSWFrontend } from "@bootstrapp/sw/frontend.js";
import View, { settings } from "@bootstrapp/view";
import Loader from "@bootstrapp/view/loader.js";
import T from "/app/types";

// Initialize SW frontend with $APP injection
initSWFrontend($APP);
import initControllerApp, {
  registerModelType,
} from "@bootstrapp/controller/app.js";
import { ModelType } from "@bootstrapp/model";
import { initModelFrontend } from "@bootstrapp/model/frontend.js";
import Router from "@bootstrapp/router";
import initRouterApp from "@bootstrapp/router/app.js";
import Backend from "/app/backend/frontend.js";
import "/app/app/index.js";

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
