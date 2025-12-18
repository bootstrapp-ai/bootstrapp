import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-progress-bar",
  properties: {
    value: T.number(0),
    max: T.number(100),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "success", "danger", "warning", "info"],
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    showLabel: T.boolean(false),
    striped: T.boolean(false),
    animated: T.boolean(false),
  },
  style: true,

  getPercentage() {
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  },

  render() {
    const percentage = this.getPercentage();

    return html`
      <div part="container" class="progress-container">
        <div
          part="bar"
          class="progress-bar"
          role="progressbar"
          aria-valuenow="${this.value}"
          aria-valuemin="0"
          aria-valuemax="${this.max}"
        >
          <div
            part="fill"
            class="progress-fill"
            style="width: ${percentage}%"
          >
            ${
              this.showLabel
                ? html`<span part="label" class="progress-label"
                  >${Math.round(percentage)}%</span
                >`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  },
};

/**
 * Progress Bar Component
 *
 * @component
 * @category feedback
 * @tag uix-progress-bar
 *
 * Visual progress indicator showing completion percentage
 *
 * @example
 * // Basic progress bar
 * ```html
 * <uix-progress-bar value="50"></uix-progress-bar>
 * ```
 *
 * @example
 * // With label
 * ```html
 * <uix-progress-bar value="75" showLabel></uix-progress-bar>
 * ```
 *
 * @example
 * // With size variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-progress-bar value="60" size="sm" showLabel></uix-progress-bar>
 *   <uix-progress-bar value="60" size="md" showLabel></uix-progress-bar>
 *   <uix-progress-bar value="60" size="lg" showLabel></uix-progress-bar>
 * </div>
 * ```
 *
 * @example
 * // With variants
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-progress-bar value="25" variant="default"></uix-progress-bar>
 *   <uix-progress-bar value="50" variant="success"></uix-progress-bar>
 *   <uix-progress-bar value="75" variant="warning"></uix-progress-bar>
 *   <uix-progress-bar value="90" variant="danger"></uix-progress-bar>
 *   <uix-progress-bar value="100" variant="info"></uix-progress-bar>
 * </div>
 * ```
 *
 * @example
 * // With striped and animated
 * ```html
 * <div style="display: flex; flex-direction: column; gap: 1rem;">
 *   <uix-progress-bar value="60" striped></uix-progress-bar>
 *   <uix-progress-bar value="60" striped animated></uix-progress-bar>
 * </div>
 * ```
 *
 * @example
 * // Dynamic progress with binding
 * ```js
 * html`<uix-progress-bar
 *   .value=${this.progress}
 *   variant="success"
 *   showLabel
 *   animated
 * ></uix-progress-bar>`
 * ```
 *
 * @example
 * // Complete example with all features
 * ```html
 * <uix-progress-bar
 *   value="85"
 *   max="100"
 *   variant="success"
 *   size="lg"
 *   showLabel
 *   striped
 *   animated
 * ></uix-progress-bar>
 * ```
 */
