import Bundler from "/$app/bundler/index.js";
import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

$APP.define("credentials-manager", {
  dataQuery: true,
  properties: {
    row: T.object(),
  },
  render() {
    if (!this.row)
      return html`<div class="bundler-loading">Loading credentials...</div>`;

    return html`
      <uix-card shadow="none" borderWidth="0">
        <h2 slot="header">GitHub Credentials</h2>
        <div class="bundler-form-grid">
          <uix-input
            label="Owner"
            .value=${this.row.owner}
            @change=${(e) => (this.row.owner = e.target.value)}
          ></uix-input>
          <uix-input
            label="Repository"
            .value=${this.row.repo}
            @change=${(e) => (this.row.repo = e.target.value)}
          ></uix-input>
          <uix-input
            label="Branch"
            .value=${this.row.branch}
            @change=${(e) => (this.row.branch = e.target.value)}
          ></uix-input>
          <uix-input
            label="GitHub Token"
            type="password"
            .value=${this.row.token}
            @change=${(e) => (this.row.token = e.target.value)}
          ></uix-input>
        </div>
        <div slot="footer">
          <uix-button
            @click=${() => $APP.Model.bundler_credentials.edit({ ...this.row })}
            label="Save Credentials"
          ></uix-button>
        </div>
      </uix-card>
    `;
  },
});

$APP.define("cloudflare-credentials-manager", {
  dataQuery: true,
  properties: {
    row: T.object(),
  },
  render() {
    if (!this.row)
      return html`<div class="bundler-loading">Loading credentials...</div>`;
    if (!this.row.cloudflare) this.row.cloudflare = {};
    return html`
      <uix-card shadow="none" borderWidth="0">
        <h2 slot="header">Cloudflare Credentials</h2>
        <div class="bundler-form-grid">
          <uix-input
            label="Account ID"
            .value=${this.row.cloudflare.accountId}
            @change=${(e) => (this.row.cloudflare.accountId = e.target.value)}
          ></uix-input>
          <uix-input
            label="Pages Project Name"
            .value=${this.row.cloudflare.projectName}
            @change=${(e) => (this.row.cloudflare.projectName = e.target.value)}
          ></uix-input>
          <uix-input
            class="bundler-full-width"
            label="API Token"
            type="password"
            .value=${this.row.cloudflare.apiToken}
            @change=${(e) => (this.row.cloudflare.apiToken = e.target.value)}
          ></uix-input>
        </div>
        <p class="bundler-help-text">
          The bundler will automatically create a Cloudflare Pages project if one with the given name doesn't exist.
        </p>
        <div slot="footer">
          <uix-button
            @click=${() => $APP.Model.bundler_credentials.edit({ ...this.row, cloudflare: this.row.cloudflare })}
            label="Save Cloudflare Credentials"
          ></uix-button>
        </div>
      </uix-card>
    `;
  },
});

$APP.define("release-creator", {
  properties: {
    version: T.string(`v${new Date().toISOString().slice(0, 10)}`),
    notes: T.string(""),
    deployMode: T.string("hybrid"),
    isDeploying: T.boolean(false),
  },
  async handleDeploy() {
    if (this.isDeploying) return;

    this.isDeploying = true;
    const credentials = await $APP.Model.bundler_credentials.get("singleton");

    if (this.deployMode === "worker") {
      if (
        !credentials?.cloudflare?.apiToken ||
        !credentials?.cloudflare?.accountId ||
        !credentials?.cloudflare?.projectName
      ) {
        alert(
          "Please provide your Cloudflare Account ID, API Token, and a Project Name before deploying.",
        );
        this.isDeploying = false;
        return;
      }
    } else {
      if (!credentials || !credentials.token) {
        alert("Please provide a GitHub token before deploying.");
        this.isDeploying = false;
        return;
      }
    }

    let newRelease;
    try {
      newRelease = await $APP.Model.bundler_releases.add({
        version: this.version,
        notes: this.notes,
        status: "pending",
        deployedAt: new Date(),
        deployType: this.deployMode,
      });

      const files = await Bundler.deploy({
        ...credentials,
        mode: this.deployMode,
      });

      await $APP.Model.bundler_releases.edit({
        ...newRelease,
        status: "success",
        files,
      });

      alert(`Deployment (${this.deployMode.toUpperCase()}) successful!`);
    } catch (error) {
      console.error(
        `Deployment failed for ${this.deployMode.toUpperCase()}:`,
        error,
      );
      alert(`Deployment failed: ${error.message}`);
      if (newRelease?._id) {
        await $APP.Model.bundler_releases.edit({
          ...newRelease,
          status: "failed",
        });
      }
    } finally {
      this.isDeploying = false;
    }
  },
  render() {
    return html`
      <uix-card shadow="none" borderWidth="0">
        <h2 slot="header">New Release</h2>
        <div class="bundler-form">
          <uix-input
            label="Version"
            .value=${this.version}
            @change=${(e) => (this.version = e.target.value)}
          ></uix-input>
          <uix-textarea
            label="Release Notes"
            .value=${this.notes}
            @change=${(e) => (this.notes = e.target.value)}
          ></uix-textarea>
          <uix-checkbox
            ?checked=${!!$APP.settings.obfuscate}
            @change=${(e) => ($APP.settings.obfuscate = e.target.checked)}
            label="Obfuscate"
          ></uix-checkbox>
        </div>
        <div class="bundler-deploy-row">
          <uix-select
            label="Deployment Mode"
            value=${this.deployMode}
            .options=${[{ value: "spa", label: "SPA" }, { value: "ssg", label: "SSG" }, { value: "hybrid", label: "Hybrid" }, { value: "worker", label: "Cloudflare Workers" }]}
            @change=${(e) => (this.deployMode = e.target.value)}
          >
          </uix-select>
          <uix-button
            @click=${() => this.handleDeploy()}
            label=${this.isDeploying ? `Deploying ${this.deployMode.toUpperCase()}...` : "Deploy"}
            ?disabled=${this.isDeploying}
          ></uix-button>
        </div>
      </uix-card>
    `;
  },
});

