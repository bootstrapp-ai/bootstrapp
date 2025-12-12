import T from "/$app/types/index.js";

export default {
  style: true,
  extends: "uix-popover-controller",
  tag: "uix-dropdown",
  properties: {
    autoClose: T.boolean(true),
  },

  connected() {
    this.setAttribute("role", "menu");
    this.addEventListener("click", this._handleMenuClick);
  },

  disconnected() {
    this.removeEventListener("click", this._handleMenuClick);
  },

  _handleMenuClick(e) {
    if (!this.autoClose) return;

    // Close dropdown when a menu item (link or button) is clicked
    const target = e.target;
    const link = target.closest("a, button");

    // Don't close if it's a button that triggers another popover
    if (link && !link.closest("[popovertarget]")) {
      this._close();
    }
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * UIX Dropdown Component
 * Shows dropdown menu using custom popover system.
 * Extends uix-popover-controller for positioning and state management.
 *
 * @extends uix-popover-controller
 * @slot - Default slot for dropdown menu items
 *
 * @property {string} position - Positioning relative to trigger (inherited from popover-controller)
 * @property {boolean} autoClose - Auto-close when menu item is clicked (default true)
 *
 * @example Basic Dropdown
 * ```html
 * <uix-button popovertarget="menu5">Toggle Menu</uix-button>
<uix-dropdown id="menu5">
    <div class="dropdown-header">Settings</div>
    <a href="/profile">Profile</a>
    <a href="/preferences">Preferences</a>
    <hr>
    <div class="dropdown-header">Account</div>
    <a href="/logout">Logout</a>
  </uix-dropdown>

 * ```
 *
 * @example Different Positions
 * ```html
 * <uix-button popovertarget="dropdown1">Bottom Menu</uix-button>
 * <uix-dropdown id="dropdown1" position="bottom">

 *     <uix-nav-item
 *        href="/item1"
 *        label="Item 1"></uix-nav-item>
 *     <uix-nav-item
 *        href="/item2"
 *        label="Item 2"></uix-nav-item>
 * </uix-dropdown>
 *
 * <uix-button popovertarget="dropdown2">Top Menu</uix-button>
 * <uix-dropdown id="dropdown2" position="top">
 *     <uix-nav-item
 *        href="/item1"
 *        label="Item 1"></uix-nav-item>
 *     <uix-nav-item
 *        href="/item2"
 *        label="Item 2"></uix-nav-item>
 * </uix-dropdown>
 *
 * <uix-button popovertarget="dropdown3">Right-Aligned Menu</uix-button>
 * <uix-dropdown id="dropdown3" position="right">
 *     <uix-nav-item
 *        href="/item1"
 *        label="Item 1"></uix-nav-item>
 *     <uix-nav-item
 *        href="/item2"
 *        label="Item 2"></uix-nav-item>
 * </uix-dropdown>
 * ```
 *
 * @example With Custom Content
 * ```html
 * <uix-button popovertarget="products-menu">
 *   Products <uix-icon name="chevron-down"></uix-icon>
 * </uix-button>
 * <uix-dropdown id="products-menu" position="bottom-left">
 *   <a href="/product1">Product 1</a>
 *   <a href="/product2">Product 2</a>
 *   <hr>
 *   <a href="/all-products">View All</a>
 * </uix-dropdown>
 * ```
 */
