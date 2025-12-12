import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-radio",
  properties: {
    checked: T.boolean(false),
    value: T.string(""),
    name: T.string(""),
    disabled: T.boolean(false),
    required: T.boolean(false),
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

  handleChange(e) {
    this.checked = e.target.checked;
    this.emit("change", { checked: this.checked, value: this.value });

    // Uncheck other radios with the same name
    if (this.checked && this.name) {
      const radios = document.querySelectorAll(
        `uix-radio[name="${this.name}"]`,
      );
      radios.forEach((radio) => {
        if (radio !== this && radio.checked) {
          radio.checked = false;
        }
      });
    }
  },

  render() {
    return html`
      <label class="radio-wrapper">
        <input
          type="radio"
          class="radio"
          .checked=${this.checked}
          .value=${this.value}
          name=${this.name}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange.bind(this)}
        />
        <span class="radio-label">
          <slot></slot>
        </span>
      </label>
    `;
  },
};

/**
 * Radio Component
 *
 * @component
 * @category form
 * @tag uix-radio
 *
 * A radio button input for selecting one option from a group.
 *
 * @example
 * // Basic radio group
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-radio name="option" value="1" checked>Option 1</uix-radio>
 *   <uix-radio name="option" value="2">Option 2</uix-radio>
 *   <uix-radio name="option" value="3">Option 3</uix-radio>
 * </div>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-radio size="xs" name="size1" value="xs" checked>Extra small</uix-radio>
 *   <uix-radio size="sm" name="size2" value="sm" checked>Small</uix-radio>
 *   <uix-radio size="md" name="size3" value="md" checked>Medium</uix-radio>
 *   <uix-radio size="lg" name="size4" value="lg" checked>Large</uix-radio>
 *   <uix-radio size="xl" name="size5" value="xl" checked>Extra large</uix-radio>
 * </div>
 * ```
 *
 * @example
 * // Color variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-radio variant="primary" name="color1" checked>Primary</uix-radio>
 *   <uix-radio variant="secondary" name="color2" checked>Secondary</uix-radio>
 *   <uix-radio variant="success" name="color3" checked>Success</uix-radio>
 *   <uix-radio variant="warning" name="color4" checked>Warning</uix-radio>
 *   <uix-radio variant="error" name="color5" checked>Error</uix-radio>
 * </div>
 * ```
 *
 * @example
 * // Disabled state
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 0.5rem;">
 *   <uix-radio name="disabled" value="1" disabled>Disabled unchecked</uix-radio>
 *   <uix-radio name="disabled" value="2" checked disabled>Disabled checked</uix-radio>
 * </div>
 * ```
 *
 * @example
 * // With event handling
 * ```js
 * html`
 *   <uix-radio
 *     name="payment"
 *     value="credit"
 *     @change=${(e) => this.paymentMethod = e.detail.value}
 *   >Credit Card</uix-radio>
 *   <uix-radio
 *     name="payment"
 *     value="paypal"
 *     @change=${(e) => this.paymentMethod = e.detail.value}
 *   >PayPal</uix-radio>
 * `
 * ```
 *
 * @example
 * // In a form
 * ```html
 * <form>
 *   <fieldset>
 *     <legend>Choose your plan:</legend>
 *     <uix-radio name="plan" value="basic" required>Basic - $9/mo</uix-radio>
 *     <uix-radio name="plan" value="pro">Pro - $29/mo</uix-radio>
 *     <uix-radio name="plan" value="enterprise">Enterprise - $99/mo</uix-radio>
 *   </fieldset>
 *   <button type="submit">Continue</button>
 * </form>
 * ```
 */
