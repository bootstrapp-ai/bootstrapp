import { html } from "/npm/lit-html";
import T from "/node_modules/@bootstrapp/types/index.js";
import IDE from "/controllers/ide.js";

export default {
  properties: {
    context: T.object(),
    server: T.object(null),
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

  render() {
    if (!this.server) {
      return html`
                <div class="flex flex-col gap-3">
                    <span class="text-sm text-default/50">Loading server info...</span>
                </div>
            `;
    }

    return html`
            <uix-panel variant="bordered">
                <span slot="header" class="text-xs font-semibold uppercase text-default/80">
                    Server Details
                </span>
                <div class="flex flex-col gap-3">
                    ${
                      this.tools.length > 0
                        ? html`
                        <div class="flex flex-col gap-2">
                            <span class="text-xs text-default/50">Tools (${this.tools.length})</span>
                            <div class="flex flex-col gap-1">
                                ${this.tools.map(
                                  (tool) => html`
                                    <uix-card padding="sm" class="bg-inverse border border-surface">
                                        <div class="flex flex-col gap-1">
                                            <span class="text-xs font-medium text-default">${tool.name}</span>
                                            ${
                                              tool.description
                                                ? html`
                                                    <span class="text-xs text-default/50">${tool.description}</span>
                                                `
                                                : ""
                                            }
                                        </div>
                                    </uix-card>
                                `,
                                )}
                            </div>
                        </div>
                    `
                        : ""
                    }

                    ${
                      this.resources.length > 0
                        ? html`
                        <div class="flex flex-col gap-2">
                            <span class="text-xs text-default/50">Resources (${this.resources.length})</span>
                            <div class="flex flex-col gap-1">
                                ${this.resources.map(
                                  (resource) => html`
                                    <uix-card padding="sm" class="bg-inverse border border-surface">
                                        <div class="flex flex-col gap-1">
                                            <span class="text-xs font-medium text-default">${resource.name}</span>
                                            <span class="text-xs text-default/50">${resource.uri}</span>
                                        </div>
                                    </uix-card>
                                `,
                                )}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </uix-panel>
        `;
  },
};
