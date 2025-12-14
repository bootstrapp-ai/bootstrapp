/**
 * Extension Admin Plugin
 * Registers the browser extension manager in the admin sidebar
 */
import { registerPlugin } from "/$app/admin/plugins.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

$APP.addModule({ name: "extension", path: "/$app/extension/admin" });
registerPlugin("extension", {
  sidebar: [
    {
      label: "Extension",
      icon: "puzzle",
      href: "/admin/extension",
    },
  ],
  actions: {
    _global: [
      {
        label: "Browser Extension",
        icon: "puzzle",
        handler: (context) => context.openModal("extension-manager"),
      },
    ],
  },

  modals: {
    "extension-manager": {
      title: "Browser Extension",
      component: () => html`<extension-manager></extension-manager>`,
    },
  },

  routes: {
    "/admin/extension": {
      name: "admin-extension",
      component: () => html`<extension-manager></extension-manager>`,
      title: "Admin - Extension",
      template: "admin-layout",
    },
  },
});
