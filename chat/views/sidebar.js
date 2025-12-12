import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";

export default {
  class: "h-full flex flex-col bg-surface-light flex flex-1",
  properties: {
    conversations: T.array({ sync: Model.conversations, query: {} }),
    currentId: T.any(null),
    onSelect: T.function(),
    onNew: T.function(),
    onDelete: T.function(),
    conversationContextMenu: T.function(),
  },
  _getPreview(conversation) {
    if (!conversation.messages || conversation.messages.length === 0)
      return "New conversation";
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return "New conversation";
    const content = lastMessage.content || "Tool Call";
    return content.length > 35 ? `${content.substring(0, 35)}...` : content;
  },
  _formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  },
  render() {
    if (!this.conversations) return;
    const sortedConversations = [...this.conversations].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    );

    return html`<div class="p-3 border-b border-surface-lighter">
                        <button @click=${this.onNew} class="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-secondary-dark hover:bg-secondary transition-colors font-semibold">
                            <uix-icon name="plus" class="w-4 h-4"></uix-icon> New Chat
                        </button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2">
                        ${
                          !sortedConversations ||
                          sortedConversations.length === 0
                            ? html`<div class="p-4 text-center text-muted">No conversations yet</div>`
                            : sortedConversations.map(
                                (conv) => html`
                                        <div
                                            @click=${() => this.onSelect(conv.id)}
																						@contextmenu=${(event) => this.conversationContextMenu?.(event, conv)}
                                            class="p-3 rounded-lg cursor-pointer transition-colors group relative ${this.currentId === conv.id ? "bg-surface-lighter" : "hover:bg-surface-lighter"}"
                                        >
                                            <div class="text-sm font-semibold truncate">${conv.title || "Untitled Chat"}</div>
                                            <div class="flex justify-between items-center mt-1">
                                                <div class="text-sm text-muted truncate pr-10">${this._getPreview(conv)}</div>
                                                <span class="text-sm text-muted flex-shrink-0">${this._formatDate(conv.updatedAt || conv.createdAt)}</span>
                                            </div>
                                            <button
                                                @click=${(e) => {
                                                  e.stopPropagation();
                                                  this.onDelete(conv.id);
                                                }}
                                                class="absolute top-2 right-2 p-1 text-muted hover:text-danger rounded-full hover:bg-inverse opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete conversation"
                                            >
                                                <uix-icon name="trash-2" class="w-4 h-4"></uix-icon>
                                            </button>
                                        </div>
                                    `,
                              )
                        }
                    </div>`;
  },
};
