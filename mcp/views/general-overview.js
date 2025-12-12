import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import IDE from "/controllers/ide.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

export default {
  properties: {
    context: T.object(),
    serverCount: T.number(0),
    connectionCount: T.number(0),
  },

  async connected() {
    await this.loadStats();
  },

  async loadStats() {
    try {
      const servers = await Model.servers.getAll();
      this.serverCount = servers.length;

      const connections = AI.listConnections();
      this.connectionCount = connections.filter((c) => c.connected).length;
    } catch (error) {
      console.error("Failed to load MCP stats:", error);
    }
  },

  render() {
    return html`
            <uix-panel variant="bordered" class="h-full">
                <span slot="header" class="text-xs font-semibold uppercase text-default/80">
                    MCP Overview
                </span>
                <div class="flex flex-col items-center justify-center flex-1">
                    <div class="flex flex-col gap-4 items-center">
                        <uix-icon name="server" size="xxl" class="text-default/30"></uix-icon>
                        <div class="flex flex-col gap-2 items-center">
                            <span class="font-medium text-default">
                                ${this.serverCount} Server${this.serverCount !== 1 ? "s" : ""}
                            </span>
                            <span class="font-medium text-success">
                                ${this.connectionCount} Connected
                            </span>
                        </div>
                        <span class="text-xs text-default/50">
                            Open an MCP server to see details
                        </span>
                        <uix-button
                            variant="success"
                            @click=${() => IDE.executeCommand("mcp.newServer")}
                        >
                            New Server
                        </uix-button>
                    </div>
                </div>
            </uix-panel>
        `;
  },
};
