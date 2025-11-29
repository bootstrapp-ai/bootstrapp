import T from "@bootstrapp/types";

export default {
  extends: "uix-popover-controller",
  tag: "uix-popover",
  style: true,
  properties: {
    arrow: T.boolean(true),
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * UIX Popover Component
 * Shows popover content on click using custom popover system.
 * Similar to dropdown but can contain any content (not just menu items).
 * Extends uix-popover-controller for positioning and state management.
 *
 * @extends uix-popover-controller
 * @slot - Default slot for popover content
 *
 * @property {string} position - Positioning relative to trigger (inherited from popover-controller)
 * @property {boolean} arrow - Show arrow pointing to trigger (default true)
 *
 * @example Basic Popover
 * ```html
 * <uix-button popovertarget="info-popover">Show Info</uix-button>
 * <uix-popover id="info-popover">
 *   <div>Popover content here...</div>
 * </uix-popover>
 * ```
 *
 * @example Different Positions
 * ```html
 * <uix-button popovertarget="top-popover">Top</uix-button>
 * <uix-popover id="top-popover" position="top">
 *   <div>Content above</div>
 * </uix-popover>
 *
 * <uix-button popovertarget="bottom-popover">Bottom</uix-button>
 * <uix-popover id="bottom-popover" position="bottom">
 *   <div>Content below</div>
 * </uix-popover>
 * ```
 *
 * @example Without Arrow
 * ```html
 * <uix-button popovertarget="no-arrow">No Arrow</uix-button>
 * <uix-popover id="no-arrow" arrow="false">
 *   <div>Content without arrow</div>
 * </uix-popover>
 * ```
 */
