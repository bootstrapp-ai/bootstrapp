import T from "@bootstrapp/types";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import Bundler from "./index.js";

$APP.define("credentials-manager", {
  class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
  dataQuery: true,
  properties: {
    row: T.object(),
  },
  render() {
    if (!this.row)
      return html`<div class="text-center p-4">Loading credentials...</div>`;

    return html`
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
        GitHub Credentials
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div class="flex justify-end">
        <uix-button
          @click=${() => $APP.Model.credentials.edit({ ...this.row })}
          label="Save Credentials"
        ></uix-button>
      </div>
    `;
  },
});

$APP.define("cloudflare-credentials-manager", {
  class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
  dataQuery: true,
  properties: {
    row: T.object(),
  },
  render() {
    if (!this.row)
      return html`<div class="text-center p-4">Loading credentials...</div>`;
    if (!this.row.cloudflare) this.row.cloudflare = {};
    return html`
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
                    Cloudflare Credentials
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        class="md:col-span-2"
                        label="API Token"
                        type="password"
                        .value=${this.row.cloudflare.apiToken}
                        @change=${(e) => (this.row.cloudflare.apiToken = e.target.value)}
                    ></uix-input>
                </div>
                 <p class="text-sm text-gray-500 mt-2">
                    The bundler will automatically create a Cloudflare Pages project if one with the given name doesn't exist. You can link your custom domain in the Cloudflare dashboard once the project is created.
                </p>
                <div class="flex justify-end">
                    <uix-button
                        @click=${() => $APP.Model.credentials.edit({ ...this.row, cloudflare: this.row.cloudflare })}
                        label="Save Cloudflare Credentials"
                    ></uix-button>
                </div>
            `;
  },
});

$APP.define("release-creator", {
  class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
  properties: {
    version: T.string(`v${new Date().toISOString().slice(0, 10)}`),
    notes: T.string(""),
    deployMode: T.string("hybrid"), // Default to hybrid
    isDeploying: T.boolean(false),
  },
  async handleDeploy() {
    if (this.isDeploying) return;

    this.isDeploying = true;
    const credentials = await $APP.Model.credentials.get("singleton");

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
      newRelease = await $APP.Model.releases.add({
        version: this.version,
        notes: this.notes,
        status: "pending",
        deployedAt: new Date(),
        deployType: this.deployMode,
      });

      // Using the new unified deploy method
      const files = await Bundler.deploy({
        ...credentials,
        mode: this.deployMode,
      });

      await $APP.Model.releases.edit({
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
        await $APP.Model.releases.edit({
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
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">New Release</h2>
                <uix-input
                    label="Version"
                    .value=${this.version}
                    @change=${(e) => (this.version = e.target.value)}
                ></uix-input>
                <uix-input
                    type="textarea"
                    label="Release Notes"
                    .value=${this.notes}
                    @change=${(e) => (this.notes = e.target.value)}
                ></uix-input>
                
                    <uix-input
                        class="md:col-span-2"
                        type="checkbox"
                        label="Obfuscate"
                        ?checked=${!!$APP.settings.obfuscate}
                        @change=${(e) => ($APP.settings.obfuscate = e.target.checked)}
                    ></uix-input>
                <div class="flex items-center justify-end gap-2">
                    <uix-input
                        type="select" 
                        label="Deployment Mode"
                        .value=${this.deployMode}
                        @change=${(e) => (this.deployMode = e.target.value)}
                        .options=${[
                          { value: "spa", label: "SPA" },
                          { value: "ssg", label: "SSG" },
                          { value: "hybrid", label: "Hybrid" },
                          { value: "worker", label: "Cloudflare Workers" },
                        ]}
                    >
                    </uix-input>
                    <uix-button
                        @click=${() => this.handleDeploy()}
                        label=${this.isDeploying ? `Deploying ${this.deployMode.toUpperCase()}...` : "Deploy"}
                        ?disabled=${this.isDeploying}
                    ></uix-button>
                </div>
            `;
  },
});

/**
 * A component to display the history of releases.
 * It lists all past deployments with their version, status, and deployment date.
 */
$APP.define("release-history", {
  class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
  properties: {
    rows: T.array(),
  },
  getStatusClass(status) {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  },
  render() {
    return html`
      <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
        Release History
      </h2>
      <div class="flex flex-col gap-3">
        ${
          this.rows && this.rows.length > 0
            ? this.rows
                .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))
                .map(
                  (release) => html`
                <div
                  class="flex flex-col p-2 rounded-md ${this.getStatusClass(
                    release.status,
                  )}"
                >
                  <div class="grid grid-cols-3 items-center gap-2">
                    <div class="font-semibold">${release.version}</div>
                    <div class="flex items-center gap-2">
                      <span>${release.status}</span>
                      ${
                        release.deployType
                          ? html`<span
                          class="text-xs font-mono px-2 py-1 rounded bg-gray-200 text-gray-700"
                          >${release.deployType.toUpperCase()}</span
                        >`
                          : ""
                      }
                    </div>
                    <div class="text-sm text-right">
                      ${new Date(release.deployedAt).toLocaleString()}
                    </div>
                  </div>
                  ${
                    release.notes
                      ? html`<p class="text-sm text-gray-600 pt-2">
                      ${release.notes}
                    </p>`
                      : ""
                  }
                </div>
              `,
                )
            : html`<p class="text-center text-gray-500">
            No releases yet.
          </p>`
        }
      </div>
    `;
  },
});

// Add this new component to bundler-ui.js

$APP.define("settings-editor", {
  class: "flex flex-col gap-4 p-4 border rounded-lg shadow-md bg-white",
  properties: {
    _settings: T.object(null), // Will hold the app settings
  },
  // Fetch settings when the component is added to the page
  connected() {
    this._settings = $APP.settings; // Assumes a function to get all current settings
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
      return html`<div class="text-center p-4">Loading settings...</div>`;
    }
    return html`
                <h2 class="text-2xl font-bold text-gray-800 border-b pb-2">
                    App Settings
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        class="md:col-span-2"
                        label="Open Graph Image URL"
                        .value=${this._settings.og_image}
                        @change=${(e) => (this.row.cloudflare.og_image = e.target.value)}
                    ></uix-input>
                    <uix-input
                        class="md:col-span-2"
                        type="textarea"
                        label="Description"
                        .value=${this._settings.description}
                        @change=${(e) => (this._settings.description = e.target.value)}
                    ></uix-input>
                </div>
                <div class="flex justify-end">
                    <uix-button
                        @click=${this.handleSave.bind(this)}
                        label="Save Settings"
                    ></uix-button>
                </div>
            `;
  },
});

export default {
  tag: "bundler-ui",
  class: "flex flex-col gap-6 p-6 bg-gray-50 min-h-screen",
  render() {
    return html`
                <h1 class="text-4xl font-extrabold text-gray-900">Release Manager</h1>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-6">
                        <settings-editor></settings-editor> 
                        <credentials-manager
                            .data-query=${{ model: "credentials", id: "singleton", key: "row" }}
                        ></credentials-manager>
                        <cloudflare-credentials-manager
                            .data-query=${{ model: "credentials", id: "singleton", key: "row" }}
                        ></cloudflare-credentials-manager>
                    </div>

                    <div class="flex flex-col gap-6">
                        <release-creator></release-creator>
                    <release-history
                        .data-query=${{ model: "releases", order: "-deployedAt", key: "rows" }}
                    ></release-history>
                </div>
                </div>
            `;
  },
};
