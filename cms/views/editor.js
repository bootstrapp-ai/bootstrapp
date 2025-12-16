/**
 * @bootstrapp/cms - Content Editor
 * Full-page content editor with markdown and publishing sidebar
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

const defaultValue = {
  title: "",
  body: "",
  coverImage: "",
  status: "draft",
  seo: { metaTitle: "", metaDescription: "", ogImage: "" },
};
export default {
  tag: "cms-editor",
  dataQuery: true,
  style: true,
  properties: {
    model: T.string({ required: true }),
    contentId: T.string(),
    content: T.object({ defaultValue }),
    saving: T.boolean({ defaultValue: false }),
    previewMode: T.boolean({ defaultValue: false }),
    hasChanges: T.boolean({ defaultValue: false }),
  },

  updateField(field, value) {
    this.content = { ...this.content, [field]: value };
    this.hasChanges = true;
  },

  updateSeoField(key, value) {
    this.content = {
      ...this.content,
      seo: { ...(this.content.seo || {}), [key]: value },
    };
    this.hasChanges = true;
  },

  async handleSave(publish = false) {
    this.saving = true;
    try {
      const data = { ...this.content };

      if (publish) {
        data.status = "published";
        data.publishedAt = new Date().toISOString();
      }

      let result;
      if (this.contentId && this.contentId !== "new") {
        const [err, res] = await $APP.Model[this.model].edit(
          this.contentId,
          data,
        );
        if (err) throw err;
        result = res;
      } else {
        const [err, res] = await $APP.Model[this.model].add(data);
        if (err) throw err;
        result = res;
        // Navigate to edit URL after creating
        if (result?.id) {
          $APP.Router.go("cms-editor", { model: this.model, id: result.id });
        }
      }

      this.hasChanges = false;
      this.content = result || data;
    } catch (err) {
      console.error("[CMS] Save failed:", err);
      alert("Failed to save. Please try again.");
    } finally {
      this.saving = false;
    }
  },

  handleBack() {
    if (this.hasChanges) {
      if (
        !confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        return;
      }
    }
    $APP.Router.go("cms-dashboard");
  },

  togglePreview() {
    this.previewMode = !this.previewMode;
  },

  insertMarkdown(before, after = "") {
    const textarea = this.querySelector(".editor-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.content.body || "";
    const selection = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      before +
      selection +
      after +
      text.substring(end);
    this.updateField("body", newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selection.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  },

  renderMarkdown(text) {
    if (!text)
      return html`<p class="text-gray-400 italic">No content yet...</p>`;

    let htmlText = text
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" class="text-blue-600 underline">$1</a>',
      )
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    htmlText = `<p>${htmlText}</p>`;

    const div = document.createElement("div");
    div.innerHTML = htmlText;
    return html`${Array.from(div.childNodes)}`;
  },

  capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  },

  render() {
    if (!this.content) {
      return html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-gray-500">Loading editor...</div>
        </div>
      `;
    }

    const isNew = !this.contentId || this.contentId === "new";
    const title = this.content.title || (isNew ? "New Content" : "Untitled");
    const seo = this.content.seo || {};

    return html`
      <div class="cms-editor h-screen flex flex-col bg-gray-50 overflow-hidden">
        <!-- Header -->
        <div class="flex-shrink-0 bg-white border-b-2 border-black px-6 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button
                type="button"
                @click=${() => this.handleBack()}
                class="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <uix-icon name="arrow-left" size="20"></uix-icon>
                <span>Back</span>
              </button>
              <div class="h-6 w-px bg-gray-300"></div>
              <div>
                <div class="text-sm text-gray-500 uppercase font-bold">
                  ${isNew ? "New" : "Edit"} ${this.capitalize(this.model)}
                </div>
                <div class="font-black text-lg truncate max-w-md">${title}</div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              ${
                this.hasChanges
                  ? html`<span class="text-sm text-yellow-600 font-medium">Unsaved changes</span>`
                  : ""
              }
              <button
                type="button"
                @click=${() => this.handleSave(false)}
                ?disabled=${this.saving}
                class="px-4 py-2 border-2 border-black rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                ${this.saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                @click=${() => this.handleSave(true)}
                ?disabled=${this.saving}
                class="px-4 py-2 bg-green-500 border-2 border-black rounded-lg font-bold text-white hover:bg-green-600 transition-colors disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                ${this.content.status === "published" ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Editor Area -->
          <div class="flex-1 p-6 flex flex-col overflow-hidden">
            <!-- Title -->
            <div class="mb-4 flex-shrink-0">
              <input
                type="text"
                .value=${this.content.title || ""}
                @input=${(e) => this.updateField("title", e.target.value)}
                placeholder="Enter title..."
                class="w-full text-3xl font-black border-none outline-none bg-transparent placeholder-gray-300"
              />
            </div>

            <!-- Markdown Editor -->
            <uix-card shadow="md" borderWidth="2" padding="none" class="flex-1 flex flex-col overflow-hidden">
              <!-- Toolbar -->
              <div class="flex-shrink-0 flex items-center gap-1 p-3 bg-gray-100 border-b-2 border-black">
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("**", "**")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg font-bold hover:bg-gray-200 transition-colors"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("*", "*")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg italic hover:bg-gray-200 transition-colors"
                  title="Italic"
                >
                  I
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("# ", "")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("## ", "")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("### ", "")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                  title="Heading 3"
                >
                  H3
                </button>
                <div class="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("[", "](url)")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                  title="Link"
                >
                  <uix-icon name="link" size="18"></uix-icon>
                </button>
                <button
                  type="button"
                  @click=${() => this.insertMarkdown("- ", "")}
                  class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                  title="Bullet List"
                >
                  <uix-icon name="list" size="18"></uix-icon>
                </button>

                <div class="flex-1"></div>

                <button
                  type="button"
                  @click=${() => this.togglePreview()}
                  class="px-4 py-1.5 text-sm font-bold rounded-lg ${
                    this.previewMode
                      ? "bg-black text-white"
                      : "bg-white border-2 border-gray-300 hover:bg-gray-100"
                  } transition-colors"
                >
                  ${this.previewMode ? "Edit" : "Preview"}
                </button>
              </div>

              <!-- Editor / Preview -->
              ${
                this.previewMode
                  ? html`
                    <div class="flex-1 overflow-auto p-6 prose prose-lg max-w-none">
                      ${this.renderMarkdown(this.content.body)}
                    </div>
                  `
                  : html`
                    <textarea
                      .value=${this.content.body || ""}
                      @input=${(e) => this.updateField("body", e.target.value)}
                      class="editor-textarea flex-1 w-full p-6 font-mono text-base resize-none border-none outline-none overflow-auto"
                      placeholder="Write your content using Markdown..."
                    ></textarea>
                  `
              }
            </uix-card>
          </div>

          <!-- Sidebar -->
          <div class="w-80 flex-shrink-0 p-6 border-l border-gray-200 bg-white overflow-auto">
            <div class="space-y-6">
              <!-- Publishing Status -->
              <uix-card shadow="sm" borderWidth="2" padding="md">
                <h3 class="font-black uppercase text-sm mb-3">Publishing</h3>
                <div class="space-y-2">
                  ${["draft", "published", "scheduled"].map(
                    (status) => html`
                      <label
                        class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          this.content.status === status ? "bg-gray-100" : ""
                        }"
                      >
                        <input
                          type="radio"
                          name="status"
                          value=${status}
                          .checked=${this.content.status === status}
                          @change=${() => this.updateField("status", status)}
                          class="w-4 h-4"
                        />
                        <span class="font-medium capitalize">${status}</span>
                        ${
                          status === "draft"
                            ? html`<span class="ml-auto px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-bold">Draft</span>`
                            : ""
                        }
                        ${
                          status === "published"
                            ? html`<span class="ml-auto px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded font-bold">Live</span>`
                            : ""
                        }
                        ${
                          status === "scheduled"
                            ? html`<span class="ml-auto px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-bold">Pending</span>`
                            : ""
                        }
                      </label>
                    `,
                  )}
                </div>
                ${
                  this.content.status === "scheduled"
                    ? html`
                      <div class="mt-3">
                        <label class="text-xs font-bold text-gray-600">Schedule Date</label>
                        <input
                          type="datetime-local"
                          .value=${this.content.scheduledAt?.slice(0, 16) || ""}
                          @input=${(e) => this.updateField("scheduledAt", new Date(e.target.value).toISOString())}
                          class="w-full mt-1 p-2 border-2 border-black rounded-lg text-sm"
                        />
                      </div>
                    `
                    : ""
                }
              </uix-card>

              <!-- Cover Image -->
              <uix-card shadow="sm" borderWidth="2" padding="md">
                <h3 class="font-black uppercase text-sm mb-3">Cover Image</h3>
                ${
                  this.content.coverImage
                    ? html`
                      <div class="relative">
                        <img
                          src="${this.content.coverImage}"
                          alt="Cover"
                          class="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          @click=${() => this.updateField("coverImage", "")}
                          class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          x
                        </button>
                      </div>
                    `
                    : html`
                      <div class="h-32 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <label class="cursor-pointer text-center">
                          <uix-icon name="image" size="24" class="text-gray-400 mx-auto mb-1"></uix-icon>
                          <div class="text-sm text-gray-500">Add cover image</div>
                          <input
                            type="url"
                            placeholder="Paste image URL"
                            @change=${(e) => this.updateField("coverImage", e.target.value)}
                            class="mt-2 w-full p-1 text-xs border rounded"
                          />
                        </label>
                      </div>
                    `
                }
              </uix-card>

              <!-- SEO -->
              <uix-card shadow="sm" borderWidth="2" padding="md">
                <h3 class="font-black uppercase text-sm mb-3">SEO</h3>
                <div class="space-y-3">
                  <div>
                    <label class="text-xs font-bold text-gray-600">Meta Title</label>
                    <input
                      type="text"
                      .value=${seo.metaTitle || ""}
                      @input=${(e) => this.updateSeoField("metaTitle", e.target.value)}
                      maxlength="60"
                      placeholder="Page title for search engines"
                      class="w-full mt-1 p-2 border-2 border-black rounded-lg text-sm"
                    />
                    <div class="text-xs text-gray-400 mt-1">${(seo.metaTitle || "").length}/60</div>
                  </div>
                  <div>
                    <label class="text-xs font-bold text-gray-600">Meta Description</label>
                    <textarea
                      .value=${seo.metaDescription || ""}
                      @input=${(e) => this.updateSeoField("metaDescription", e.target.value)}
                      maxlength="160"
                      rows="3"
                      placeholder="Brief description for search results"
                      class="w-full mt-1 p-2 border-2 border-black rounded-lg text-sm resize-none"
                    ></textarea>
                    <div class="text-xs text-gray-400 mt-1">${(seo.metaDescription || "").length}/160</div>
                  </div>
                </div>
              </uix-card>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
