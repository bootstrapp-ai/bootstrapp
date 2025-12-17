/**
 * Google Maps Plugin for Admin
 * Search and import places from Google Maps
 */

import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

// Register plugin with routes, actions, modals, and sidebar
registerPlugin("gmaps", {
  routes: {
    "/admin/maps-search": {
      name: "admin-maps-search",
      component: () => html`<admin-gmaps-search></admin-gmaps-search>`,
      template: "admin-layout",
    },
  },

  sidebar: [
    {
      label: "Maps Search",
      href: "/admin/maps-search",
      icon: "map",
    },
  ],

  actions: {
    places: [
      {
        label: "Import from Maps",
        icon: "map-pin",
        handler: (context) => context.openModal("gmaps-search"),
      },
    ],
  },

  modals: {
    "gmaps-search": {
      title: "Import from Google Maps",
      size: "lg",
      component: ({ model }) => html`
        <admin-gmaps-search .model=${model} modal></admin-gmaps-search>
      `,
    },
  },
});
