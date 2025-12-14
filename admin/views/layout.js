import Router from "/$app/router/index.js";
import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import { getSidebarItems } from "../plugins.js";
import { capitalize, getModelNames } from "../utils/model-utils.js";

export default {
  tag: "admin-layout",
  style: true,
  properties: {
    currentRoute: T.object({ sync: Router }),
    sidebarCollapsed: T.boolean({ defaultValue: false, sync: "local" }),
  },

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  },

  isActive(path) {
    const currentPath = this.currentRoute?.path || window.location.pathname;
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath === path || currentPath.startsWith(`${path}/`);
  },

  isModelActive(modelName) {
    const currentPath = this.currentRoute?.path || window.location.pathname;
    return currentPath.includes(`/admin/models/${modelName}`);
  },

  render() {
    const models = getModelNames();
    const sidebarItems = getSidebarItems();
    console.error({ sidebarItems });
    return html`
      <uix-sidebar
        position="left"
        ?collapsed=${this.sidebarCollapsed}
        collapsible
        @toggle=${this.toggleSidebar}
      >
        <div slot="header" class="sidebar-brand">
          <uix-icon name="shield" size="24"></uix-icon>
          ${
            !this.sidebarCollapsed
              ? html`<span class="sidebar-title">Admin</span>`
              : ""
          }
        </div>

        <uix-menu variant="sidebar">
          <li>
            <uix-link
              href="/admin"
              icon="layout-dashboard"
              class=${this.isActive("/admin") ? "active" : ""}
            >
              Dashboard
            </uix-link>
          </li>

          <li>
            <details open>
              <summary>
                <uix-icon name="database" size="20"></uix-icon>
                <span class="sidebar-label">Models</span>
                <uix-icon name="chevron-right" size="16"></uix-icon>
              </summary>
              <ul>
                ${models.map(
                  (model) => html`
                    <li>
                      <uix-link
                        href="/admin/models/${model}"
                        class=${this.isModelActive(model) ? "active" : ""}
                      >
                        ${capitalize(model)}
                      </uix-link>
                    </li>
                  `,
                )}
              </ul>
            </details>
          </li>

          <li class="divider"></li>

          ${sidebarItems.map(
            (item) => html`
              <li>
                <uix-link
                  href=${item.href}
                  icon=${item.icon}
                  class=${this.isActive(item.href) ? "active" : ""}
                >
                  ${item.label}
                </uix-link>
              </li>
            `,
          )}
        </uix-menu>

        <div slot="footer" class="sidebar-footer-content">
          <uix-darkmode></uix-darkmode>
        </div>
      </uix-sidebar>

      <main class="admin-layout-main">
        ${this.currentRoute.component}
      </main>
    `;
  },
};
