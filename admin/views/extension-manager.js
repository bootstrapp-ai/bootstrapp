/**
 * Extension Manager Component
 * Manage browser extension connection, browse tabs, and scrape content
 */

import {
  connectExtension as sharedConnect,
  disconnectExtension as sharedDisconnect,
  getExtensionBridge,
  getExtensionId,
  isConnected,
  onConnectionChange,
} from "../utils/extension-bridge.js";
import T from "/$app/types/index.js";
import { html, nothing } from "/npm/lit-html";

export default {
  style: true,
  properties: {
    extensionId: T.string({ defaultValue: "" }),
    connected: T.boolean({ defaultValue: false }),
    connecting: T.boolean({ defaultValue: false }),
    error: T.string({ defaultValue: "" }),
    tabs: T.array({ defaultValue: [] }),
    selectedTab: T.object(),
    scrapeSelector: T.string({ defaultValue: "" }),
    scrapeResult: T.object(),
    scraping: T.boolean({ defaultValue: false }),
  },

  _unsubscribe: null,

  connected() {
    // Load saved extension ID and connection state
    this.extensionId = getExtensionId();
    this.connected = isConnected();

    // Subscribe to connection changes
    this._unsubscribe = onConnectionChange((event) => {
      this.connected = event.type === "connected";
      if (this.connected) {
        this.refreshTabs();
      }
    });

    // If already connected, refresh tabs
    if (this.connected) {
      this.refreshTabs();
    }
  },

  disconnected() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  },

  async connectExtension() {
    if (!this.extensionId) {
      this.error = "Please enter an Extension ID";
      return;
    }

    this.connecting = true;
    this.error = "";

    try {
      await sharedConnect(this.extensionId);
      this.connected = true;
      await this.refreshTabs();
    } catch (err) {
      this.error = `Connection failed: ${err.message}`;
      this.connected = false;
    }

    this.connecting = false;
  },

  disconnectExtension() {
    sharedDisconnect();
    this.connected = false;
    this.tabs = [];
    this.selectedTab = null;
    this.scrapeResult = null;
  },

  async refreshTabs() {
    const bridge = getExtensionBridge();
    if (!bridge) return;

    try {
      this.tabs = await bridge.getTabs();
    } catch (err) {
      console.error("Failed to refresh tabs:", err);
    }
  },

  selectTab(tab) {
    this.selectedTab = tab;
    this.scrapeResult = null;
  },

  async doScrape() {
    const bridge = getExtensionBridge();
    if (!bridge || !this.selectedTab || !this.scrapeSelector) return;

    this.scraping = true;
    try {
      this.scrapeResult = await bridge.scrape(
        this.selectedTab.id,
        this.scrapeSelector,
        { html: true, text: true, attributes: true },
      );
    } catch (err) {
      this.scrapeResult = { error: err.message };
    }
    this.scraping = false;
  },

  renderConnectionPanel() {
    return html`
      <div class="ext-panel">
        <h3 class="ext-panel-title">
          <uix-icon name="link" size="20"></uix-icon>
          Connection
        </h3>

        ${
          this.connected
            ? html`
              <div class="ext-status ext-status-connected">
                <uix-icon name="check-circle" size="18"></uix-icon>
                Connected
              </div>
              <p class="ext-id-display">ID: ${this.extensionId}</p>
              <uix-button size="sm" @click=${this.disconnectExtension}>
                Disconnect
              </uix-button>
            `
            : html`
              <div class="ext-connect-form">
                <uix-input
                  .value=${this.extensionId}
                  @input=${(e) => (this.extensionId = e.target.value)}
                  placeholder="Extension ID (32 characters)"
                ></uix-input>
                <uix-button
                  primary
                  @click=${this.connectExtension}
                  ?loading=${this.connecting}
                  ?disabled=${this.connecting}
                >
                  Connect
                </uix-button>
              </div>
              ${
                this.error
                  ? html`<p class="ext-error">${this.error}</p>`
                  : nothing
              }
              <div class="ext-help">
                <p>
                  <strong>How to get your Extension ID:</strong>
                </p>
                <ol>
                  <li>Open <code>chrome://extensions</code></li>
                  <li>Enable "Developer mode"</li>
                  <li>Load the extension unpacked</li>
                  <li>Copy the ID shown under the extension</li>
                </ol>
              </div>
            `
        }
      </div>
    `;
  },

  renderTabsPanel() {
    if (!this.connected) return nothing;

    return html`
      <div class="ext-panel">
        <div class="ext-panel-header">
          <h3 class="ext-panel-title">
            <uix-icon name="layout" size="20"></uix-icon>
            Browser Tabs
          </h3>
          <uix-button size="sm" @click=${this.refreshTabs}>
            <uix-icon name="refresh-cw" size="16"></uix-icon>
            Refresh
          </uix-button>
        </div>

        <div class="ext-tabs-list">
          ${
            this.tabs.length === 0
              ? html`<p class="ext-empty">No tabs available</p>`
              : this.tabs.map(
                  (tab) => html`
                  <div
                    class="ext-tab-item ${
                      this.selectedTab?.id === tab.id ? "selected" : ""
                    }"
                    @click=${() => this.selectTab(tab)}
                  >
                    ${
                      tab.favIconUrl
                        ? html`<img
                          class="ext-tab-favicon"
                          src=${tab.favIconUrl}
                          alt=""
                        />`
                        : html`<uix-icon
                          name="globe"
                          size="16"
                          class="ext-tab-favicon-placeholder"
                        ></uix-icon>`
                    }
                    <div class="ext-tab-info">
                      <span class="ext-tab-title">${tab.title || "Untitled"}</span>
                      <span class="ext-tab-url">${tab.url}</span>
                    </div>
                  </div>
                `,
                )
          }
        </div>
      </div>
    `;
  },

  renderScrapePanel() {
    if (!this.connected || !this.selectedTab) return nothing;

    return html`
      <div class="ext-panel">
        <h3 class="ext-panel-title">
          <uix-icon name="code" size="20"></uix-icon>
          Quick Scrape
        </h3>

        <p class="ext-selected-tab">
          Scraping from: <strong>${this.selectedTab.title}</strong>
        </p>

        <div class="ext-scrape-form">
          <uix-input
            .value=${this.scrapeSelector}
            @input=${(e) => (this.scrapeSelector = e.target.value)}
            placeholder="CSS Selector (e.g., h1, .title, #content)"
            @keydown=${(e) => e.key === "Enter" && this.doScrape()}
          ></uix-input>
          <uix-button
            primary
            @click=${this.doScrape}
            ?loading=${this.scraping}
            ?disabled=${this.scraping || !this.scrapeSelector}
          >
            Scrape
          </uix-button>
        </div>

        ${
          this.scrapeResult
            ? html`
              <div class="ext-scrape-result">
                ${
                  this.scrapeResult.error
                    ? html`<p class="ext-error">${this.scrapeResult.error}</p>`
                    : html`
                      <div class="ext-result-header">
                        Found ${this.scrapeResult.count || 0} element(s)
                      </div>
                      <pre class="ext-result-data">${JSON.stringify(
                        this.scrapeResult,
                        null,
                        2,
                      )}</pre>
                    `
                }
              </div>
            `
            : nothing
        }
      </div>
    `;
  },

  render() {
    return html`
      <div class="admin-extension-manager">
        <header class="ext-header">
          <h1 class="ext-page-title">
            <uix-icon name="puzzle" size="28"></uix-icon>
            Browser Extension
          </h1>
          <p class="ext-page-desc">
            Connect to the Bootstrapp browser extension to scrape, inject, and interact with any tab.
          </p>
        </header>

        <div class="ext-grid">
          ${this.renderConnectionPanel()}
          ${this.renderTabsPanel()}
          ${this.renderScrapePanel()}
        </div>
      </div>
    `;
  },
};
