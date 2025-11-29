import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-sidebar",
  properties: {
    open: T.boolean(false),
    position: T.string({
      defaultValue: "left",
      enum: ["left", "right"],
    }),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "floating"],
    }),
    collapsible: T.boolean(true),
    collapsed: T.boolean(false),
    width: T.string({ defaultValue: "280px" }),
    collapsedWidth: T.string({ defaultValue: "80px" }),
    overlay: T.boolean(false), // Show overlay when open on mobile
  },
  style: true,
  shadow: true,

  toggle() {
    if (this.collapsible) {
      this.collapsed = !this.collapsed;
      this.emit("toggle", { collapsed: this.collapsed });
    }
  },

  closeSidebar() {
    this.open = false;
    this.emit("close");
  },

  render() {
    return html`
      <div part="container" class="sidebar-container ${this.open ? "open" : ""}">
        ${
          this.overlay && this.open
            ? html`<div part="overlay" class="sidebar-overlay" @click=${this.closeSidebar}></div>`
            : ""
        }

        <aside part="sidebar" class="sidebar ${this.collapsed ? "collapsed" : ""}" role="complementary">
          <div part="header" class="sidebar-header">
            <slot name="header"></slot>
            ${
              this.collapsible
                ? html`
                  <button
                    part="toggle"
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
          </div>

          <div part="content" class="sidebar-content">
            <slot></slot>
          </div>

          <div part="footer" class="sidebar-footer">
            <slot name="footer"></slot>
          </div>
        </aside>
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
 * A collapsible sidebar navigation component with support for headers, footers, and custom content.
 *
 * @slot header - Content for the sidebar header
 * @slot default - Main sidebar content (navigation items)
 * @slot footer - Content for the sidebar footer
 *
 * @example
 * // Basic sidebar
 * ```html
 * <uix-sidebar open>
 *   <div slot="header">
 *     <h3>My App</h3>
 *   </div>
 *   <uix-menu>
 *     <li><a href="#dashboard">Dashboard</a></li>
 *     <li><a href="#projects">Projects</a></li>
 *     <li><a href="#team">Team</a></li>
 *     <li><a href="#settings">Settings</a></li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // With icons
 * ```html
 * <uix-sidebar open>
 *   <div slot="header">
 *     <strong>Dashboard</strong>
 *   </div>
 *   <uix-menu>
 *     <li>
 *       <a href="#home">
 *         <uix-icon name="house"></uix-icon>
 *         <span>Home</span>
 *       </a>
 *     </li>
 *     <li>
 *       <a href="#analytics">
 *         <uix-icon name="chart-bar"></uix-icon>
 *         <span>Analytics</span>
 *       </a>
 *     </li>
 *     <li>
 *       <a href="#users">
 *         <uix-icon name="users"></uix-icon>
 *         <span>Users</span>
 *       </a>
 *     </li>
 *     <li>
 *       <a href="#settings">
 *         <uix-icon name="settings"></uix-icon>
 *         <span>Settings</span>
 *       </a>
 *     </li>
 *   </uix-menu>
 *   <div slot="footer">
 *     <uix-avatar size="sm" initials="JD"></uix-avatar>
 *     <span>John Doe</span>
 *   </div>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Right-side sidebar
 * ```html
 * <uix-sidebar open position="right">
 *   <div slot="header">
 *     <h4>Notifications</h4>
 *   </div>
 *   <div style="padding: 1rem;">
 *     <p>No new notifications</p>
 *   </div>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Collapsible sidebar
 * ```html
 * <uix-sidebar open collapsible>
 *   <div slot="header">
 *     <img src="/logo.svg" alt="Logo" style="height: 2rem;">
 *   </div>
 *   <uix-menu>
 *     <li>
 *       <a href="#dashboard">
 *         <uix-icon name="layout-dashboard"></uix-icon>
 *         <span>Dashboard</span>
 *       </a>
 *     </li>
 *     <li>
 *       <a href="#inbox">
 *         <uix-icon name="inbox"></uix-icon>
 *         <span>Inbox</span>
 *       </a>
 *     </li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Initially collapsed
 * ```html
 * <uix-sidebar open collapsed collapsible>
 *   <uix-menu>
 *     <li><a href="#home"><uix-icon name="house"></uix-icon></a></li>
 *     <li><a href="#search"><uix-icon name="search"></uix-icon></a></li>
 *     <li><a href="#settings"><uix-icon name="settings"></uix-icon></a></li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Bordered variant
 * ```html
 * <uix-sidebar open variant="bordered">
 *   <div slot="header">Navigation</div>
 *   <uix-menu>
 *     <li><a href="#page1">Page 1</a></li>
 *     <li><a href="#page2">Page 2</a></li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // With overlay (mobile-friendly)
 * ```html
 * <uix-sidebar open overlay>
 *   <div slot="header">Menu</div>
 *   <uix-menu>
 *     <li><a href="#home">Home</a></li>
 *     <li><a href="#about">About</a></li>
 *     <li><a href="#contact">Contact</a></li>
 *   </uix-menu>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // Custom width
 * ```html
 * <uix-sidebar open width="350px" collapsed-width="60px">
 *   <div slot="header">Wide Sidebar</div>
 *   <div style="padding: 1rem;">
 *     <p>Custom content here</p>
 *   </div>
 * </uix-sidebar>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-sidebar
 *   .open=${this.sidebarOpen}
 *   @toggle=${(e) => console.log('Collapsed:', e.detail.collapsed)}
 *   @close=${() => this.sidebarOpen = false}
 * >
 *   <uix-menu>
 *     <li><a href="#item1">Item 1</a></li>
 *     <li><a href="#item2">Item 2</a></li>
 *   </uix-menu>
 * </uix-sidebar>`
 * ```
 */
