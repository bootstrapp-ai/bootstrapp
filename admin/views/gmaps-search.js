/**
 * Google Maps Search Component for Admin
 * Search and import places from Google Maps
 */

import {
  getExtensionBridge,
  isConnected,
  onConnectionChange,
} from "/$app/extension/extension-bridge.js";
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html, nothing } from "/npm/lit-html";

export default {
  tag: "admin-gmaps-search",
  style: true,
  properties: {
    model: T.string(),
    modal: T.boolean({ defaultValue: false }),
    connected: T.boolean({ defaultValue: false }),
    mapsTabs: T.array({ defaultValue: [] }),
    selectedTab: T.object(),

    // Interception state
    intercepting: T.boolean({ defaultValue: false }),
    interceptedResults: T.array({ defaultValue: [] }),

    // Selection
    selectedPlaces: T.array({ defaultValue: [] }),
    previewPlace: T.object(),

    // Import
    category: T.string({ defaultValue: "attractions" }),
    importing: T.boolean({ defaultValue: false }),
    error: T.string({ defaultValue: "" }),
  },

  _unsubscribe: null,
  _interceptUnsubscribe: null,
  _hasFetched: false,

  connected() {
    this.connected = isConnected();

    this._unsubscribe = onConnectionChange((event) => {
      this.connected = event.type === "connected";
    });
  },

  disconnected() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    if (this._interceptUnsubscribe) {
      this._interceptUnsubscribe();
    }
  },

  get results() {
    return this.interceptedResults || [];
  },

  async findMapsTabs() {
    const bridge = getExtensionBridge();
    if (!bridge) {
      this.error = "Not connected to extension";
      return;
    }

    this.error = "";
    try {
      const allTabs = await bridge.getTabs();
      console.log("[GMaps] Got tabs:", allTabs?.length);
      this.mapsTabs = (allTabs || []).filter(
        (tab) =>
          tab.url?.includes("google.com/maps") ||
          tab.url?.includes("google.com.br/maps"),
      );
      console.log("[GMaps] Maps tabs:", this.mapsTabs.length);
      this._hasFetched = true;
    } catch (err) {
      console.error("Failed to get tabs:", err);
      this.error = `Failed to get tabs: ${err.message}`;
    }
  },

  async startInterception() {
    const bridge = getExtensionBridge();
    if (!bridge || !this.selectedTab) return;

    this.error = "";
    try {
      // Start interception on the tab
      await bridge.startIntercept(this.selectedTab.id);
      this.intercepting = true;

      // Listen for intercepted data
      this._interceptUnsubscribe = bridge.onInterceptedData((message) => {
        console.log("[GMaps] Received intercepted message:", message);

        if (message.platform === "gmaps" && message.parsed?.data) {
          console.log(
            "[GMaps] Processing gmaps data, interceptType:",
            message.interceptType,
          );

          if (
            message.interceptType === "search" &&
            message.parsed.data.places
          ) {
            this.interceptedResults = [
              ...this.interceptedResults,
              ...message.parsed.data.places,
            ];
            console.log(
              "[GMaps] Added search results, total:",
              this.interceptedResults.length,
            );
          } else if (message.interceptType === "place" && message.parsed.data) {
            // Update existing place or add new
            const place = message.parsed.data;
            const existing = this.interceptedResults.findIndex(
              (p) => p.placeId === place.placeId,
            );
            if (existing >= 0) {
              this.interceptedResults = [
                ...this.interceptedResults.slice(0, existing),
                { ...this.interceptedResults[existing], ...place },
                ...this.interceptedResults.slice(existing + 1),
              ];
              console.log("[GMaps] Updated existing place:", place.name);
            } else {
              this.interceptedResults = [...this.interceptedResults, place];
              console.log("[GMaps] Added new place:", place.name);
            }
          }
          // Force UI update since getter doesn't trigger reactivity
          console.log("[GMaps] Results count:", this.interceptedResults.length);
          console.error(this.interceptedResults);
          this.requestUpdate();
        }
      });

      console.log("[GMaps] Interception started");
    } catch (err) {
      console.error("[GMaps] Start intercept error:", err);
      this.error = `Failed to start interception: ${err.message}`;
    }
  },

  async stopInterception() {
    const bridge = getExtensionBridge();
    if (!bridge || !this.selectedTab) return;

    try {
      await bridge.stopIntercept(this.selectedTab.id);
      this.intercepting = false;

      if (this._interceptUnsubscribe) {
        this._interceptUnsubscribe();
        this._interceptUnsubscribe = null;
      }

      console.log("[GMaps] Interception stopped");
    } catch (err) {
      console.error("[GMaps] Stop intercept error:", err);
    }
  },

  togglePlaceSelection(place) {
    const idx = this.selectedPlaces.findIndex(
      (p) => p.placeId === place.placeId || p.name === place.name,
    );
    if (idx >= 0) {
      this.selectedPlaces = [
        ...this.selectedPlaces.slice(0, idx),
        ...this.selectedPlaces.slice(idx + 1),
      ];
    } else {
      this.selectedPlaces = [...this.selectedPlaces, place];
    }
  },

  isPlaceSelected(place) {
    return this.selectedPlaces.some(
      (p) => p.placeId === place.placeId || p.name === place.name,
    );
  },

  selectAll() {
    this.selectedPlaces = [...this.results];
  },

  deselectAll() {
    this.selectedPlaces = [];
  },

  async importSelected() {
    if (this.selectedPlaces.length === 0) return;

    this.importing = true;
    this.error = "";

    try {
      for (const place of this.selectedPlaces) {
        const [error] = await $APP.Model.places.add({
          name: place.name,
          description: place.description?.join(" ") || `Found on Google Maps`,
          category: this.category,
          image:
            place.images?.[0]?.url ||
            `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/1200`,
          address: place.address || "",
          phoneNumber: place.phoneNumber || "",
          website: place.website || "",
          rating: place.rating || null,
          reviewCount: place.reviewCount || 0,
          latitude: place.coordinates?.latitude || null,
          longitude: place.coordinates?.longitude || null,
          placeId: place.placeId || "",
          createdAt: new Date().toISOString(),
        });

        if (error) {
          console.error("[GMaps] Error importing place:", place.name, error);
        } else {
          console.log("[GMaps] Imported:", place.name);
        }
      }

      this.emit("close-modal");
      this.emit("refresh");
    } catch (err) {
      this.error = `Import error: ${err.message}`;
    }

    this.importing = false;
  },

  renderNotConnected() {
    return html`
      <div class="gmaps-not-connected">
        <uix-icon name="link-2" size="48" class="gmaps-icon-muted"></uix-icon>
        <h3>Extension Not Connected</h3>
        <p>
          Connect the browser extension first to search Google Maps.
        </p>
        <p class="gmaps-help-text">
          Go to <strong>Extension</strong> in the admin sidebar to connect.
        </p>
        <uix-button @click=${() => $APP.Router.go("/admin/extension")}>
          <uix-icon name="puzzle" size="18"></uix-icon>
          Open Extension Settings
        </uix-button>
      </div>
    `;
  },

  renderTabSelector() {
    return html`
      <div class="gmaps-section">
        <h3 class="gmaps-section-title">
          <uix-icon name="layout" size="18"></uix-icon>
          Select Google Maps Tab
        </h3>

        ${
          this.mapsTabs.length === 0
            ? html`
              <div class="gmaps-empty">
                ${
                  this._hasFetched
                    ? html`<p>No Google Maps tabs found.</p>`
                    : html`<p>Click the button below to find Google Maps tabs.</p>`
                }
                <p class="gmaps-help-text">
                  Make sure you have Google Maps open in another tab with search results.
                </p>
                <uix-button primary @click=${this.findMapsTabs}>
                  <uix-icon name="search" size="16"></uix-icon>
                  Find Google Maps Tabs
                </uix-button>
              </div>
            `
            : html`
              <div class="gmaps-tabs-list">
                ${this.mapsTabs.map(
                  (tab) => html`
                    <div
                      class="gmaps-tab-item ${
                        this.selectedTab?.id === tab.id ? "selected" : ""
                      }"
                      @click=${() => {
                        this.selectedTab = tab;
                        this.scrapedResults = [];
                        this.interceptedResults = [];
                      }}
                    >
                      <img
                        class="gmaps-tab-favicon"
                        src=${tab.favIconUrl || ""}
                        alt=""
                      />
                      <div class="gmaps-tab-info">
                        <span class="gmaps-tab-title">${tab.title}</span>
                        <span class="gmaps-tab-url">${tab.url}</span>
                      </div>
                    </div>
                  `,
                )}
              </div>
              <uix-button
                size="sm"
                class="gmaps-refresh-btn"
                @click=${this.findMapsTabs}
              >
                <uix-icon name="refresh-cw" size="16"></uix-icon>
                Refresh
              </uix-button>
            `
        }
      </div>
    `;
  },

  renderInterceptionControls() {
    if (!this.selectedTab) return nothing;

    return html`
      <div class="gmaps-section">
        <h3 class="gmaps-section-title">
          <uix-icon name="wifi" size="18"></uix-icon>
          API Interception
        </h3>

        <p class="gmaps-help-text" style="margin-bottom: 1rem;">
          Intercept API responses as you browse Google Maps. Click on places to capture their details.
        </p>

        <div class="gmaps-intercept-status ${this.intercepting ? "active" : ""}">
          <span class="gmaps-intercept-dot"></span>
          ${
            this.intercepting
              ? "Listening for data... Click on places in Maps tab"
              : "Interception inactive"
          }
        </div>

        ${
          this.intercepting
            ? html`
              <uix-button @click=${this.stopInterception}>
                <uix-icon name="pause" size="18"></uix-icon>
                Stop Interception
              </uix-button>
            `
            : html`
              <uix-button primary @click=${this.startInterception}>
                <uix-icon name="play" size="18"></uix-icon>
                Start Interception
              </uix-button>
            `
        }
      </div>
    `;
  },

  renderResults() {
    if (!this.selectedTab || this.results.length === 0) return nothing;

    return html`
      <div class="gmaps-section">
        <div class="gmaps-results-header">
          <h3 class="gmaps-section-title" style="margin: 0;">
            <uix-icon name="list" size="18"></uix-icon>
            Results
          </h3>
          <div class="gmaps-results-actions">
            <span class="gmaps-results-count">
              ${this.results.length} places found
            </span>
            <uix-button size="sm" @click=${this.selectAll}>Select All</uix-button>
            <uix-button size="sm" @click=${this.deselectAll}>Deselect</uix-button>
          </div>
        </div>

        <div class="gmaps-results-list">
          ${this.results.map(
            (place) => html`
              <div
                class="gmaps-result-item ${this.isPlaceSelected(place) ? "selected" : ""}"
                @click=${() => this.togglePlaceSelection(place)}
                @mouseenter=${() => (this.previewPlace = place)}
              >
                <input
                  type="checkbox"
                  class="gmaps-result-checkbox"
                  .checked=${this.isPlaceSelected(place)}
                  @click=${(e) => e.stopPropagation()}
                  @change=${() => this.togglePlaceSelection(place)}
                />
                ${
                  place.thumbnail || place.image || place.images?.[0]?.url
                    ? html`<img
                        class="gmaps-result-image"
                        src=${place.thumbnail || place.image || place.images[0].url}
                        alt=""
                      />`
                    : html`<div class="gmaps-result-image gmaps-result-image-placeholder">
                        <uix-icon name="map-pin" size="24"></uix-icon>
                      </div>`
                }
                <div class="gmaps-result-info">
                  <div class="gmaps-result-name">${place.name}</div>
                  ${
                    place.category || place.categories?.[0]
                      ? html`<div class="gmaps-result-category">
                          ${place.category || place.categories[0]}
                        </div>`
                      : nothing
                  }
                  <div class="gmaps-result-meta">
                    ${
                      place.rating
                        ? html`<span class="gmaps-result-rating">
                            <uix-icon name="star" size="14"></uix-icon>
                            ${place.rating}
                          </span>`
                        : nothing
                    }
                    ${
                      place.reviewCount
                        ? html`<span class="gmaps-result-reviews">(${place.reviewCount.toLocaleString()})</span>`
                        : nothing
                    }
                    ${
                      place.address
                        ? html`<span class="gmaps-result-address">${place.address}</span>`
                        : nothing
                    }
                  </div>
                </div>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  },

  renderPreview() {
    if (!this.previewPlace) return nothing;

    const place = this.previewPlace;

    return html`
      <div class="gmaps-section gmaps-preview">
        <h3 class="gmaps-section-title">
          <uix-icon name="eye" size="18"></uix-icon>
          Preview
        </h3>

        <div class="gmaps-preview-card">
          ${
            place.thumbnail || place.image || place.images?.[0]?.url
              ? html`<img
                  class="gmaps-preview-image"
                  src=${(place.thumbnail || place.image || place.images[0].url).replace(/=w\d+(-h\d+)?/, "=w400-h300")}
                  alt=""
                />`
              : html`<div class="gmaps-preview-image-placeholder">
                  <uix-icon name="image" size="48"></uix-icon>
                </div>`
          }
          <div class="gmaps-preview-name">${place.name}</div>
          ${
            place.category || place.categories?.[0]
              ? html`<div class="gmaps-preview-category">
                  ${place.category || place.categories?.join(", ")}
                </div>`
              : nothing
          }
          <div class="gmaps-preview-meta">
            ${
              place.rating
                ? html`<span class="gmaps-preview-rating">
                    <uix-icon name="star" size="14"></uix-icon>
                    ${place.rating}
                    ${place.reviewCount ? `(${place.reviewCount} reviews)` : ""}
                  </span>`
                : nothing
            }
            ${
              place.priceLevel || place.priceRange
                ? html`<span>${place.priceLevel || place.priceRange}</span>`
                : nothing
            }
          </div>
          ${
            place.address
              ? html`<div class="gmaps-preview-address">
                  <uix-icon name="map-pin" size="14"></uix-icon>
                  ${place.address}
                </div>`
              : nothing
          }
          ${
            place.website
              ? html`<div class="gmaps-preview-website">
                  <uix-icon name="external-link" size="14"></uix-icon>
                  <a href=${place.website} target="_blank">${place.website}</a>
                </div>`
              : nothing
          }
        </div>
      </div>
    `;
  },

  renderImportBar() {
    if (this.selectedPlaces.length === 0) return nothing;

    const categories = [
      { value: "beaches", label: "Beaches" },
      { value: "nightlife", label: "Nightlife" },
      { value: "food", label: "Food & Drinks" },
      { value: "attractions", label: "Attractions" },
    ];

    return html`
      <div class="gmaps-import-bar">
        <div class="gmaps-import-info">
          ${this.selectedPlaces.length} place${this.selectedPlaces.length > 1 ? "s" : ""} selected
        </div>
        <div class="gmaps-import-actions">
          <uix-select
            .value=${this.category}
            .options=${categories}
            @change=${(e) => (this.category = e.target.value)}
          ></uix-select>
          <uix-button
            primary
            @click=${this.importSelected}
            ?loading=${this.importing}
            ?disabled=${this.importing}
          >
            <uix-icon name="download" size="18"></uix-icon>
            Import Selected
          </uix-button>
        </div>
      </div>
    `;
  },

  render() {
    return html`
      <div class="admin-gmaps-search ${this.modal ? "modal" : ""}">
        ${this.error ? html`<div class="gmaps-error">${this.error}</div>` : nothing}
        ${
          !this.connected
            ? this.renderNotConnected()
            : html`
                ${this.renderTabSelector()}
                ${this.renderInterceptionControls()}
                <div class="gmaps-two-column">
                  ${this.renderResults()}
                  ${this.renderPreview()}
                </div>
                ${this.renderImportBar()}
              `
        }
      </div>
    `;
  },
};
