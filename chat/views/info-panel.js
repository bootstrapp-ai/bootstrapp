import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import IDE from "/controllers/ide.js";

const getChatId = (uri) => uri.substring(7);

export default {
  properties: {
    context: T.object(),
    conversation: T.object(null),
  },

  async connected() {
    if (this.context?.uri) {
      await this.loadConversation();
    }
  },

  async loadConversation() {
    try {
      const id = getChatId(this.context.uri);
      const convo = await Model.conversations.get(id, {
        includes: ["messages"],
      });
      this.conversation = convo;
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  },

  formatDate(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  },

  render() {
    if (!this.conversation) {
      return html`
                <div class="flex flex-col gap-3">
                    <span class="text-sm text-default/50">Loading conversation info...</span>
                </div>
            `;
    }

    const messageCount = this.conversation.messages?.length || 0;
    const lastMessage = this.conversation.messages?.[messageCount - 1];

    return html`
            <uix-panel variant="bordered">
                <div class="flex items-center justify-between" slot="header">
                    <span class="text-xs font-semibold uppercase text-default/80">Conversation Info</span>
                    <uix-icon name="info"></uix-icon>
                </div>
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-default/50">Title</span>
                        <span class="font-medium text-default">${this.conversation.title || "Untitled"}</span>
                    </div>

                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-default/50">Created</span>
                        <span class="text-sm text-default">${this.formatDate(this.conversation.createdAt)}</span>
                    </div>

                    ${
                      this.conversation.updatedAt
                        ? html`
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-default/50">Last Updated</span>
                            <span class="text-sm text-default">${this.formatDate(this.conversation.updatedAt)}</span>
                        </div>
                    `
                        : ""
                    }

                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-default/50">Messages</span>
                        <span class="text-sm text-default">${messageCount} message${messageCount !== 1 ? "s" : ""}</span>
                    </div>

                    ${
                      lastMessage
                        ? html`
                        <div class="flex flex-col gap-1">
                            <span class="text-xs text-default/50">Last Message</span>
                            <span class="text-xs text-default/80 line-clamp-2">
                                ${lastMessage.role === "user" ? "You: " : "Assistant: "}
                                ${typeof lastMessage.content === "string" ? lastMessage.content.substring(0, 100) : "..."}
                            </span>
                        </div>
                    `
                        : ""
                    }

                    <uix-button
                        variant="danger"
                        size="sm"
                        @click=${() => IDE.executeCommand("chat.deleteChat", { uri: this.context.uri })}
                        class="w-full"
                    >
                        Delete Conversation
                    </uix-button>
                </div>
            </uix-panel>
        `;
  },
};
