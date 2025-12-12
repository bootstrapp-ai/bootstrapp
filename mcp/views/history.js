import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import View from "/node_modules/@bootstrapp/view/index.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

$APP.define("mcp-history-view", {
  properties: {
    item: T.object(null),
    onBack: T.function(),
  },

  handleBack() {
    if (this.onBack) {
      this.onBack();
    }
  },

  render() {
    if (!this.item) {
      return html`<div class="text-center text-gray-500 h-full flex items-center justify-center">Select a history item to view details.</div>`;
    }

    const { item } = this;

    return html`
                <div class="text-sm">
                    <uix-link label="Back" icon="arrow-left" reverse @click=${this.handleBack.bind(this)} class="text-xs text-blue-600 hover:underline mb-3 flex items-center"></uix-link>
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-mono text-xs font-bold text-gray-700 mb-1">REQUEST</h4>
                            <pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-2 rounded-lg font-mono overflow-auto">${JSON.stringify({ tool: item.toolName, args: item.args || item.params }, null, 2)}</pre>
                        </div>
                        <div>
                            <h4 class="font-mono text-xs font-bold text-gray-700 mb-1">RESPONSE</h4>
                            ${
                              item.status === "success"
                                ? html`<pre class="text-xs whitespace-pre-wrap bg-gray-900 text-green-400 p-2 rounded-lg font-mono overflow-auto">${JSON.stringify(item.result, null, 2)}</pre>`
                                : item.status === "error"
                                  ? html`<pre class="text-xs whitespace-pre-wrap bg-red-100 text-red-700 p-2 rounded-lg font-mono overflow-auto">${item.error}</pre>`
                                  : html`<p class="text-xs text-gray-500">Request is still pending...</p>`
                            }
                        </div>
                    </div>
                </div>
            `;
  },
});

export default {
  properties: {
    history: T.array([]),
    selectedHistoryId: T.string(null),
    onSelect: T.function(),
    listOnly: T.boolean(),
  },
  selectHistoryItem(item) {
    this.selectedHistoryId = item ? item.id : undefined;
    if (this.onHistorySelect) this.onSelect(item);
  },
  connected() {
    this.historyUnsubscribe = AI.onHistoryChange((event) => {
      this.history = event.history;
    });
    this.history = AI.getHistory();
  },
  render() {
    if (this.history.length === 0)
      return html`<p class="text-center text-xs text-gray-400 p-4">No history yet</p>`;
    const selectedHistoryItem = this.history.find(
      (h) => h.id === this.selectedHistoryId,
    );

    return html`
                <ul class="text-xs space-y-1 font-mono">
                    ${this.history.map(
                      (item) => html`
                            <li
                                class="flex flex-col ${this.selectedHistoryId === item.id ? "font-semibold text-blue-100 p-2" : item.status === "error" ? "text-red-100" : "text-white"}">
                                <div 
																 @click=${() => this.selectHistoryItem(item)}
																class="cursor-pointer flex items-center justify-between p-2 rounded hover:bg-gray-700">
																<span class="text-ellipsis">${item.toolName}</span>
                                <div class="flex items-center">
                                    <span class="text-gray-500 mr-2">${item.status}</span>
                                    <uix-icon name="chevron-right" class="h-4 w-4 text-gray-400"></uix-icon>
                                </div>
																</div>
																${!this.listOnly || !selectedHistoryItem || selectedHistoryItem.id !== item.id ? null : html`<mcp-history-view .item=${selectedHistoryItem} .onBack=${() => this.selectHistoryItem(null)}></mcp-history-view>`}
                            </li>
                        `,
                    )}
                </ul>
            `;
  },
};
