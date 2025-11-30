import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-switch",
  properties: {
    checked: T.boolean({ defaultValue: false }),
    disabled: T.boolean({ defaultValue: false }),
    name: T.string(""),
    value: T.string({ defaultValue: "on" }),
    label: T.string(""),
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
    this._internals.setFormValue(this.checked ? this.value : null);
  },

  handleChange(e) {
    this.checked = e.target.checked;
    this._internals?.setFormValue(this.checked ? this.value : null);
    this.emit("change", { checked: this.checked });
    this.emit("input", { checked: this.checked });
  },

  render() {
    return html`
      <label class="switch-wrapper">
        <input
          type="checkbox"
          class="switch-native"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          name=${this.name}
          value=${this.value}
          @change=${this.handleChange.bind(this)}
        />
        <div class="switch-control">
          <div class="switch-thumb"></div>
        </div>
        ${this.label ? html`<span class="switch-label">${this.label}</span>` : ""}
      </label>
    `;
  },
};

/**
 * Switch Component
 *
 * @component
 * @category form
 * @tag uix-switch
 *
 * A toggle switch for boolean on/off states.
 *
 * @example Basic Switch
 * ```html
 * <uix-switch></uix-switch>
 * ```
 *
 * @example With Label
 * ```html
 * <uix-switch label="Enable notifications" checked></uix-switch>
 * ```
 *
 * @example Size Variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-switch size="xs" label="Extra small"></uix-switch>
 *   <uix-switch size="sm" label="Small"></uix-switch>
 *   <uix-switch size="md" label="Medium"></uix-switch>
 *   <uix-switch size="lg" label="Large"></uix-switch>
 *   <uix-switch size="xl" label="Extra large"></uix-switch>
 * </div>
 * ```
 *
 * @example Color Variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-switch variant="primary" label="Primary" checked></uix-switch>
 *   <uix-switch variant="secondary" label="Secondary" checked></uix-switch>
 *   <uix-switch variant="success" label="Success" checked></uix-switch>
 *   <uix-switch variant="warning" label="Warning" checked></uix-switch>
 *   <uix-switch variant="error" label="Error" checked></uix-switch>
 * </div>
 * ```
 *
 * @example Disabled State
 * ```html
 * <div style="display: flex; gap: 1rem;">
 *   <uix-switch label="Disabled off" disabled></uix-switch>
 *   <uix-switch label="Disabled on" disabled checked></uix-switch>
 * </div>
 * ```
 *
 * @example With Event Handling
 * ```js
 * html`<uix-switch
 *   label="Dark mode"
 *   @change=${(e) => console.log('Dark mode:', e.detail.checked)}
 * ></uix-switch>`
 * ```
 *
 * @example In a Form
 * ```html
 * <form>
 *   <uix-switch name="newsletter" value="yes" label="Subscribe to newsletter"></uix-switch>
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