$APP.define("release-history", {
  properties: {
    rows: T.array(),
    limit: T.number(0),
  },
  render() {
    let sortedRows = this.rows?.length
      ? [...this.rows].sort(
          (a, b) => new Date(b.deployedAt) - new Date(a.deployedAt),
        )
      : [];

    if (this.limit > 0) {
      sortedRows = sortedRows.slice(0, this.limit);
    }

    return html`
      <uix-card shadow="none" borderWidth="0">
        <h2 slot="header">Release History</h2>
        <div class="bundler-releases">
          ${
            sortedRows.length > 0
              ? sortedRows.map(
                  (release) => html`
                  <div class="bundler-release bundler-release-${release.status}">
                    <div class="bundler-release-row">
                      <span class="bundler-release-version">${release.version}</span>
                      <span class="bundler-release-status">${release.status}</span>
                      ${
                        release.deployType
                          ? html`<span class="bundler-release-type">${release.deployType.toUpperCase()}</span>`
                          : ""
                      }
                      <span class="bundler-release-date">${new Date(release.deployedAt).toLocaleString()}</span>
                    </div>
                    ${
                      release.notes
                        ? html`<p class="bundler-release-notes">${release.notes}</p>`
                        : ""
                    }
                  </div>
                `,
                )
              : html`<p class="bundler-empty">No releases yet.</p>`
          }
        </div>
      </uix-card>
    `;
  },
});

