import Router from "/$app/router/index.js";
import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
export default {
  class: "w-full flex h-screen bg-gray-50",
  tag: "admin-layout",
  properties: {
    currentRoute: T.object({ sync: Router }),
    sidebarCollapsed: T.boolean({ defaultValue: false, sync: "local" }),
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  },

  render() {
    return html`
      <admin-sidebar
        .collapsed=${this.sidebarCollapsed}
        @toggle=${this.toggleSidebar}
      ></admin-sidebar>

      <main class="flex-1 overflow-auto">
        ${this.currentRoute.component}
      </main>
    `;
  },
};
