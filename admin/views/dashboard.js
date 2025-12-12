import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import { getModelNames, capitalize } from "../utils/model-utils.js";

export default {
  tag: "admin-dashboard",
  properties: {
    modelStats: T.object({ defaultValue: {} }),
    loading: T.boolean({ defaultValue: true }),
  },

  async connected() {
    await this.loadStats();
  },

  async loadStats() {
    this.loading = true;
    const stats = {};
    const models = getModelNames();

    for (const model of models) {
      try {
        const records = await $APP.Model[model].getAll();
        stats[model] = Array.isArray(records) ? records.length : 0;
      } catch (error) {
        console.error(`Error loading stats for ${model}:`, error);
        stats[model] = 0;
      }
    }

    this.modelStats = stats;
    this.loading = false;
  },

  navigate(path) {
    $APP.Router.go(path);
  },

  render() {
    if (this.loading) {
      return html`
        <div class="flex items-center justify-center h-full">
          <uix-spinner size="lg"></uix-spinner>
        </div>
      `;
    }

    const models = Object.entries(this.modelStats);
    const totalRecords = Object.values(this.modelStats).reduce((a, b) => a + b, 0);

    return html`
      <div class="p-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-black uppercase mb-2">Dashboard</h1>
          <p class="text-gray-600">Manage your application data and settings</p>
        </div>

        <!-- Summary Card -->
        <div class="mb-8 p-6 bg-black text-white rounded-2xl border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-300 text-sm uppercase font-bold">Total Records</p>
              <p class="text-4xl font-black">${totalRecords}</p>
            </div>
            <div class="text-right">
              <p class="text-gray-300 text-sm uppercase font-bold">Models</p>
              <p class="text-4xl font-black">${models.length}</p>
            </div>
          </div>
        </div>

        <!-- Model Stats Grid -->
        <div class="mb-8">
          <h2 class="text-xl font-black uppercase mb-4">Models</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${models.map(
              ([model, count]) => html`
                <button
                  @click=${() => this.navigate(`/admin/models/${model}`)}
                  class="p-6 bg-white border-3 border-black rounded-xl text-left
                         shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[2px] hover:translate-y-[2px]
                         hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                         transition-all duration-150 cursor-pointer"
                >
                  <div class="flex items-center justify-between mb-2">
                    <uix-icon name="database" size="24" class="text-gray-400"></uix-icon>
                    <span class="text-3xl font-black">${count}</span>
                  </div>
                  <p class="font-bold text-lg capitalize">${model}</p>
                  <p class="text-sm text-gray-500">
                    ${count === 1 ? "record" : "records"}
                  </p>
                </button>
              `,
            )}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
          <h2 class="text-xl font-black uppercase mb-4">Quick Actions</h2>
          <div class="flex flex-wrap gap-4">
            <button
              @click=${() => this.navigate("/admin/deploy")}
              class="flex items-center gap-3 px-6 py-4 bg-yellow-300 border-3 border-black rounded-xl
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     transition-all duration-150 font-black uppercase"
            >
              <uix-icon name="rocket" size="24"></uix-icon>
              Deploy
            </button>

            <button
              @click=${() => this.navigate("/admin/theme")}
              class="flex items-center gap-3 px-6 py-4 bg-pink-300 border-3 border-black rounded-xl
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     transition-all duration-150 font-black uppercase"
            >
              <uix-icon name="palette" size="24"></uix-icon>
              Theme
            </button>

            <button
              @click=${() => this.loadStats()}
              class="flex items-center gap-3 px-6 py-4 bg-green-300 border-3 border-black rounded-xl
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     transition-all duration-150 font-black uppercase"
            >
              <uix-icon name="refresh-cw" size="24"></uix-icon>
              Refresh
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
