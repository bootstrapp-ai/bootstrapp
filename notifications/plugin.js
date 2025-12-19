import { registerPlugin } from "/$app/admin/plugins.js";
import { html } from "/npm/lit-html";

registerPlugin("notifications", {
  sidebar: [
    {
      label: "Notifications",
      icon: "bell",
      href: "/admin/notifications",
    },
  ],
  routes: {
    "/admin/notifications": {
      name: "admin-notifications",
      component: () => html`<notifications-admin-history></notifications-admin-history>`,
      title: "Admin - Notifications",
      template: "admin-layout",
    },
    "/admin/notifications/compose": {
      name: "admin-notifications-compose",
      component: () => html`<notifications-admin-compose></notifications-admin-compose>`,
      title: "Admin - Compose Notification",
      template: "admin-layout",
    },
  },
});
