/**
 * Instagram Import Component for Admin
 * Scrape Instagram profiles and create places
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
  tag: "admin-instagram-import",

  properties: {
    model: T.string(),
    connected: T.boolean({ defaultValue: false }),
    instagramTabs: T.array({ defaultValue: [] }),
    selectedTab: T.object(),
    profileData: T.object(),
    scraping: T.boolean({ defaultValue: false }),
    saving: T.boolean({ defaultValue: false }),
    error: T.string({ defaultValue: "" }),
    // Place form fields
    category: T.string({ defaultValue: "nightlife" }),
    description: T.string({ defaultValue: "" }),
  },

  _unsubscribe: null,
  _hasFetched: false,

  connected() {
    // Check if already connected
    this.connected = isConnected();

    // Subscribe to connection changes
    this._unsubscribe = onConnectionChange((event) => {
      this.connected = event.type === "connected";
    });
  },

  disconnected() {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  },

  async findInstagramTabs() {
    const bridge = getExtensionBridge();
    if (!bridge) {
      this.error = "Not connected to extension";
      return;
    }

    this.error = "";
    try {
      const allTabs = await bridge.getTabs();
      console.log("[Instagram] Got tabs:", allTabs?.length);
      this.instagramTabs = (allTabs || []).filter((tab) =>
        tab.url?.includes("instagram.com"),
      );
      console.log("[Instagram] Instagram tabs:", this.instagramTabs.length);
      this._hasFetched = true;
    } catch (err) {
      console.error("Failed to get tabs:", err);
      this.error = `Failed to get tabs: ${err.message}`;
    }
  },

  async scrapeProfile() {
    const bridge = getExtensionBridge();
    if (!bridge || !this.selectedTab) return;

    this.scraping = true;
    this.error = "";
    this.profileData = null;

    try {
      // Get username from URL
      const username = this.extractUsernameFromUrl();
      if (!username) {
        this.error =
          "Could not extract username from URL. Make sure you're on an Instagram profile page.";
        this.scraping = false;
        return;
      }

      console.log("[Instagram] Fetching profile via API:", username);

      // Use direct API call (REST first, then GraphQL fallback)
      const result = await bridge.fetchInstagramProfile(
        this.selectedTab.id,
        username,
      );
      console.log("[Instagram] API result:", result);

      if (result?.success && result.user) {
        const user = result.user;
        this.profileData = {
          username: user.username || username,
          fullName: user.full_name || "",
          bio: user.biography || "",
          avatar:
            user.profile_pic_url || user.hd_profile_pic_url_info?.url || "",
          followers: user.follower_count?.toString() || "",
          following: user.following_count?.toString() || "",
          posts: user.media_count?.toString() || "",
          externalLink: user.external_url || "",
          isVerified: user.is_verified || false,
          profileUrl: this.selectedTab.url,
          source: result.source, // "rest" or "graphql"
        };

        // Pre-fill description with bio
        if (this.profileData.bio && !this.description) {
          this.description = this.profileData.bio;
        }

        console.log("[Instagram] Profile data extracted via", result.source);
      } else {
        // Fallback to DOM scraping if API fails
        console.log("[Instagram] API failed, trying DOM scraping...");
        const scrapeResult = await bridge.scrapeInstagram(this.selectedTab.id);

        if (scrapeResult) {
          this.profileData = {
            username: scrapeResult.username || username,
            fullName: scrapeResult.fullName || "",
            bio: scrapeResult.bio || "",
            avatar: scrapeResult.avatar || "",
            followers: scrapeResult.followers || "",
            following: scrapeResult.following || "",
            posts: scrapeResult.posts || "",
            externalLink: scrapeResult.externalLink || "",
            isVerified: scrapeResult.isVerified || false,
            profileUrl: this.selectedTab.url,
            source: "dom",
          };

          if (this.profileData.bio && !this.description) {
            this.description = this.profileData.bio;
          }
        } else {
          this.error =
            result?.error ||
            "Could not fetch profile. Make sure you're logged into Instagram.";
        }
      }
    } catch (err) {
      console.error("[Instagram] Fetch error:", err);
      this.error = `Failed to fetch profile: ${err.message}`;
    }

    this.scraping = false;
  },

  extractUsernameFromUrl() {
    if (!this.selectedTab?.url) return "";
    const match = this.selectedTab.url.match(/instagram\.com\/([^/?]+)/);
    return match ? match[1] : "";
  },

  async createPlace() {
    if (!this.profileData) return;

    this.saving = true;
    try {
      const name = this.profileData.fullName || this.profileData.username;
      const [error] = await $APP.Model.places.add({
        name,
        description:
          this.description ||
          this.profileData.bio ||
          `Instagram: @${this.profileData.username}`,
        category: this.category,
        image:
          this.profileData.avatar ||
          `https://picsum.photos/seed/${encodeURIComponent(name)}/800/1200`,
        instagram: this.profileData.username,
        website: this.profileData.externalLink || "",
        createdAt: new Date().toISOString(),
      });

      if (error) {
        this.error = `Error creating place: ${error.message || "Unknown error"}`;
        this.saving = false;
        return;
      }

      this.emit("close-modal");
      this.emit("refresh");
    } catch (err) {
      this.error = `Error: ${err.message}`;
    }
    this.saving = false;
  },

  renderNotConnected() {
    return html`
      <div class="ig-not-connected">
        <uix-icon name="link-2" size="48" class="ig-icon-muted"></uix-icon>
        <h3>Extension Not Connected</h3>
        <p>
          Connect the browser extension first to scrape Instagram profiles.
        </p>
        <p class="ig-help-text">
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
      <div class="ig-section">
        <h3 class="ig-section-title">
          <uix-icon name="layout" size="18"></uix-icon>
          Select Instagram Tab
        </h3>

        ${
          this.instagramTabs.length === 0
            ? html`
              <div class="ig-empty">
                ${
                  this._hasFetched
                    ? html`<p>No Instagram tabs found.</p>`
                    : html`<p>Click the button below to find Instagram tabs.</p>`
                }
                <p class="ig-help-text">
                  Make sure you have an Instagram profile open in another tab.
                </p>
                <uix-button primary @click=${this.findInstagramTabs}>
                  <uix-icon name="search" size="16"></uix-icon>
                  Find Instagram Tabs
                </uix-button>
              </div>
            `
            : html`
              <div class="ig-tabs-list">
                ${this.instagramTabs.map(
                  (tab) => html`
                    <div
                      class="ig-tab-item ${
                        this.selectedTab?.id === tab.id ? "selected" : ""
                      }"
                      @click=${() => {
                        this.selectedTab = tab;
                        this.profileData = null;
                      }}
                    >
                      <img
                        class="ig-tab-favicon"
                        src=${tab.favIconUrl || ""}
                        alt=""
                      />
                      <div class="ig-tab-info">
                        <span class="ig-tab-title">${tab.title}</span>
                        <span class="ig-tab-url">${tab.url}</span>
                      </div>
                    </div>
                  `,
                )}
              </div>
              <uix-button
                size="sm"
                class="ig-refresh-btn"
                @click=${this.findInstagramTabs}
              >
                <uix-icon name="refresh-cw" size="16"></uix-icon>
                Refresh
              </uix-button>
            `
        }
      </div>
    `;
  },

  renderScrapeSection() {
    if (!this.selectedTab) return nothing;

    return html`
      <div class="ig-section">
        <h3 class="ig-section-title">
          <uix-icon name="download" size="18"></uix-icon>
          Scrape Profile
        </h3>

        <p class="ig-selected-tab">
          Selected: <strong>${this.selectedTab.title}</strong>
        </p>

        <uix-button
          primary
          @click=${this.scrapeProfile}
          ?loading=${this.scraping}
          ?disabled=${this.scraping}
        >
          <uix-icon name="download" size="18"></uix-icon>
          Scrape Profile Data
        </uix-button>
      </div>
    `;
  },

  renderProfilePreview() {
    if (!this.profileData) return nothing;

    const categories = [
      { value: "beaches", label: "Beaches" },
      { value: "nightlife", label: "Nightlife" },
      { value: "food", label: "Food & Drinks" },
      { value: "attractions", label: "Attractions" },
    ];

    return html`
      <div class="ig-section ig-profile-preview">
        <h3 class="ig-section-title">
          <uix-icon name="user" size="18"></uix-icon>
          Profile Data
        </h3>

        <div class="ig-profile-card">
          ${
            this.profileData.avatar
              ? html`<img
                class="ig-profile-avatar"
                src=${this.profileData.avatar}
                alt=""
              />`
              : nothing
          }
          <div class="ig-profile-info">
            <div class="ig-profile-name">
              ${this.profileData.fullName || this.profileData.username}
              ${
                this.profileData.isVerified
                  ? html`<uix-icon
                    name="check-circle"
                    size="16"
                    class="ig-verified"
                  ></uix-icon>`
                  : nothing
              }
            </div>
            <div class="ig-profile-username">@${this.profileData.username}</div>
            <div class="ig-profile-stats">
              ${
                this.profileData.posts
                  ? html`<span>${this.profileData.posts} posts</span>`
                  : nothing
              }
              ${
                this.profileData.followers
                  ? html`<span>${this.profileData.followers} followers</span>`
                  : nothing
              }
              ${
                this.profileData.following
                  ? html`<span>${this.profileData.following} following</span>`
                  : nothing
              }
            </div>
          </div>
        </div>

        ${
          this.profileData.bio
            ? html`<p class="ig-profile-bio">${this.profileData.bio}</p>`
            : nothing
        }
        ${
          this.profileData.externalLink
            ? html`<p class="ig-profile-link">
              <uix-icon name="external-link" size="14"></uix-icon>
              <a href=${this.profileData.externalLink} target="_blank">
                ${this.profileData.externalLink}
              </a>
            </p>`
            : nothing
        }

        <div class="ig-form">
          <div class="ig-form-field">
            <label>Category</label>
            <uix-select
              .value=${this.category}
              .options=${categories}
              @change=${(e) => (this.category = e.target.value)}
            ></uix-select>
          </div>

          <div class="ig-form-field">
            <label>Description</label>
            <uix-textarea
              .value=${this.description}
              @input=${(e) => (this.description = e.target.value)}
              placeholder="Enter a description..."
              rows="3"
            ></uix-textarea>
          </div>
        </div>

        <div class="ig-actions">
          <uix-button
            primary
            @click=${this.createPlace}
            ?loading=${this.saving}
            ?disabled=${this.saving}
          >
            <uix-icon name="plus" size="18"></uix-icon>
            Create Place
          </uix-button>
        </div>
      </div>
    `;
  },

  render() {
    return html`
      <div class="admin-instagram-import">
        ${
          this.error ? html`<div class="ig-error">${this.error}</div>` : nothing
        }
        ${
          !this.connected
            ? this.renderNotConnected()
            : html`
              ${this.renderTabSelector()} ${this.renderScrapeSection()}
              ${this.renderProfilePreview()}
            `
        }
      </div>
    `;
  },
};
