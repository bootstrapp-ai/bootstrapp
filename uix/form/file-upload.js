import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-file-upload",
  properties: {
    accept: T.string(""),
    multiple: T.boolean(false),
    disabled: T.boolean(false),
    required: T.boolean(false),
    maxSize: T.number({ defaultValue: null }), // in bytes
    showPreview: T.boolean(true),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "dropzone"],
    }),
    files: T.array([]),
    dragOver: T.boolean(false),
    error: T.string(""),
  },
  style: true,
  shadow: false,
  formAssociated: true,

  connected() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
  },

  handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    this._processFiles(files);
  },

  handleDrop(e) {
    e.preventDefault();
    this.dragOver = false;

    if (this.disabled) return;

    const files = Array.from(e.dataTransfer.files || []);
    this._processFiles(files);
  },

  handleDragOver(e) {
    e.preventDefault();
    if (!this.disabled) {
      this.dragOver = true;
    }
  },

  handleDragLeave(e) {
    e.preventDefault();
    this.dragOver = false;
  },

  _processFiles(files) {
    this.error = "";

    // Validate file count
    if (!this.multiple && files.length > 1) {
      this.error = "Only one file is allowed";
      this.emit("error", { error: this.error });
      return;
    }

    // Validate file size
    if (this.maxSize) {
      const oversized = files.find((f) => f.size > this.maxSize);
      if (oversized) {
        this.error = `File ${oversized.name} exceeds maximum size of ${this._formatBytes(this.maxSize)}`;
        this.emit("error", { error: this.error });
        return;
      }
    }

    this.files = this.multiple ? [...this.files, ...files] : files;

    // Update form value
    const dataTransfer = new DataTransfer();
    this.files.forEach((file) => dataTransfer.items.add(file));
    this._internals?.setFormValue(dataTransfer.files);

    this.emit("change", { files: this.files });
  },

  removeFile(index) {
    this.files = this.files.filter((_, i) => i !== index);

    const dataTransfer = new DataTransfer();
    this.files.forEach((file) => dataTransfer.items.add(file));
    this._internals?.setFormValue(dataTransfer.files);

    this.emit("change", { files: this.files });
  },

  _formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i];
  },

  _isImage(file) {
    return file.type.startsWith("image/");
  },

  render() {
    if (this.variant === "dropzone") {
      return this._renderDropzone();
    }
    return this._renderDefault();
  },

  _renderDefault() {
    return html`
      <div class="file-upload">
        <label class="file-upload-label">
          <input
            type="file"
            class="file-upload-input"
            accept=${this.accept}
            ?multiple=${this.multiple}
            ?disabled=${this.disabled}
            ?required=${this.required}
            @change=${this.handleFileSelect}
          />
          <uix-button variant="secondary">
            <uix-icon name="upload"></uix-icon>
            Choose ${this.multiple ? "Files" : "File"}
          </uix-button>
        </label>

        ${this.error ? html`<div class="file-upload-error">${this.error}</div>` : ""}
        ${this.showPreview && this.files.length > 0 ? this._renderFileList() : ""}
      </div>
    `;
  },

  _renderDropzone() {
    return html`
      <div
        class="file-dropzone ${this.dragOver ? "dragover" : ""} ${this.disabled ? "disabled" : ""}"
        @drop=${this.handleDrop}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
      >
        <label class="file-dropzone-label">
          <input
            type="file"
            class="file-upload-input"
            accept=${this.accept}
            ?multiple=${this.multiple}
            ?disabled=${this.disabled}
            ?required=${this.required}
            @change=${this.handleFileSelect}
          />
          <div class="file-dropzone-content">
            <uix-icon name="upload-cloud" size="xl"></uix-icon>
            <p class="file-dropzone-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            ${this.accept ? html`<p class="file-dropzone-hint">${this.accept}</p>` : ""}
            ${this.maxSize ? html`<p class="file-dropzone-hint">Max size: ${this._formatBytes(this.maxSize)}</p>` : ""}
          </div>
        </label>

        ${this.error ? html`<div class="file-upload-error">${this.error}</div>` : ""}
        ${this.showPreview && this.files.length > 0 ? this._renderFileList() : ""}
      </div>
    `;
  },

  _renderFileList() {
    return html`
      <div class="file-list">
        ${this.files.map(
          (file, index) => html`
            <div class="file-item">
              ${
                this._isImage(file) && this.showPreview
                  ? html`<img
                    class="file-preview"
                    src=${URL.createObjectURL(file)}
                    alt=${file.name}
                  />`
                  : html`<uix-icon name="file" class="file-icon"></uix-icon>`
              }
              <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this._formatBytes(file.size)}</div>
              </div>
              <button
                type="button"
                class="file-remove"
                @click=${() => this.removeFile(index)}
                ?disabled=${this.disabled}
              >
                <uix-icon name="x"></uix-icon>
              </button>
            </div>
          `,
        )}
      </div>
    `;
  },
};

/**
 * File Upload Component
 *
 * @component
 * @category form
 * @tag uix-file-upload
 *
 * File upload input with drag-and-drop support and preview.
 *
 * @example
 * // Basic file upload
 * ```html
 * <uix-file-upload></uix-file-upload>
 * ```
 *
 * @example
 * // Multiple files
 * ```html
 * <uix-file-upload multiple></uix-file-upload>
 * ```
 *
 * @example
 * // Dropzone variant
 * ```html
 * <uix-file-upload variant="dropzone"></uix-file-upload>
 * ```
 *
 * @example
 * // Accept only images
 * ```html
 * <uix-file-upload accept="image/*" variant="dropzone"></uix-file-upload>
 * ```
 *
 * @example
 * // With file size limit (5MB)
 * ```html
 * <uix-file-upload max-size="5242880" variant="dropzone"></uix-file-upload>
 * ```
 *
 * @example
 * // Multiple images with preview
 * ```html
 * <uix-file-upload
 *   accept="image/*"
 *   multiple
 *   variant="dropzone"
 *   show-preview
 * ></uix-file-upload>
 * ```
 *
 * @example
 * // Documents only
 * ```html
 * <uix-file-upload
 *   accept=".pdf,.doc,.docx"
 *   variant="dropzone"
 * ></uix-file-upload>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-file-upload
 *   @change=${(e) => this.handleFiles(e.detail.files)}
 *   @error=${(e) => this.showError(e.detail.error)}
 *   variant="dropzone"
 * ></uix-file-upload>`
 * ```
 *
 * @example
 * // In a form
 * ```html
 * <form>
 *   <label>Upload your resume:</label>
 *   <uix-file-upload
 *     name="resume"
 *     accept=".pdf,.doc,.docx"
 *     required
 *     max-size="2097152"
 *   ></uix-file-upload>
 *   <button type="submit">Submit Application</button>
 * </form>
 * ```
 */
