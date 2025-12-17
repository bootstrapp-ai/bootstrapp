/**
 * @bootstrapp/cms - Media Picker
 * Select or upload images with library integration
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "cms-media-picker",
  style: true,
  properties: {
    value: T.string({ defaultValue: "" }),
    field: T.object({ attribute: false }),
    showLibrary: T.boolean({ defaultValue: false }),
    uploading: T.boolean({ defaultValue: false }),
    mediaItems: T.array({ defaultValue: [] }),
  },

  async connected() {
    // Load media items when library is opened
  },

  async loadMedia() {
    try {
      if ($APP.Model.cms_media) {
        this.mediaItems = await $APP.Model.cms_media.getAll();
      }
    } catch (err) {
      console.warn("[CMS] Could not load media:", err);
      this.mediaItems = [];
    }
  },

  handleSelect(url) {
    this.value = url;
    this.showLibrary = false;
    this.emit("change", url);
  },

  handleClear() {
    this.value = "";
    this.emit("change", "");
  },

  async openLibrary() {
    this.showLibrary = true;
    await this.loadMedia();
  },

  async handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const accept = this.field?.accept || "image/*";
    if (accept !== "*" && !file.type.startsWith(accept.replace("*", ""))) {
      alert(`Please select a file matching: ${accept}`);
      return;
    }

    // Validate file size
    const maxSize = this.field?.maxSize || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(
        `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
      return;
    }

    this.uploading = true;

    try {
      // For now, create object URL (in production, upload to storage)
      // This can be replaced with $APP.Storage.upload(file) when available
      let url;

      if ($APP.Storage?.upload) {
        url = await $APP.Storage.upload(file);
      } else {
        // Fallback: use data URL for local development
        url = await this.readFileAsDataURL(file);
      }

      // Save to media library if model exists
      if ($APP.Model.cms_media) {
        await $APP.Model.cms_media.add({
          id: String(Date.now()),
          url,
          name: file.name,
          size: file.size,
          type: file.type,
          createdAt: new Date().toISOString(),
        });
      }

      this.value = url;
      this.emit("change", url);
      this.showLibrary = false;
    } catch (err) {
      console.error("[CMS] Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      this.uploading = false;
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

  render() {
    const label = this.field?.label || this.field?.name || "Image";
    const accept = this.field?.accept || "image/*";

    return html`
      <div class="cms-media-picker">
        <label class="block text-sm font-bold text-gray-700 mb-2">${label}</label>

        <div class="border-2 border-black rounded-lg overflow-hidden bg-white">
          ${
            this.value
              ? html`
                <!-- Image Preview -->
                <div class="relative">
                  <img
                    src="${this.value}"
                    alt="Selected media"
                    class="w-full h-48 object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <button
                      type="button"
                      @click=${() => this.openLibrary()}
                      class="px-3 py-2 bg-white border-2 border-black rounded-lg font-bold text-sm mr-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      @click=${() => this.handleClear()}
                      class="px-3 py-2 bg-red-400 border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              `
              : html`
                <!-- Empty State -->
                <div
                  class="h-48 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg m-2"
                >
                  <svg
                    class="w-12 h-12 text-gray-400 mb-3"
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
                  <button
                    type="button"
                    @click=${() => this.openLibrary()}
                    class="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                  >
                    Choose Image
                  </button>
                </div>
              `
          }
        </div>

        <!-- Media Library Modal -->
        ${
          this.showLibrary
            ? html`
              <div
                class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                @click=${(e) => {
                  if (e.target === e.currentTarget) this.showLibrary = false;
                }}
              >
                <div
                  class="bg-white border-3 border-black rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <!-- Header -->
                  <div
                    class="flex items-center justify-between p-4 border-b-2 border-black"
                  >
                    <h3 class="text-lg font-black uppercase">Select Image</h3>
                    <div class="flex items-center gap-2">
                      <label
                        class="px-4 py-2 bg-black text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        ${this.uploading ? "Uploading..." : "Upload New"}
                        <input
                          type="file"
                          accept="${accept}"
                          @change=${(e) => this.handleUpload(e)}
                          class="hidden"
                          ?disabled=${this.uploading}
                        />
                      </label>
                      <button
                        type="button"
                        @click=${() => (this.showLibrary = false)}
                        class="w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
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
                  </div>

                  <!-- Content -->
                  <div class="p-4 overflow-y-auto max-h-[60vh]">
                    ${
                      this.mediaItems.length > 0
                        ? html`
                          <div class="grid grid-cols-4 gap-3">
                            ${this.mediaItems.map(
                              (item) => html`
                                <button
                                  type="button"
                                  @click=${() => this.handleSelect(item.url)}
                                  class="relative aspect-square border-2 border-black rounded-lg overflow-hidden hover:ring-4 ring-blue-400 transition-all ${
                                    this.value === item.url
                                      ? "ring-4 ring-green-400"
                                      : ""
                                  }"
                                >
                                  <img
                                    src="${item.url}"
                                    alt="${item.name || "Media"}"
                                    class="w-full h-full object-cover"
                                  />
                                  ${
                                    this.value === item.url
                                      ? html`
                                        <div
                                          class="absolute inset-0 bg-green-400 bg-opacity-30 flex items-center justify-center"
                                        >
                                          <svg
                                            class="w-8 h-8 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                              stroke-width="3"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        </div>
                                      `
                                      : null
                                  }
                                </button>
                              `,
                            )}
                          </div>
                        `
                        : html`
                          <div
                            class="text-center py-12 text-gray-500 flex flex-col items-center"
                          >
                            <svg
                              class="w-16 h-16 text-gray-300 mb-4"
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
                            <p class="font-bold">No media uploaded yet</p>
                            <p class="text-sm">Upload your first image to get started</p>
                          </div>
                        `
                    }
                  </div>
                </div>
              </div>
            `
            : null
        }
      </div>
    `;
  },
};
