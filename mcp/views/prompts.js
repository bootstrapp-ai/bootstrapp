import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/$app/ai/index.js";

export default {
  tag: "mcp-prompts",
  properties: {
    prompts: T.array([]),
    selectedPrompt: T.object(null),
    promptArgs: T.object({}),
    isExecuting: T.boolean(false),
    isLoading: T.boolean(true),
    viewMode: T.string({ defaultValue: "side-by-side" }),
    promptResponse: T.any(null),
  },
  connected() {
    this.loadPrompts();
  },
  async loadPrompts() {
    this.isLoading = true;
    try {
      const servers = AI.listClients();
      if (servers && servers.length > 0) {
        const { prompts } = await AI.listPrompts({ servers });
        console.log({ prompts });
        this.prompts = prompts || [];
      }
    } catch (error) {
      console.error("Error loading prompts:", error);
      this.prompts = [];
    } finally {
      this.isLoading = false;
    }
  },
  selectPrompt(prompt) {
    this.selectedPrompt = prompt;
    this.promptArgs = {};
    this.promptResponse = null;
  },
  clearSelectedPrompt() {
    this.selectedPrompt = null;
    this.promptResponse = null;
  },
  handleArgInput(paramName, event) {
    this.promptArgs = {
      ...this.promptArgs,
      [paramName]: event.target.value,
    };
  },
  async handleGetPrompt() {
    if (!this.selectedPrompt) return;

    this.isExecuting = true;
    this.promptResponse = null;
    try {
      const { name } = this.selectedPrompt;
      const args = this.promptArgs;

      const response = await AI.getPrompt({ name, arguments: args });
      this.promptResponse = response;
    } catch (error) {
      console.error("Error executing prompt:", error);
      this.promptResponse = {
        error: error.message || "An unknown error occurred.",
      };
    } finally {
      this.isExecuting = false;
    }
  },

  // Shared rendering methods
  _renderPromptList(showBackButton = false) {
    if (this.isLoading) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">Loading...</p></div>`;
    }
    if (!this.prompts.length) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">No prompts found.</p></div>`;
    }
    return html`
				<div class="flex-1 overflow-y-auto p-2">
					<h3 class="font-semibold text-sm p-2 text-gray-800">Prompts</h3>
					<ul>
						${this.prompts.map(
              (prompt) => html`
								<li>
									<button 
										@click=${() => this.selectPrompt(prompt)} 
										class="w-full text-left p-2 rounded text-sm hover:bg-gray-100 ${
                      this.selectedPrompt?.name === prompt.name
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : ""
                    }"
									>
										<p class="font-mono text-xs">${prompt.name}</p>
										<p class="text-xs text-gray-500 truncate">${prompt.description}</p>
									</button>
								</li>
							`,
            )}
					</ul>
				</div>
			`;
  },

  _renderResponseView() {
    if (!this.promptResponse) return "";

    if (this.promptResponse.error) {
      return html`
					<div class="mt-6 border-t pt-4">
						<h4 class="font-semibold text-sm mb-3">Response</h4>
						<div class="bg-red-50 text-red-700 rounded p-3 text-sm font-mono">
							${this.promptResponse.error}
						</div>
					</div>
				`;
    }

    return html`
				<div class="mt-6 border-t pt-4">
					<h4 class="font-semibold text-sm mb-3">Response</h4>
					<div class="space-y-4">
						${this.promptResponse.messages.map(
              (msg) => html`
								<div class="dark bg-gray-100  text-gray-800 rounded p-3">
									<div class="text-xs font-bold uppercase text-gray-500 mb-1">${msg.role}</div>
									${
                    msg.content.type === "text"
                      ? html`<p class="text-sm whitespace-pre-wrap font-mono">${msg.content.text}</p>`
                      : html`<div class="text-sm font-mono">Resource: ${msg.content.uri}</div>`
                  }
								</div>
							`,
            )}
					</div>
				</div>
			`;
  },

  _renderPromptExecutor(showBackButton = false) {
    if (!this.selectedPrompt) {
      return html`<div class="text-center text-gray-500 h-full flex items-center justify-center">Select a prompt to view details.</div>`;
    }

    return html`
				<div class="dark ${showBackButton ? "p-6 overflow-y-auto w-full" : ""}">
					${
            showBackButton
              ? html`
						<button @click=${this.clearSelectedPrompt.bind(this)} class="dark flex items-center text-sm text-blue-600 hover:underline mb-4">
							<uix-icon name="arrow-left" class="w-4 h-4 mr-2"></uix-icon>
							Back to list
						</button>
					`
              : ""
          }
					<h3 class="font-bold text-lg mb-2">${this.selectedPrompt.name}</h3>
					<p class="text-xs text-gray-200 mb-6">${this.selectedPrompt.description}</p>
					
					${
            this.promptResponse
              ? this._renderResponseView()
              : html`<h4 class="font-semibold text-sm mb-3">Parameters</h4>
					<div class="space-y-4">
						${
              Array.isArray(this.selectedPrompt.arguments) &&
              this.selectedPrompt.arguments.length
                ? this.selectedPrompt.arguments.map(
                    (arg) =>
                      !console.log(arg) &&
                      html`
											<uix-input
												label=${arg.name}
                        type=${arg.enum ? "select" : { boolean: "checkbox", enum: "select" }[arg.type] || "text"}
												value=${this.promptArgs[arg.name] || ""}
												@input=${(e) => this.handleArgInput(arg.name, e)}
												placeholder=${arg.description || arg.name}
												class="font-mono text-xs"
											></uix-input>
										`,
                  )
                : html`<p class="text-xs text-gray-300">This prompt has no parameters.</p>`
            }
					</div>
					<div class="mt-8 border-t pt-6">
						<uix-button
							label=${this.isExecuting ? "Executing..." : "Get Prompt"}
							class="is-primary"
							@click=${this.handleGetPrompt.bind(this)}
							?disabled=${this.isExecuting}
						></uix-button>
					</div>`
          }
				</div>
			`;
  },
  _renderFlowView() {
    if (this.selectedPrompt) {
      return this._renderPromptExecutor(true);
    }
    return this._renderPromptList();
  },

  _renderSideBySideView() {
    return html`
				<div class="w-1/3 flex flex-col border-r border-gray-200">
					${this._renderPromptList()}
				</div>
				<div class="w-2/3 p-6 overflow-y-auto">
					${this._renderPromptExecutor(false)}
				</div>
			`;
  },

  render() {
    return html`
				<uix-card class="bg-surface-light h-full overflow-y-auto">
					<div class="dark">
						${this.viewMode === "flow" ? this._renderFlowView() : this._renderSideBySideView()}
					</div>
				</uix-card>
			`;
  },
};
