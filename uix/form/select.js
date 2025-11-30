import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-select",
  style: true,
  formAssociated: true,
  properties: {
    value: T.string(),
    disabled: T.boolean(),
    required: T.boolean(),
    placeholder: T.string(),
    name: T.string(),
    label: T.string(),
    options: T.array({ defaultValue: [] }),
  },
  formResetCallback() {
    const $select = this.querySelector("select");
    if ($select) {
      $select.value = this._defaultValue || "";
      this.value = $select.value;
    }
  },
  formDisabledCallback(disabled) {
    const $select = this.querySelector("select");
    if ($select) $select.disabled = disabled;
  },
  formStateRestoreCallback(state) {
    const $select = this.querySelector("select");
    if ($select) $select.value = state;
    this.value = state;
  },
  reportValidity() {
    const $select = this.querySelector("select");
    if (!$select) return true;
    const validity = $select.reportValidity() !== false;
    $select?.classList.toggle("input-error", !validity);
    return validity;
  },
  connected() {
    if (!this._internals) {
      this._internals = this.attachInternals();
    }
    this._defaultValue = this.value;
  },

  _onInput(e) {
    this.value = e.target.value;
    this._internals?.setFormValue(this.value);
  },

  _onChange(e) {
    this.value = e.target.value;
    this._internals?.setFormValue(this.value);
  },

  render() {
    const { value, disabled, required, placeholder, name, options } = this;
    return html`
        <select
          name=${name || ""}
          value=${value || ""}
          ?disabled=${disabled}
          ?required=${required}
          @input=${this._onInput.bind(this)}
          @change=${this._onChange.bind(this)}
        >
          ${
            placeholder && !value
              ? html`<option value="" disabled selected hidden>
                ${placeholder}
              </option>`
              : ""
          }
          ${options.map(
            (option) => html`
              <option
                value=${option.value ?? option}
                ?selected=${(option.value ?? option) === this.value}
              >
                ${option.label ?? option}
              </option>
            `,
          )}
        </select>
        <uix-icon name="chevron-down" class="select-arrow"></uix-icon>
    `;
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Select Component
 *
 * @component
 * @category form
 * @tag uix-select
 *
 * A native select dropdown with consistent styling. Accepts an options array
 * and integrates with HTML forms.
 *
 * @example Basic Select
 * ```html
 * <uix-select
 *   value="option2"
 *   options='["Option 1", "Option 2", "Option 3"]'
 * ></uix-select>
 * ```
 *
 * @example With Label and Placeholder
 * ```html
 * <uix-select
 *   label="Choose Color"
 *   placeholder="Select a color..."
 *   options='[
 *     { "value": "red", "label": "Red" },
 *     { "value": "green", "label": "Green" },
 *     { "value": "blue", "label": "Blue" }
 *   ]'
 * ></uix-select>
 * ```
 *
 * @example In a Form
 * ```html
 * <form>
 *   <uix-select
 *     name="country"
 *     label="Country"
 *     required
 *     options='["USA", "UK", "Canada"]'
 *   ></uix-select>
 * </form>
 * ```
 *
 * @example Disabled State
 * ```html
 * <uix-select
 *   disabled
 *   value="disabled"
 *   options='["This select is disabled"]'
 * ></uix-select>
 * ```
 */
