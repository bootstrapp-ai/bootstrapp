/**
 * @bootstrapp/cms - Content Management Dashboard
 * Central hub for managing CMS-enabled content
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import { getCmsModels } from "../schema.js";

export default {
  tag: "cms-dashboard",
  properties: {
    stats: T.object({
      defaultValue: { total: 0, drafts: 0, published: 0, scheduled: 0 },
    }),
    recentDrafts: T.array({ defaultValue: [] }),
    scheduledPosts: T.array({ defaultValue: [] }),
    contentTypes: T.array({ defaultValue: [] }),
    loading: T.boolean({ defaultValue: true }),
  },

  async connected() {
    await this.loadDashboardData();
  },

  async loadDashboardData() {
    this.loading = true;

    try {
      const cmsModels = getCmsModels();
      const contentTypes = [];
      let allContent = [];

      // Load data from each CMS model
      for (const modelName of cmsModels) {
        const model = $APP.Model[modelName];
        if (!model) continue;

        const items = await model.getAll();
        contentTypes.push({
          name: modelName,
          count: items.length,
          drafts: items.filter((i) => i.status === "draft").length,
          published: items.filter((i) => i.status === "published").length,
        });

        // Add model name to each item for display
        allContent = allContent.concat(
          items.map((item) => ({ ...item, _model: modelName })),
        );
      }

      // Calculate stats
      const stats = {
        total: allContent.length,
        drafts: allContent.filter((i) => i.status === "draft").length,
        published: allContent.filter((i) => i.status === "published").length,
        scheduled: allContent.filter((i) => i.status === "scheduled").length,
      };

      // Get recent drafts (last 5)
      const recentDrafts = allContent
        .filter((i) => i.status === "draft")
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        )
        .slice(0, 5);

      // Get scheduled posts
      const scheduledPosts = allContent
        .filter((i) => i.status === "scheduled")
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5);

      this.stats = stats;
      this.recentDrafts = recentDrafts;
      this.scheduledPosts = scheduledPosts;
      this.contentTypes = contentTypes;
    } catch (err) {
      console.error("[CMS] Failed to load dashboard data:", err);
    } finally {
      this.loading = false;
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  formatFutureDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  },

  getDisplayTitle(item) {
    return item.title || item.name || item.id;
  },

  render() {
    if (this.loading) {
      return html`
        <div class="p-6 flex items-center justify-center min-h-[400px]">
          <div class="text-gray-500">Loading dashboard...</div>
        </div>
      `;
    }

    return html`
      <div class="cms-dashboard p-6 bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-black uppercase">Content Management</h1>
          <p class="text-gray-500 mt-1">Manage your published content</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <uix-card shadow="md" borderWidth="2" padding="md" class="bg-white">
            <div class="text-gray-500 text-sm font-bold uppercase mb-1">Total</div>
            <div class="text-3xl font-black">${this.stats.total}</div>
          </uix-card>
          <uix-card shadow="md" borderWidth="2" padding="md" class="bg-yellow-100">
            <div class="text-gray-600 text-sm font-bold uppercase mb-1">Drafts</div>
            <div class="text-3xl font-black">${this.stats.drafts}</div>
          </uix-card>
          <uix-card shadow="md" borderWidth="2" padding="md" class="bg-green-100">
            <div class="text-gray-600 text-sm font-bold uppercase mb-1">Published</div>
            <div class="text-3xl font-black">${this.stats.published}</div>
          </uix-card>
          <uix-card shadow="md" borderWidth="2" padding="md" class="bg-blue-100">
            <div class="text-gray-600 text-sm font-bold uppercase mb-1">Scheduled</div>
            <div class="text-3xl font-black">${this.stats.scheduled}</div>
          </uix-card>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <!-- Recent Drafts -->
          <uix-card shadow="md" borderWidth="2" padding="lg" class="bg-white">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-black uppercase">Recent Drafts</h2>
              ${
                this.stats.drafts > 5
                  ? html`<uix-link href="/admin/content?status=draft" class="text-sm text-blue-600 hover:underline">View All</uix-link>`
                  : ""
              }
            </div>
            ${
              this.recentDrafts.length > 0
                ? html`
                  <div class="space-y-3">
                    ${this.recentDrafts.map(
                      (item) => html`
                        <uix-link
                          href="/admin/content/${item._model}/${item.id}"
                          class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold truncate group-hover:text-blue-600">
                              ${this.getDisplayTitle(item)}
                            </div>
                            <div class="text-xs text-gray-400">
                              ${this.capitalize(item._model)} - ${this.formatDate(item.updatedAt || item.createdAt)}
                            </div>
                          </div>
                          <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                            Draft
                          </span>
                        </uix-link>
                      `,
                    )}
                  </div>
                `
                : html`
                  <div class="text-center py-8 text-gray-400">
                    <p>No drafts yet</p>
                  </div>
                `
            }
          </uix-card>

          <!-- Scheduled Posts -->
          <uix-card shadow="md" borderWidth="2" padding="lg" class="bg-white">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-black uppercase">Scheduled</h2>
              ${
                this.stats.scheduled > 5
                  ? html`<uix-link href="/admin/content?status=scheduled" class="text-sm text-blue-600 hover:underline">View All</uix-link>`
                  : ""
              }
            </div>
            ${
              this.scheduledPosts.length > 0
                ? html`
                  <div class="space-y-3">
                    ${this.scheduledPosts.map(
                      (item) => html`
                        <uix-link
                          href="/admin/content/${item._model}/${item.id}"
                          class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                          <div class="flex-1 min-w-0">
                            <div class="font-bold truncate group-hover:text-blue-600">
                              ${this.getDisplayTitle(item)}
                            </div>
                            <div class="text-xs text-gray-400">
                              ${this.capitalize(item._model)}
                            </div>
                          </div>
                          <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                            ${this.formatFutureDate(item.scheduledAt)}
                          </span>
                        </uix-link>
                      `,
                    )}
                  </div>
                `
                : html`
                  <div class="text-center py-8 text-gray-400">
                    <p>No scheduled posts</p>
                  </div>
                `
            }
          </uix-card>
        </div>

        <!-- Content Types -->
        <uix-card shadow="md" borderWidth="2" padding="lg" class="bg-white">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-black uppercase">Content Types</h2>
          </div>
          ${
            this.contentTypes.length > 0
              ? html`
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  ${this.contentTypes.map(
                    (type) => html`
                      <uix-card shadow="none" borderWidth="0" padding="md" class="hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-2 mb-2">
                          <uix-icon name="file-text" size="20"></uix-icon>
                          <span class="font-black uppercase">
                            ${this.capitalize(type.name)}
                          </span>
                        </div>
                        <div class="text-2xl font-black mb-1">${type.count}</div>
                        <div class="text-xs text-gray-500 mb-3">
                          <span class="text-green-600">${type.published} published</span>
                          ${
                            type.drafts > 0
                              ? html` - <span class="text-yellow-600">${type.drafts} drafts</span>`
                              : ""
                          }
                        </div>
                        <div class="flex gap-2">
                          <uix-link
                            href="/admin/content/${type.name}"
                            class="flex-1 text-center px-3 py-2 text-sm font-bold border-2 border-black rounded-lg hover:bg-gray-100"
                          >
                            View All
                          </uix-link>
                          <uix-link
                            href="/admin/content/${type.name}/new"
                            class="flex-1 text-center px-3 py-2 text-sm font-bold bg-black text-white border-2 border-black rounded-lg hover:bg-gray-800"
                          >
                            + New
                          </uix-link>
                        </div>
                      </uix-card>
                    `,
                  )}
                </div>
              `
              : html`
                <div class="text-center py-8 text-gray-400">
                  <p>No CMS-enabled models found</p>
                  <p class="text-sm mt-2">Add <code class="bg-gray-100 px-1 rounded">$cms: true</code> to your model schema</p>
                </div>
              `
          }
        </uix-card>
      </div>
    `;
  },
};
