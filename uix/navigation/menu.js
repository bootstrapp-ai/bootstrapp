import T from "/$app/types/index.js";

export default {
  tag: "uix-menu",
  properties: {
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "compact", "flush"],
    }),
    rounded: T.boolean(true),
    bordered: T.boolean(true),
  },
  style: true,
};

/**
 * Menu Component
 *
 * @component
 * @category navigation
 * @tag uix-menu
 *
 * A vertical menu list for navigation or actions. Can be used with uix-dropdown for dropdown menus.
 *
 * @example
 * // Basic menu
 * ```html
 * <uix-menu>
 *   <li role="menuitem"><a href="#home">Home</a></li>
 *   <li role="menuitem"><a href="#about">About</a></li>
 *   <li role="menuitem"><a href="#services">Services</a></li>
 *   <li role="menuitem"><a href="#contact">Contact</a></li>
 * </uix-menu>
 * ```
 *
 * @example
 * // With icons
 * ```html
 * <uix-menu>
 *   <li role="menuitem">
 *     <a href="#profile">
 *       <uix-icon name="user"></uix-icon>
 *       Profile
 *     </a>
 *   </li>
 *   <li role="menuitem">
 *     <a href="#settings">
 *       <uix-icon name="settings"></uix-icon>
 *       Settings
 *     </a>
 *   </li>
 *   <li role="menuitem">
 *     <a href="#help">
 *       <uix-icon name="circle-help"></uix-icon>
 *       Help
 *     </a>
 *   </li>
 *   <li role="separator" class="divider"></li>
 *   <li role="menuitem">
 *     <a href="#logout">
 *       <uix-icon name="log-out"></uix-icon>
 *       Logout
 *     </a>
 *   </li>
 * </uix-menu>
 * ```
 *
 * @example
 * // Bordered variant
 * ```html
 * <uix-menu variant="bordered">
 *   <li role="menuitem"><a href="#dashboard">Dashboard</a></li>
 *   <li role="menuitem"><a href="#reports">Reports</a></li>
 *   <li role="menuitem"><a href="#analytics">Analytics</a></li>
 * </uix-menu>
 * ```
 *
 * @example
 * // Compact variant
 * ```html
 * <uix-menu variant="compact" size="sm">
 *   <li role="menuitem"><a href="#item1">Item 1</a></li>
 *   <li role="menuitem"><a href="#item2">Item 2</a></li>
 *   <li role="menuitem"><a href="#item3">Item 3</a></li>
 * </uix-menu>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; gap: 2rem;">
 *   <uix-menu size="sm">
 *     <li role="menuitem"><a href="#">Small</a></li>
 *     <li role="menuitem"><a href="#">Menu</a></li>
 *   </uix-menu>
 *
 *   <uix-menu size="md">
 *     <li role="menuitem"><a href="#">Medium</a></li>
 *     <li role="menuitem"><a href="#">Menu</a></li>
 *   </uix-menu>
 *
 *   <uix-menu size="lg">
 *     <li role="menuitem"><a href="#">Large</a></li>
 *     <li role="menuitem"><a href="#">Menu</a></li>
 *   </uix-menu>
 * </div>
 * ```
 *
 * @example
 * // In a dropdown
 * ```html
 * <uix-button popovertarget="actions-menu">Actions</uix-button>
 * <uix-dropdown id="actions-menu">
 *   <a href="#edit">Edit</a>
 *   <a href="#duplicate">Duplicate</a>
 *   <a href="#archive">Archive</a>
 *   <hr>
 *   <a href="#delete" class="text-error">Delete</a>
 * </uix-dropdown>
 * ```
 *
 * @example
 * // With nested submenus
 * ```html
 * <uix-menu>
 *   <li role="menuitem"><a href="#home">Home</a></li>
 *   <li role="menuitem">
 *     <details>
 *       <summary>Products</summary>
 *       <ul>
 *         <li><a href="#laptops">Laptops</a></li>
 *         <li><a href="#phones">Phones</a></li>
 *         <li><a href="#tablets">Tablets</a></li>
 *       </ul>
 *     </details>
 *   </li>
 *   <li role="menuitem"><a href="#about">About</a></li>
 * </uix-menu>
 * ```
 *
 * @example
 * // With active state
 * ```html
 * <uix-menu>
 *   <li role="menuitem"><a href="#dashboard">Dashboard</a></li>
 *   <li role="menuitem"><a href="#projects" class="active">Projects</a></li>
 *   <li role="menuitem"><a href="#team">Team</a></li>
 *   <li role="menuitem"><a href="#settings">Settings</a></li>
 * </uix-menu>
 * ```
 */
