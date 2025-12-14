/**
 * Extension Connection Toggle
 * Persistent toggle for extension connection (like dark mode toggle)
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import {
  connectExtension,
  disconnectExtension,
  getExtensionId,
  isConnected,
  onConnectionChange,
} from "../extension-bridge.js";

export default {
  tag: "extension-toggle",
  style: true,
  properties: {
    connected: T.boolean({ defaultValue: false }),
    connecting: T.boolean({ defaultValue: false }),
  },

  _unsubscribe: null,

  connected() {
    this.connected = isConnected();

    this._unsubscribe = onConnectionChange((event) => {
      this.connected = event.type === "connected";
      this.connecting = false;
    });

    // Don't auto-connect - let user click the toggle
  },

  disconnected() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  },

  async tryConnect() {
    const extensionId = getExtensionId();
    if (!extensionId) return;

    this.connecting = true;
    try {
      await connectExtension(extensionId);
      this.connected = true;
    } catch (err) {
      console.warn("[Extension] Auto-connect failed:", err.message);
      this.connected = false;
    }
    this.connecting = false;
  },

  async toggle() {
    if (this.connected) {
      disconnectExtension();
      this.connected = false;
    } else {
      await this.tryConnect();
    }
  },

  render() {
    const hasExtensionId = !!getExtensionId();

    if (!hasExtensionId) {
      return html`
        <div class="ext-toggle ext-toggle-setup">
          <uix-icon name="puzzle" size="18"></uix-icon>
          <uix-link href="/admin/extension" class="ext-toggle-link">
            Setup Extension
          </uix-link>
        </div>
      `;
    }

    return html`
      <div
        class="ext-toggle ${this.connected ? "ext-toggle-on" : "ext-toggle-off"}"
        @click=${this.toggle}
        title=${this.connected ? "Extension connected - click to disconnect" : "Click to connect extension"}
      >
        <uix-icon name="puzzle" size="18"></uix-icon>
        <span class="ext-toggle-label">Extension</span>
        <div class="ext-toggle-indicator ${this.connecting ? "connecting" : ""}">
          ${
            this.connecting
              ? html`<uix-icon name="loader" size="14" class="spinning"></uix-icon>`
              : html`<span class="ext-dot"></span>`
          }
        </div>
      </div>
    `;
  },
};
