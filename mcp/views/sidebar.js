import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

export default {
  class: "h-full flex flex-col bg-surface-light",
  properties: {
    servers: T.array({ sync: Model.servers }),
    currentId: T.any(null),
    onSelect: T.function(),
    onConnect: T.function(),
    onNew: T.function(),
    onDelete: T.function(),
    serverContextMenu: T.function(),
    connectedServers: T.array({ sync: "ram", defaultValue: [] }),

    name: T.string({ defaultValue: "MCP Servers" }),
    transportType: T.string({
      sync: "local",
      defaultValue: "JavaScript",
      enum: ["JavaScript", "StreamableHTTP", "SSE"],
    }),
    command: T.string({
      sync: "local",
      defaultValue: "/node_modules/@bootstrapp/mcp/templates/servers/basic.js",
    }),
    args: T.string({ sync: "local" }),
  },

  // Lifecycle: subscribe to AI connection changes
  connected() {
    // Load initial connections
    this.updateConnections();

    // Subscribe to connection changes
    this._unsubscribe = AI.subscribe((event) => {
      console.log("Connection event:", event.type, event.alias);
      this.updateConnections();
    });
  },

  // Lifecycle: cleanup subscription
  disconnected() {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  },

  // Update connected servers from AI
  updateConnections() {
    const connections = AI.listConnections();
    this.connectedServers = connections.map((conn) => ({
      alias: conn.alias,
      type: conn.client?.clientInfo?.name || "Unknown",
      command: this._extractCommand(conn),
      connected: conn.connected,
    }));
  },

  // Extract command/endpoint from connection
  _extractCommand(connection) {
    // Try to get command from client or return alias as fallback
    if (connection.client?.transport?.command) {
      return connection.client.transport.command;
    }
    return connection.alias;
  },

  async handleConnect(transportConfig) {
    if (!transportConfig || !transportConfig.command) {
      console.error("Connection command/URL cannot be empty.");
      return;
    }

    try {
      const alias = `inspector_server_${Date.now()}`;
      const server = await AI.connect(transportConfig, { alias });

      // No need to manually update connectedServers - subscription will handle it

      if (this.onConnect) this.onConnect(server);
    } catch (e) {
      console.error("Failed to connect:", e);
      IDE.ui.showMessage(`Connection Failed: ${e.message}`, "error");
    }
  },

  async handleDisconnect(alias) {
    try {
      await AI.disconnect(alias);

      // No need to manually update connectedServers - subscription will handle it
    } catch (e) {
      console.error(`Failed to disconnect ${alias}:`, e);
      IDE.ui.showMessage(`Disconnect Failed: ${e.message}`, "error");
    }
  },

  handleServerSelect(server) {
    if (this.onSelect && server.id) {
      const serverNode = this.servers.find((s) => s.id === server.id);
      if (serverNode?.uri) {
        this.onSelect(serverNode.uri);
      } else {
        console.warn("Could not find URI for server:", server);
      }
    }
  },

  handleConnectClick() {
    if (!this.command) {
      console.error("Connection command/URL cannot be empty.");
      return;
    }

    const transportConfig = {
      type: this.transportType,
      command: this.command,
      args: this.args ? this.args.split(" ") : [],
    };

    this.handleConnect(transportConfig);

    // Reset form
    this.command = "";
    this.args = "";
  },

  handleSidebarInput(field, value) {
    this[field] = value;
  },

  _getPreview(server) {
    const desc = server.description || "No description";
    return desc.length > 35 ? `${desc.substring(0, 35)}...` : desc;
  },

  _getSubtitle(server) {
    if (server.version) {
      return `v${server.version}`;
    }
    if (server.name) {
      const parts = server.name.split("/");
      return parts[parts.length - 1] || "v0.0.0";
    }
    return "v0.0.0";
  },

  _renderConnectionForm() {
    return html`
            <div class="flex flex-col gap-2">
                <uix-form-input w-full type="select" .options=${["JavaScript", "StreamableHTTP", "SSE"]} label="Transport" value=${this.transportType} @change=${(e) => this.handleSidebarInput("transportType", e.target.value)}></uix-form-input>
                <uix-form-input w-full label="Command / URL" value=${this.command} @input=${(e) => this.handleSidebarInput("command", e.target.value)}></uix-form-input>
                <uix-form-input w-full label="Arguments" value=${this.args} @input=${(e) => this.handleSidebarInput("args", e.target.value)}></uix-form-input>
            </div>
            <div class="mt-4">
                <uix-button @click=${this.handleConnectClick.bind(this)} class="bg-secondary text-inverse w-full">
                  <uix-icon name="rocket" class="w-6 h-6"></uix-icon>
                  Connect
                </uix-button>
            </div>
        `;
  },

  _renderConnectedServersList() {
    return html`
            <div class="space-y-4">
                ${this.connectedServers.map(
                  (server) => html`
                        <div class="text-xs space-y-2 bg-inverse p-3 rounded-lg border border-surface-lighter">
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-muted">Status:</span>
                                <span text="surface" class="px-2 py-1 ${server.connected ? "bg-success" : "bg-default"} rounded-full font-medium text-xs">
                                    ${server.connected ? "Connected" : "Disconnected"}
                                </span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-muted">Alias:</span>
                                <span class="truncate">${server.alias}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-muted">Transport:</span>
                                <span>${server.type}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-semibold text-muted mr-2">Endpoint:</span>
                                <span class="truncate font-mono text-right" title=${server.command}>${server.command}</span>
                            </div>
                            <div class="mt-2 pt-2 border-t border-surface-lighter">
                                <uix-button @click=${() => this.handleDisconnect(server.alias)} label="Disconnect" class="bg-danger w-full h-8 text-xs"></uix-button>
                            </div>
                        </div>
                    `,
                )}
            </div>
        `;
  },

  _renderAvailableServersList() {
    if (!this.servers || this.servers.length === 0) {
      return html`<div class="p-4 text-center text-sm text-muted">No servers configured.</div>`;
    }

    const availableServers = this.servers.map((node) => ({
      id: node.id,
      name: node.name,
      description: node.description || "Open to see details",
      version: node.version || "v1.0",
    }));

    const sortedServers = [...availableServers].sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );

    return html`
            <div class="flex-1 overflow-y-auto -mx-2">
                ${sortedServers.map(
                  (server) => html`
                        <div
                            @click=${() => this.handleServerSelect(server)}
                            @contextmenu=${(event) => this.serverContextMenu?.(event, server)}
                            class="p-3 rounded-lg cursor-pointer transition-colors group relative hover:bg-surface-lighter"
                        >
                            <div class="text-sm font-semibold truncate">${server.name || "Untitled Server"}</div>
                            <div class="flex justify-between items-center mt-1">
                                <div class="text-sm text-muted truncate pr-10">${this._getPreview(server)}</div>
                                <span class="text-sm text-muted flex-shrink-0">${this._getSubtitle(server)}</span>
                            </div>
                            <button
                                @click=${(e) => {
                                  e.stopPropagation();
                                  this.onDelete?.(server.id);
                                }}
                                class="absolute top-2 right-2 p-1 text-muted hover:text-danger rounded-full hover:bg-inverse opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete server"
                            >
                                <uix-icon name="trash-2" class="w-4 h-4"></uix-icon>
                            </button>
                        </div>
                    `,
                )}
            </div>
        `;
  },

  render() {
    if (!this.servers) return;

    return html`
            <div class="p-4 border-b border-surface-lighter">
                <h1 class="font-bold text-lg">${this.name}</h1>
            </div>
            
            <div class="flex-grow flex flex-col overflow-y-auto p-4 space-y-6">
                <!-- Connection Form -->
                <div>
                    <h2 class="font-semibold text-sm mb-3">Add Connection</h2>
                    ${this._renderConnectionForm()}
                </div>

                <!-- Active Connections List -->
                ${
                  this.connectedServers?.length > 0
                    ? html`
                        <div class="border-t border-surface-lighter pt-4">
                            <h2 class="font-semibold text-sm mb-3">Active Connections (${this.connectedServers.length})</h2>
                            ${this._renderConnectedServersList()}
                        </div>
                    `
                    : ""
                }
                
                <!-- Available Servers List (from DB) -->
                <div class="border-t border-surface-lighter pt-4">
                    <div class="flex justify-between items-center mb-3">
                         <h2 class="font-semibold text-sm">Available Servers</h2>
                         <button @click=${this.onNew} title="New Server" class="p-1 text-muted hover:text-[default]">
                            <uix-icon name="plus" class="w-4 h-4"></uix-icon>
                         </button>
                    </div>
                    ${this._renderAvailableServersList()}
                </div>
            </div>
        `;
  },
};
