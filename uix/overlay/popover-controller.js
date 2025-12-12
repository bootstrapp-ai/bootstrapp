import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  tag: "uix-popover-controller",
  i18n: {},
  properties: {
    position: T.string("bottom-left"),
    open: T.boolean(false),
    offset: T.number(4),
  },
  style: true,

  connected() {
    this._triggerElement = null;
    this._boundDocumentClick = this._handleDocumentClick.bind(this);

    // Set initial state
    if (!this.open) {
      this.style.display = "none";
    }
  },

  disconnected() {
    this._removeDocumentListener();
    this._stopPositionTracking();
  },

  _calculatePosition(triggerElement) {
    if (!triggerElement) return { top: 0, left: 0 };

    const triggerRect = triggerElement.getBoundingClientRect();
    const popoverRect = this.getBoundingClientRect();
    const offset = this.offset || 4;

    let top = 0;
    let left = 0;

    const position = this.position || "bottom-left";

    // Vertical positioning
    if (position.includes("bottom")) {
      top = triggerRect.bottom + offset;
    } else if (position.includes("top")) {
      top = triggerRect.top - popoverRect.height - offset;
    } else {
      // Default to bottom
      top = triggerRect.bottom + offset;
    }

    // Horizontal positioning
    if (
      position.includes("left") ||
      position === "bottom" ||
      position === "top"
    ) {
      left = triggerRect.left;
    } else if (position.includes("right")) {
      left = triggerRect.right - popoverRect.width;
    } else if (position === "left") {
      left = triggerRect.left - popoverRect.width - offset;
    } else if (position === "right") {
      left = triggerRect.right + offset;
    } else {
      left = triggerRect.left;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + popoverRect.width > viewportWidth) {
      left = viewportWidth - popoverRect.width - 8;
    }
    if (left < 8) {
      left = 8;
    }
    if (top + popoverRect.height > viewportHeight) {
      top = viewportHeight - popoverRect.height - 8;
    }
    if (top < 8) {
      top = 8;
    }

    return { top, left };
  },

  _updatePosition() {
    if (!this._triggerElement) return;

    const pos = this._calculatePosition(this._triggerElement);
    this.style.top = `${pos.top}px`;
    this.style.left = `${pos.left}px`;
  },

  _open(triggerElement) {
    if (this.open) return;

    this._triggerElement = triggerElement;
    this.open = true;
    this.style.display = "";
    this.setAttribute("data-open", "");

    // Start position tracking loop
    this._startPositionTracking();

    this._addDocumentListener();

    this.dispatchEvent(new CustomEvent("popover-open", { bubbles: true }));
  },

  _close() {
    if (!this.open) return;

    this.open = false;
    this.style.display = "none";
    this.removeAttribute("data-open");
    this._removeDocumentListener();
    this._stopPositionTracking();
    this._triggerElement = null;

    this.dispatchEvent(new CustomEvent("popover-close", { bubbles: true }));
  },

  toggle(triggerElement) {
    if (this.open) {
      this._close();
    } else {
      this._open(triggerElement);
    }
  },

  _addDocumentListener() {
    // Use capture phase to handle clicks before they bubble
    document.addEventListener("click", this._boundDocumentClick, true);
  },

  _removeDocumentListener() {
    document.removeEventListener("click", this._boundDocumentClick, true);
  },

  _startPositionTracking() {
    // Use requestAnimationFrame to continuously update position
    this._trackingFrame = null;

    const track = () => {
      if (this.open && this._triggerElement) {
        this._updatePosition();
        this._trackingFrame = requestAnimationFrame(track);
      }
    };

    // Start tracking
    this._trackingFrame = requestAnimationFrame(track);
  },

  _stopPositionTracking() {
    if (this._trackingFrame) {
      cancelAnimationFrame(this._trackingFrame);
      this._trackingFrame = null;
    }
  },

  _handleDocumentClick(e) {
    // Don't close if clicking inside the popover
    if (this.contains(e.target)) {
      return;
    }

    // Don't close if clicking the trigger element or its shadow host
    if (this._triggerElement) {
      // Check if click is on the trigger element itself
      if (this._triggerElement.contains(e.target)) {
        return;
      }

      // Check if click is on the shadow host (uix-button/uix-link)
      const shadowHost = this._triggerElement.getRootNode()?.host;
      if (
        shadowHost &&
        (shadowHost === e.target || shadowHost.contains(e.target))
      ) {
        return;
      }
    }

    // Close popover
    this._close();
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * UIX Popover Controller
 * Base component for popover-style overlays (dropdown, tooltip, etc.)
 * Handles positioning, open/close state, and click-outside behavior.
 *
 * @slot - Default slot for popover content
 *
 * @property {string} position - Positioning relative to trigger (top, bottom, left, right, top-left, top-right, bottom-left, bottom-right)
 * @property {boolean} open - Current open state
 * @property {number} offset - Distance in pixels from trigger (default 4)
 *
 * @fires popover-open - Fired when popover opens
 * @fires popover-close - Fired when popover closes
 *
 * @example Extending this component
 * ```javascript
 * export default {
 *   extends: "uix-popover-controller",
 *   // Add your custom behavior
 * }
 * ```
 */
