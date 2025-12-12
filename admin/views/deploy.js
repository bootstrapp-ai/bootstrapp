import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";

export default {
  tag: "admin-deploy",
  properties: {
    activeTab: T.string({ defaultValue: "release" }),
    deploying: T.boolean({ defaultValue: false }),
    deployLog: T.array({ defaultValue: [] }),
  },

  async deploy(mode) {
    this.deploying = true;
    this.deployLog = [];

    this.addLog(`Starting ${mode.toUpperCase()} build...`);

    try {
      // Check if bundler is available
      if ($APP.Bundler) {
        this.addLog("Bundler found, starting build process...");

        if (mode === "spa") {
          await $APP.Bundler.buildSPA?.();
        } else if (mode === "ssg") {
          await $APP.Bundler.buildSSG?.();
        }

        this.addLog(`${mode.toUpperCase()} build completed successfully!`);
      } else {
        this.addLog("Bundler not configured. Please set up @bootstrapp/bundler.");
        this.addLog("Refer to the documentation for deployment setup.");
      }
    } catch (error) {
      this.addLog(`Error: ${error.message}`);
    }

    this.deploying = false;
  },

  addLog(message) {
    this.deployLog = [
      ...this.deployLog,
      { time: new Date().toLocaleTimeString(), message },
    ];
  },

  renderReleaseTab() {
    return html`
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- SPA Build -->
          <div
            class="p-6 bg-white border-3 border-black rounded-2xl
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-blue-100 rounded-xl">
                <uix-icon name="globe" size="32" class="text-blue-600"></uix-icon>
              </div>
              <div>
                <h3 class="font-black text-lg">Single Page App</h3>
                <p class="text-sm text-gray-600">Client-side rendering</p>
              </div>
            </div>
            <p class="text-gray-600 mb-4 text-sm">
              Bundle your app as a single-page application. Best for dynamic,
              interactive applications.
            </p>
            <button
              @click=${() => this.deploy("spa")}
              ?disabled=${this.deploying}
              class="w-full py-3 bg-blue-500 text-white font-bold rounded-xl
                     border-3 border-black hover:bg-blue-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${this.deploying ? "Building..." : "Build SPA"}
            </button>
          </div>

          <!-- SSG Build -->
          <div
            class="p-6 bg-white border-3 border-black rounded-2xl
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-green-100 rounded-xl">
                <uix-icon name="file-text" size="32" class="text-green-600"></uix-icon>
              </div>
              <div>
                <h3 class="font-black text-lg">Static Site</h3>
                <p class="text-sm text-gray-600">Pre-rendered HTML</p>
              </div>
            </div>
            <p class="text-gray-600 mb-4 text-sm">
              Generate static HTML files. Best for content sites, blogs, and SEO
              optimization.
            </p>
            <button
              @click=${() => this.deploy("ssg")}
              ?disabled=${this.deploying}
              class="w-full py-3 bg-green-500 text-white font-bold rounded-xl
                     border-3 border-black hover:bg-green-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${this.deploying ? "Building..." : "Build SSG"}
            </button>
          </div>
        </div>

        <!-- Deploy Log -->
        ${this.deployLog.length > 0
          ? html`
              <div
                class="p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-xl
                       border-3 border-black max-h-64 overflow-y-auto"
              >
                ${this.deployLog.map(
                  (log) => html`
                    <div class="py-1">
                      <span class="text-gray-500">[${log.time}]</span> ${log.message}
                    </div>
                  `,
                )}
              </div>
            `
          : ""}
      </div>
    `;
  },

  renderGitHubTab() {
    return html`
      <div
        class="p-8 bg-white border-3 border-black rounded-2xl
               shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center gap-4 mb-6">
          <uix-icon name="github" size="48" class="text-gray-800"></uix-icon>
          <div>
            <h3 class="font-black text-xl">GitHub Integration</h3>
            <p class="text-gray-600">Deploy directly to GitHub Pages</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block font-bold text-sm mb-2">Repository</label>
            <input
              type="text"
              placeholder="username/repository"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>
          <div>
            <label class="block font-bold text-sm mb-2">Branch</label>
            <input
              type="text"
              value="gh-pages"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>
          <div>
            <label class="block font-bold text-sm mb-2">Personal Access Token</label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>

          <button
            class="w-full py-3 bg-gray-800 text-white font-bold rounded-xl
                   border-3 border-black hover:bg-black transition-colors"
          >
            Connect GitHub
          </button>
        </div>
      </div>
    `;
  },

  renderCloudflareTab() {
    return html`
      <div
        class="p-8 bg-white border-3 border-black rounded-2xl
               shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <div class="flex items-center gap-4 mb-6">
          <uix-icon name="cloud" size="48" class="text-orange-500"></uix-icon>
          <div>
            <h3 class="font-black text-xl">Cloudflare Pages</h3>
            <p class="text-gray-600">Deploy to the edge</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block font-bold text-sm mb-2">Account ID</label>
            <input
              type="text"
              placeholder="Your Cloudflare Account ID"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>
          <div>
            <label class="block font-bold text-sm mb-2">API Token</label>
            <input
              type="password"
              placeholder="Your API Token"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>
          <div>
            <label class="block font-bold text-sm mb-2">Project Name</label>
            <input
              type="text"
              placeholder="my-project"
              class="w-full px-4 py-3 border-3 border-black rounded-xl"
            />
          </div>

          <button
            class="w-full py-3 bg-orange-500 text-white font-bold rounded-xl
                   border-3 border-black hover:bg-orange-600 transition-colors"
          >
            Connect Cloudflare
          </button>
        </div>
      </div>
    `;
  },

  render() {
    const tabs = [
      { id: "release", label: "Release", icon: "rocket" },
      { id: "github", label: "GitHub", icon: "github" },
      { id: "cloudflare", label: "Cloudflare", icon: "cloud" },
    ];

    return html`
      <div class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-black uppercase mb-2">Deploy</h1>
          <p class="text-gray-600">Build and deploy your application</p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b-3 border-black pb-4">
          ${tabs.map(
            (tab) => html`
              <button
                @click=${() => (this.activeTab = tab.id)}
                class="flex items-center gap-2 px-4 py-2 rounded-lg font-bold
                       transition-colors
                       ${this.activeTab === tab.id
                         ? "bg-black text-white"
                         : "hover:bg-gray-100"}"
              >
                <uix-icon name=${tab.icon} size="18"></uix-icon>
                ${tab.label}
              </button>
            `,
          )}
        </div>

        <!-- Tab Content -->
        ${this.activeTab === "release"
          ? this.renderReleaseTab()
          : this.activeTab === "github"
            ? this.renderGitHubTab()
            : this.renderCloudflareTab()}
      </div>
    `;
  },
};
