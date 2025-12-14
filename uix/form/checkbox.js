import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

const generateId = () => `uix-checkbox-${Math.random().toString(36).slice(2, 9)}`;

export default {
  tag: "uix-checkbox",
  properties: {
    id: T.string(),
    label: T.string(),
    checked: T.boolean(false),
    value: T.string(""),
    name: T.string(""),
    disabled: T.boolean(false),
    required: T.boolean(false),
    indeterminate: T.boolean(false),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    variant: T.string({
      defaultValue: "primary",
      enum: ["primary", "secondary", "success", "warning", "error"],
    }),
  },
  style: true,
  shadow: false,
  formAssociated: true,

  connected() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    this._updateFormValue();
    if (!this.id && !this._checkboxId) {
      this._checkboxId = generateId();
    }
  },

  get checkboxId() {
    return this.id || this._checkboxId || (this._checkboxId = generateId());
  },

  updated({ changedProps }) {
    if (changedProps.has("checked")) {
      this._updateFormValue();
    }
    // Handle indeterminate state
    if (changedProps.has("indeterminate")) {
      const input =
        this.shadowRoot?.querySelector("input") || this.querySelector("input");
      if (input) {
        input.indeterminate = this.indeterminate;
      }
    }
  },

  _updateFormValue() {
    if (this._internals) {
      this._internals.setFormValue(this.checked ? this.value || "on" : null);
    }
  },

  handleChange(e) {
    this.checked = e.target.checked;
    this.indeterminate = false;
    this._updateFormValue();
    this.emit("change", { checked: this.checked, value: this.value });
  },

  render() {
    const id = this.checkboxId;
    return html`
      <input
        type="checkbox"
        id=${id}
        class="checkbox"
        ?checked=${this.checked}
        .indeterminate=${this.indeterminate}
        value=${this.value}
        name=${this.name}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @change=${this.handleChange.bind(this)}
      />
      ${this.label ? html`<uix-label inline for=${id} text=${this.label} ?required=${this.required}></uix-label>` : ""}
    `;
  },
};

/**
 * Checkbox Component
 *
 * @component
 * @category form
 * @tag uix-checkbox
 *
 * A checkbox input for boolean selections with label support.
 *
 * @example
 * // Basic checkbox
 * ```html
 * <uix-checkbox label="Accept terms and conditions"></uix-checkbox>
 * ```
 *
 * @example
 * // Checked by default
 * ```html
 * <uix-checkbox checked label="Subscribe to newsletter"></uix-checkbox>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox size="xs" label="Extra small"></uix-checkbox>
 *   <uix-checkbox size="sm" label="Small"></uix-checkbox>
 *   <uix-checkbox size="md" checked label="Medium"></uix-checkbox>
 *   <uix-checkbox size="lg" label="Large"></uix-checkbox>
 *   <uix-checkbox size="xl" label="Extra large"></uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // Color variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox variant="primary" checked label="Primary"></uix-checkbox>
 *   <uix-checkbox variant="secondary" checked label="Secondary"></uix-checkbox>
 *   <uix-checkbox variant="success" checked label="Success"></uix-checkbox>
 *   <uix-checkbox variant="warning" checked label="Warning"></uix-checkbox>
 *   <uix-checkbox variant="error" checked label="Error"></uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // Indeterminate state
 * ```html
 * <uix-checkbox indeterminate label="Select all"></uix-checkbox>
 * ```
 *
 * @example
 * // Disabled state
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox disabled label="Disabled unchecked"></uix-checkbox>
 *   <uix-checkbox checked disabled label="Disabled checked"></uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-checkbox
 *   .checked=${this.agreed}
 *   @change=${(e) => this.agreed = e.detail.checked}
 *   label="I agree to the terms"
 * ></uix-checkbox>`
 * ```
 *
 * @example
 * // In a form
 * ```html
 * <form>
 *   <uix-checkbox name="newsletter" value="yes" label="Subscribe to newsletter"></uix-checkbox>
 *   <uix-checkbox name="terms" value="accepted" required label="Accept terms"></uix-checkbox>
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
