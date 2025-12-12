import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import View from "/node_modules/@bootstrapp/view/index.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

$APP.define("mcp-tabs", {
  class: "flex flex-col flex-grow",
  properties: {
    tabs: T.array([]),
    activeTab: T.number(0),
    selectedHistoryItem: T.object(null),
    onDeselectHistoryItem: T.function(),
  },

  connected() {
    this.tabs = [
      { key: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { key: "resources", label: "Resources", icon: "database" },
      { key: "tools", label: "Tools", icon: "wrench" },
      { key: "prompts", label: "Prompts", icon: "terminal" },
      { key: "roots", label: "Roots", icon: "git-branch-plus" },
      { key: "auth", label: "Auth", icon: "key" },
    ];
  },

  selectTab(index) {
    this.activeTab = index;
  },

  _renderTabView(tab) {
    switch (tab.key) {
      case "dashboard":
        return html`<mcp-dashboard .selectedHistoryItem=${this.selectedHistoryItem} .onDeselectHistoryItem=${this.onDeselectHistoryItem}></mcp-dashboard>`;
      case "resources":
        return html`<mcp-resources></mcp-resources>`;
      case "tools":
        return html`<mcp-tools></mcp-tools>`;
      case "prompts":
        return html`<mcp-prompts></mcp-prompts>`;
      case "roots":
        return html`<mcp-roots></mcp-roots>`;
      default:
        return html`<div class="text-center p-8 text-muted">View not implemented: ${tab.key}</div>`;
    }
  },

  render() {
    return html`
                <uix-tabs
                    class="flex flex-col flex-grow flex-1"
                    style="--uix-tabs-font-size: 1rem; --uix-tabs-active-background-color: var(--colors-red-700); --uix-tabs-border-color: var(--colors-red-800); --uix-tabs-text: default; --uix-tabs-active-text: default;"
                    .activeTab=${this.activeTab}
                    .selectTab=${this.selectTab.bind(this)}
                    .tabs=${this.tabs.map((tab) => [
                      html`<uix-icon name=${tab.icon} class="mr-2"></uix-icon> ${tab.label}`,
                      html`<div class="p-6 bg-inverse flex-grow">${this._renderTabView(tab)}</div>`,
                    ])}
                >
                </uix-tabs>
            `;
  },
});

export default {
  tag: "mcp-inspector",
  class: "w-full bg-inverse flex font-sans text-sm",
  properties: {
    servers: T.array([]),
    history: T.array([]),
    historyUnsubscribe: T.any(null),
    selectedHistoryId: T.any(null),
  },

  connected() {
    this.initializeAI();
  },

  disconnected() {
    if (this.historyUnsubscribe) this.historyUnsubscribe();
  },

  handleHistorySelect(item) {
    this.selectedHistoryId = item ? item.id : null;
  },

  getSelectedHistoryItem() {
    if (!this.selectedHistoryId) return null;
    return (
      this.history.find((item) => item.id === this.selectedHistoryId) || null
    );
  },

  async initializeAI() {
    try {
      if (!AI.isInitialized) {
        await AI.init({
          geminiApiKey: "",
          defaultRoots: [
            {
              uri: "file:///",
              name: "Root Filesystem",
              description: "Full filesystem access",
            },
            {
              uri: "file:///home/user/",
              name: "User Home",
              description: "User home directory",
            },
            {
              uri: "config://",
              name: "Configuration",
              description: "Application configuration",
            },
          ],
        });
        this.servers = AI.listClients();
        console.log(this.servers);
      }
    } catch (error) {
      console.error("Error initializing AI service:", error);
    }
  },

  render() {
    const selectedHistoryItem = this.getSelectedHistoryItem();
    return html`
                <mcp-sidebar name="Inspector" class="bg-surface-light"></mcp-sidebar>
                <main class="flex-1 flex flex-col">
                    ${
                      this.servers.length > 0
                        ? html`<mcp-tabs
                              .selectedHistoryItem=${selectedHistoryItem}
                              .onDeselectHistoryItem=${() => this.handleHistorySelect(null)}
                          ></mcp-tabs>`
                        : html`
                              <div
                                  class="flex-grow flex items-center justify-center bg-inverse"
                              >
                                  <div class="text-center">
                                      <h3
                                          class="text-lg font-semibold"
                                      >
                                          Not Connected
                                      </h3>
                                      <p class="text-muted mt-1">
                                          Please connect to a server using the
                                          sidebar to begin.
                                      </p>
                                  </div>
                              </div>
                          `
                    }
                </main>
            `;
  },
};
