import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import { getSidebarItems } from "../plugins.js";
import { capitalize, getModelNames } from "../utils/model-utils.js";

export default {
  tag: "admin-layout",
  style: true,
  properties: {
    currentRoute: T.object({ sync: $APP.Router }),
    sidebarCollapsed: T.boolean({ defaultValue: false, sync: "local" }),
  },

  handleSidebarToggle(e) {
    this.sidebarCollapsed = e.detail.collapsed;
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

  getBreadcrumbs() {
    const path = this.currentRoute?.path || window.location.pathname;
    const parts = path.split("/").filter(Boolean);
    const breadcrumbs = [{ text: "Admin", href: "/admin" }];

    if (parts.length > 1) {
      if (parts[1] === "models" && parts[2]) {
        breadcrumbs.push({ text: "Models", href: null });
        breadcrumbs.push({
          text: capitalize(parts[2]),
          href: `/admin/models/${parts[2]}`,
        });
        if (parts[3]) {
          breadcrumbs.push({
            text: parts[3] === "new" ? "New" : "Edit",
            href: null,
          });
        }
      } else {
        breadcrumbs.push({ text: capitalize(parts[1]), href: null });
      }
    } else {
      breadcrumbs.push({ text: "Dashboard", href: null });
    }

    return breadcrumbs;
  },

  render() {
    const models = getModelNames();
    const sidebarItems = getSidebarItems();
    const breadcrumbs = this.getBreadcrumbs();
    const isDashboard =
      this.isActive("/admin") && !this.currentRoute?.path?.includes("/models");
    return html`
      <div class="admin-wrapper">
        <uix-sidebar
          ?collapsed=${this.sidebarCollapsed}
          @toggle=${this.handleSidebarToggle}
        >
          <div slot="header" class="sidebar-brand">
            <uix-icon name="shield" size="28"></uix-icon>
            <span class="sidebar-title">Admin</span>
          </div>

          <nav class="admin-nav">
            <uix-nav-item
              href="/admin"
              icon="layout-dashboard"
              label="Dashboard"
              ?active=${isDashboard}
              indicatorPosition="left"
              activeBg
              rounded
              ?iconOnly=${this.sidebarCollapsed}
            ></uix-nav-item>

            ${sidebarItems.map(
              (item) => html`
                <uix-nav-item
                  href=${item.href}
                  icon=${item.icon}
                  label=${item.label}
                  ?active=${this.isActive(item.href)}
                  indicatorPosition="left"
                  activeBg
                  rounded
                  ?iconOnly=${this.sidebarCollapsed}
                ></uix-nav-item>
              `,
            )}

            <details class="models-accordion" ?open=${!this.sidebarCollapsed}>
              <summary class="models-header">
                <uix-icon name="database"></uix-icon>
                ${!this.sidebarCollapsed ? html`<span>Models</span>` : ""}
              </summary>
              <div class="models-list">
                ${models.map(
                  (model) => html`
                    <uix-nav-item
                      href="/admin/models/${model}"
                      icon="table"
                      label=${capitalize(model)}
                      ?active=${this.isModelActive(model)}
                      indicatorPosition="left"
                      activeBg
                      rounded
                    ></uix-nav-item>
                  `,
                )}
              </div>
            </details>
          </nav>

          <div slot="footer">
            <uix-darkmode></uix-darkmode>
          </div>
        </uix-sidebar>

        <div class="admin-main">
          <uix-navbar variant="bordered">
            <div slot="start">
              <uix-breadcrumbs separator=">" .items=${breadcrumbs}></uix-breadcrumbs>
            </div>

            <div slot="end" class="topbar-right">
              <uix-link icon="search" title="Search"></uix-link>
              <uix-link icon="bell" title="Notifications"></uix-link>
              <uix-link icon="settings" title="Settings"></uix-link>
              <uix-avatar size="sm"></uix-avatar>
            </div>
          </uix-navbar>

          <main class="admin-content">
            ${this.currentRoute.component}
          </main>
        </div>
      </div>
    `;
  },
};
