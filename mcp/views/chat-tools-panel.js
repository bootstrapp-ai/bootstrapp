import { html } from "/npm/lit-html";
import T from "/node_modules/@bootstrapp/types/index.js";
import IDE from "/controllers/ide.js";

export default {
  properties: {
    context: T.object(),
    connections: T.array([]),
    tools: T.array([]),
    resources: T.array([]),
  },

  async connected() {
    if (this.context?.uri) {
      await this.loadServerData();
    }
  },

  async loadServerData() {
    try {
      const data = await IDE.executeCommand("mcp.loadData", {
        uri: this.context.uri,
      });

      if (data) {
        this.server = data.server;
        this.tools = data.tools;
        this.resources = data.resources;
      }
    } catch (error) {
      console.error("Failed to load server data:", error);
    }
  },

  handleToolClick(tool) {
    const toolUsage = `Use the ${tool.name} tool from ${tool.serverAlias}`;
    IDE._notify("editor:insertText", {
      text: toolUsage,
      panelId: IDE.activePanelId,
      uri: this.context.chatUri,
    });
  },

  handleResourceClick(resource) {
    const resourceRef = `Reference: ${resource.name} (${resource.uri})`;
    IDE._notify("editor:insertText", {
      text: resourceRef,
      panelId: IDE.activePanelId,
      uri: this.context.chatUri,
    });
  },

  render() {
    return html`
            <uix-panel variant="bordered">
                <div class="flex items-center justify-between" slot="header">
                    <span class="text-xs font-semibold uppercase text-default/80">MCP Tools & Resources</span>
                    <uix-icon name="layers"></uix-icon>
                </div>

                ${
                  this.connections.length === 0
                    ? html`
                    <div class="flex flex-col gap-2">
                        <span class="text-xs text-default/50">No MCP servers connected</span>
                        <uix-button
                            variant="success"
                            size="sm"
                            @click=${() => IDE.handleActivityChange("mcp")}
                            class="w-full"
                        >
                            Connect MCP Server
                        </uix-button>
                    </div>
                `
                    : html`
                    <!-- Connected Servers -->
                    <div class="p-2">
                        <span class="text-xs font-semibold text-default/50">
                        Connected Servers (${this.connections.length})
                        </span>
                        <div class="flex flex-col gap-1 mt-2">
                            ${this.connections.map(
                              (conn) => html`
                                <uix-card padding="sm" class="border border-surface">
                                    <div class="flex items-center gap-2">
                                        <uix-icon name="zap" size="xs" class="text-success"></uix-icon>
                                        <span class="text-xs text-default">${conn.alias}</span>
                                    </div>
                                </uix-card>
                            `,
                            )}
                        </div>
                    </div>
              `
                }

                    <!-- Available Tools -->
                    ${
                      this.tools.length > 0
                        ? html`
                        <div class="flex flex-col gap-2">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-semibold text-default/50">
                                Available Tools (${this.tools.length})
                                </span>
                                <uix-button
                                    ghost
                                    size="xs"
                                    @click=${this.loadData.bind(this)}
                                    title="Refresh"
                                >
                                    <uix-icon name="refresh-cw" size="xs"></uix-icon>
                                </uix-button>
                            </div>
                            <div class="max-h-48 overflow-y-auto">
                                <div class="flex flex-col gap-1">
                                ${this.tools.map(
                                  (tool) => html`
                                    <uix-card
                                        @click=${() => this.handleToolClick(tool)}
                                        padding="sm"
                                        class="cursor-pointer border border-transparent hover:border-secondary transition-colors bg-inverse"
                                    >
                                        <div class="flex flex-col gap-1">
                                            <div class="flex items-center gap-2">
                                                <uix-icon name="wrench" size="xs" class="text-primary"></uix-icon>
                                                <span class="text-xs font-medium text-default">${tool.name}</span>
                                            </div>
                                            ${
                                              tool.description
                                                ? html`
                                                    <span class="text-xs text-default/50 ml-5 line-clamp-2">
                                                        ${tool.description}
                                                    </span>
                                                `
                                                : ""
                                            }
                                            <span class="text-xs text-default/50 ml-5">
                                                from ${tool.serverAlias}
                                            </span>
                                        </div>
                                    </uix-card>
                                `,
                                )}
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }

                    <!-- Available Resources -->
                    ${
                      this.resources.length > 0
                        ? html`
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-semibold text-default/50">
                                Available Resources (${this.resources.length})
                            </span>
                            <div class="max-h-32 overflow-y-auto">
                                <div class="flex flex-col gap-1">
                                ${this.resources.map(
                                  (resource) => html`
                                    <uix-card
                                        @click=${() => this.handleResourceClick(resource)}
                                        padding="sm"
                                        class="cursor-pointer border border-transparent hover:border-success transition-colors bg-inverse"
                                    >
                                        <div class="flex flex-col gap-1">
                                            <div class="flex items-center gap-2">
                                                <uix-icon name="file-text" size="xs" class="text-secondary"></uix-icon>
                                                <span class="text-xs text-default">${resource.name}</span>
                                            </div>
                                            <span class="text-xs text-default/50 ml-5">
                                                ${resource.uri}
                                            </span>
                                        </div>
                                    </uix-card>
                                `,
                                )}
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }
            </uix-panel>
        `;
  },
};
