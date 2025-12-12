import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import AI from "/$app/ai/index.js";
export default {
  tag: "mcp-tools",
  properties: {
    tools: T.array([]),
    selectedTool: T.object(null),
    toolArgs: T.object({}),
    isExecuting: T.boolean(false),
    isLoading: T.boolean(true),
    viewMode: T.string({ defaultValue: "side-by-side" }), // 'side-by-side' or 'flow'
    toolResponse: T.any(null),
  },

  connected() {
    this.loadTools();
  },

  async loadTools() {
    this.isLoading = true;
    try {
      const servers = AI.listClients();
      if (servers && servers.length > 0) {
        const { tools } = await AI.listTools({ servers });
        this.tools = tools || [];
      }
    } catch (error) {
      console.error("Error loading tools:", error);
      this.tools = [];
    } finally {
      this.isLoading = false;
    }
  },

  selectTool(tool) {
    this.selectedTool = tool;
    this.toolArgs = {};
    this.toolResponse = null;
  },

  clearSelectedTool() {
    this.selectedTool = null;
    this.toolResponse = null;
  },

  handleArgInput(paramName, event, schema) {
    this.toolArgs = {
      ...this.toolArgs,
      [paramName]:
        schema.type === "number"
          ? Number(event.target.value)
          : schema.type === "boolean"
            ? !!event.target.checked
            : event.target.value,
    };
  },

  async handleExecuteTool() {
    if (!this.selectedTool) return;

    this.isExecuting = true;
    this.toolResponse = null;
    try {
      const { name } = this.selectedTool;
      const args = this.toolArgs;
      const response = await AI.callTool(name, args);
      this.toolResponse = response;
    } catch (e) {
      console.error(`Failed to execute tool ${this.selectedTool.name}:`, e);
      this.toolResponse = {
        error: e.message || "An unknown error occurred.",
      };
    } finally {
      this.isExecuting = false;
    }
  },

  // Rendering methods for 'flow' view
  _renderFlowView() {
    if (this.selectedTool) {
      return this._renderToolExecutorFlow();
    }
    return this._renderToolListFlow();
  },
  _renderToolListFlow() {
    if (this.isLoading) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">Loading...</p></div>`;
    }
    if (!this.tools.length) {
      return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">No tools found.</p></div>`;
    }
    return html`
                <div class="flex-1 overflow-y-auto p-2">
                    <h3 class="font-semibold text-sm p-2 text-gray-800">Tools</h3>
                    <ul>
                        ${this.tools.map(
                          (tool) => html`
                                <li>
                                    <button @click=${() => this.selectTool(tool)} class="w-full text-left p-2 rounded text-sm hover:bg-gray-100">
                                        <p class="font-mono text-sm">${tool.name}</p>
                                        <p class="text-xs text-gray-500 truncate">${tool.description}</p>
                                    </button>
                                </li>
                            `,
                        )}
                    </ul>
                </div>
            `;
  },

  _renderToolExecutorFlow() {
    const responseView = this.toolResponse
      ? html`
                <div class="mt-6 border-t pt-4 dark">
									<h4 class="font-semibold text-sm mb-3">Response</h4>
                    ${
                      this.toolResponse.error
                        ? html`<div class="bg-red-50 text-red-700 rounded p-3 text-sm font-mono">${this.toolResponse.error}</div>`
                        : html`<pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-2 rounded-lg font-mono overflow-auto">${this.toolResponse?.content?.[0]?.text}</pre>`
                    }
                </div>
            `
      : "";

    return html`
                <div class="p-6 overflow-y-auto w-full">
                     <button @click=${this.clearSelectedTool.bind(this)} class="flex items-center text-sm text-blue-600 hover:underline mb-4">
                        <uix-icon name="arrow-left" class="w-4 h-4 mr-2"></uix-icon>
                        Back to list
                    </button>
                    ${this.toolResponse ? responseView : this._renderToolExecutorContent()}                    
                </div>
            `;
  },
  _renderSideBySideView() {
    const toolList = () => {
      if (this.isLoading) {
        return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">Loading...</p></div>`;
      }
      if (!this.tools.length) {
        return html`<div class="flex items-center justify-center h-full"><p class="text-xs text-gray-500">No tools found.</p></div>`;
      }
      return html`
                    <div class="flex-1 overflow-y-auto p-2">
                        <h3 class="font-semibold text-sm p-2 text-gray-800">Tools</h3>
                        <ul>
                            ${this.tools.map(
                              (tool) => html`
                                    <li>
                                        <button @click=${() => this.selectTool(tool)} class="w-full text-left p-2 rounded text-sm hover:bg-gray-100 ${this.selectedTool?.name === tool.name ? "bg-blue-50 font-semibold text-blue-700" : ""}">
                                            <p class="font-mono text-xs">${tool.name}</p>
                                            <p class="text-xs text-gray-500 truncate">${tool.description}</p>
                                        </button>
                                    </li>
                                `,
                            )}
                        </ul>
                    </div>
                `;
    };

    const toolExecutor = () => {
      if (!this.selectedTool) {
        return html`<div class="text-center text-gray-500 h-full flex items-center justify-center">Select a tool to view details.</div>`;
      }
      const responseView = this.toolResponse
        ? html`
                    <div class="mt-6 border-t pt-4">
                        ${
                          this.toolResponse.error
                            ? html`<div class="bg-red-50 text-red-700 rounded p-3 text-sm font-mono">${this.toolResponse.error}</div>`
                            : html`<pre class="text-xs whitespace-pre-wrap bg-gray-800 text-gray-200 p-2 rounded-lg font-mono overflow-auto">${this.toolResponse?.contents?.[0]?.text}</pre>`
                        }
                    </div>
                `
        : "";

      return html`
                    <div>
                        ${this._renderToolExecutorContent()}
                        ${responseView}
                    </div>
                `;
    };

    return html`
                <div class="w-1/3 flex flex-col border-r border-gray-200">
                    ${toolList()}
                </div>
                <div class="w-2/3 p-6 overflow-y-auto">
                    ${toolExecutor()}
                </div>
            `;
  },

  _renderToolExecutorContent() {
    if (!this.selectedTool) return "";
    return html`
                <h3 class="font-bold text-lg mb-2  dark">${this.selectedTool.name}</h3>
                <p class="text-xs text-gray-600 mb-6">${this.selectedTool.description}</p>
                <h4 class="font-semibold text-sm mb-3 dark">Parameters</h4>
                <div class="space-y-4">
                    ${
                      this.selectedTool.inputSchema &&
                      Object.keys(this.selectedTool.inputSchema.properties)
                        .length > 0
                        ? Object.entries(
                            this.selectedTool.inputSchema.properties,
                          ).map(
                            ([paramName, paramSchema]) =>
                              html`<uix-input
                                        label=${paramName}
                                        type=${paramSchema.enum ? "select" : { boolean: "checkbox", enum: "select" }[paramSchema.type] || "text"}
                                        .options=${paramSchema.enum}
                                        value=${this.toolArgs[paramName] || ""}
                                        @input=${(e) => this.handleArgInput(paramName, e, paramSchema)}
                                        placeholder=${paramSchema.description || paramName}
                                        class="font-mono text-xs"
                                    ></uix-input>`,
                          )
                        : html`<p class="text-xs text-gray-500">This tool has no parameters.</p>`
                    }
                </div>
                <div class="mt-8 border-t pt-6">
                    <uix-button
                        label=${this.isExecuting ? "Executing..." : "Execute"}
                        class="is-primary"
                        @click=${this.handleExecuteTool.bind(this)}
                        ?disabled=${this.isExecuting}
                    ></uix-button>
                </div>
            `;
  },

  render() {
    return html`<uix-card class="bg-surface-light h-full overflow-y-auto pb-2">
                    <div class="dark">${this.viewMode === "flow" ? this._renderFlowView() : this._renderSideBySideView()}</div>
								</uix-card>
            `;
  },
};
