import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/$app/ai/index.js";
export default {
  properties: {
    conversation: T.array({ defaultValue: [], sync: "local" }),
    newMessage: T.string(),
    isOpen: T.boolean({ sync: "local" }),
    isThinking: T.boolean(),
    geminiKey: T.string({ sync: "local" }),
    isAiReady: T.boolean(false),
  },
  async connected() {
    if (!this.geminiKey) {
      this.geminiKey = prompt(
        "Enter your Gemini API Key to enable AI features:",
      );
    }
    if (!this.geminiKey) {
      console.warn(
        "Gemini API Key is not provided. AI features will be disabled.",
      );
      return;
    }
    try {
      await AI.init({ geminiApiKey: this.geminiKey });
      this.isAiReady = true;
      console.log("AI Initialized Successfully from view-index");
    } catch (error) {
      console.error("Failed to initialize AI:", error);
      alert(
        "Failed to initialize AI. Please check your API key and try again.",
      );
    }
  },
  async sendMessage() {
    if (!this.newMessage?.trim()) return;
    const userMessage = { role: "user", content: this.newMessage };
    this.conversation = [...this.conversation, userMessage];
    const currentConversation = [...this.conversation];
    this.isThinking = true;
    this.newMessage = "";
    try {
      const aiResponse = await AI.chat(currentConversation);
      this.conversation = [...currentConversation, aiResponse];
    } catch (error) {
      console.error("Chatbot AI error:", error);
      const errorMessage = {
        role: "assistant",
        content: `Sorry, an error occurred: ${error.message}`,
      };
      this.conversation = [...currentConversation, errorMessage];
    } finally {
      this.isThinking = false;
    }
  },
  renderMessage(message) {
    const isUser = message.role === "user";
    if (message.toolCalls) {
      return html`<div class="text-xs text-gray-400 italic text-center my-2">Using tool: ${message.toolCalls[0].name}...</div>`;
    }
    return html`
                <div class="flex ${isUser ? "justify-end" : "justify-start"}">
                    <div class="max-w-xs md:max-w-md p-3 rounded-lg ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}">
                        ${message.content}
                    </div>
                </div>
            `;
  },
  render() {
    return html`
                <div class="relative">
                    ${
                      this.isOpen
                        ? html`
                            <div class="w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col">
                            <header class="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
                                    <h3 class="font-bold text-lg">Habit Helper</h3>
                                    <uix-button icon="x" class="text-white" @click=${() => (this.isOpen = false)}></uix-button>
                                </header>
                                <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                                    ${this.conversation?.map(this.renderMessage)}
                                    ${this.isThinking ? html`<div class="flex justify-start"><div class="p-3 rounded-lg bg-gray-200 text-gray-500"><i>Thinking...</i></div></div>` : ""}
                                </div>
                                <footer class="p-2 border-t">
                                    <uix-form .submit=${this.sendMessage.bind(this)}>
                                        <uix-join>
                                            <uix-input .bind=${this.prop("newMessage")} placeholder="Ask me anything..." class="w-full"></uix-input>
                                            <uix-button type="submit" icon="send" ?disabled=${this.isThinking}></uix-button>
                                        </uix-join>
                                    </uix-form>
                                </footer>
                            </div>`
                        : html`
                            <uix-button shape="circle" class="is-xl is-primary shadow-lg" icon="message-circle" @click=${() => (this.isOpen = true)}></uix-button>`
                    }
                </div>
            `;
  },
};
