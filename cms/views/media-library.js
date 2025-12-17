/**
 * @bootstrapp/cms - Media Library
 * Full-page media management with upload, organize, and delete
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
export default {
  tag: "cms-media-library",
  dataQuery: true,
  properties: {
    media: T.array({ defaultValue: [] }),
    uploading: T.boolean({ defaultValue: false }),
    selectedItem: T.object({ attribute: false }),
    viewMode: T.string({ defaultValue: "grid" }), // "grid" or "list"
    searchQuery: T.string({ defaultValue: "" }),
  },

  async handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    this.uploading = true;

    try {
      for (const file of files) {
        let url;

        if ($APP.Storage?.upload) {
          url = await $APP.Storage.upload(file);
        } else {
          // Fallback: use data URL for local development
          url = await this.readFileAsDataURL(file);
        }

        // Get image dimensions if it's an image
        let width, height;
        if (file.type.startsWith("image/")) {
          const dims = await this.getImageDimensions(url);
          width = dims.width;
          height = dims.height;
        }

        await $APP.Model.cms_media.add({
          id: String(Date.now() + Math.random()),
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          width,
          height,
          createdAt: new Date().toISOString(),
        });
      }

      // Refresh the list
      this.media = await $APP.Model.cms_media.getAll();
    } catch (err) {
      console.error("[CMS] Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      this.uploading = false;
      // Reset the file input
      e.target.value = "";
    }
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  getImageDimensions(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  },

  async handleDelete(item) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    try {
      await $APP.Model.cms_media.remove(item.id);
      this.media = this.media.filter((m) => m.id !== item.id);
      if (this.selectedItem?.id === item.id) {
        this.selectedItem = null;
      }
    } catch (err) {
      console.error("[CMS] Delete failed:", err);
      alert("Delete failed. Please try again.");
    }
  },

  formatFileSize(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert("URL copied to clipboard!");
  },

  get filteredMedia() {
    if (!this.searchQuery) return this.media || [];
    const query = this.searchQuery.toLowerCase();
    return (this.media || []).filter(
      (m) =>
        m.name?.toLowerCase().includes(query) ||
        m.type?.toLowerCase().includes(query),
    );
  },

  render() {
    const items = this.filteredMedia;

    return html`
      <div class="cms-media-library p-6 min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-black uppercase">Media Library</h1>
            <p class="text-sm text-gray-500">
              ${items.length} item${items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative">
              <input
                type="text"
                .value=${this.searchQuery}
                @input=${(e) => (this.searchQuery = e.target.value)}
                placeholder="Search media..."
                class="pl-10 pr-4 py-2 border-2 border-black rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <svg
                class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
            </div>

            <!-- View Mode Toggle -->
            <div class="flex border-2 border-black rounded-lg overflow-hidden">
              <button
                type="button"
                @click=${() => (this.viewMode = "grid")}
                class="p-2 ${
                  this.viewMode === "grid"
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                type="button"
                @click=${() => (this.viewMode = "list")}
                class="p-2 ${
                  this.viewMode === "list"
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-100"
                }"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <!-- Upload Button -->
            <label
              class="px-4 py-2 bg-black text-white rounded-lg font-bold cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              ${this.uploading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/*"
                multiple
                @change=${(e) => this.handleUpload(e)}
                class="hidden"
                ?disabled=${this.uploading}
              />
            </label>
          </div>
        </div>

        <!-- Content -->
        <div class="flex gap-6">
          <!-- Media Grid/List -->
          <div class="flex-1">
            ${
              items.length > 0
                ? this.viewMode === "grid"
                  ? html`
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      ${items.map(
                        (item) => html`
                          <button
                            type="button"
                            @click=${() => (this.selectedItem = item)}
                            class="relative aspect-square border-2 border-black rounded-lg overflow-hidden bg-white group ${
                              this.selectedItem?.id === item.id
                                ? "ring-4 ring-blue-400"
                                : "hover:ring-2 hover:ring-gray-300"
                            }"
                          >
                            <img
                              src="${item.url}"
                              alt="${item.name || "Media"}"
                              class="w-full h-full object-cover"
                            />
                            <div
                              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all"
                            ></div>
                            <div
                              class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <p class="text-white text-xs truncate font-medium">
                                ${item.name}
                              </p>
                            </div>
                          </button>
                        `,
                      )}
                    </div>
                  `
                  : html`
                    <div class="space-y-2">
                      ${items.map(
                        (item) => html`
                          <button
                            type="button"
                            @click=${() => (this.selectedItem = item)}
                            class="w-full flex items-center gap-4 p-3 border-2 border-black rounded-lg bg-white text-left ${
                              this.selectedItem?.id === item.id
                                ? "ring-2 ring-blue-400"
                                : "hover:bg-gray-50"
                            }"
                          >
                            <img
                              src="${item.url}"
                              alt="${item.name}"
                              class="w-16 h-16 object-cover rounded border border-gray-200"
                            />
                            <div class="flex-1 min-w-0">
                              <p class="font-bold truncate">${item.name}</p>
                              <p class="text-sm text-gray-500">
                                ${this.formatFileSize(item.size)} - ${item.type}
                              </p>
                            </div>
                            <p class="text-sm text-gray-400">
                              ${this.formatDate(item.createdAt)}
                            </p>
                          </button>
                        `,
                      )}
                    </div>
                  `
                : html`
                  <div
                    class="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <svg
                      class="w-20 h-20 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p class="font-bold text-gray-600 text-lg mb-2">
                      No media uploaded yet
                    </p>
                    <p class="text-gray-500 mb-4">
                      Upload your first image to get started
                    </p>
                    <label
                      class="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold cursor-pointer hover:bg-gray-800"
                    >
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      Upload Images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        @change=${(e) => this.handleUpload(e)}
                        class="hidden"
                      />
                    </label>
                  </div>
                `
            }
          </div>

          <!-- Details Sidebar -->
          ${
            this.selectedItem
              ? html`
                <div
                  class="w-80 flex-shrink-0 bg-white border-2 border-black rounded-lg p-4 h-fit sticky top-20"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="font-black uppercase text-sm">Details</h3>
                    <button
                      type="button"
                      @click=${() => (this.selectedItem = null)}
                      class="p-1 hover:bg-gray-100 rounded"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <img
                    src="${this.selectedItem.url}"
                    alt="${this.selectedItem.name}"
                    class="w-full aspect-video object-cover rounded-lg border-2 border-black mb-4"
                  />

                  <div class="space-y-3">
                    <div>
                      <p class="text-xs font-bold text-gray-500 uppercase">Name</p>
                      <p class="font-medium truncate">${this.selectedItem.name}</p>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-500 uppercase">Type</p>
                      <p class="font-medium">${this.selectedItem.type}</p>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-500 uppercase">Size</p>
                      <p class="font-medium">
                        ${this.formatFileSize(this.selectedItem.size)}
                      </p>
                    </div>
                    ${
                      this.selectedItem.width
                        ? html`
                          <div>
                            <p class="text-xs font-bold text-gray-500 uppercase">
                              Dimensions
                            </p>
                            <p class="font-medium">
                              ${this.selectedItem.width} x ${this.selectedItem.height}
                            </p>
                          </div>
                        `
                        : null
                    }
                    <div>
                      <p class="text-xs font-bold text-gray-500 uppercase">
                        Uploaded
                      </p>
                      <p class="font-medium">
                        ${this.formatDate(this.selectedItem.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      type="button"
                      @click=${() => this.copyToClipboard(this.selectedItem.url)}
                      class="w-full py-2 bg-gray-100 border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      @click=${() => this.handleDelete(this.selectedItem)}
                      class="w-full py-2 bg-red-100 border-2 border-red-500 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              `
              : null
          }
        </div>
      </div>
    `;
  },
};
