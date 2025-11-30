import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-radio-group",
  properties: {
    value: T.string(""),
    name: T.string(""),
    disabled: T.boolean(false),
    required: T.boolean(false),
    orientation: T.string({
      defaultValue: "vertical",
      enum: ["vertical", "horizontal"],
    }),
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
  shadow: true,
  formAssociated: true,

  connected() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    this._updateFormValue();
    this._syncRadios();
  },

  updated(changedProperties) {
    if (changedProperties.has("value") || changedProperties.has("name")) {
      this._syncRadios();
      this._updateFormValue();
    }
    if (
      changedProperties.has("size") ||
      changedProperties.has("variant") ||
      changedProperties.has("disabled")
    ) {
      this._syncRadios();
    }
  },

  _updateFormValue() {
    if (this._internals) {
      this._internals.setFormValue(this.value || null);
    }
  },

  _syncRadios() {
    const radios = this.querySelectorAll("uix-radio");
    radios.forEach((radio) => {
      if (this.name) radio.name = this.name;
      if (this.size) radio.size = this.size;
      if (this.variant) radio.variant = this.variant;
      radio.disabled = this.disabled || radio.hasAttribute("disabled");
      radio.checked = radio.value === this.value;
    });
  },

  handleSlotChange() {
    this._syncRadios();

    // Listen to changes from child radios
    const radios = this.querySelectorAll("uix-radio");
    radios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.detail.checked) {
          this.value = e.detail.value;
          this._updateFormValue();
          this.emit("change", { value: this.value });
        }
      });
    });
  },

  render() {
    return html`
      <div part="container" class="radio-group" role="radiogroup">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  },
};

/**
 * Radio Group Component
 *
 * @component
 * @category form
 * @tag uix-radio-group
 *
 * A container for radio buttons that manages the selection state.
 *
 * @example
 * // Basic radio group
 * ```html
 * <uix-radio-group name="plan" value="basic">
 *   <uix-radio value="basic">Basic - $9/mo</uix-radio>
 *   <uix-radio value="pro">Pro - $29/mo</uix-radio>
 *   <uix-radio value="enterprise">Enterprise - $99/mo</uix-radio>
 * </uix-radio-group>
 * ```
 *
 * @example
 * // Horizontal orientation
 * ```html
 * <uix-radio-group name="theme" orientation="horizontal" value="dark">
 *   <uix-radio value="light">Light</uix-radio>
 *   <uix-radio value="dark">Dark</uix-radio>
 *   <uix-radio value="auto">Auto</uix-radio>
 * </uix-radio-group>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-radio-group name="size1" size="xs" value="a">
 *     <uix-radio value="a">Option A</uix-radio>
 *     <uix-radio value="b">Option B</uix-radio>
 *   </uix-radio-group>
 *
 *   <uix-radio-group name="size2" size="lg" value="a">
 *     <uix-radio value="a">Option A</uix-radio>
 *     <uix-radio value="b">Option B</uix-radio>
 *   </uix-radio-group>
 * </div>
 * ```
 *
 * @example
 * // Color variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-radio-group name="variant1" variant="primary" value="yes">
 *     <uix-radio value="yes">Yes</uix-radio>
 *     <uix-radio value="no">No</uix-radio>
 *   </uix-radio-group>
 *
 *   <uix-radio-group name="variant2" variant="success" value="yes">
 *     <uix-radio value="yes">Yes</uix-radio>
 *     <uix-radio value="no">No</uix-radio>
 *   </uix-radio-group>
 * </div>
 * ```
 *
 * @example
 * // Disabled group
 * ```html
 * <uix-radio-group name="disabled" disabled value="option1">
 *   <uix-radio value="option1">Option 1</uix-radio>
 *   <uix-radio value="option2">Option 2</uix-radio>
 *   <uix-radio value="option3">Option 3</uix-radio>
 * </uix-radio-group>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`<uix-radio-group
 *   name="preference"
 *   .value=${this.userPreference}
 *   @change=${(e) => this.userPreference = e.detail.value}
 * >
 *   <uix-radio value="email">Email notifications</uix-radio>
 *   <uix-radio value="sms">SMS notifications</uix-radio>
 *   <uix-radio value="none">No notifications</uix-radio>
 * </uix-radio-group>`
 * ```
 *
 * @example
 * // In a form
 * ```html
 * <form>
 *   <label>Select your subscription:</label>
 *   <uix-radio-group name="subscription" required>
 *     <uix-radio value="monthly">Monthly</uix-radio>
 *     <uix-radio value="yearly">Yearly (Save 20%)</uix-radio>
 *   </uix-radio-group>
 *   <button type="submit">Continue</button>
 * </form>
 * ```
 */
