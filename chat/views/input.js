import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  properties: {
    value: T.string(""),
    isLoading: T.boolean(false),
    onSend: T.function(),
    groupedTools: T.object({}),
    expandedServers: T.array([]),
    selectedTools: T.array([]),
    onToolToggle: T.function(),
    onServerToggle: T.function(),
    onServerExpandToggle: T.function(),
    selectedModel: T.string(),
    onModelChange: T.function(),
    availableProviders: T.array([]),
    selectedProvider: T.object(),
    onProviderChange: T.function(),
    onSettingsClick: T.function(),
  },
  handleInput(event) {
    this.value = event.target.value;
    this.autoResize(event.target);
  },
  autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  },
  handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  },
  sendMessage() {
    if (!this.value.trim() || this.isLoading) return;
    const message = this.value.trim();
    if (this.onSend) {
      this.onSend(message);
    }
    this.value = "";
    setTimeout(() => {
      const textarea = this.querySelector("textarea");
      if (textarea) this.autoResize(textarea);
    }, 0);
  },
  render() {
    return html`
                <div class="px-6 pb-4">
                    <div class="bg-surface-light border border-surface-lighter rounded-xl shadow-lg p-2">
                        <div class="px-2 pb-2 flex justify-between items-center flex-wrap gap-2">
                            <div class="flex items-center gap-2 flex-wrap">
                                ${Object.keys(this.groupedTools || {}).map(
                                  (serverName) => {
                                    const toolsOnServer =
                                      this.groupedTools[serverName];
                                    const allSelected = toolsOnServer.every(
                                      (t) =>
                                        this.selectedTools.includes(t.name),
                                    );
                                    const someSelected =
                                      !allSelected &&
                                      toolsOnServer.some((t) =>
                                        this.selectedTools.includes(t.name),
                                      );
                                    const isExpanded =
                                      this.expandedServers.includes(serverName);

                                    let serverButtonClass =
                                      "bg-surface-lighter";
                                    let serverTextColor = "text-[default]";
                                    if (allSelected) {
                                      serverButtonClass = "bg-secondary";
                                      serverTextColor = "text-inverse";
                                    } else if (someSelected) {
                                      serverButtonClass = "bg-warning";
                                      serverTextColor = "text-inverse";
                                    }

                                    return html`
                                            <div class="relative inline-block text-left">
                                                <div class="flex items-center rounded-md ${serverButtonClass} ${serverTextColor} text-sm font-medium transition-colors">
                                                    <button
                                                        @click=${() => this.onServerToggle(serverName)}
                                                        class="px-2 py-1 hover:bg-black/10 transition-all flex items-center gap-1.5 rounded-l-md"
                                                        title=${`Toggle all tools for ${serverName}`}
                                                    >
                                                        <span class="capitalize">${serverName}</span>
                                                    </button>
                                                    <button @click=${() => this.onServerExpandToggle(serverName)} class="px-1.5 py-1 hover:bg-black/10 rounded-r-md border-l border-black/20">
                                                        <span class="${isExpanded ? "rotate-180" : ""} inline-block transition-transform">
                                                            <uix-icon name="chevron-down"></uix-icon>
                                                        </span>
                                                    </button>
                                                </div>
                                                ${
                                                  isExpanded
                                                    ? html`
                                                            <div class="absolute bottom-full mb-2 z-10 w-64 bg-surface-light border border-surface-lighter rounded-md shadow-lg p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                                                                ${toolsOnServer.map(
                                                                  (
                                                                    tool,
                                                                  ) => html`
                                                                        <button
                                                                            @click=${() => this.onToolToggle(tool.name)}
                                                                            class="w-full text-left p-1.5 rounded text-sm truncate transition-colors ${this.selectedTools.includes(tool.name) ? "bg-secondary text-inverse" : "hover:bg-surface-lighter"}"
                                                                            title=${tool.description}
                                                                        >
                                                                            ${tool.name}
                                                                        </button>
                                                                    `,
                                                                )}
                                                            </div>
                                                          `
                                                    : ""
                                                }
                                            </div>
                                        `;
                                  },
                                )}
                            </div>
                            <div class="flex items-center gap-2">
                                <select @change=${(e) => this.onProviderChange(e.target.value)} .value=${this.selectedProvider?.type} class="bg-surface-lighter border border-surface-lighter rounded-md px-2 text-sm focus:ring-secondary focus:outline-none h-7 capitalize">
                                    ${this.availableProviders.map((provider) => html`<option value=${provider.type}>${provider.type}</option>`)}
                                </select>
                                ${
                                  !this.selectedProvider
                                    ? null
                                    : html`<select @change=${(e) => this.onModelChange(e.target.value)} value=${this.selectedModel} class="bg-surface-lighter border border-surface-lighter rounded-md px-2 text-sm focus:ring-secondary focus:outline-none h-7">
                                                    ${this.selectedProvider.models.map((model) => html`<option value=${model.id} ?selected=${model.id === this.selectedModel}>${model.name}</option>`)}
                                                </select>
                                              `
                                }
                                <button @click=${this.onSettingsClick} class="p-1.5 text-muted hover:hover:bg-surface-lighter rounded-md">
                                    <uix-icon name="settings" class="w-5 h-5"></uix-icon>
                                </button>
                            </div>
                        </div>
                        <div class="relative">
                            <textarea
                                .value=${this.value}
                                @input=${this.handleInput.bind(this)}
                                @keydown=${this.handleKeyPress.bind(this)}
                                ?disabled=${this.isLoading || this.availableProviders.length === 0}
                                placeholder=${this.availableProviders.length === 0 ? "Please add a provider in settings first." : "Type your message..."}
                                rows="1"
                                class="w-full bg-inverse p-4 pr-16 placeholder-default resize-none focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg transition-all"
                                style="max-height: 200px; overflow-y: auto;"
                            ></textarea>
                            <button
                                @click=${this.sendMessage.bind(this)}
                                ?disabled=${!this.value.trim() || this.isLoading || this.availableProviders.length === 0}
                                class="absolute right-3 bottom-2.5 p-2 rounded-full transition-colors
                                ${
                                  !this.value.trim() ||
                                  this.isLoading ||
                                  this.availableProviders.length === 0
                                    ? "bg-surface-lighter cursor-not-allowed"
                                    : "bg-secondary-dark hover:bg-secondary"
                                }"
                            >
                                ${this.isLoading ? html`<div class="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>` : html`<uix-icon name="send" class="w-5 h-5"></uix-icon>`}
                            </button>
                        </div>
                    </div>
                </div>
            `;
  },
};
