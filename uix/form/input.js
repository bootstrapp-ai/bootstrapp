import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-input",
  properties: {
    name: T.string(),
    value: T.string(""),
    placeholder: T.string(""),
    type: T.string({
      defaultValue: "text",
      enum: ["text", "email", "tel", "url", "search", "password"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    disabled: T.boolean(false),
    readonly: T.boolean(false),
    required: T.boolean(false),
    error: T.boolean(false),
    fullWidth: T.boolean(false),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "primary", "secondary", "success", "warning", "error"],
    }),
  },
  style: true,
  shadow: false,

  handleInput(e) {
    this.value = e.target.value;
    this.emit("input", { value: this.value });
  },

  handleChange(e) {
    this.value = e.target.value;
    this.emit("change", { value: this.value });
  },

  render() {
    return html`
      <input
        name=${this.name}
        class="input"
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?required=${this.required}
        @input=${this.handleInput.bind(this)}
        @change=${this.handleChange.bind(this)}
      />
    `;
  },
};

/**
 * Input Component
 *
 * @component
 * @category form
 * @tag uix-input
 *
 * Text input field with size variants matching button sizes for use in uix-join
 *
 * @example
 * // Basic input
 * ```html
 * <uix-input placeholder="Enter text..."></uix-input>
 * ```
 *
 * @example
 * // With sizes
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-input size="xs" placeholder="Extra small"></uix-input>
 *   <uix-input size="sm" placeholder="Small"></uix-input>
 *   <uix-input size="md" placeholder="Medium"></uix-input>
 *   <uix-input size="lg" placeholder="Large"></uix-input>
 *   <uix-input size="xl" placeholder="Extra large"></uix-input>
 * </div>
 * ```
 *
 * @example
 * // Different input types
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-input type="text" placeholder="Text"></uix-input>
 *   <uix-input type="email" placeholder="Email"></uix-input>
 *   <uix-input type="tel" placeholder="Phone"></uix-input>
 *   <uix-input type="url" placeholder="URL"></uix-input>
 *   <uix-input type="search" placeholder="Search"></uix-input>
 *   <uix-input type="password" placeholder="Password"></uix-input>
 * </div>
 * ```
 *
 * @example
 * // In button group with uix-join
 * ```html
 * <uix-join>
 *   <uix-input placeholder="Search..." size="md"></uix-input>
 *   <uix-button variant="primary" size="md">Search</uix-button>
 * </uix-join>
 * ```
 *
 * @example
 * // With binding
 * ```js
 * html`<uix-input
 *   .value=${this.searchQuery}
 *   @input=${(e) => this.searchQuery = e.detail.value}
 *   placeholder="Search..."
 * ></uix-input>`
 * ```
 *
 * @example
 * // States
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-input placeholder="Normal"></uix-input>
 *   <uix-input placeholder="Disabled" disabled></uix-input>
 *   <uix-input placeholder="Readonly" value="Read only text" readonly></uix-input>
 *   <uix-input placeholder="Required" required></uix-input>
 * </div>
 * ```
 */
