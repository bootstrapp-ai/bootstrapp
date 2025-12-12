import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";

const getChatId = (uri) => uri.substring(7);

export default {
  properties: {
    context: T.object(),
    stats: T.object(null),
  },

  async connected() {
    if (this.context?.uri) {
      await this.calculateStats();
    }
  },

  async calculateStats() {
    try {
      const id = getChatId(this.context.uri);
      const convo = await Model.conversations.get(id, {
        includes: ["messages"],
      });

      const messages = convo.messages || [];
      const userMessages = messages.filter((m) => m.role === "user");
      const assistantMessages = messages.filter((m) => m.role === "assistant");

      const totalChars = messages.reduce((sum, m) => {
        const content = typeof m.content === "string" ? m.content : "";
        return sum + content.length;
      }, 0);

      const estimatedTokens = Math.round(totalChars / 4);

      this.stats = {
        total: messages.length,
        user: userMessages.length,
        assistant: assistantMessages.length,
        characters: totalChars,
        tokens: estimatedTokens,
      };
    } catch (error) {
      console.error("Failed to calculate stats:", error);
    }
  },

  render() {
    if (!this.stats) {
      return html`
                <div class="border-t border-surface p-3 text-default/50 text-xs">
                    Calculating statistics...
                </div>
            `;
    }

    return html`
            <div class="border-t border-surface">
                <div class="p-2 font-semibold uppercase text-xs tracking-wider text-default/50 border-b border-surface">
                    Message Statistics
                </div>
                <div class="flex flex-col gap-2 p-3 text-xs">
                    <div class="flex justify-between items-center">
                        <span class="text-default/50">Total Messages</span>
                        <span class="text-default font-semibold">${this.stats.total}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-default/50">Your Messages</span>
                        <span class="text-secondary">${this.stats.user}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-default/50">Assistant Messages</span>
                        <span class="text-success">${this.stats.assistant}</span>
                    </div>
                    <div class="flex justify-between items-center pt-2 border-t border-surface/50">
                        <span class="text-default/50">Total Characters</span>
                        <span class="text-default">${this.stats.characters.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-default/50">Estimated Tokens</span>
                        <span class="text-primary">~${this.stats.tokens.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
  },
};
