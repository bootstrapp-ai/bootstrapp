/**
 * Theme Admin Plugin
 * Registers the theme showcase/generator in the admin sidebar
 */
import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

registerPlugin("theme", {
  sidebar: [
    {
      label: "Theme",
      icon: "palette",
      href: "/admin/theme",
    },
  ],
  routes: {
    "/admin/theme": {
      name: "admin-theme",
      component: () => html`<uix-showcase></uix-showcase>`,
      title: "Admin - Theme",
      template: "admin-layout",
    },
  },
});
