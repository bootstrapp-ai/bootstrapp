import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import { getModelNames, capitalize } from "../utils/model-utils.js";

export default {
  tag: "admin-sidebar",
  properties: {
    collapsed: T.boolean({ defaultValue: false }),
    currentPath: T.string({ defaultValue: "" }),
    modelsExpanded: T.boolean({ defaultValue: true, sync: "local" }),
  },

  connected() {
    // Update current path on route change
    this.currentPath = window.location.pathname;
    this._routeHandler = () => {
      this.currentPath = window.location.pathname;
    };
    window.addEventListener("popstate", this._routeHandler);
  },

  disconnected() {
    window.removeEventListener("popstate", this._routeHandler);
  },

  isActive(path) {
    return this.currentPath === path || this.currentPath.startsWith(path + "/");
  },

  isModelActive(modelName) {
    return this.currentPath.includes(`/admin/models/${modelName}`);
  },

  toggleModels() {
    this.modelsExpanded = !this.modelsExpanded;
  },

  navigate(path) {
    $APP.Router.go(path);
    this.currentPath = path;
  },

  render() {
    const models = getModelNames();

    const navItem = (href, icon, label, active = false) => html`
      <a
        href=${href}
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
               ${active
                 ? "bg-black text-white"
                 : "text-gray-700 hover:bg-gray-100"}"
        @click=${(e) => {
          e.preventDefault();
          this.navigate(href);
        }}
      >
        <uix-icon name=${icon} size="20"></uix-icon>
        ${!this.collapsed ? html`<span class="font-medium">${label}</span>` : ""}
      </a>
    `;

    const modelItem = (model) => html`
      <a
        href="/admin/models/${model}"
        class="flex items-center gap-3 px-4 py-2 pl-12 rounded-lg transition-colors
               ${this.isModelActive(model)
                 ? "bg-gray-200 text-black font-semibold"
                 : "text-gray-600 hover:bg-gray-100"}"
        @click=${(e) => {
          e.preventDefault();
          this.navigate(`/admin/models/${model}`);
        }}
      >
        <span class="text-sm">${capitalize(model)}</span>
      </a>
    `;

    return html`
      <aside
        class="h-full bg-white border-r-3 border-black flex flex-col transition-all duration-300
               ${this.collapsed ? "w-20" : "w-64"}"
      >
        <!-- Header -->
        <div class="p-4 border-b-3 border-black flex items-center justify-between">
          ${!this.collapsed
            ? html`
                <div class="flex items-center gap-2">
                  <uix-icon name="shield" size="24" class="text-black"></uix-icon>
                  <span class="font-black text-lg uppercase">Admin</span>
                </div>
              `
            : html`
                <uix-icon name="shield" size="24" class="mx-auto"></uix-icon>
              `}
          <button
            @click=${() => this.emit("toggle")}
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label=${this.collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <uix-icon
              name=${this.collapsed ? "chevron-right" : "chevron-left"}
              size="20"
            ></uix-icon>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          ${navItem("/admin", "layout-dashboard", "Dashboard", this.currentPath === "/admin")}

          <!-- Models Section -->
          <div class="pt-2">
            <button
              @click=${this.toggleModels}
              class="flex items-center justify-between w-full px-4 py-3 rounded-lg
                     text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-3">
                <uix-icon name="database" size="20"></uix-icon>
                ${!this.collapsed
                  ? html`<span class="font-medium">Models</span>`
                  : ""}
              </div>
              ${!this.collapsed
                ? html`
                    <uix-icon
                      name=${this.modelsExpanded ? "chevron-down" : "chevron-right"}
                      size="16"
                    ></uix-icon>
                  `
                : ""}
            </button>

            ${!this.collapsed && this.modelsExpanded
              ? html`
                  <div class="mt-1 space-y-1">
                    ${models.map((model) => modelItem(model))}
                  </div>
                `
              : ""}
          </div>

          <div class="pt-4 border-t border-gray-200 mt-4 space-y-1">
            ${navItem("/admin/deploy", "rocket", "Deploy", this.isActive("/admin/deploy"))}
            ${navItem("/admin/theme", "palette", "Theme", this.isActive("/admin/theme"))}
          </div>
        </nav>

        <!-- Footer -->
        <div class="p-3 border-t-3 border-black">
          ${!this.collapsed
            ? html`
                <div class="flex items-center justify-between px-2">
                  <span class="text-xs text-gray-500">Bootstrapp Admin</span>
                  <uix-darkmode></uix-darkmode>
                </div>
              `
            : html`
                <div class="flex justify-center">
                  <uix-darkmode></uix-darkmode>
                </div>
              `}
        </div>
      </aside>
    `;
  },
};
