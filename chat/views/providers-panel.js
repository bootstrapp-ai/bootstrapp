import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";

export default {
  properties: {
    context: T.object(),
    providers: T.array([]),
  },

  async connected() {
    await this.loadProviders();
  },

  async loadProviders() {
    try {
      const providers = await Model.providers.getAll({
        includes: ["models"],
      });
      this.providers = providers;
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  },

  render() {
    return html`
            <div class="border-t border-surface">
                <div class="p-2 font-semibold uppercase text-xs tracking-wider text-default/50 border-b border-surface">
                    Available Providers
                </div>
                <div class="flex flex-col gap-2 p-2">
                    ${
                      this.providers.length === 0
                        ? html`
                        <div class="text-xs text-default/50 p-2">
                            No providers configured
                        </div>
                    `
                        : this.providers.map(
                            (provider) => html`
                        <uix-card padding="sm" class="border hover:border-inverse-lighter bg-inverse border-surface">
                            <div class="flex items-center gap-2 mb-1">
                                <uix-icon name="cpu" class="w-3 h-3 text-secondary"></uix-icon>
                                <span class="text-sm font-medium text-default">${provider.name}</span>
                            </div>
                            ${
                              provider.models?.length
                                ? html`
                                    <div class="text-xs ml-5 text-default/50">
                                        ${provider.models.length} model${provider.models.length !== 1 ? "s" : ""}
                                    </div>
                                `
                                : ""
                            }
                        </uix-card>
                    `,
                          )
                    }
                </div>
            </div>
        `;
  },
};
