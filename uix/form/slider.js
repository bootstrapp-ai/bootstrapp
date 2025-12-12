import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-slider",
  properties: {
    value: T.number({ defaultValue: 50 }),
    min: T.number({ defaultValue: 0 }),
    max: T.number({ defaultValue: 100 }),
    step: T.number({ defaultValue: 1 }),
    disabled: T.boolean({ defaultValue: false }),
    name: T.string(""),
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
    this._internals.setFormValue(this.value.toString());
  },

  handleInput(e) {
    this.value = parseFloat(e.target.value);
    this._internals?.setFormValue(this.value.toString());
    this.emit("input", { value: this.value });
  },

  handleChange(e) {
    this.value = parseFloat(e.target.value);
    this._internals?.setFormValue(this.value.toString());
    this.emit("change", { value: this.value });
  },

  render() {
    return html`
      <input
        type="range"
        class="slider"
        value=${this.value.toString()}
        min=${this.min}
        max=${this.max}
        step=${this.step}
        ?disabled=${this.disabled}
        name=${this.name}
        @input=${this.handleInput.bind(this)}
        @change=${this.handleChange.bind(this)}
      />
    `;
  },
};

/**
 * Slider Component
 *
 * @component
 * @category form
 * @tag uix-slider
 *
 * A range slider input for selecting numeric values.
 *
 * @example Basic Slider
 * ```html
 * <uix-slider value="50"></uix-slider>
 * ```
 *
 * @example With Min, Max, and Step
 * ```html
 * <uix-slider min="0" max="10" step="0.5" value="5"></uix-slider>
 * ```
 *
 * @example Size Variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-slider size="xs" value="25"></uix-slider>
 *   <uix-slider size="sm" value="50"></uix-slider>
 *   <uix-slider size="md" value="75"></uix-slider>
 *   <uix-slider size="lg" value="50"></uix-slider>
 *   <uix-slider size="xl" value="25"></uix-slider>
 * </div>
 * ```
 *
 * @example Color Variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-slider variant="primary" value="70"></uix-slider>
 *   <uix-slider variant="secondary" value="60"></uix-slider>
 *   <uix-slider variant="success" value="80"></uix-slider>
 *   <uix-slider variant="warning" value="40"></uix-slider>
 *   <uix-slider variant="error" value="30"></uix-slider>
 * </div>
 * ```
 *
 * @example Disabled State
 * ```html
 * <uix-slider value="60" disabled></uix-slider>
 * ```
 *
 * @example With Event Handling
 * ```js
 * html`<uix-slider
 *   value="50"
 *   @input=${(e) => console.log('Current:', e.detail.value)}
 *   @change=${(e) => console.log('Final:', e.detail.value)}
 * ></uix-slider>`
 * ```
 *
 * @example In a Form
 * ```html
 * <form>
 *   <label>Volume: <uix-slider name="volume" min="0" max="100" value="50"></uix-slider></label>
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
