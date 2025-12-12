import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  extends: "uix-popover-controller",
  tag: "uix-tooltip",
  style: true,
  properties: {
    text: T.string(),
    delay: T.number(200), // Delay before showing tooltip in ms
  },

  render() {
    return html`<slot></slot>`;
  },

  connected() {
    this._hoverTimeout = null;
    this._boundMouseEnter = this._handleMouseEnter.bind(this);
    this._boundMouseLeave = this._handleMouseLeave.bind(this);

    // Find the parent element as the trigger
    if (this.parentElement) {
      this._attachHoverListeners(this.parentElement);
    }
  },

  disconnected() {
    if (this._currentTrigger) {
      this._detachHoverListeners(this._currentTrigger);
    }
    this._clearHoverTimeout();
  },

  _attachHoverListeners(element) {
    this._currentTrigger = element;
    element.addEventListener("mouseenter", this._boundMouseEnter);
    element.addEventListener("mouseleave", this._boundMouseLeave);
  },

  _detachHoverListeners(element) {
    element.removeEventListener("mouseenter", this._boundMouseEnter);
    element.removeEventListener("mouseleave", this._boundMouseLeave);
  },

  _handleMouseEnter(e) {
    this._clearHoverTimeout();

    this._hoverTimeout = setTimeout(() => {
      this._open(this._currentTrigger);
    }, this.delay || 300);
  },

  _handleMouseLeave(e) {
    this._clearHoverTimeout();

    // Small delay before closing to allow moving mouse to tooltip
    setTimeout(() => {
      if (!this.matches(":hover") && !this._currentTrigger?.matches(":hover")) {
        this._close();
      }
    }, 100);
  },

  _clearHoverTimeout() {
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = null;
    }
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Tooltip Component
 *
 * @component
 * @category overlay
 * @tag uix-tooltip
 *
 * Shows contextual information on hover. Automatically uses the parent element
 * as the trigger. Extends uix-popover-controller for positioning and state management.
 *
 * @extends uix-popover-controller
 * @slot - Tooltip content text
 *
 * @property {string} position - Positioning relative to trigger (inherited: top, bottom, left, right, etc.)
 * @property {string} text - Tooltip text content (alternative to slot)
 * @property {number} delay - Delay in milliseconds before showing (default 300)
 *
 * @example Basic Tooltip
 * ```html
 * <uix-button>
 *   Hover me
 *   <uix-tooltip>Helpful information here</uix-tooltip>
 * </uix-button>
 * ```
 *
 * @example Using text property
 * ```html
 * <uix-icon name="info">
 *   <uix-tooltip text="Click for more info"></uix-tooltip>
 * </uix-icon>
 * ```
 *
 * @example Different Positions
 * ```html
 * <uix-button>
 *   Top
 *   <uix-tooltip position="top">Top tooltip</uix-tooltip>
 * </uix-button>
 *
 * <uix-button>
 *   Bottom
 *   <uix-tooltip position="bottom">Bottom tooltip</uix-tooltip>
 * </uix-button>
 *
 * <uix-button>
 *   Left
 *   <uix-tooltip position="left">Left tooltip</uix-tooltip>
 * </uix-button>
 *
 * <uix-button>
 *   Right
 *   <uix-tooltip position="right">Right tooltip</uix-tooltip>
 * </uix-button>
 * ```
 *
 * @example Custom delay
 * ```html
 * <uix-button>
 *   Instant
 *   <uix-tooltip delay="0">Shows immediately</uix-tooltip>
 * </uix-button>
 *
 * <uix-button>
 *   Delayed
 *   <uix-tooltip delay="1000">Shows after 1 second</uix-tooltip>
 * </uix-button>
 * ```
 */
