/**
 * @bootstrapp/cms - Rich Text Editor
 * Markdown editor with toolbar and live preview
 */

import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";

$APP.define("cms-rich-text", {
  tag: "cms-rich-text",
  style: true,
  properties: {
    value: T.string({ defaultValue: "" }),
    field: T.object({ attribute: false }),
    previewMode: T.boolean({ defaultValue: false }),
  },

  handleInput(e) {
    this.value = e.target.value;
    this.emit("change", this.value);
  },

  togglePreview() {
    this.previewMode = !this.previewMode;
  },

  /**
   * Insert markdown syntax at cursor position
   */
  insertMarkdown(before, after = "") {
    const textarea = this.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.value;
    const selection = text.substring(start, end);

    const newText =
      text.substring(0, start) + before + selection + after + text.substring(end);

    this.value = newText;
    this.emit("change", this.value);

    // Restore focus and selection
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selection.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  },

  /**
   * Simple markdown to HTML renderer
   * For production, consider using a proper markdown library
   */
  renderMarkdown(text) {
    if (!text) return html`<p class="text-gray-400 italic">No content yet...</p>`;

    // Basic markdown parsing
    let htmlText = text
      // Headers
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    // Wrap in paragraph
    htmlText = `<p>${htmlText}</p>`;

    // Return as raw HTML (trusted content from admin)
    const div = document.createElement("div");
    div.innerHTML = htmlText;
    return html`${Array.from(div.childNodes)}`;
  },

  render() {
    const label = this.field?.label || this.field?.name || "Content";

    return html`
      <div class="cms-rich-text">
        <label class="block text-sm font-bold text-gray-700 mb-2">${label}</label>

        <div class="border-2 border-black rounded-lg overflow-hidden bg-white">
          <!-- Toolbar -->
          <div
            class="flex items-center gap-1 p-2 bg-gray-100 border-b-2 border-black"
          >
            <button
              type="button"
              @click=${() => this.insertMarkdown("**", "**")}
              class="w-8 h-8 flex items-center justify-center rounded font-bold hover:bg-gray-200 transition-colors"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              @click=${() => this.insertMarkdown("*", "*")}
              class="w-8 h-8 flex items-center justify-center rounded italic hover:bg-gray-200 transition-colors"
              title="Italic"
            >
              I
            </button>
            <div class="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              @click=${() => this.insertMarkdown("# ", "")}
              class="w-8 h-8 flex items-center justify-center rounded text-sm font-bold hover:bg-gray-200 transition-colors"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              @click=${() => this.insertMarkdown("## ", "")}
              class="w-8 h-8 flex items-center justify-center rounded text-sm font-bold hover:bg-gray-200 transition-colors"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              @click=${() => this.insertMarkdown("### ", "")}
              class="w-8 h-8 flex items-center justify-center rounded text-sm font-bold hover:bg-gray-200 transition-colors"
              title="Heading 3"
            >
              H3
            </button>
            <div class="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              @click=${() => this.insertMarkdown("[", "](url)")}
              class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              title="Link"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </button>
            <button
              type="button"
              @click=${() => this.insertMarkdown("- ", "")}
              class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
              title="Bullet List"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div class="flex-1"></div>

            <button
              type="button"
              @click=${() => this.togglePreview()}
              class="px-3 py-1 text-sm font-bold rounded ${this.previewMode
                ? "bg-black text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"} transition-colors"
            >
              ${this.previewMode ? "Edit" : "Preview"}
            </button>
          </div>

          <!-- Editor / Preview -->
          ${this.previewMode
            ? html`
                <div class="p-4 min-h-[256px] prose prose-sm max-w-none">
                  ${this.renderMarkdown(this.value)}
                </div>
              `
            : html`
                <textarea
                  .value=${this.value}
                  @input=${(e) => this.handleInput(e)}
                  class="w-full min-h-[256px] p-4 font-mono text-sm resize-y border-none outline-none"
                  placeholder="Write your content using Markdown..."
                ></textarea>
              `}
        </div>

        <div class="mt-1 text-xs text-gray-500">
          Supports Markdown: **bold**, *italic*, ## headings, [links](url)
        </div>
      </div>
    `;
  },
});
