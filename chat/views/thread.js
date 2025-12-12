import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

export default {
  class: "w-full",
  dataQuery: true,
  properties: {
    providers: T.array(),
    currentConversation: T.object(null),
    contextMessageIds: T.array([]),
    availableTools: T.array([]),
    groupedTools: T.object({}),
    expandedServers: T.array([]),
    selectedTools: T.array([]),
    selectedModel: T.string({ sync: "local" }),
    selectedProvider: T.object(),
    selectedProviderId: T.string({ sync: "local" }),
    contextTokenCount: T.number(0),
    error: T.string(""),
    isLoading: T.boolean(false),
    showSettings: T.boolean(false),
  },

  connected() {
    this.on("dataLoaded", () => {
      this.initializeComponent();
    });
  },

  async initializeComponent() {
    const activeProviders = this.providers.filter((p) => p.active);
    if (activeProviders.length > 0) {
      await this.loadTools();
      let providerToSelect = null;
      if (this.selectedProviderId) {
        providerToSelect = activeProviders.find(
          (p) => p.id === this.selectedProviderId,
        );
      }
      if (!providerToSelect) providerToSelect = activeProviders[0];
      this.selectedProvider = providerToSelect;
      this.selectedProviderId = providerToSelect.id;
      const modelIsValid = providerToSelect.models.some(
        (m) => m.id === this.selectedModel,
      );
      if (!this.selectedModel || !modelIsValid)
        this.selectedModel = providerToSelect.models[0].id;
    } else {
      this.selectedProvider = null;
      this.selectedProviderId = null;
      this.selectedModel = null;
    }
  },

  async loadTools() {
    try {
      const { tools } = await AI.listTools();
      this.availableTools = tools || [];
      const groups = {};
      for (const tool of this.availableTools) {
        const serverName = tool.server || "local";
        if (!groups[serverName]) groups[serverName] = [];
        groups[serverName].push(tool);
      }
      this.groupedTools = groups;
    } catch (e) {
      console.error("Couldn't load tools", e);
      this.availableTools = [];
      this.groupedTools = {};
    }
  },

  async addProvider(providerData) {
    if (this.providers.some((p) => p.active && p.type === providerData.type)) {
      this.error = `A provider of type "${providerData.type}" already exists. Please delete it first.`;
      return;
    }
    const provider = {
      id: providerData.id,
      active: true,
    };
    if (providerData.baseUrl) provider.baseUrl = providerData.baseUrl;
    if (providerData.apiKey) provider.apiKey = providerData.apiKey;
    const newRecord = await Model.providers.edit(provider);

    await this.loadTools();

    const newProvider = this.providers.find((p) => p.id === newRecord.id);
    if (newProvider) {
      // REFACTORED: Set both object and ID
      this.selectedProvider = newProvider;
      this.selectedProviderId = newProvider.id;
      this.selectedModel = this.selectedProvider.models[0].id;
    }

    this.error = "";
  },

  async deleteProvider(providerType) {
    const providerToDelete = this.providers.find(
      (p) => p.type === providerType,
    );
    if (providerToDelete) await Model.providers.remove(providerToDelete.id);

    // REFACTORED: Update both object and ID
    if (this.selectedProvider?.type === providerType) {
      const activeProviders = this.providers.filter((p) => p.active);
      if (activeProviders.length > 0) {
        this.selectedProvider = activeProviders[0];
        this.selectedProviderId = this.selectedProvider.id;
        this.selectedModel = this.selectedProvider.models[0].id;
      } else {
        this.selectedProvider = null;
        this.selectedProviderId = null;
        this.selectedModel = null;
      }
    }
  },

  toggleSettings() {
    this.showSettings = !this.showSettings;
  },

  toggleTool(toolName) {
    if (this.selectedTools.includes(toolName))
      this.selectedTools = this.selectedTools.filter((t) => t !== toolName);
    else this.selectedTools = [...this.selectedTools, toolName];
    this.updateTokenCount();
  },

  toggleServerTools(serverName) {
    const toolsOnServer = this.groupedTools[serverName].map((t) => t.name);
    const allSelected = toolsOnServer.every((t) =>
      this.selectedTools.includes(t),
    );
    if (allSelected)
      this.selectedTools = this.selectedTools.filter(
        (t) => !toolsOnServer.includes(t),
      );
    else {
      const currentSelectedSet = new Set(this.selectedTools);
      toolsOnServer.forEach((t) => currentSelectedSet.add(t));
      this.selectedTools = Array.from(currentSelectedSet);
    }
    this.updateTokenCount();
  },

  toggleServerExpansion(serverName) {
    if (this.expandedServers.includes(serverName))
      this.expandedServers = this.expandedServers.filter(
        (s) => s !== serverName,
      );
    else this.expandedServers = [...this.expandedServers, serverName];
  },

  handleModelChange(modelId) {
    this.selectedModel = modelId;
  },

  handleProviderChange(providerType) {
    const provider = this.providers.find((p) => p.type === providerType);
    // REFACTORED: Set both object and ID
    if (provider) {
      this.selectedProvider = provider;
      this.selectedProviderId = provider.id;
      if (provider.models.length > 0) {
        this.selectedModel = provider.models[0].id;
      }
    }
  },

  toggleMessageInContext(messageId) {
    const idSet = new Set(this.contextMessageIds);
    if (idSet.has(messageId)) {
      idSet.delete(messageId);
    } else {
      idSet.add(messageId);
    }
    this.contextMessageIds = Array.from(idSet);
    this.updateTokenCount();
  },

  selectAllMessages() {
    if (this.currentConversation?.messages) {
      this.contextMessageIds = this.currentConversation.messages.map(
        (m) => m.id,
      );
      this.updateTokenCount();
    }
  },

  deselectAllMessages() {
    this.contextMessageIds = [];
    this.updateTokenCount();
  },

  updateTokenCount() {
    if (!this.currentConversation && this.selectedTools.length === 0) {
      this.contextTokenCount = 0;
      return;
    }

    let totalChars = 0;

    if (this.currentConversation) {
      const contextMessages = this.currentConversation.messages.filter((m) =>
        this.contextMessageIds.includes(m.id),
      );
      totalChars += contextMessages.reduce((sum, msg) => {
        let messageChars = msg.content?.length || 0;
        if (msg.toolCalls) {
          messageChars += JSON.stringify(msg.toolCalls).length;
        }
        return sum + messageChars;
      }, 0);
    }

    const selectedToolObjects = this.availableTools.filter((t) =>
      this.selectedTools.includes(t.name),
    );
    const toolChars = selectedToolObjects.reduce((sum, tool) => {
      const argumentString = tool.arguments
        ? JSON.stringify(tool.arguments)
        : "";
      return (
        sum +
        (tool.name?.length || 0) +
        (tool.description?.length || 0) +
        argumentString.length +
        100
      );
    }, 0);

    totalChars += toolChars;

    this.contextTokenCount = Math.ceil(totalChars / 4);
  },

  updateConversationTitle(conversation) {
    if (
      (!conversation.title || conversation.title === "New Chat") &&
      conversation.messages.length > 0
    ) {
      const firstMessage = conversation.messages.find((m) => m.role === "user");
      if (firstMessage?.content) {
        conversation.title =
          firstMessage.content.length > 50
            ? `${firstMessage.content.substring(0, 50)}...`
            : firstMessage.content;
      }
    }
  },

  async sendMessage(content) {
    if (this.providers.filter((p) => p.active).length === 0) {
      this.error =
        "Cannot send message. Please add a provider in the settings.";
      return;
    }
    if (!this.selectedModel) {
      this.error = "Cannot send message. No model selected.";
      return;
    }
    if (!this.currentConversation) {
      this.dispatchEvent(
        new CustomEvent("create-conversation-needed", { bubbles: true }),
      );
      return;
    }
    const userMessage = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const [_, savedUserMessage] = await Model.messages.add({
      ...userMessage,
      chat: this.currentConversation.id.replace("chat://", ""),
    });

    this.currentConversation.messages.push(savedUserMessage);
    this.contextMessageIds = [...this.contextMessageIds, savedUserMessage.id];

    this.updateConversationTitle(this.currentConversation);
    this.updateTokenCount();

    this.isLoading = true;
    this.error = "";
    const assistantMessage = {
      role: "assistant",
      content: "",
      timestamp: null,
      toolCalls: [],
    };
    this.currentConversation.messages.push(assistantMessage);
    try {
      const history = this.currentConversation.messages
        .filter((m) => this.contextMessageIds.includes(m.id))
        .map((m) => ({
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls,
        }));
      const stream = AI.chat(history, {
        stream: true,
        enabledTools: this.selectedTools,
        model: this.selectedModel,
        provider: this.selectedProvider,
      });
      for await (const chunk of stream) {
        if (chunk.type === "content") {
          assistantMessage.content = chunk.content;
        } else if (chunk.type === "tool_calls_start") {
          assistantMessage.toolCalls = chunk.toolCalls;
        } else if (
          chunk.type === "tool_result" ||
          chunk.type === "tool_error"
        ) {
          const toolCall = assistantMessage.toolCalls.find(
            (tc) => tc.id === chunk.id,
          );
          if (toolCall) {
            toolCall.result = chunk.result || { error: chunk.error };
          }
        }
        this.currentConversation = { ...this.currentConversation };
        this.scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      this.error = error.message || "Failed to send message";
      assistantMessage.content = `Error: ${this.error}`;
    } finally {
      this.isLoading = false;
      assistantMessage.timestamp = new Date().toISOString();

      const [_, savedAssistantMessage] = await Model.messages.add({
        ...assistantMessage,
        chat: this.currentConversation.id.replace("chat://", ""),
      });
      console.log({ savedAssistantMessage, _ });
      const lastMsgIndex = this.currentConversation.messages.length - 1;
      this.currentConversation.messages[lastMsgIndex] = savedAssistantMessage;

      this.contextMessageIds = [
        ...this.contextMessageIds,
        savedAssistantMessage.id,
      ];
      this.updateTokenCount();
    }
  },

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = this.querySelector(".chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  },

  render() {
    if (!this.providers) return;
    this.scrollToBottom();
    const activeProviders = this.providers.filter((p) => p.active);
    console.log(this.currentConversation);
    return html`
            <div class="flex-1 flex flex-col bg-inverse h-full relative">
                ${
                  activeProviders.length === 0
                    ? html`
                            <div class="flex-1 overflow-y-auto">
                                <mcp-provider-settings
                                    .providers=${this.providers}
                                    .onAddProvider=${this.addProvider.bind(this)}
                                    .onDeleteProvider=${this.deleteProvider.bind(this)}
                                ></mcp-provider-settings>
                            </div>
                        `
                    : html`
                            <chat-context-bar
                                .tokenCount=${this.contextTokenCount}
                                .selectedTools=${this.selectedTools}
                                .messageCount=${this.contextMessageIds.length}
                                .totalMessages=${this.currentConversation?.messages.length || 0}
                                .onSelectAll=${this.selectAllMessages.bind(this)}
                                .onDeselectAll=${this.deselectAllMessages.bind(this)}
                            ></chat-context-bar>

                            <div class="flex-1 overflow-y-auto chat-messages px-6">
                                ${this.error ? html`<div class="bg-red-900/50 border border-danger rounded-lg p-3 my-4 text-primary">${this.error}</div>` : ""}
                                ${this.currentConversation?.messages.map(
                                  (message, index) => html`
                                        <chat-message
                                            .message=${{ ...message }}
                                            .isUser=${message.role === "user"}
                                            .isStreaming=${this.isLoading && this.currentConversation && index === this.currentConversation.messages.length - 1}
                                            .inContext=${this.contextMessageIds.includes(message.id)}
                                            .onContextToggle=${this.toggleMessageInContext.bind(this)}
                                       ></chat-message>
                                    `,
                                )}
                            </div>
                        `
                }
                ${
                  this.showSettings && activeProviders.length > 0
                    ? html`
                            <div class="absolute inset-0 bg-black/60 z-10 flex items-center justify-center p-4">
                                <div class="w-full max-w-2xl h-[80vh] max-h-[700px] bg-inverse rounded-lg shadow-2xl border border-surface-lighter overflow-hidden">
                                    <mcp-provider-settings
                                        .providers=${this.providers}
                                        .onAddProvider=${this.addProvider.bind(this)}
                                        .onDeleteProvider=${this.deleteProvider.bind(this)}
                                   .isModal=${true}
                                        .onClose=${this.toggleSettings.bind(this)}
                                    ></mcp-provider-settings>
                                </div>
                            </div>`
                    : ""
                }
                <chat-input
                    .isLoading=${this.isLoading}
               .onSend=${this.sendMessage.bind(this)}
                    .groupedTools=${this.groupedTools}
                    .expandedServers=${this.expandedServers}
                    .selectedTools=${this.selectedTools}
                    .onToolToggle=${this.toggleTool.bind(this)}
                    .onServerToggle=${this.toggleServerTools.bind(this)}
                    .onServerExpandToggle=${this.toggleServerExpansion.bind(this)}
                    .selectedModel=${this.selectedModel}
                    .onModelChange=${this.handleModelChange.bind(this)}
                 .availableProviders=${activeProviders}
                    .selectedProvider=${this.selectedProvider}
                    .onProviderChange=${this.handleProviderChange.bind(this)}
                    .onSettingsClick=${this.toggleSettings.bind(this)}
                ></chat-input>
         </div>
        `;
  },
};
