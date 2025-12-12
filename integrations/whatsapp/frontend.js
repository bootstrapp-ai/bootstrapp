import { html } from "lit-html";

const routes = {
  "/admin/whatsapp": {
    component: () => html`<whatsapp-admin></whatsapp-admin>`,
    title: "WhatsApp",
    template: "admin-template",
  },
  "/admin/whatsapp/:action": {
    component: ({ action }) =>
      html`<whatsapp-admin action=${action}></whatsapp-admin>`,
    title: "WhatsApp",
    template: "admin-template",
  },
};

$APP.routes.set(routes);

$APP.settings.set({
  mv3popup: html`<whatsapp-group-new></whatsapp-group-new>`,
});
$APP.mv3Connections.add("whatsapp");

const currentUrl = window.location.href;
$APP.settings.set({ currentUrl });
