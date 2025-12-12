import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/$app/ai/index.js";

const renderTabContent = (tab) => {
  switch (tab.key) {
    case "dashboard":
      return html`<mcp-dashboard></mcp-dashboard>`;
    case "tools":
      return html`<mcp-tools></mcp-tools>`;
    case "resources":
      return html`<mcp-resources></mcp-resources>`;
    case "prompts":
      return html`<mcp-prompts></mcp-prompts>`;
    default:
      return html`<div class="text-center p-8 text-gray-500">View not implemented: ${tab.key}</div>`;
  }
};

export default {
  class: "flex-1 flex flex-col min-h-0",
  properties: {
    activeTab: T.string(),
  },
  selectTab(tabKey) {
    this.activeTab = tabKey;
  },
  render() {
    const tabs = [
      { key: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { key: "tools", label: "Tools", icon: "wrench" },
      { key: "resources", label: "Resources", icon: "database" },
      { key: "prompts", label: "Prompts", icon: "terminal" },
    ];
    return html`<uix-tabs
                                style="--uix-tabs-font-size: 1rem; --uix-tabs-active-background-color: var(--colors-red-700); --uix-tabs-border-color: var(--colors-red-800); --uix-tabs-text: default; --uix-tabs-active-text: default;"
                                class="flex flex-col flex-grow"
                                activeTab=${this.activeTab}
                                .selectTab=${this.selectTab.bind(this)}
                                .tabs=${tabs.map((tab) => [
                                  html`<uix-icon name=${tab.icon} class="mr-2 w-5"></uix-icon> ${tab.label}`,
                                  html`<div class="p-4 flex-grow overflow-auto">${renderTabContent(tab)}</div>`,
                                ])}
                            ></uix-tabs>`;
  },
};
