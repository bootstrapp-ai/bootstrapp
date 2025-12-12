import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  properties: {
    tokenCount: T.number(0),
    selectedTools: T.array([]),
    messageCount: T.number(0),
    totalMessages: T.number(0),
    onSelectAll: T.function(),
    onDeselectAll: T.function(),
  },
  render() {
    return html`
                <div class="px-6 py-2 border-b border-surface-lighter bg-inverse flex items-center justify-between text-sm text-muted shadow-md">
                    <div class="flex items-center gap-x-6">
                        <div class="flex items-center gap-2" title="Messages in context / Total messages">
                            <uix-icon name="list-checks" class="w-4 h-4 text-muted"></uix-icon>
                            <span>${this.messageCount} / ${this.totalMessages} Messages</span>
                        </div>
                        <div class="flex items-center gap-2" title="Estimated token count for the context">
                            <uix-icon name="database" class="w-4 h-4 text-muted"></uix-icon>
                            <span>~${this.tokenCount.toLocaleString()} Tokens</span>
                        </div>
                        <div class="flex items-center gap-2" title="Enabled tools for the next message">
                            <uix-icon name="pickaxe" class="w-4 h-4 text-muted"></uix-icon>
                            <span>${this.selectedTools.length} Tools Enabled</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click=${this.onSelectAll} class="px-2 py-1 rounded-md hover:bg-surface-lighter transition-colors flex items-center gap-1.5 text-sm font-medium">
                            <uix-icon name="square-check" class="w-3.5 h-3.5"></uix-icon> Select All
                        </button>
                        <button @click=${this.onDeselectAll} class="px-2 py-1 rounded-md hover:bg-surface-lighter transition-colors flex items-center gap-1.5 text-sm font-medium">
                           <uix-icon name="square" class="w-3.5 h-3.5"></uix-icon> Deselect All
                        </button>
                    </div>
                </div>
            `;
  },
};
