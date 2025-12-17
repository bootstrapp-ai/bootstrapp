import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import { getPluginRoutes } from "./plugins.js";
import "/$app/bundler/index.js";

import "/$app/bundler/plugin.js";
// Import non-dev admin plugins (always loaded)
import "/$app/theme/plugin.js";
import "/$app/extension/admin/plugin.js";

// Register admin module
$APP.addModule({
  name: "admin",
  path: "/$app/admin/views",
});

// Core admin routes (dashboard, models, legacy)
const coreRoutes = {
  // Dashboard
  "/admin": {
    name: "admin-dashboard",
    component: () => html`<admin-dashboard></admin-dashboard>`,
    title: "Admin Dashboard",
    template: "admin-layout",
  },

  // Model CRUD
  "/admin/models/:model": {
    name: "admin-model-list",
    component: ({ model }) => html`
      <admin-model-list
        model=${model}
        .data-query=${{ model, key: "rows" }}
      ></admin-model-list>
    `,
    title: "Admin - Models",
    template: "admin-layout",
  },

  "/admin/models/:model/:id": {
    name: "admin-model-detail",
    component: ({ model, id }) => html`
      <admin-model-list
        model=${model}
        selectedId=${id}
        .data-query=${{ model, key: "rows" }}
      ></admin-model-list>
    `,
    title: "Admin - Edit",
    template: "admin-layout",
  },

  // Legacy CMS routes (for backward compatibility)
  "/admin/cms": {
    component: () => html`<admin-dashboard></admin-dashboard>`,
    title: "Admin",
    template: "admin-layout",
  },

  "/admin/cms/:model": {
    component: ({ model }) => html`
      <admin-model-list
        model=${model}
        .data-query=${{ model, key: "rows" }}
      ></admin-model-list>
    `,
    title: "Admin",
    template: "admin-layout",
  },

  "/admin/cms/:model/:id": {
    name: "cms_item",
    component: ({ model, id }) => html`
      <admin-model-list
        model=${model}
        selectedId=${id}
        .data-query=${{ model, key: "rows" }}
      ></admin-model-list>
    `,
    title: "Admin",
    template: "admin-layout",
  },
};

// Merge core routes with plugin routes
const routes = { ...coreRoutes, ...getPluginRoutes() };

// Register routes
$APP.routes.set(routes);

export default routes;
