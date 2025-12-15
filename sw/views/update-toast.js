import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

export default {
  tag: "sw-update-toast",
  style: true,

  properties: {
    visible: T.boolean({ defaultValue: false }),
    message: T.string({ defaultValue: "A new version is available!" }),
    buttonText: T.string({ defaultValue: "Update now" }),
  },

  connected() {
    this._unsubscribe = $APP.events.on("SW:UPDATE_AVAILABLE", () => {
      this.visible = true;
    });
  },

  disconnected() {
    this._unsubscribe?.();
  },

  _applyUpdate() {
    this.$APP.SW?.applyUpdate();
  },

  _dismiss() {
    this.visible = false;
  },

  render() {
    if (!this.visible) return html``;

    return html`
      <div class="sw-update-toast">
        <span class="sw-update-message">${this.message}</span>
        <div class="sw-update-actions">
          <button class="sw-update-btn" @click=${() => this._applyUpdate()}>
            ${this.buttonText}
          </button>
          <button class="sw-update-dismiss" @click=${() => this._dismiss()}>
            &times;
          </button>
        </div>
      </div>
    `;
  },
};
