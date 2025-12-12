import { html } from "/npm/lit-html";
import T from "/node_modules/@bootstrapp/types/index.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

export default {
  properties: {
    context: T.object(),
    connections: T.array([]),
  },

  async connected() {
    this.loadConnections();
  },

  loadConnections() {
    this.connections = AI.listConnections();
  },

  render() {
    return html`
            <uix-panel variant="bordered">
                <span slot="header" class="text-xs font-semibold uppercase text-default/80">
                    Active Connections
                </span>
                <div class="flex flex-col gap-2">
                    ${
                      this.connections.length === 0
                        ? html`
                        <div class="text-xs text-default/50 text-center">
                            No active connections
                        </div>
                    `
                        : this.connections.map(
                            (conn) => html`
                        <uix-card padding="sm" class="border ${conn.connected ? "border-success" : "border-danger"}">
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-2">
                                    <uix-icon
                                        name=${conn.connected ? "zap" : "zap-off"}
                                        size="xs"
                                        class="${conn.connected ? "text-success" : "text-danger"}"
                                    ></uix-icon>
                                    <span class="text-sm font-medium text-default">${conn.alias}</span>
                                </div>
                                <span class="text-xs ${conn.connected ? "text-success" : "text-danger"}">
                                    ${conn.connected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                        </uix-card>
                    `,
                          )
                    }
                </div>
            </uix-panel>
        `;
  },
};
