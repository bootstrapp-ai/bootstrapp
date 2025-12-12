import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import { unsafeHTML } from "/npm/lit-html/directives/unsafe-html.js";
import AI from "/node_modules/@bootstrapp/ai/index.js";

const starIcon = (isFilled = false) => html`
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${isFilled ? "var(--color-primary)" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${isFilled ? "text-primary" : "text-default/60"}">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    `;

export default {
  tag: "mcp-servers",
  class:
    "w-full h-full bg-inverse flex flex-col p-6 md:p-8 font-sans text-sm overflow-y-auto",
  properties: {
    searchQuery: T.string(""),
  },
  availableServers: [],
  favoriteServerIds: [],
  connectedServerId: null,

  connected() {
    this.availableServers = AI.listServers();
    this.availableServers.map((server) =>
      $APP.SW.request("SW:CACHE_FILE", {
        path: server.path,
        skipSW: true,
      }),
    );
    this.favoriteServerIds = AI.getFavorites();
    this.updateConnectionStatus();
    this._updateFavorites = this.updateFavorites.bind(this);
    this._updateConnectionStatus = this.updateConnectionStatus.bind(this);
    AI.events.on("servers:favoritesChanged", this._updateFavorites);
    AI.events.on("connect", this._updateConnectionStatus);
    AI.events.on("disconnect", this._updateConnectionStatus);
    this.update();
  },

  disconnected() {
    AI.events.off("servers:favoritesChanged", this._updateFavorites);
    AI.events.off("connect", this._updateConnectionStatus);
    AI.events.off("disconnect", this._updateConnectionStatus);
  },
  updateFavorites(newFavoriteIds) {
    this.favoriteServerIds = newFavoriteIds;
    this.update();
  },

  updateConnectionStatus() {
    const clients = AI.listClients();
    const devClient = clients.find((c) => c.alias === "dev_server");
    let newConnectedServerId = null;
    if (devClient && this.availableServers) {
      const connectedServer = this.availableServers.find(
        (s) => s.path === devClient.command,
      );
      if (connectedServer) newConnectedServerId = connectedServer.id;
    }
    if (this.connectedServerId !== newConnectedServerId) {
      this.connectedServerId = newConnectedServerId;
      this.update();
    }
  },
  async connectToServer(server) {
    try {
      if (this.connectedServerId) {
        await this.disconnectFromServer();
      }
      const transportConfig = {
        type: "JavaScript",
        command: server.path,
        args: [],
      };
      await AI.connect(transportConfig, { alias: "dev_server" });
    } catch (e) {
      console.error(`Failed to connect to ${server.name}:`, e);
    }
  },
  async disconnectFromServer() {
    try {
      await AI.disconnect("dev_server");
    } catch (e) {
      console.error("Failed to disconnect from server:", e);
    }
  },

  toggleFavorite(server) {
    AI.toggleFavorite(server.id);
  },

  // --- Render Methods ---
  renderServerCard(server) {
    const isConnected = this.connectedServerId === server.id;
    const isFavorited = this.favoriteServerIds.includes(server.id);

    return html`
                <uix-card variant="filled" shadow="brutalist" ?hover=${true} borderWidth="2" gap="lg" padding="lg">
                    <div slot="header" class="flex justify-between items-start">
                         <div class="flex items-center gap-4">
                            <div class="flex items-center justify-center w-12 h-12 rounded-md bg-inverse text-secondary flex-shrink-0">
                               ${unsafeHTML(server.icon)}
                            </div>
                            <div>
                                <h3 class="font-bold text-md">${server.name}</h3>
                                ${isConnected ? html`<span class="text-xs text-success font-medium">Currently connected</span>` : ""}
                            </div>
                        </div>
                        <button @click=${() => this.toggleFavorite(server)} class="p-1 rounded-full hover:bg-surface-lighter transition-colors">
                            ${starIcon(isFavorited)}
                        </button>
                    </div>

                    <!-- Middle Section: Description -->
                    <p class="text-sm text-muted font-medium min-h-[2.5rem]">${server.description}</p>

                    <!-- Bottom Section: Tags and Connect Button -->
                    <div slot="footer" class="flex flex-wrap items-center justify-between gap-2" style="border-top-width: 2px;">
                        <div class="flex flex-wrap gap-2">
                            ${server.tags.map((tag) => html`<span class="text-xs font-bold px-2 py-1 rounded bg-surface-lighter">${tag.toUpperCase()}</span>`)}
                        </div>
                        ${
                          isConnected
                            ? html`<uix-button label="Disconnect" @click=${() => this.disconnectFromServer()} class="bg-danger font-bold" size="small"></uix-button>`
                            : html`<uix-button label="Connect" @click=${() => this.connectToServer(server)} class="bg-secondary-dark font-bold" size="small"></uix-button>`
                        }
                    </div>
                </uix-card>
            `;
  },

  render() {
    const lowerCaseQuery = this.searchQuery.toLowerCase();
    const filteredServers = this.searchQuery
      ? this.availableServers.filter(
          (s) =>
            s.name.toLowerCase().includes(lowerCaseQuery) ||
            s.description.toLowerCase().includes(lowerCaseQuery) ||
            s.tags.some((t) => t.toLowerCase().includes(lowerCaseQuery)),
        )
      : this.availableServers;

    const favoriteServers = filteredServers.filter((s) =>
      this.favoriteServerIds.includes(s.id),
    );
    const otherServers = filteredServers.filter(
      (s) => !this.favoriteServerIds.includes(s.id),
    );

    return html`
                <div class="flex flex-col gap-6 w-full h-full">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 class="font-bold text-3xl">Servers</h1>
                            <p class="text-muted">Browse and connect to your available MCP test servers.</p>
                        </div>
                        <div class="relative">
                            <uix-input
                                type="text"
                                .value=${this.searchQuery}
                                @input=${(e) => (this.searchQuery = e.target.value)}
                                placeholder="Search servers..."
                            ></uix-input>
                        </div>
                    </div>
                    ${
                      favoriteServers.length > 0
                        ? html`
                        <div>
                            <h2 class="font-semibold text-xl mb-4">
                                <div class="flex items-center gap-2">
                                    <uix-icon name="star" class="w-5 h-5 text-primary"></uix-icon>
                                    Favorites
                                </div>
                            </h2>
                            <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                                ${favoriteServers.map((server) => this.renderServerCard(server))}
                            </div>
                        </div>
                    `
                        : ""
                    }
                    <div>
                         <h2 class="font-semibold text-xl mb-4">${favoriteServers.length > 0 ? "Available Servers" : ""}</h2>
                         ${
                           otherServers.length > 0
                             ? html`
                                <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                                    ${otherServers.map((server) => this.renderServerCard(server))}
                                </div>`
                             : html`
                                <uix-card variant="filled" shadow="brutalist" borderWidth="2" padding="lg" class="text-center text-muted">
                                    <h3 class="font-bold text-lg">No Servers Found</h3>
                                    ${this.searchQuery ? html`<p>Your search for "${this.searchQuery}" did not match any servers.</p>` : ""}
                                </uix-card>
                            `
                         }
                    </div>
                </div>
            `;
  },
};
