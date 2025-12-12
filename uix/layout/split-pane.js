import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

let throttleTimeout = null;
let lastEvent = null;

export default {
  tag: "uix-split-pane",
  i18n: {},
  properties: {
    direction: T.string("horizontal"),
    initialSize: T.string("50%"), // Supports "200px" or "30%"
    minSize: T.string(), // Minimum size constraint e.g., "200px" or "10%"
    maxSize: T.string(), // Maximum size constraint e.g., "500px" or "90%"
    primarySize: T.string(), // Current size (with units)
    dividerSize: T.number(2),
    storageKey: T.string(),
    resizable: T.boolean(false), // Whether divider can be dragged
  },
  extends: "uix-flex",
  style: true,
  shadow: true,
  connected() {
    this.isDragging = false;
    this.loadSize();
    this.boundHandlePointerMove = this._handlePointerMove.bind(this);
    this.boundHandlePointerUp = this._handlePointerUp.bind(this);
  },
  firstUpdated() {
    this.primaryPanel = this.shadowRoot.querySelector('[part="primary"]');
    this.secondaryPanel = this.shadowRoot.querySelector('[part="secondary"]');
  },

  // Parse size string to { value, unit }
  _parseSize(size) {
    if (!size) return null;
    const match = String(size).match(/^([\d.]+)(px|%)?$/);
    if (!match) return null;
    return {
      value: parseFloat(match[1]),
      unit: match[2] || "%",
    };
  },

  // Convert size to pixels based on container
  _toPixels(size, containerSize) {
    const parsed = this._parseSize(size);
    if (!parsed) return null;
    if (parsed.unit === "px") return parsed.value;
    return (parsed.value / 100) * containerSize;
  },

  loadSize() {
    if (this.storageKey) {
      const saved = localStorage.getItem(`uix-split-pane:${this.storageKey}`);
      if (saved) {
        this.primarySize = saved;
        return;
      }
    }
    this.primarySize = this.initialSize;
  },

  saveSize() {
    if (this.storageKey && this.primarySize) {
      localStorage.setItem(
        `uix-split-pane:${this.storageKey}`,
        this.primarySize,
      );
    }
  },

  _handleDividerPointerDown(e) {
    if (!this.resizable) return;
    e.preventDefault();
    this.isDragging = true;
    this.startPos = this.direction === "horizontal" ? e.clientX : e.clientY;

    const rect = this.getBoundingClientRect();
    this.containerSize =
      this.direction === "horizontal" ? rect.width : rect.height;
    this.startPrimaryPx = this._toPixels(this.primarySize, this.containerSize);

    this.shadowRoot.addEventListener(
      "pointermove",
      this.boundHandlePointerMove,
    );
    this.setAttribute("dragging", "");
  },

  _handlePointerMove(e) {
    if (!this.isDragging) return;
    lastEvent = e;
    if (throttleTimeout) return;
    throttleTimeout = setTimeout(() => {
      throttleTimeout = null;
      this._calculateNewSize(lastEvent);
    }, 15);
  },

  _calculateNewSize(e) {
    const currentPos = this.direction === "horizontal" ? e.clientX : e.clientY;
    const delta = currentPos - this.startPos;
    let newPrimaryPx = this.startPrimaryPx + delta;

    // Apply min/max constraints
    const minPx = this._toPixels(this.minSize, this.containerSize);
    const maxPx = this._toPixels(this.maxSize, this.containerSize);

    if (minPx !== null) newPrimaryPx = Math.max(minPx, newPrimaryPx);
    if (maxPx !== null) newPrimaryPx = Math.min(maxPx, newPrimaryPx);

    // Ensure secondary panel has space
    const minSecondary = 50; // minimum 50px for secondary
    newPrimaryPx = Math.min(newPrimaryPx, this.containerSize - minSecondary);

    if (this.primaryPanel && this.secondaryPanel) {
      this.primaryPanel.style.flexBasis = `${newPrimaryPx}px`;
      this.secondaryPanel.style.flexBasis = `${this.containerSize - newPrimaryPx}px`;
    }
    this.primarySize = `${newPrimaryPx}px`;
  },

  _handlePointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.removeAttribute("dragging");
    this.shadowRoot.removeEventListener(
      "pointermove",
      this.boundHandlePointerMove,
    );
    this.saveSize();
  },

  render() {
    const parsed = this._parseSize(this.primarySize);
    const primaryStyle = parsed
      ? `flex-basis: ${parsed.value}${parsed.unit}`
      : "flex-basis: 50%";

    return html`<slot name="primary" part="primary" style="${primaryStyle}"></slot>
      <div
        part="divider"
        @pointerdown=${this._handleDividerPointerDown.bind(this)}
        @pointerup=${this._handlePointerUp.bind(this)}
        style="--divider-size: ${this.dividerSize}px"
      ></div>
      <slot part="secondary" name="secondary"></slot>`;
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Split Pane Component
 *
 * @component
 * @category layout
 * @tag uix-split-pane
 *
 * A split pane layout for dividing space between two panels.
 * By default, the divider is non-resizable (just a visual separator).
 * Add the `resizable` attribute to enable drag-to-resize functionality.
 * Supports both pixel and percentage-based sizing.
 *
 * @slot primary - Primary (left/top) panel content
 * @slot secondary - Secondary (right/bottom) panel content
 * @part primary - Primary panel container
 * @part divider - Divider between panels
 * @part secondary - Secondary panel container
 *
 * @example Fixed Sidebar (Non-resizable)
 * ```html
 * <uix-split-pane initialSize="200px" minSize="200px">
 *   <div slot="primary">Fixed 200px sidebar</div>
 *   <div slot="secondary">Main content</div>
 * </uix-split-pane>
 * ```
 *
 * @example Resizable Split
 * ```html
 * <uix-split-pane initialSize="30%" resizable>
 *   <div slot="primary">Resizable panel</div>
 *   <div slot="secondary">Main content</div>
 * </uix-split-pane>
 * ```
 *
 * @example With Constraints
 * ```html
 * <uix-split-pane
 *   initialSize="250px"
 *   minSize="150px"
 *   maxSize="400px"
 *   resizable
 *   storageKey="editor-sidebar"
 * >
 *   <div slot="primary">Sidebar</div>
 *   <div slot="secondary">Editor</div>
 * </uix-split-pane>
 * ```
 */
