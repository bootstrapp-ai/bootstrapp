import "/$app/admin/cms/index.js";
import "/$app/admin/project/index.js";
import "/$app/bundler/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";

$APP.addModule({
  name: "admin",
  path: "apps/admin/views",
});

const routes = {
  "/admin": {
    component: () => html`<cms-ui directory="admin/cms"></cms-ui>`,
    title: "Admin",
    template: "admin-template",
  },
  "/admin/cms": {
    component: () => html`<cms-ui directory="admin/cms"></cms-ui>`,
    title: "Data",
    template: "admin-template",
  },
  "/admin/ide": {
    component: () =>
      html`<ide-ui full directory="/projects" hasProject></ide-ui>`,
    title: "IDE",
    template: "admin-template",
  },
  "/admin/bundler": {
    component: () => html`<bundler-ui></bundler-ui>`,
    title: "Bundler",
    template: "admin-template",
  },
  "/admin/project": {
    component: () =>
      html`<cms-crud
							view="board"
							class="p-8"
							.data-query=${{ model: "tasks", key: "rows" }} 
							.allowedActions=${["import", "export", "changeViewMode", "changeColumns"]}></cms-crud>`,
    title: "Data",
    template: "admin-template",
  },
  "/admin/design": {
    component: () => html`<design-ui></design-ui>`,
    title: "Design",
    template: "admin-template",
  },
  "/admin/design/:component": {
    component: ({ component }) =>
      html`<design-ui component=${component}></design-ui>`,
    title: "Component Design",
    template: "admin-template",
  },
  "/admin/cms/:model": {
    component: ({ model }) =>
      html`<cms-ui directory="admin/cms" model=${model}></cms-ui>`,
    title: "Admin",
    template: "admin-template",
  },
  "/admin/cms/:model/:id": {
    name: "cms_item",
    component: ({ model, id }) =>
      html`<cms-ui directory="admin/cms" model=${model} selectedId=${id}></cms-ui>`,
    title: "Admin",
    template: "admin-template",
  },
  "/admin/mcp": {
    component: () => html`<mcp-inspector></mcp-inspector>`,
    title: "MCP Inspector",
    template: "admin-template",
  },
  "/admin/mcp-dev": {
    component: () => html`<mcp-dev></mcp-dev>`,
    title: "Chat",
    template: "admin-template",
  },
  "/admin/mcp-chat": {
    component: () => html`<mcp-chat></mcp-chat>`,
    title: "Chat",
    template: "admin-template",
  },
  "/admin/chat": {
    component: () =>
      html`<app-chat class="flex-1 flex h-screen bg-gray-100 font-sans"></app-chat>`,
    title: "Data",
    template: "admin-template",
  },
};

$APP.routes.set(routes);
