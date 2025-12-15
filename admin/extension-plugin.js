/**
 * @bootstrapp/admin - Extension Plugin
 * Global admin integration for browser extension
 */

import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

registerPlugin("extension", {
  // Global actions (appear in dashboard/header)
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
});
