import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-drawer",
  style: true,
  shadow: true,
  properties: {
    open: T.boolean(false),
    position: T.string({
      defaultValue: "right",
      enum: ["left", "right", "top", "bottom"],
    }),
    width: T.string({ defaultValue: "280px" }), // For left/right drawers
    height: T.string({ defaultValue: "50vh" }), // For top/bottom drawers
    backdrop: T.boolean(true), // Show backdrop overlay
    persistent: T.boolean(false), // Don't close on backdrop click
  },

  _handleBackdropClick(e) {
    // Ensure we're clicking the backdrop itself, not children
    if (e.target === e.currentTarget && !this.persistent) {
      this.closeDrawer();
    }
  },

  _handleEscapeKey(e) {
    if (e.key === "Escape" && this.open && !this.persistent) {
      this.closeDrawer();
    }
  },

  connected() {
    this._boundHandleEscape = this._handleEscapeKey.bind(this);
    document.addEventListener("keydown", this._boundHandleEscape);
  },

  disconnected() {
    if (this._boundHandleEscape) {
      document.removeEventListener("keydown", this._boundHandleEscape);
    }
  },

  openDrawer() {
    this.open = true;
    this.emit("drawer-opened");
  },

  closeDrawer() {
    this.open = false;
    this.emit("drawer-closed");
  },

  toggleDrawer() {
    this.open ? this.closeDrawer() : this.openDrawer();
  },

  render() {
    return html`
    <style>
      
      .panel {
          transition:
            transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
            opacity 0.3s ease;
          will-change: transform;          
      }
    </style>
      <!-- Backdrop -->
      ${
        this.backdrop && this.open
          ? html`<div
            part="backdrop"
            class="backdrop"
            @click=${this._handleBackdropClick.bind(this)}
          ></div>`
          : ""
      }

      <!-- Drawer Panel -->
      <div part="panel" class="drawer-panel">
        <slot></slot>
      </div>
    `;
  },
};

/**
 * Drawer Component
 *
 * @component
 * @category overlay
 * @tag uix-drawer
 *
 * A sliding panel component for mobile navigation, sidebars, and side panels.
 * Supports positions from all four sides with backdrop overlay and keyboard navigation.
 *
 * @property {boolean} open - Controls drawer visibility
 * @property {string} position - Drawer position: 'left', 'right', 'top', 'bottom'
 * @property {string} width - Width for left/right drawers (default: '280px')
 * @property {string} height - Height for top/bottom drawers (default: '50vh')
 * @property {boolean} backdrop - Show backdrop overlay (default: true)
 * @property {boolean} persistent - Prevent closing on backdrop click (default: false)
 *
 * @method openDrawer() - Opens the drawer
 * @method closeDrawer() - Closes the drawer
 * @method toggleDrawer() - Toggles drawer open/closed state
 *
 * @event drawer-opened - Fired when drawer opens
 * @event drawer-closed - Fired when drawer closes
 *
 * @part backdrop - The backdrop overlay
 * @part panel - The drawer panel container
 *
 * @example Basic Mobile Navigation
 * ```html
 * <uix-drawer id="nav-drawer" position="left">
 *   <uix-flex direction="column" gap="none" style="padding: 1rem;">
 *     <uix-heading level="3">Navigation</uix-heading>
 *     <uix-divider></uix-divider>
 *     <uix-link href="/">Home</uix-link>
 *     <uix-link href="/about">About</uix-link>
 *     <uix-link href="/products">Products</uix-link>
 *     <uix-link href="/contact">Contact</uix-link>
 *   </uix-flex>
 * </uix-drawer>
 *
 * <uix-button onclick="document.querySelector('#nav-drawer').toggleDrawer()">
 *   Open Menu
 * </uix-button>
 * ```
 *
 * @example Right Sidebar
 * ```html
 * <uix-drawer position="right" width="350px">
 *   <div style="padding: 2rem;">
 *     <uix-heading level="3">Settings</uix-heading>
 *     <uix-form>
 *       <uix-input label="Username"></uix-input>
 *       <uix-input label="Email" type="email"></uix-input>
 *       <uix-button primary w-full>Save</uix-button>
 *     </uix-form>
 *   </div>
 * </uix-drawer>
 * ```
 *
 * @example Persistent Drawer
 * ```html
 * <!-- Won't close on backdrop click or Escape key -->
 * <uix-drawer persistent open>
 *   <div style="padding: 1rem;">
 *     <p>This drawer stays open until explicitly closed</p>
 *     <uix-button onclick="this.closest('uix-drawer').closeDrawer()">
 *       Close
 *     </uix-button>
 *   </div>
 * </uix-drawer>
 * ```
 *
 * @example Bottom Sheet (Mobile)
 * ```html
 * <uix-drawer position="bottom" height="60vh">
 *   <div style="padding: 2rem;">
 *     <uix-heading level="3">Filter Options</uix-heading>
 *     <uix-flex direction="column" gap="md">
 *       <uix-checkbox label="In Stock"></uix-checkbox>
 *       <uix-checkbox label="On Sale"></uix-checkbox>
 *       <uix-checkbox label="Free Shipping"></uix-checkbox>
 *       <uix-button primary w-full>Apply Filters</uix-button>
 *     </uix-flex>
 *   </div>
 * </uix-drawer>
 * ```
 *
 * @example With Hamburger Button
 * ```javascript
 * import { html } from 'lit';
 *
 * export default {
 *   tag: 'my-app',
 *   properties: {
 *     drawerOpen: T.boolean(false),
 *   },
 *
 *   render() {
 *     return html`
 *       <uix-flex direction="column" style="height: 100vh;">
 *         <!-- Header with hamburger -->
 *         <header style="padding: 1rem; border-bottom: 1px solid #ddd;">
 *           <uix-flex align="center" justify="space-between">
 *             <uix-button
 *               ghost
 *               @click=${() => this.drawerOpen = !this.drawerOpen}
 *             >
 *               <uix-icon name="menu"></uix-icon>
 *             </uix-button>
 *             <uix-heading level="2">My App</uix-heading>
 *             <div style="width: 40px;"></div>
 *           </uix-flex>
 *         </header>
 *
 *         <!-- Main content -->
 *         <main flex-1 style="padding: 2rem;">
 *           <p>Main content area</p>
 *         </main>
 *
 *         <!-- Navigation drawer -->
 *         <uix-drawer ?open=${this.drawerOpen} @drawer-closed=${() => this.drawerOpen = false}>
 *           <nav style="padding: 2rem;">
 *             <uix-flex direction="column" gap="md">
 *               <uix-link href="/">Dashboard</uix-link>
 *               <uix-link href="/users">Users</uix-link>
 *               <uix-link href="/settings">Settings</uix-link>
 *             </uix-flex>
 *           </nav>
 *         </uix-drawer>
 *       </uix-flex>
 *     `;
 *   }
 * };
 * ```
 *
 * @example Responsive Drawer
 * ```html
 * <!-- Hidden on desktop (lg+), shown as drawer on mobile/tablet -->
 * <style>
 *   @media (min-width: 992px) {
 *     #mobile-drawer {
 *       display: none;
 *     }
 *   }
 * </style>
 *
 * <uix-drawer id="mobile-drawer">
 *   <uix-sidebar>Mobile navigation</uix-sidebar>
 * </uix-drawer>
 * ```
 */
