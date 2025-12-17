/**
 * Bundler Admin Plugin
 * Registers the bundler/release manager in the admin sidebar
 */
import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

registerPlugin("bundler", {
  sidebar: [
    {
      label: "Bundler",
      icon: "package",
      href: "/admin/bundler",
    },
  ],
  routes: {
    "/admin/bundler": {
      name: "admin-bundler",
      component: () => {
        return html`<bundler-ui></bundler-ui>`;
      },
      title: "Admin - Bundler",
      template: "admin-layout",
    },
  },
});
