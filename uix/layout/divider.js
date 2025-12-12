let throttleTimeout = null;
let lastEvent = null;

import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
export default {
  tag: "uix-divider",
  style: true,
  properties: {
    label: T.string(),
    vertical: T.boolean(),
    resizable: T.boolean({ defaultValue: false }),
  },
  firstUpdated() {
    if (this.resizable) {
      window.addEventListener("pointerdown", this.pointerDown.bind(this));
    }
  },

  pointerDown(e) {
    if (e.target !== this) return;
    e.preventDefault();
    this.setPointerCapture(e.pointerId);

    this._startX = e.clientX;
    this._startY = e.clientY;

    this._prevElem = this.previousElementSibling;
    this._nextElem = this.nextElementSibling;

    this._prevElemStartWidth = this._prevElem ? this._prevElem.offsetWidth : 0;
    this._nextElemStartWidth = this._nextElem ? this._nextElem.offsetWidth : 0;
    this._prevElemStartHeight = this._prevElem
      ? this._prevElem.offsetHeight
      : 0;
    this._nextElemStartHeight = this._nextElem
      ? this._nextElem.offsetHeight
      : 0;

    window.addEventListener("pointermove", this.pointerMove.bind(this));
    window.addEventListener("pointerup", this.pointerUp.bind(this));
  },
  pointerMove(e) {
    lastEvent = e;
    if (throttleTimeout) return;

    throttleTimeout = setTimeout(() => {
      throttleTimeout = null;
      this.handleMouseMove(lastEvent);
    }, 15);
  },

  handleMouseMove(e) {
    if (!this._prevElem || !this._nextElem) return;

    if (this.vertical) {
      let dx = e.clientX - this._startX;
      if (dx > 0) dx += 20;
      const newPrevWidth = this._prevElemStartWidth + dx;
      const newNextWidth = this._nextElemStartWidth - dx;

      if (newPrevWidth > 0 && newNextWidth > 0) {
        this._prevElem.style.flexBasis = `${newPrevWidth}px`;
        this._nextElem.style.flexBasis = `${newNextWidth}px`;
      }
    } else {
      const dy = e.clientY - this._startY;
      const newPrevHeight = this._prevElemStartHeight + dy;
      const newNextHeight = this._nextElemStartHeight - dy;

      if (newPrevHeight > 0 && newNextHeight > 0) {
        this._prevElem.style.flexBasis = `${newPrevHeight}px`;
        this._nextElem.style.flexBasis = `${newNextHeight}px`;
      }
    }
  },

  pointerUp(e) {
    this.releasePointerCapture(e.pointerId);
    this._startX = null;
    this._startY = null;

    this._prevElem = null;
    this._nextElem = null;

    this._prevElemStartWidth = null;
    this._nextElemStartWidth = null;
    this._prevElemStartHeight = null;
    this._nextElemStartHeight = null;
    window.removeEventListener("pointermove", this.pointerMove.bind(this));
    window.removeEventListener("pointerup", this.pointerUp.bind(this));
  },

  render() {
    return !this.label ? null : html`<span>${this.label}</span>`;
  },
};
