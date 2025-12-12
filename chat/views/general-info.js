import { html } from "/npm/lit-html";
import Model from "/$app/model/index.js";
import T from "/$app/types/index.js";
import IDE from "/controllers/ide.js";

export default {
  properties: {
    context: T.object(),
    totalChats: T.number(0),
  },

  async connected() {
    await this.loadChatCount();
  },

  async loadChatCount() {
    try {
      const conversations = await Model.conversations.getAll();
      this.totalChats = conversations.length;
    } catch (error) {
      console.error("Failed to load chat count:", error);
    }
  },

  render() {
    return html`
            <div class="flex flex-col h-full">
                <div class="p-2 font-semibold uppercase text-xs tracking-wider text-default/50 border-b border-surface">
                    Chat Overview
                </div>
                <div class="flex flex-col items-center justify-center flex-1 p-6 text-center">
                    <uix-icon name="message-square" class="w-16 h-16 text-default/30 mb-4"></uix-icon>
                    <div class="text-default font-medium mb-2">
                        ${this.totalChats} Conversation${this.totalChats !== 1 ? "s" : ""}
                    </div>
                    <div class="text-xs text-default/50 mb-4">
                        Open a chat to see detailed information
                    </div>
                    <uix-button
                        variant="success"
                        @click=${() => IDE.executeCommand("chat.newChat")}
                    >
                        New Chat
                    </uix-button>
                </div>
            </div>
        `;
  },
};
