import T from "@bootstrapp/types";

export default {
  tag: "uix-bottom-nav",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "floating", "filled"],
    }),
    fixed: T.boolean(),
  },
  style: true,
  role: "navigation",
};

/**
 * Bottom Navigation Component
 *
 * @component
 * @category navigation
 * @tag uix-bottom-nav
 *
 * A mobile-optimized bottom navigation bar with icon and label items.
 * Commonly used in mobile apps for primary navigation.
 *
 * @slot default - Navigation items
 *
 * @part nav - The navigation container
 *
 * @example Basic Navigation
 * ```html
 * <uix-bottom-nav>
 *   <a href="/">
 *     <uix-icon name="house"></uix-icon>
 *     <span>Home</span>
 *   </a>
 *   <a href="/search">
 *     <uix-icon name="search"></uix-icon>
 *     <span>Search</span>
 *   </a>
 *   <a href="/favorites">
 *     <uix-icon name="heart"></uix-icon>
 *     <span>Favorites</span>
 *   </a>
 *   <a href="/profile">
 *     <uix-icon name="user"></uix-icon>
 *     <span>Profile</span>
 *   </a>
 * </uix-bottom-nav>
 * ```
 *
 * @example With Badges
 * ```html
 * <uix-bottom-nav>
 *   <a href="/">
 *     <uix-icon name="house"></uix-icon>
 *     <span>Home</span>
 *   </a>
 *   <a href="/notifications">
 *     <uix-badge>3</uix-badge>
 *     <uix-icon name="bell"></uix-icon>
 *     <span>Notifications</span>
 *   </a>
 *   <a href="/messages">
 *     <uix-badge>12</uix-badge>
 *     <uix-icon name="message-circle"></uix-icon>
 *     <span>Messages</span>
 *   </a>
 *   <a href="/profile">
 *     <uix-icon name="user"></uix-icon>
 *     <span>Profile</span>
 *   </a>
 * </uix-bottom-nav>
 * ```
 *
 * @example Floating Variant
 * ```html
 * <uix-bottom-nav variant="floating">
 *   <a href="/">
 *     <uix-icon name="house"></uix-icon>
 *     <span>Home</span>
 *   </a>
 *   <a href="/explore">
 *     <uix-icon name="search"></uix-icon>
 *     <span>Explore</span>
 *   </a>
 *   <a href="/create">
 *     <uix-icon name="plus"></uix-icon>
 *     <span>Create</span>
 *   </a>
 *   <a href="/profile">
 *     <uix-icon name="user"></uix-icon>
 *     <span>Profile</span>
 *   </a>
 * </uix-bottom-nav>
 * ```
 *
 * @example Icons Only (No Labels)
 * ```html
 * <uix-bottom-nav>
 *   <a href="/" aria-label="Home">
 *     <uix-icon name="house"></uix-icon>
 *   </a>
 *   <a href="/search" aria-label="Search">
 *     <uix-icon name="search"></uix-icon>
 *   </a>
 *   <a href="/saved" aria-label="Saved">
 *     <uix-icon name="bookmark"></uix-icon>
 *   </a>
 *   <a href="/settings" aria-label="Settings">
 *     <uix-icon name="settings"></uix-icon>
 *   </a>
 * </uix-bottom-nav>
 * ```
 *
 * @example Filled Variant
 * ```html
 * <uix-bottom-nav variant="filled">
 *   <a href="/">
 *     <uix-icon name="grid"></uix-icon>
 *     <span>Dashboard</span>
 *   </a>
 *   <a href="/shop">
 *     <uix-icon name="shopping-cart"></uix-icon>
 *     <span>Shop</span>
 *   </a>
 *   <a href="/wishlist">
 *     <uix-icon name="heart"></uix-icon>
 *     <span>Wishlist</span>
 *   </a>
 *   <a href="/account">
 *     <uix-icon name="user"></uix-icon>
 *     <span>Account</span>
 *   </a>
 * </uix-bottom-nav>
 * ```
 *
 * @example Non-Fixed Position
 * ```html
 * <uix-bottom-nav fixed="false">
 *   <a href="/"><uix-icon name="house"></uix-icon><span>Home</span></a>
 *   <a href="/search"><uix-icon name="search"></uix-icon><span>Search</span></a>
 *   <a href="/profile"><uix-icon name="user"></uix-icon><span>Profile</span></a>
 * </uix-bottom-nav>
 * ```
 */
