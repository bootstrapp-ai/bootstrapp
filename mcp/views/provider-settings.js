import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
export default {
  properties: {
    providers: T.array([]),
    onAddProvider: T.function(),
    onDeleteProvider: T.function(),
    isModal: T.boolean(false),
    onClose: T.function(),
    newProviderType: T.string("local"),
  },

  async addProvider(providerData) {
    if (providerConfigs.has(providerData.type)) {
      this.error = `A provider of type "${providerData.type}" already exists. Please delete it first.`;
      return;
    }
    providerConfigs.set(providerData.type, providerData);
    this.providers = Array.from(providerConfigs.values());
    this.saveState();
    await this.initializeAI();
    await this.loadModels();
    this.error = "";
  },

  async deleteProvider(providerType) {
    providerConfigs.delete(providerType);
    this.providers = Array.from(providerConfigs.values());
    this.saveState();
    await this.initializeAI();
    await this.loadModels();
  },
  render() {
    const activeProviders = this.providers.filter((p) => p.active);
    return html`
            <div class="h-full flex flex-col p-6 bg-inverse">
                <div class="flex items-center justify-between mb-6">
                    <h1 class="text-2xl font-bold">AI Providers</h1>
                    ${this.isModal ? html`<button @click=${this.onClose} class="p-2 rounded-full hover:bg-surface-lighter text-muted hover:text-2xl leading-none">&times;</button>` : ""}
                </div>

                ${
                  !this.isModal && this.providers.length === 0
                    ? html`
                <div class="bg-surface-light border border-surface-lighter rounded-lg p-4 mb-6 text-center">
                    <p class="font-semibold text-lg">Welcome!</p>
                    <p class="text-muted">To start chatting, please add at least one AI provider below.</p>
                </div>
                `
                    : ""
                }

                <!-- Add Provider Form -->
                <div class="bg-surface-light border border-surface-lighter rounded-lg p-4 mb-6">
                    <h2 class="text-lg font-semibold mb-3">Add New Provider</h2>
                    <form @submit=${(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const data = Object.fromEntries(formData.entries());
                      this.onAddProvider(data);
                      e.target.reset();
                      this.newProviderType = "local";
                    }}>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label for="provider-type" class="block text-sm font-medium text-muted mb-1">Provider Type</label>
                                <select name="id" id="provider-type" @change=${(e) => (this.newProviderType = e.target.value)} class="w-full bg-surface-lighter border border-surface-lighter rounded-md px-3 py-1.5 text-sm focus:ring-secondary focus:outline-none h-[34px]">
                                	${this.providers.map((provider) => html`<option value=${provider.id} ?selected=${provider.id === this.newProviderType}>${provider.name}</option>`)}
                                </select>
                            </div>
                            ${
                              this.newProviderType === "local"
                                ? html`
                                <div>
                                    <label for="api-endpoint" class="block text-sm font-medium text-muted mb-1">API Endpoint</label>
                                    <input type="url" name="endpoint" id="api-endpoint" required value="http://localhost:1234/v1/chat/completions" placeholder="http://localhost:1234/v1/chat/completions" class="w-full bg-surface-lighter border border-surface-lighter rounded-md px-3 py-1.5 text-sm focus:ring-secondary focus:outline-none">
                                </div>
                            `
                                : ""
                            }
                            <div class="col-span-1 md:col-span-2">
                                <label for="api-key" class="block text-sm font-medium text-muted mb-1">API Key</label>
                                <input type="password" name="apiKey" id="api-key" placeholder="Optional for some local providers" class="w-full bg-surface-lighter border border-surface-lighter rounded-md px-3 py-1.5 text-sm focus:ring-secondary focus:outline-none">
                            </div>
                        </div>
                        <button type="submit" class="mt-4 w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary-dark hover:bg-secondary transition-colors font-semibold">
                            Add Provider
                        </button>
                    </form>
                </div>

                <!-- Existing Providers List -->
                <div class="flex-1 overflow-y-auto">
                     <h2 class="text-lg font-semibold mb-3">Configured Providers</h2>
                     ${
                       activeProviders.length === 0
                         ? html`
                        <div class="text-center py-8 px-4 border-2 border-dashed border-surface-lighter rounded-lg">
                            <p class="text-muted">No providers configured yet.</p>
                        </div>
                     `
                         : html`
                     <div class="space-y-3">
                        ${activeProviders.map(
                          (p) => html`
                            <div class="bg-surface-light border border-surface-lighter rounded-lg p-3 flex justify-between items-center">
                                <div>
                                    <p class="font-semibold capitalize">${p.type}</p>
                                    ${p.endpoint ? html`<p class="text-xs text-muted">${p.endpoint}</p>` : ""}
                                </div>
                                <uix-button ghost icon="trash" @click=${() => this.onDeleteProvider(p.type)}
																	class="p-1.5 text-muted hover:text-danger rounded-full hover:bg-inverse">
                              </uix-button>
                            </div>
                        `,
                        )}
                     </div>
                     `
                     }
                </div>
            </div>
            `;
  },
};
