import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-number-input",
  properties: {
    value: T.number({ defaultValue: 0 }),
    min: T.number({ defaultValue: null }),
    max: T.number({ defaultValue: null }),
    step: T.number({ defaultValue: 1 }),
    placeholder: T.string(""),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    disabled: T.boolean(false),
    readonly: T.boolean(false),
    required: T.boolean(false),
    showButtons: T.boolean(true),
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

  _updateFormValue() {
    if (this._internals) {
      this._internals.setFormValue(this.value?.toString() || "");
    }
  },

  handleInput(e) {
    const val = e.target.value;
    this.value = val === "" ? null : parseFloat(val);
    this._updateFormValue();
    this.emit("input", { value: this.value });
  },

  handleChange(e) {
    const val = e.target.value;
    this.value = val === "" ? null : parseFloat(val);
    this._updateFormValue();
    this.emit("change", { value: this.value });
  },

  increment() {
    if (this.disabled || this.readonly) return;
    const newValue = (this.value || 0) + this.step;
    if (this.max === null || newValue <= this.max) {
      this.value = newValue;
      this._updateFormValue();
      this.emit("change", { value: this.value });
    }
  },

  decrement() {
    if (this.disabled || this.readonly) return;
    const newValue = (this.value || 0) - this.step;
    if (this.min === null || newValue >= this.min) {
      this.value = newValue;
      this._updateFormValue();
      this.emit("change", { value: this.value });
    }
  },

  render() {
    const attrs = {};
    if (this.min !== null) attrs.min = this.min;
    if (this.max !== null) attrs.max = this.max;

    return html`
      <div class="number-input-wrapper">
        <input
          type="number"
          class="number-input"
          .value=${this.value?.toString() || ""}
          placeholder=${this.placeholder}
          step=${this.step}
          ...${attrs}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          @input=${this.handleInput.bind(this)}
          @change=${this.handleChange.bind(this)}
        />
        ${
          this.showButtons
            ? html`
              <div class="number-input-buttons">
                <button
                  type="button"
                  class="number-input-button increment"
                  ?disabled=${this.disabled || this.readonly}
                  @click=${this.increment}
                  tabindex="-1"
                >
                  <uix-icon name="chevron-up"></uix-icon>
                </button>
                <button
                  type="button"
                  class="number-input-button decrement"
                  ?disabled=${this.disabled || this.readonly}
                  @click=${this.decrement}
                  tabindex="-1"
                >
                  <uix-icon name="chevron-down"></uix-icon>
                </button>
              </div>
            `
            : ""
        }
      </div>
    `;
  },
};

/**
 * Number Input Component
 *
 * @component
 * @category form
 * @tag uix-number-input
 *
 * Numeric input field with optional increment/decrement buttons.
 *
 * @example
 * // Basic number input
 * ```html
 * <uix-number-input value="5"></uix-number-input>
 * ```
 *
 * @example
 * // With min, max, and step
 * ```html
 * <uix-number-input min="0" max="100" step="5" value="50"></uix-number-input>
 * ```
 *
 * @example
 * // Without buttons
 * ```html
 * <uix-number-input value="42" show-buttons="false"></uix-number-input>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-number-input size="xs" value="1"></uix-number-input>
 *   <uix-number-input size="sm" value="2"></uix-number-input>
 *   <uix-number-input size="md" value="3"></uix-number-input>
 *   <uix-number-input size="lg" value="4"></uix-number-input>
 *   <uix-number-input size="xl" value="5"></uix-number-input>
 * </div>
 * ```
 *
 * @example
 * // Decimal values
 * ```html
 * <uix-number-input value="3.14" step="0.01" placeholder="Enter price"></uix-number-input>
 * ```
 *
 * @example
 * // States
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-number-input value="10" placeholder="Normal"></uix-number-input>
 *   <uix-number-input value="10" disabled>Disabled</uix-number-input>
 *   <uix-number-input value="10" readonly>Read only</uix-number-input>
 *   <uix-number-input required placeholder="Required"></uix-number-input>
 * </div>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-number-input
 *   .value=${this.quantity}
 *   min="1"
 *   max="99"
 *   @change=${(e) => this.quantity = e.detail.value}
 * ></uix-number-input>`
 * ```
 *
 * @example
 * // In a form (quantity selector)
 * ```html
 * <form>
 *   <label>Quantity:
 *     <uix-number-input name="quantity" min="1" max="10" value="1"></uix-number-input>
 *   </label>
 *   <button type="submit">Add to Cart</button>
 * </form>
 * ```
 */
