import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-checkbox",
  properties: {
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
  },

  updated(changedProperties) {
    if (changedProperties.has("checked")) {
      this._updateFormValue();
    }
    // Handle indeterminate state
    if (changedProperties.has("indeterminate")) {
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
    return html`
      <label class="checkbox-wrapper">
        <input
          type="checkbox"
          class="checkbox"
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          .value=${this.value}
          name=${this.name}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange.bind(this)}
        />
        <span class="checkbox-label">
          <slot></slot>
        </span>
      </label>
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
 * <uix-checkbox>Accept terms and conditions</uix-checkbox>
 * ```
 *
 * @example
 * // Checked by default
 * ```html
 * <uix-checkbox checked>Subscribe to newsletter</uix-checkbox>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox size="xs">Extra small</uix-checkbox>
 *   <uix-checkbox size="sm">Small</uix-checkbox>
 *   <uix-checkbox size="md" checked>Medium</uix-checkbox>
 *   <uix-checkbox size="lg">Large</uix-checkbox>
 *   <uix-checkbox size="xl">Extra large</uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // Color variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox variant="primary" checked>Primary</uix-checkbox>
 *   <uix-checkbox variant="secondary" checked>Secondary</uix-checkbox>
 *   <uix-checkbox variant="success" checked>Success</uix-checkbox>
 *   <uix-checkbox variant="warning" checked>Warning</uix-checkbox>
 *   <uix-checkbox variant="error" checked>Error</uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // Indeterminate state
 * ```html
 * <uix-checkbox indeterminate>Select all</uix-checkbox>
 * ```
 *
 * @example
 * // Disabled state
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-checkbox disabled>Disabled unchecked</uix-checkbox>
 *   <uix-checkbox checked disabled>Disabled checked</uix-checkbox>
 * </div>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-checkbox
 *   .checked=${this.agreed}
 *   @change=${(e) => this.agreed = e.detail.checked}
 * >I agree to the terms</uix-checkbox>`
 * ```
 *
 * @example
 * // In a form
 * ```html
 * <form>
 *   <uix-checkbox name="newsletter" value="yes">Subscribe to newsletter</uix-checkbox>
 *   <uix-checkbox name="terms" value="accepted" required>Accept terms (required)</uix-checkbox>
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
