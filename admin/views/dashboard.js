import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import { getModelNames, capitalize } from "../utils/model-utils.js";

export default {
  tag: "admin-dashboard",
  style: true,
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
        <div class="admin-dashboard-loading">
          <uix-spinner size="lg"></uix-spinner>
        </div>
      `;
    }

    const models = Object.entries(this.modelStats);
    const totalRecords = Object.values(this.modelStats).reduce((a, b) => a + b, 0);

    return html`
      <div class="admin-dashboard">
        <!-- Header -->
        <div class="admin-dashboard-header">
          <h1 class="admin-dashboard-title">Dashboard</h1>
          <p class="admin-dashboard-subtitle">Manage your application data and settings</p>
        </div>

        <!-- Summary Card -->
        <uix-card class="admin-dashboard-summary">
          <div class="admin-dashboard-summary-content">
            <div>
              <p class="admin-dashboard-stat-label">Total Records</p>
              <p class="admin-dashboard-stat-value">${totalRecords}</p>
            </div>
            <div class="admin-dashboard-stat-right">
              <p class="admin-dashboard-stat-label">Models</p>
              <p class="admin-dashboard-stat-value">${models.length}</p>
            </div>
          </div>
        </uix-card>

        <!-- Model Stats Grid -->
        <section class="admin-dashboard-section">
          <h2 class="admin-dashboard-section-title">Models</h2>
          <div class="admin-dashboard-grid">
            ${models.map(
              ([model, count]) => html`
                <uix-card
                  hover
                  class="admin-dashboard-model-card"
                  @click=${() => this.navigate(`/admin/models/${model}`)}
                >
                  <div class="admin-dashboard-model-header">
                    <uix-icon name="database" size="24"></uix-icon>
                    <span class="admin-dashboard-model-count">${count}</span>
                  </div>
                  <p class="admin-dashboard-model-name">${model}</p>
                  <p class="admin-dashboard-model-label">
                    ${count === 1 ? "record" : "records"}
                  </p>
                </uix-card>
              `,
            )}
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="admin-dashboard-section">
          <h2 class="admin-dashboard-section-title">Quick Actions</h2>
          <div class="admin-dashboard-actions">
            <uix-button
              class="admin-action-deploy"
              @click=${() => this.navigate("/admin/deploy")}
            >
              <uix-icon name="rocket" size="24"></uix-icon>
              Deploy
            </uix-button>

            <uix-button
              class="admin-action-theme"
              @click=${() => this.navigate("/admin/theme")}
            >
              <uix-icon name="palette" size="24"></uix-icon>
              Theme
            </uix-button>

            <uix-button
              class="admin-action-refresh"
              @click=${() => this.loadStats()}
            >
              <uix-icon name="refresh-cw" size="24"></uix-icon>
              Refresh
            </uix-button>
          </div>
        </section>
      </div>
    `;
  },
};
