/**
 * @bootstrapp/cms - Content List
 * Lists all content items for a CMS-enabled model
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "cms-content-list",
  dataQuery: true,
  properties: {
    model: T.string({ required: true }),
    items: T.array({ defaultValue: [] }),
    statusFilter: T.string({ defaultValue: "all" }),
    searchQuery: T.string({ defaultValue: "" }),
  },

  capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  },

  getSingularName(model) {
    if (model.endsWith("ies")) return model.slice(0, -3) + "y";
    if (model.endsWith("s")) return model.slice(0, -1);
    return model;
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  getDisplayTitle(item) {
    return item.title || item.name || item.id;
  },

  getFilteredItems() {
    let filtered = this.items || [];

    // Filter by status
    if (this.statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === this.statusFilter);
    }

    // Filter by search
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const title = this.getDisplayTitle(item).toLowerCase();
        return title.includes(query);
      });
    }

    // Sort by updated/created date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt),
    );
  },

  getStatusBadge(status) {
    const badges = {
      draft: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Draft" },
      published: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Published",
      },
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Scheduled",
      },
    };
    return badges[status] || badges.draft;
  },

  render() {
    const singularName = this.getSingularName(this.model);
    const filteredItems = this.getFilteredItems();

    return html`
      <div class="cms-content-list p-6 bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <uix-link
              href="/admin/content"
              class="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <uix-icon name="arrow-left" size="20"></uix-icon>
              <span>Back</span>
            </uix-link>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1 class="text-2xl font-black uppercase">
              ${this.capitalize(this.model)}
            </h1>
            <span class="text-gray-500">${filteredItems.length} items</span>
          </div>

          <uix-link
            href="/admin/content/${this.model}/new"
            class="px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            + New ${this.capitalize(singularName)}
          </uix-link>
        </div>

        <!-- Filters -->
        <uix-card
          shadow="sm"
          borderWidth="2"
          padding="md"
          class="bg-white mb-6"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm font-bold text-gray-600">Status:</label>
              <select
                .value=${this.statusFilter}
                @change=${(e) => (this.statusFilter = e.target.value)}
                class="px-3 py-2 border-2 border-black rounded-lg font-medium"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div class="flex-1">
              <input
                type="search"
                placeholder="Search..."
                .value=${this.searchQuery}
                @input=${(e) => (this.searchQuery = e.target.value)}
                class="w-full max-w-md px-4 py-2 border-2 border-black rounded-lg"
              />
            </div>
          </div>
        </uix-card>

        <!-- Content List -->
        <uix-card shadow="md" borderWidth="2" padding="none" class="bg-white">
          ${
            filteredItems.length > 0
              ? html`
                <div class="divide-y-2 divide-black">
                  ${filteredItems.map((item) => {
                    const badge = this.getStatusBadge(item.status);
                    return html`
                      <uix-link
                        href="/admin/content/${this.model}/${item.id}"
                        class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
                      >
                        <!-- Cover Image (if exists) -->
                        ${
                          item.coverImage || item.image
                            ? html`
                              <div
                                class="w-16 h-16 rounded-lg bg-gray-100 border-2 border-black overflow-hidden flex-shrink-0"
                              >
                                <img
                                  src="${item.coverImage || item.image}"
                                  alt=""
                                  class="w-full h-full object-cover"
                                />
                              </div>
                            `
                            : html`
                              <div
                                class="w-16 h-16 rounded-lg bg-gray-100 border-2 border-black flex items-center justify-center flex-shrink-0"
                              >
                                <uix-icon
                                  name="file-text"
                                  size="24"
                                  class="text-gray-400"
                                ></uix-icon>
                              </div>
                            `
                        }

                        <!-- Content Info -->
                        <div class="flex-1 min-w-0">
                          <div
                            class="font-bold text-lg group-hover:text-blue-600 truncate"
                          >
                            ${this.getDisplayTitle(item)}
                          </div>
                          <div class="text-sm text-gray-500">
                            ${this.formatDate(item.updatedAt || item.createdAt)}
                          </div>
                        </div>

                        <!-- Status Badge -->
                        <span
                          class="px-3 py-1 ${badge.bg} ${badge.text} text-sm font-bold rounded-lg"
                        >
                          ${badge.label}
                        </span>

                        <!-- Arrow -->
                        <uix-icon
                          name="chevron-right"
                          size="20"
                          class="text-gray-400 group-hover:text-black"
                        ></uix-icon>
                      </uix-link>
                    `;
                  })}
                </div>
              `
              : html`
                <div class="text-center py-16 text-gray-400">
                  <uix-icon
                    name="file-text"
                    size="48"
                    class="mx-auto mb-4 opacity-50"
                  ></uix-icon>
                  <p class="text-lg font-bold">No content found</p>
                  <p class="text-sm mt-1">
                    ${
                      this.statusFilter !== "all"
                        ? `No ${this.statusFilter} items`
                        : "Create your first item to get started"
                    }
                  </p>
                  <uix-link
                    href="/admin/content/${this.model}/new"
                    class="inline-block mt-4 px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800"
                  >
                    + New ${this.capitalize(singularName)}
                  </uix-link>
                </div>
              `
          }
        </uix-card>
      </div>
    `;
  },
};
