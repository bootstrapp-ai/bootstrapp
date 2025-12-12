import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-metric-hero-card",
  properties: {
    label: T.string(""),
    value: T.string(""),
    subtitle: T.string(""),
    gradientFrom: T.string(""),
    gradientTo: T.string(""),
    shadow: T.string({
      defaultValue: "lg",
      enum: ["", "sm", "md", "lg", "brutalist"],
    }),
    padding: T.string({
      defaultValue: "lg",
      enum: ["none", "sm", "md", "lg"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    const cardStyle = this.gradientFrom
      ? `--card-gradient-from: ${this.gradientFrom}; ${this.gradientTo ? `--card-gradient-to: ${this.gradientTo};` : ""}`
      : "";

    return html`
      <uix-card
        part="card"
        shadow=${this.shadow}
        padding=${this.padding}
        style=${cardStyle}
      >
        <uix-flex part="container" direction="column" gap="md">
          ${
            this.label
              ? html`
                <uix-text part="label" size="sm" weight="medium">
                  ${this.label}
                </uix-text>
              `
              : ""
          }

          <uix-flex part="content" direction="column" gap="xs">
            <uix-heading part="value" level="1" weight="bold">
              ${this.value}
            </uix-heading>
            ${
              this.subtitle
                ? html`
                  <uix-text part="subtitle" size="sm">
                    ${this.subtitle}
                  </uix-text>
                `
                : ""
            }
          </uix-flex>

          <slot part="chart" name="chart"></slot>
        </uix-flex>
      </uix-card>
    `;
  },
};

/**
 * Metric Hero Card Component
 *
 * @component
 * @category page
 * @tag uix-metric-hero-card
 *
 * A prominent hero-style card for displaying key metrics with optional
 * gradient backgrounds and chart visualizations. Perfect for dashboard
 * headers and primary KPI displays.
 *
 * @property {string} label - Optional label/category text
 * @property {string} value - The main metric value to display
 * @property {string} subtitle - Optional subtitle/description
 * @property {string} gradientFrom - Starting gradient color
 * @property {string} gradientTo - Ending gradient color (optional, uses gradientFrom if not set)
 * @property {string} shadow - Card shadow: sm, md, lg, brutalist (default: lg)
 * @property {string} padding - Card padding: none, sm, md, lg (default: lg)
 *
 * @slot chart - Optional chart or visualization content
 *
 * @part card - The card wrapper
 * @part container - The flex container
 * @part label - The label text
 * @part content - The content section
 * @part value - The value heading
 * @part subtitle - The subtitle text
 * @part chart - The chart slot container
 *
 * @example Basic Usage
 * ```html
 * <uix-metric-hero-card
 *   value="$8,628"
 *   subtitle="Total Balance"
 * ></uix-metric-hero-card>
 * ```
 *
 * @example With Gradient
 * ```html
 * <uix-metric-hero-card
 *   label="Revenue"
 *   value="$8,628"
 *   subtitle="Total Balance"
 *   gradientFrom="#10b981"
 *   gradientTo="#059669"
 * ></uix-metric-hero-card>
 * ```
 *
 * @example With Chart
 * ```html
 * <uix-metric-hero-card
 *   label="Monthly Sales"
 *   value="$12,450"
 *   subtitle="+15% from last month"
 *   gradientFrom="#8b5cf6"
 *   gradientTo="#7c3aed"
 * >
 *   <div slot="chart">
 *     <uix-flex gap="xs" align="end" style="height: 40px;">
 *       <div style="flex: 1; background: rgba(255,255,255,0.3); height: 60%; border-radius: 2px;"></div>
 *       <div style="flex: 1; background: rgba(255,255,255,0.3); height: 80%; border-radius: 2px;"></div>
 *       <div style="flex: 1; background: rgba(255,255,255,0.3); height: 50%; border-radius: 2px;"></div>
 *       <div style="flex: 1; background: rgba(255,255,255,0.3); height: 90%; border-radius: 2px;"></div>
 *       <div style="flex: 1; background: rgba(255,255,255,0.5); height: 100%; border-radius: 2px;"></div>
 *     </uix-flex>
 *   </div>
 * </uix-metric-hero-card>
 * ```
 *
 * @example Progress Metric
 * ```html
 * <uix-metric-hero-card
 *   value="560"
 *   subtitle="Tasks completed this week"
 *   gradientFrom="#ec4899"
 *   gradientTo="#db2777"
 * >
 *   <div slot="chart">
 *     <uix-flex direction="column" gap="xs">
 *       <uix-flex justify="space-between">
 *         <uix-text size="xs">Progress</uix-text>
 *         <uix-text size="xs">78%</uix-text>
 *       </uix-flex>
 *       <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
 *         <div style="background: rgba(255,255,255,0.8); width: 78%; height: 100%;"></div>
 *       </div>
 *     </uix-flex>
 *   </div>
 * </uix-metric-hero-card>
 * ```
 */
