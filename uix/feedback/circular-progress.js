import T from "/$app/types/index.js";
import { html, svg } from "/npm/lit-html";

export default {
  tag: "uix-circular-progress",
  properties: {
    value: T.number({ defaultValue: 0 }), // 0-100
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"],
    }),
    variant: T.string({
      defaultValue: "primary",
      enum: ["primary", "secondary", "success", "warning", "error"],
    }),
    thickness: T.number({ defaultValue: 4 }),
    indeterminate: T.boolean(false),
    showValue: T.boolean(false),
  },
  style: true,
  shadow: false,

  _getSizeValue() {
    const sizes = {
      xs: 24,
      sm: 32,
      md: 48,
      lg: 64,
      xl: 96,
    };
    return sizes[this.size] || sizes.md;
  },

  render() {
    const size = this._getSizeValue();
    const center = size / 2;
    const radius = center - this.thickness / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.value / 100) * circumference;

    return html`
      <div class="circular-progress ${this.indeterminate ? "indeterminate" : ""}">
        <svg
          class="circular-progress-svg"
          width="${size}"
          height="${size}"
          viewBox="0 0 ${size} ${size}"
        >
          <!-- Background circle -->
          <circle
            class="circular-progress-track"
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="none"
            stroke-width="${this.thickness}"
          ></circle>

          <!-- Progress circle -->
          <circle
            class="circular-progress-indicator circular-progress-${this.variant}"
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="none"
            stroke-width="${this.thickness}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${this.indeterminate ? circumference * 0.75 : offset}"
            stroke-linecap="round"
            transform="rotate(-90 ${center} ${center})"
          ></circle>
        </svg>

        ${
          this.showValue && !this.indeterminate
            ? html`
              <div class="circular-progress-label">
                <span>${Math.round(this.value)}%</span>
              </div>
            `
            : ""
        }
      </div>
    `;
  },
};

/**
 * Circular Progress Component
 *
 * @component
 * @category feedback
 * @tag uix-circular-progress
 *
 * A circular progress indicator showing completion percentage or indeterminate loading state.
 *
 * @example
 * // Basic usage
 * ```html
 * <uix-circular-progress value="75"></uix-circular-progress>
 * ```
 *
 * @example
 * // With value label
 * ```html
 * <uix-circular-progress value="65" show-value></uix-circular-progress>
 * ```
 *
 * @example
 * // Indeterminate (loading)
 * ```html
 * <uix-circular-progress indeterminate></uix-circular-progress>
 * ```
 *
 * @example
 * // Size variants
 * ```html
 * <div style="display: flex; gap: 1rem; align-items: center;">
 *   <uix-circular-progress size="xs" value="50"></uix-circular-progress>
 *   <uix-circular-progress size="sm" value="60"></uix-circular-progress>
 *   <uix-circular-progress size="md" value="70"></uix-circular-progress>
 *   <uix-circular-progress size="lg" value="80"></uix-circular-progress>
 *   <uix-circular-progress size="xl" value="90"></uix-circular-progress>
 * </div>
 * ```
 *
 * @example
 * // Color variants
 * ```html
 * <div style="display: flex; gap: 1rem; align-items: center;">
 *   <uix-circular-progress variant="primary" value="60" show-value></uix-circular-progress>
 *   <uix-circular-progress variant="secondary" value="70" show-value></uix-circular-progress>
 *   <uix-circular-progress variant="success" value="80" show-value></uix-circular-progress>
 *   <uix-circular-progress variant="warning" value="50" show-value></uix-circular-progress>
 *   <uix-circular-progress variant="error" value="30" show-value></uix-circular-progress>
 * </div>
 * ```
 *
 * @example
 * // Different thicknesses
 * ```html
 * <div style="display: flex; gap: 1rem; align-items: center;">
 *   <uix-circular-progress value="75" thickness="2"></uix-circular-progress>
 *   <uix-circular-progress value="75" thickness="4"></uix-circular-progress>
 *   <uix-circular-progress value="75" thickness="6"></uix-circular-progress>
 *   <uix-circular-progress value="75" thickness="8"></uix-circular-progress>
 * </div>
 * ```
 *
 * @example
 * // Progress states
 * ```html
 * <div style="display: flex; gap: 2rem; align-items: center;">
 *   <div style="text-align: center;">
 *     <uix-circular-progress value="0" show-value></uix-circular-progress>
 *     <p>Not started</p>
 *   </div>
 *   <div style="text-align: center;">
 *     <uix-circular-progress value="45" show-value variant="warning"></uix-circular-progress>
 *     <p>In progress</p>
 *   </div>
 *   <div style="text-align: center;">
 *     <uix-circular-progress value="100" show-value variant="success"></uix-circular-progress>
 *     <p>Complete</p>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // File upload progress
 * ```html
 * <div style="text-align: center; padding: 2rem;">
 *   <uix-circular-progress
 *     size="lg"
 *     value="73"
 *     show-value
 *     variant="primary"
 *   ></uix-circular-progress>
 *   <p style="margin-top: 1rem;">Uploading file...</p>
 * </div>
 * ```
 *
 * @example
 * // Multiple progress indicators
 * ```html
 * <div style="display: flex; gap: 2rem; padding: 1rem;">
 *   <div style="flex: 1; text-align: center;">
 *     <uix-circular-progress value="85" show-value variant="success"></uix-circular-progress>
 *     <p>CPU Usage</p>
 *   </div>
 *   <div style="flex: 1; text-align: center;">
 *     <uix-circular-progress value="62" show-value variant="primary"></uix-circular-progress>
 *     <p>Memory</p>
 *   </div>
 *   <div style="flex: 1; text-align: center;">
 *     <uix-circular-progress value="41" show-value variant="warning"></uix-circular-progress>
 *     <p>Disk</p>
 *   </div>
 * </div>
 * ```
 *
 * @example
 * // With dynamic value
 * ```js
 * html`
 *   <uix-circular-progress
 *     .value=${this.progress}
 *     show-value
 *     size="lg"
 *   ></uix-circular-progress>
 *
 *   <uix-button @click=${() => this.progress = Math.min(100, this.progress + 10)}>
 *     Increase
 *   </uix-button>
 *   <uix-button @click=${() => this.progress = Math.max(0, this.progress - 10)}>
 *     Decrease
 *   </uix-button>
 * `
 * ```
 *
 * @example
 * // Loading spinner
 * ```html
 * <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
 *   <uix-circular-progress indeterminate size="lg"></uix-circular-progress>
 *   <p>Loading data...</p>
 * </div>
 * ```
 */
