/**
 * @bootstrapp/cms - SEO Fields
 * Grouped SEO fields with live Google preview
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "cms-seo-fields",
  properties: {
    value: T.object({ attribute: false, defaultValue: {} }),
    field: T.object({ attribute: false }),
    expanded: T.boolean({ defaultValue: false }),
  },

  updateField(key, val) {
    this.value = { ...this.value, [key]: val };
    this.emit("change", this.value);
  },

  toggleExpanded() {
    this.expanded = !this.expanded;
  },

  render() {
    const v = this.value || {};
    const metaTitleLength = (v.metaTitle || "").length;
    const metaDescLength = (v.metaDescription || "").length;

    // Character limit warnings
    const titleWarning = metaTitleLength > 60;
    const descWarning = metaDescLength > 160;

    return html`
      <div class="cms-seo-fields">
        <!-- Header (clickable to expand/collapse) -->
        <button
          type="button"
          @click=${() => this.toggleExpanded()}
          class="w-full flex items-center justify-between p-3 bg-gray-100 border-2 border-black rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span class="uppercase text-sm">SEO Settings</span>
          </div>
          <svg
            class="w-5 h-5 transition-transform ${
              this.expanded ? "rotate-180" : ""
            }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        ${
          this.expanded
            ? html`
              <div class="mt-2 border-2 border-black rounded-lg p-4 space-y-4 bg-white">
                <!-- Meta Title -->
                <div>
                  <label class="flex items-center justify-between text-sm font-bold text-gray-700 mb-1">
                    <span>Meta Title</span>
                    <span
                      class="text-xs ${
                        titleWarning ? "text-red-500" : "text-gray-400"
                      }"
                    >
                      ${metaTitleLength}/60
                    </span>
                  </label>
                  <input
                    type="text"
                    .value=${v.metaTitle || ""}
                    @input=${(e) => this.updateField("metaTitle", e.target.value)}
                    maxlength="70"
                    placeholder="Enter a compelling title for search engines..."
                    class="w-full p-2 border-2 border-black rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                      titleWarning ? "border-red-500" : ""
                    }"
                  />
                  ${
                    titleWarning
                      ? html`
                        <p class="text-xs text-red-500 mt-1">
                          Title exceeds recommended length (60 characters)
                        </p>
                      `
                      : null
                  }
                </div>

                <!-- Meta Description -->
                <div>
                  <label class="flex items-center justify-between text-sm font-bold text-gray-700 mb-1">
                    <span>Meta Description</span>
                    <span
                      class="text-xs ${
                        descWarning ? "text-red-500" : "text-gray-400"
                      }"
                    >
                      ${metaDescLength}/160
                    </span>
                  </label>
                  <textarea
                    .value=${v.metaDescription || ""}
                    @input=${(e) =>
                      this.updateField("metaDescription", e.target.value)}
                    maxlength="200"
                    rows="3"
                    placeholder="Write a brief description that appears in search results..."
                    class="w-full p-2 border-2 border-black rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                      descWarning ? "border-red-500" : ""
                    }"
                  ></textarea>
                  ${
                    descWarning
                      ? html`
                        <p class="text-xs text-red-500 mt-1">
                          Description exceeds recommended length (160 characters)
                        </p>
                      `
                      : null
                  }
                </div>

                <!-- OG Image -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1">
                    Social Share Image
                  </label>
                  <div class="flex gap-2">
                    <input
                      type="url"
                      .value=${v.ogImage || ""}
                      @input=${(e) => this.updateField("ogImage", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      class="flex-1 p-2 border-2 border-black rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    ${
                      v.ogImage
                        ? html`
                          <div
                            class="w-12 h-12 border-2 border-black rounded-lg overflow-hidden"
                          >
                            <img
                              src="${v.ogImage}"
                              alt="OG Image preview"
                              class="w-full h-full object-cover"
                            />
                          </div>
                        `
                        : null
                    }
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>

                <!-- Google Preview -->
                <div class="pt-4 border-t-2 border-dashed border-gray-200">
                  <p class="text-xs font-bold text-gray-500 mb-2 uppercase">
                    Google Search Preview
                  </p>
                  <div class="p-3 bg-white rounded-lg border border-gray-200">
                    <div class="text-blue-700 text-lg font-medium truncate hover:underline cursor-pointer">
                      ${v.metaTitle || "Page Title"}
                    </div>
                    <div class="text-green-700 text-sm truncate">
                      https://example.com/page-url
                    </div>
                    <div class="text-gray-600 text-sm line-clamp-2 mt-1">
                      ${v.metaDescription || "Add a meta description to see how it appears in search results..."}
                    </div>
                  </div>
                </div>

                <!-- Social Preview -->
                ${
                  v.ogImage
                    ? html`
                      <div class="pt-4 border-t-2 border-dashed border-gray-200">
                        <p class="text-xs font-bold text-gray-500 mb-2 uppercase">
                          Social Share Preview
                        </p>
                        <div
                          class="border border-gray-200 rounded-lg overflow-hidden max-w-md"
                        >
                          <img
                            src="${v.ogImage}"
                            alt="Social preview"
                            class="w-full h-32 object-cover"
                          />
                          <div class="p-3 bg-gray-50">
                            <div class="text-xs text-gray-500 uppercase">
                              example.com
                            </div>
                            <div class="font-bold text-sm truncate">
                              ${v.metaTitle || "Page Title"}
                            </div>
                            <div class="text-xs text-gray-600 line-clamp-2">
                              ${v.metaDescription || "Page description..."}
                            </div>
                          </div>
                        </div>
                      </div>
                    `
                    : null
                }
              </div>
            `
            : null
        }
      </div>
    `;
  },
};
