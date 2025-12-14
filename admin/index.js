import $APP from "/$app.js";
import { html } from "/npm/lit-html";

// Register admin module
$APP.addModule({
  name: "admin",
  path: "/$app/admin/views",
  settings: {
    appbar: {
      label: "Admin",
      icon: "shield",
    },
  },
});

// Admin routes
const routes = {
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

  // Deploy
  "/admin/deploy": {
    name: "admin-deploy",
    component: () => html`<admin-deploy></admin-deploy>`,
    title: "Admin - Deploy",
    template: "admin-layout",
  },

  // Theme
  "/admin/theme": {
    name: "admin-theme",
    component: () => html`<admin-theme></admin-theme>`,
    title: "Admin - Theme",
    template: "admin-layout",
  },

  // Browser Extension
  "/admin/extension": {
    name: "admin-extension",
    component: () => html`<admin-extension-manager></admin-extension-manager>`,
    title: "Admin - Browser Extension",
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

// Register routes
$APP.routes.set(routes);

export default routes;