$APP.define("settings-editor", {
  properties: {
    _settings: T.object(null),
  },
  connected() {
    this._settings = $APP.settings;
  },
  async handleSave() {
    try {
      await $APP.settings.set(this._settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings. Check the console for details.");
    }
  },
  render() {
    if (!this._settings) {
      return html`<div class="bundler-loading">Loading settings...</div>`;
    }
    return html`
      <uix-card shadow="none" borderWidth="0">
        <h2 slot="header">App Settings</h2>
        <div class="bundler-form-grid">
          <uix-input
            label="App Name"
            .value=${this._settings.name}
            @change=${(e) => (this._settings.name = e.target.value)}
          ></uix-input>
          <uix-input
            label="Short Name"
            .value=${this._settings.short_name}
            @change=${(e) => (this._settings.short_name = e.target.value)}
          ></uix-input>
          <uix-input
            label="Emoji Icon"
            .value=${this._settings.emojiIcon}
            @change=${(e) => (this._settings.emojiIcon = e.target.value)}
          ></uix-input>
          <uix-input
            label="Icon"
            .value=${this._settings.icon}
            @change=${(e) => (this._settings.icon = e.target.value)}
          ></uix-input>
          <uix-input
            label="Start URL"
            .value=${this._settings.url}
            @change=${(e) => (this._settings.url = e.target.value)}
          ></uix-input>
          <uix-input
            label="Theme Color"
            type="color"
            .value=${this._settings.theme_color}
            @change=${(e) => (this._settings.theme_color = e.target.value)}
          ></uix-input>
          <uix-input
            class="bundler-full-width"
            label="Open Graph Image URL"
            .value=${this._settings.og_image}
            @change=${(e) => (this._settings.og_image = e.target.value)}
          ></uix-input>
          <uix-textarea
            class="bundler-full-width"
            label="Description"
            .value=${this._settings.description}
            @change=${(e) => (this._settings.description = e.target.value)}
          ></uix-textarea>
        </div>
        <div slot="footer">
          <uix-button
            @click=${this.handleSave.bind(this)}
            label="Save Settings"
          ></uix-button>
        </div>
      </uix-card>
    `;
  },
});

export default {
  tag: "bundler-ui",
  style: true,
  properties: {
    activeTab: T.number(0),
    releaseStats: T.object({
      defaultValue: {
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        lastDeploy: null,
      },
    }),
    releases: T.array(),
  },

  async connected() {
    await this.loadStats();
  },

  async loadStats() {
    try {
      const releases = await $APP.Model.bundler_releases.getAll();
      this.releases = releases || [];
      this.releaseStats = {
        total: this.releases.length,
        success: this.releases.filter((r) => r.status === "success").length,
        failed: this.releases.filter((r) => r.status === "failed").length,
        pending: this.releases.filter((r) => r.status === "pending").length,
        lastDeploy:
          this.releases.length > 0
            ? [...this.releases].sort(
                (a, b) => new Date(b.deployedAt) - new Date(a.deployedAt),
              )[0]?.deployedAt
            : null,
      };
    } catch (error) {
      console.error("Failed to load release stats:", error);
    }
  },

  formatDate(date) {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  },

  render() {
    return html`
      <div class="bundler-ui">
        <h1 class="bundler-page-title">Release Manager</h1>
        <uix-tabs .activeTab=${this.activeTab} @tab-change=${(e) => (this.activeTab = e.detail)}>
          <button slot="tab"><uix-icon name="layout-dashboard"></uix-icon> Dashboard</button>
          <button slot="tab"><uix-icon name="settings"></uix-icon> Settings</button>
          <button slot="tab"><uix-icon name="rocket"></uix-icon> Deploy</button>
          <button slot="tab"><uix-icon name="key"></uix-icon> Credentials</button>

          <div slot="panel">${this.renderDashboard()}</div>
          <div slot="panel">${this.renderSettings()}</div>
          <div slot="panel">${this.renderDeploy()}</div>
          <div slot="panel">${this.renderCredentials()}</div>
        </uix-tabs>
      </div>
    `;
  },

  renderDashboard() {
    return html`
      <div class="bundler-dashboard">
        <div class="bundler-stats-grid">
          <uix-card shadow="none" borderWidth="0">
            <uix-stat title="Total Releases" value=${this.releaseStats.total} centered>
              <uix-icon slot="figure" name="package" size="xl"></uix-icon>
            </uix-stat>
          </uix-card>
          <uix-card shadow="none" borderWidth="0">
            <uix-stat title="Successful" value=${this.releaseStats.success} variant="success" centered>
              <uix-icon slot="figure" name="check-circle" size="xl"></uix-icon>
            </uix-stat>
          </uix-card>
          <uix-card shadow="none" borderWidth="0">
            <uix-stat title="Failed" value=${this.releaseStats.failed} variant="danger" centered>
              <uix-icon slot="figure" name="x-circle" size="xl"></uix-icon>
            </uix-stat>
          </uix-card>
          <uix-card shadow="none" borderWidth="0">
            <uix-stat title="Last Deploy" value=${this.formatDate(this.releaseStats.lastDeploy)} centered>
              <uix-icon slot="figure" name="clock" size="xl"></uix-icon>
            </uix-stat>
          </uix-card>
        </div>

        <uix-card shadow="none" borderWidth="0">
          <h3 slot="header">Quick Actions</h3>
          <div class="bundler-quick-actions">
            <uix-button @click=${() => (this.activeTab = 2)}>
              <uix-icon name="rocket"></uix-icon> Deploy Now
            </uix-button>
            <uix-button @click=${() => (this.activeTab = 1)}>
              <uix-icon name="settings"></uix-icon> Settings
            </uix-button>
            <uix-button @click=${() => this.loadStats()}>
              <uix-icon name="refresh-cw"></uix-icon> Refresh
            </uix-button>
          </div>
        </uix-card>

        <release-history
          .rows=${this.releases}
          .limit=${5}
        ></release-history>
      </div>
    `;
  },

  renderSettings() {
    return html`
      <div class="bundler-tab-content">
        <settings-editor></settings-editor>
      </div>
    `;
  },

  renderDeploy() {
    return html`
      <div class="bundler-tab-content bundler-deploy-content">
        <release-creator></release-creator>
        <release-history
          .data-query=${{ model: "bundler_releases", order: "-deployedAt", key: "rows" }}
        ></release-history>
      </div>
    `;
  },

  renderCredentials() {
    return html`
      <div class="bundler-tab-content bundler-credentials-content">
        <credentials-manager
          .data-query=${{ model: "bundler_credentials", id: "singleton", key: "row" }}
        ></credentials-manager>
        <cloudflare-credentials-manager
          .data-query=${{ model: "bundler_credentials", id: "singleton", key: "row" }}
        ></cloudflare-credentials-manager>
      </div>
    `;
  },
};
