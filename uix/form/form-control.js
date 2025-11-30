import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-form-control",
  properties: {
    label: T.string(""),
    hint: T.string(""),
    error: T.string(""),
    required: T.boolean(false),
    disabled: T.boolean(false),
    orientation: T.string({
      defaultValue: "vertical",
      enum: ["vertical", "horizontal"],
    }),
    controlId: T.string(""),
  },
  style: true,
  shadow: true,

  connected() {
    // Generate unique ID for label/input association
    this.controlId = `form-control-${Math.random().toString(36).substr(2, 9)}`;

    // Associate label with input
    this._associateLabel();
  },

  updated() {
    this._associateLabel();
  },

  _associateLabel() {
    // Find the input element in the slot
    const input = this.querySelector(
      "input, textarea, select, uix-input, uix-textarea, uix-select, uix-number-input, uix-slider",
    );
    if (input) {
      input.id = this.controlId;
      if (this.disabled) {
        input.disabled = true;
      }
      if (this.required) {
        input.required = true;
      }
    }
  },

  render() {
    return html`
      <div part="container" class="form-control ${this.error ? "has-error" : ""}">
        ${
          this.label
            ? html`
              <label part="label" class="form-control-label" for=${this.controlId}>
                ${this.label}
                ${this.required ? html`<span part="required" class="form-control-required">*</span>` : ""}
              </label>
            `
            : ""
        }

        <div part="input" class="form-control-input">
          <slot></slot>
        </div>

        ${
          this.hint && !this.error
            ? html`<div part="hint" class="form-control-hint">${this.hint}</div>`
            : ""
        }

        ${
          this.error
            ? html`<div part="error" class="form-control-error">${this.error}</div>`
            : ""
        }
      </div>
    `;
  },
};

/**
 * Form Control Component
 *
 * @component
 * @category form
 * @tag uix-form-control
 *
 * A wrapper component for form inputs that provides label, hint, and error message display.
 *
 * @example
 * // Basic usage with label
 * ```html
 * <uix-form-control label="Email">
 *   <uix-input type="email" placeholder="Enter your email"></uix-input>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With required indicator
 * ```html
 * <uix-form-control label="Password" required>
 *   <uix-input type="password" placeholder="Enter password"></uix-input>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With hint text
 * ```html
 * <uix-form-control
 *   label="Username"
 *   hint="Must be 3-20 characters, alphanumeric only"
 * >
 *   <uix-input placeholder="Choose a username"></uix-input>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With error message
 * ```html
 * <uix-form-control
 *   label="Email"
 *   error="Please enter a valid email address"
 * >
 *   <uix-input type="email" value="invalid-email"></uix-input>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With textarea
 * ```html
 * <uix-form-control
 *   label="Bio"
 *   hint="Tell us about yourself"
 * >
 *   <uix-textarea rows="6" placeholder="Your bio..."></uix-textarea>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With select
 * ```html
 * <uix-form-control label="Country" required>
 *   <uix-select>
 *     <option value="">Select a country</option>
 *     <option value="us">United States</option>
 *     <option value="uk">United Kingdom</option>
 *     <option value="ca">Canada</option>
 *   </uix-select>
 * </uix-form-control>
 * ```
 *
 * @example
 * // With checkbox
 * ```html
 * <uix-form-control>
 *   <uix-checkbox>I agree to the terms and conditions</uix-checkbox>
 * </uix-form-control>
 * ```
 *
 * @example
 * // Horizontal layout
 * ```html
 * <uix-form-control label="Newsletter" orientation="horizontal">
 *   <uix-switch></uix-switch>
 * </uix-form-control>
 * ```
 *
 * @example
 * // Disabled state
 * ```html
 * <uix-form-control label="Disabled field" disabled>
 *   <uix-input value="Cannot edit this"></uix-input>
 * </uix-form-control>
 * ```
 *
 * @example
 * // Complete form example
 * ```html
 * <form>
 *   <uix-form-control label="Full Name" required>
 *     <uix-input placeholder="John Doe"></uix-input>
 *   </uix-form-control>
 *
 *   <uix-form-control
 *     label="Email"
 *     hint="We'll never share your email"
 *     required
 *   >
 *     <uix-input type="email" placeholder="john@example.com"></uix-input>
 *   </uix-form-control>
 *
 *   <uix-form-control
 *     label="Age"
 *     error="Must be 18 or older"
 *   >
 *     <uix-number-input min="18" max="120"></uix-number-input>
 *   </uix-form-control>
 *
 *   <uix-button type="submit" variant="primary">Submit</uix-button>
 * </form>
 * ```
 */
