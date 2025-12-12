import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
export default {
  style: true,
  properties: {
    selectedHistoryItem: T.object(null),
    onDeselectHistoryItem: T.function(),
  },

  _renderCard(title, content) {
    return html`
                <uix-card class="flex flex-col min-h-[200px]">
                    <h3 class="font-semibold mb-3">${title}</h3>
                    <div class="flex-grow overflow-y-auto pr-2">${content}</div>
                </uix-card>
            `;
  },

  render() {
    return html`
              <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <mcp-tools viewMode="flow" class="block h-60"></mcp-tools>
        <mcp-prompts viewMode="flow" class="block h-60"></mcp-prompts>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <mcp-resources viewMode="flow" resourceType="resources" class="block h-60"></mcp-resources>
        <mcp-resources viewMode="flow" resourceType="templates" class="block h-60"></mcp-resources>
    </div>
</div>

            `;
  },
};
