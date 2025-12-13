import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-sidebar",
  style: true,
  shadow: true,
  properties: {
    position: T.string({
      defaultValue: "left",
      enum: ["left", "right"],
    }),
    collapsed: T.boolean(false),
    collapsible: T.boolean(true),
  },

  toggle() {
    if (this.collapsible) {
      this.collapsed = !this.collapsed;
      this.emit("toggle", { collapsed: this.collapsed });
    }
  },

  render() {
    return html`
      <div class="sidebar-header">
        ${
          this.collapsible
            ? html`
              <button
                class="sidebar-toggle"
                @click=${this.toggle}
                aria-label=${this.collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <uix-icon
                  name=${
                    this.collapsed
                      ? this.position === "left"
                        ? "chevron-right"
                        : "chevron-left"
                      : this.position === "left"
                        ? "chevron-left"
                        : "chevron-right"
                  }
                ></uix-icon>
              </button>
            `
            : ""
        }
        <slot name="header"></slot>
        
      </div>

      <div class="sidebar-content">
        <slot></slot>
      </div>

      <div class="sidebar-footer">
        <slot name="footer"></slot>
      </div>
    `;
  },
};

/**
 * Sidebar Component
 *
 * @component
 * @category navigation
 * @tag uix-sidebar
 *
 * A simple collapsible sidebar container. Use with uix-menu for navigation.
 *
 * @slot header - Content for the sidebar header (logo, brand)
 * @slot default - Main sidebar content (navigation, uix-menu)
 * @slot footer - Content for the sidebar footer (user info, settings)
 *
 * @example
 * // Basic sidebar with menu
 * ```html
 * <uix-sidebar>
 *   <div slot="header">
 *     <uix-icon name="shield"></uix-icon>
 *     <span>Admin</span>
 *   </div>
 *
 *   <uix-menu variant="sidebar">
 *     <li><uix-link href="/dashboard" icon="layout-dashboard">Dashboard</uix-link></li>
 *     <li><uix-link href="/users" icon="users">Users</uix-link></li>
 *     <li><uix-link href="/settings" icon="settings">Settings</uix-link></li>
 *   </uix-menu>
 *
 *   <div slot="footer">
 *     <uix-darkmode></uix-darkmode>
 *   </div>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Collapsible sidebar
 * ```html
 * <uix-sidebar collapsible ?collapsed=${this.collapsed} @toggle=${this.handleToggle}>
 *   <div slot="header">My App</div>
 *   <uix-menu variant="sidebar">
 *     <li><uix-link href="/" icon="house">Home</uix-link></li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // With accordion menu
 * ```html
 * <uix-sidebar>
 *   <uix-menu variant="sidebar">
 *     <li><uix-link href="/home" icon="house">Home</uix-link></li>
 *     <li>
 *       <details open>
 *         <summary><uix-icon name="database"></uix-icon> Models</summary>
 *         <ul>
 *           <li><uix-link href="/models/users">Users</uix-link></li>
 *           <li><uix-link href="/models/posts">Posts</uix-link></li>
 *         </ul>
 *       </details>
 *     </li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 */
