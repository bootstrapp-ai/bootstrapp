import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-textarea",
  properties: {
    value: T.string(""),
    placeholder: T.string(""),
    rows: T.number({ defaultValue: 4 }),
    cols: T.number({ defaultValue: 50 }),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    disabled: T.boolean(false),
    readonly: T.boolean(false),
    required: T.boolean(false),
    maxlength: T.number({ defaultValue: null }),
    minlength: T.number({ defaultValue: null }),
    resize: T.string({
      defaultValue: "vertical",
      enum: ["none", "both", "horizontal", "vertical"],
    }),
    error: T.boolean(false),
    fullWidth: T.boolean(false),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "primary", "secondary", "success", "warning", "error"],
    }),
    name: T.string(),
  },
  style: true,
  shadow: false,
  formAssociated: true,

  connected() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    this._internals.setFormValue(this.value);
  },

  handleInput(e) {
    this.value = e.target.value;
    this._internals?.setFormValue(this.value);
    this.emit("input", { value: this.value });
  },

  handleChange(e) {
    this.value = e.target.value;
    this._internals?.setFormValue(this.value);
    this.emit("change", { value: this.value });
  },

  render() {
    const attrs = {};
    if (this.maxlength !== null) attrs.maxlength = this.maxlength;
    if (this.minlength !== null) attrs.minlength = this.minlength;

    return html`
      <textarea
        class="textarea"
        name=${this.name}
        .value=${this.value}
        placeholder=${this.placeholder}
        rows=${this.rows}
        cols=${this.cols}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        ...${attrs}
        @input=${this.handleInput.bind(this)}
        @change=${this.handleChange.bind(this)}
      ></textarea>
    `;
  },
};

/**
 * Textarea Component
 *
 * @component
 * @category form
 * @tag uix-textarea
 *
 * Multi-line text input field with size variants and resize options.
 *
 * @example
 * // Basic textarea
 * ```html
 * <uix-textarea placeholder="Enter your message..."></uix-textarea>
 * ```
 *
 * @example
 * // With custom rows
 * ```html
 * <uix-textarea rows="8" placeholder="Long message..."></uix-textarea>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-textarea size="xs" placeholder="Extra small" rows="2"></uix-textarea>
 *   <uix-textarea size="sm" placeholder="Small" rows="3"></uix-textarea>
 *   <uix-textarea size="md" placeholder="Medium" rows="4"></uix-textarea>
 *   <uix-textarea size="lg" placeholder="Large" rows="5"></uix-textarea>
 *   <uix-textarea size="xl" placeholder="Extra large" rows="6"></uix-textarea>
 * </div>
 * ```
 *
 * @example
 * // Resize options
 * ```html
 * <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
 *   <uix-textarea resize="none" placeholder="No resize"></uix-textarea>
 *   <uix-textarea resize="vertical" placeholder="Vertical resize"></uix-textarea>
 *   <uix-textarea resize="horizontal" placeholder="Horizontal resize"></uix-textarea>
 *   <uix-textarea resize="both" placeholder="Both resize"></uix-textarea>
 * </div>
 * ```
 *
 * @example
 * // With character limit
 * ```html
 * <uix-textarea maxlength="200" placeholder="Max 200 characters"></uix-textarea>
 * ```
 *
 * @example
 * // States
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-textarea placeholder="Normal"></uix-textarea>
 *   <uix-textarea placeholder="Disabled" disabled></uix-textarea>
 *   <uix-textarea placeholder="Readonly" value="Read only text" readonly></uix-textarea>
 *   <uix-textarea placeholder="Required" required></uix-textarea>
 * </div>
 * ```
 *
 * @example
 * // With binding
 * ```js
 * html`<uix-textarea
 *   .value=${this.message}
 *   @input=${(e) => this.message = e.detail.value}
 *   placeholder="Type your message..."
 * ></uix-textarea>`
 * ```
 */
