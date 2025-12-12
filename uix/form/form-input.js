import { ifDefined } from "lit-html/directives/if-defined.js";

const inputTypes = { string: "text" };
let uniqueIdCounter = 0;

import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
export default {
  tag: "uix-form-input",
  style: true,
  properties: {
    bind: T.object({ attribute: false }),
    autofocus: T.boolean(),
    value: T.string(),
    placeholder: T.string(),
    name: T.string(),
    label: T.string(),
    disabled: T.boolean(),
    required: T.boolean(),
    type: T.string({
      defaultValue: "text",
      enum: [
        "text",
        "textarea",
        "select",
        "password",
        "email",
        "number",
        "decimal",
        "search",
        "tel",
        "url",
        "checkbox",
        "radio",
      ],
    }),
    options: T.array({ defaultValue: [] }),
    checked: T.boolean(),
    selected: T.boolean(),
    regex: T.string(),
    maxLength: T.string(),
    rows: T.number({ defaultValue: 4 }),
    keydown: T.function(),
    input: T.function(),
    icon: T.string(),
  },
  formAssociated: true,
  formResetCallback() {
    const $input = this.getInput();
    if (!$input) return;
    if (!["submit", "button", "reset"].includes($input.type))
      $input.value = this._defaultValue || "";
    if (["radio", "checkbox", "switch"].includes($input.type))
      $input.checked = this._defaultValue || false;
    this.value = this.isCheckable ? $input.checked : $input.value;
    this._updateHasValue();
  },
  formDisabledCallback(disabled) {
    const $input = this.getInput();
    if ($input) $input.disabled = disabled;
  },
  formStateRestoreCallback(state) {
    const $input = this.getInput();
    if ($input) $input.value = state;
    this.value = state;
    this._updateHasValue();
  },
  reportValidity() {
    const $input = this.getInput();
    if (!$input) return true;
    const validity = $input.reportValidity() !== false;
    $input?.classList.toggle("input-error", !validity);
    return validity;
  },
  getInput() {
    if (!this.$input) {
      this.$input = this.querySelector("input, select, textarea");
      if (this.$input) {
        this._internals.setValidity(
          this.$input.validity,
          this.$input.validationMessage,
          this.$input,
        );
      }
    }
    return this.$input;
  },
  connected() {
    this._internals = this.attachInternals();
    this.fieldId = `uix-input-${++uniqueIdCounter}`;
    this.isCheckable = this.type === "checkbox" || this.type === "radio";

    if (!this.name) {
      this.name = this.label
        ? `uix-input-${this.label.toLowerCase().replace(/\s+/g, "-")}`
        : this.fieldId;
    }
    this.placeholder = this.placeholder || " ";
    if (this.bind) {
      this.value = this.bind.value;
      if (this.bind.instance) {
        this.bind.instance.on(`${this.bind.prop}Changed`, ({ value }) => {
          this.setValue(value);
        });
      }
    }
    this._updateHasValue();
  },
  _updateHasValue() {
    if (this.isCheckable) {
      this.classList.remove("has-value");
      return;
    }
    const hasValue =
      this.value !== null && this.value !== undefined && this.value !== "";
    this.classList.toggle("has-value", hasValue);
  },
  _onInput(event) {
    const { target } = event;
    const newValue = this.isCheckable ? target.checked : target.value;

    if (this.value !== newValue) {
      this.value = newValue;
      this._updateHasValue();
      if (this.bind) this.bind.setValue(this.value);
      if (this.input) this.input(event);
    }
  },
  inputValue() {
    const el = this.getInput();
    return el ? (this.isCheckable ? el.checked : el.value) : undefined;
  },
  setValue(value) {
    const el = this.getInput();
    if (el) {
      if (this.isCheckable) el.checked = !!value;
      else el.value = value;
    }
    if (this.bind) this.bind.value = value;
    this.value = value;
    this._updateHasValue();
    this.requestUpdate();
  },
  resetValue() {
    const el = this.getInput();
    if (el) {
      if (this.isCheckable) el.checked = false;
      else el.value = "";
    }
    this.value = this.isCheckable ? false : "";
    if (this.bind) this.bind.value = this.value;
    this._updateHasValue();
    this.requestUpdate();
  },
  render() {
    const {
      fieldId,
      name,
      type,
      label,
      value = "",
      placeholder,
      rows,
      regex,
      autofocus,
      required,
      disabled,
      maxLength,
      keydown,
      icon,
      options,
    } = this;
    let fieldTemplate;
    switch (type) {
      case "textarea":
        fieldTemplate = html`
                    <uix-textarea
                        id=${fieldId}
                        name=${name}
                        placeholder=${ifDefined(placeholder)}
                        ?autofocus=${autofocus}
                        ?disabled=${disabled}
                        ?required=${required}
                        maxLength=${ifDefined(maxLength)}
                        @input=${this._onInput.bind(this)}
                        @keydown=${ifDefined(keydown)}
                        rows=${rows}
                    >${value}</uix-textarea>`;
        break;

      case "select":
        fieldTemplate = html`
											<uix-select
                        w-full
												id=${fieldId}
												name=${name}
												value=${value}
												?disabled=${disabled}
												?required=${required}
												?autofocus=${autofocus}
                        .options=${options}
												@change=${this._onInput.bind(this)}>									
											</uix-select>
										`;
        break;

      default:
        fieldTemplate = html`
                    <uix-input
                        id=${fieldId}
                        name=${name}
                        type=${inputTypes[type] || type}
                        .value=${value}
                        placeholder=${ifDefined(placeholder)}
                        ?autofocus=${autofocus}
                        maxLength=${ifDefined(maxLength)}
                        @input=${this._onInput.bind(this)}
                        @keydown=${ifDefined(keydown)}
                        ?disabled=${disabled}
                        ?required=${required}
                        pattern=${ifDefined(regex)}
                        ?checked=${this.isCheckable && !!this.value}
                    ></uix-input>`;
        break;
    }

    return html`
            ${label ? html`<label for=${fieldId} ?required=${required}>${label}</label>` : ""}
            ${fieldTemplate}
            ${icon ? html`<uix-icon name=${icon} class="input-icon"></uix-icon>` : ""}
        `;
  },
};
