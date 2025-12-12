import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-navbar",
  properties: {
    fixed: T.string({
      defaultValue: "none",
      enum: ["none", "top", "bottom"],
    }),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "floating"],
    }),
    transparent: T.boolean(false),
    mobileMenuOpen: T.boolean(false),
    direction: T.string({
      enum: ["vertical", "horizontal"],
      defaultValue: "horizontal",
    }),
  },
  style: true,
  shadow: true,

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.emit("menu-toggle", { open: this.mobileMenuOpen });
  },

  render() {
    return html`
      <nav part="container" class="navbar ${this.mobileMenuOpen ? "menu-open" : ""}" role="navigation" direction=${this.direction}>
        <div part="inner" class="navbar-container" direction=${this.direction}>
          <div part="brand" class="navbar-brand">
            <slot name="brand"></slot>
          </div>

          <button
            part="toggle"
            class="navbar-toggle"
            @click=${this.toggleMobileMenu}
            aria-label="Toggle navigation"
            aria-expanded=${this.mobileMenuOpen}
          >
            <uix-icon name=${this.mobileMenuOpen ? "x" : "menu"}></uix-icon>
          </button>
          <div part="menu" class="navbar-menu ${this.mobileMenuOpen ? "active" : ""}" direction=${this.direction} justify="space-between">
            <div part="start" class="navbar-start">
              <slot name="start"></slot>
            </div>
            <div part="center" class="navbar-center">
              <slot name="center"></slot>
            </div>
            <div part="end" class="navbar-end">
              <slot name="end"></slot>
            </div>
          </div>
        </div>
      </nav>
    `;
  },
};

/**
 * Navbar Component
 *
 * @component
 * @category navigation
 * @tag uix-navbar
 *
 * A responsive navigation bar with support for branding, links, and actions.
 *
 * @slot brand - Logo or brand content (left side on desktop)
 * @slot start - Navigation items (left side after brand on desktop)
 * @slot center - Centered navigation items
 * @slot end - Navigation items (right side on desktop)
 *
 * @example
 * // Basic navbar
 * ```html
 * <uix-navbar>
 *   <div slot="brand">
 *     <strong>MyApp</strong>
 *   </div>
 *   <div slot="start">
 *     <a href="#home">Home</a>
 *     <a href="#about">About</a>
 *     <a href="#services">Services</a>
 *   </div>
 *   <div slot="end">
 *     <uix-button variant="primary" size="sm">Sign Up</uix-button>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // With logo
 * ```html
 * <uix-navbar>
 *   <div slot="brand">
 *     <img src="/logo.svg" alt="Logo" style="height: 2rem;">
 *   </div>
 *   <div slot="start">
 *     <a href="#products">Products</a>
 *     <a href="#pricing">Pricing</a>
 *     <a href="#docs">Docs</a>
 *   </div>
 *   <div slot="end">
 *     <a href="#login">Login</a>
 *     <uix-button variant="primary">Get Started</uix-button>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // Fixed to top
 * ```html
 * <uix-navbar fixed="top">
 *   <div slot="brand">
 *     <strong>Fixed Top</strong>
 *   </div>
 *   <div slot="center">
 *     <a href="#home">Home</a>
 *     <a href="#features">Features</a>
 *     <a href="#contact">Contact</a>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // Fixed to bottom
 * ```html
 * <uix-navbar fixed="bottom">
 *   <div slot="center">
 *     <a href="#home"><uix-icon name="house"></uix-icon> Home</a>
 *     <a href="#search"><uix-icon name="search"></uix-icon> Search</a>
 *     <a href="#profile"><uix-icon name="user"></uix-icon> Profile</a>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // Bordered variant
 * ```html
 * <uix-navbar variant="bordered">
 *   <div slot="brand">MyApp</div>
 *   <div slot="start">
 *     <a href="#dashboard">Dashboard</a>
 *     <a href="#projects">Projects</a>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // Floating variant
 * ```html
 * <uix-navbar variant="floating">
 *   <div slot="brand">MyApp</div>
 *   <div slot="center">
 *     <a href="#home">Home</a>
 *     <a href="#about">About</a>
 *     <a href="#contact">Contact</a>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // Transparent navbar
 * ```html
 * <uix-navbar transparent>
 *   <div slot="brand" style="color: white;">
 *     <strong>Transparent Nav</strong>
 *   </div>
 *   <div slot="end">
 *     <uix-button ghost>Login</uix-button>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // With dropdown menu
 * ```html
 * <uix-navbar>
 *   <div slot="brand">MyApp</div>
 *   <div slot="start">
 *     <a href="#home">Home</a>
 *     <uix-button popovertarget="products-menu">
 *       Products <uix-icon name="chevron-down"></uix-icon>
 *     </uix-button>
 *     <uix-dropdown id="products-menu">
 *       <a href="#product1">Product 1</a>
 *       <a href="#product2">Product 2</a>
 *       <a href="#product3">Product 3</a>
 *     </uix-dropdown>
 *   </div>
 *   <div slot="end">
 *     <uix-avatar popovertarget="user-menu" size="sm" initials="JD"></uix-avatar>
 *     <uix-dropdown id="user-menu">
 *       <a href="#profile">Profile</a>
 *       <a href="#settings">Settings</a>
 *       <a href="#logout">Logout</a>
 *     </uix-dropdown>
 *   </div>
 * </uix-navbar>
 * ```
 *
 * @example
 * // With search
 * ```html
 * <uix-navbar>
 *   <div slot="brand">MyApp</div>
 *   <div slot="center">
 *     <uix-input
 *       type="search"
 *       placeholder="Search..."
 *       size="sm"
 *       style="width: 300px;"
 *     ></uix-input>
 *   </div>
 *   <div slot="end">
 *     <uix-button ghost size="sm">
 *       <uix-icon name="bell"></uix-icon>
 *     </uix-button>
 *   </div>
 * </uix-navbar>
 * ```
 */
