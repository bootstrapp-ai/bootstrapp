import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-stats-section",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "cards"],
    }),
    columns: T.number(4),
    heading: T.string(""),
    subheading: T.string(""),
    centered: T.boolean(false),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="section" class="stats-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="stats-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        <div part="container" class="stats-container">
          <slot></slot>
        </div>
      </section>
    `;
  },
};

/**
 * Stats Section Component
 *
 * @component
 * @category layout
 * @tag uix-stats-section
 *
 * A section component for displaying multiple statistics in a grid layout.
 * Uses uix-stat components for consistent stat display.
 *
 * @slot default - Place uix-stat components here
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part container - The stats container
 *
 * @example Basic Stats Grid
 * ```html
 * <uix-stats-section heading="Our Impact" columns="4">
 * <uix-stat title="Total Users" value="1.2M" desc="Active users worldwide"></uix-stat>
 * <uix-stat title="Downloads" value="5M+" desc="App downloads"></uix-stat>
 * <uix-stat title="Countries" value="150+" desc="Countries served"></uix-stat>
 * <uix-stat title="Satisfaction" value="99%" desc="Customer satisfaction"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example With Icons
 * ```html
 * <uix-stats-section heading="Platform Statistics" subheading="Real-time data" columns="3">
 * <uix-stat title="Revenue" value="$2.4M" desc="Total revenue this year" variant="success">
 * <uix-icon slot="figure" name="trending-up"></uix-icon>
 * </uix-stat>
 * <uix-stat title="Projects" value="1,234" desc="Active projects" variant="primary">
 * <uix-icon slot="figure" name="briefcase"></uix-icon>
 * </uix-stat>
 * <uix-stat title="Team Members" value="48" desc="Full-time employees" variant="secondary">
 * <uix-icon slot="figure" name="users"></uix-icon>
 * </uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Bordered Variant
 * ```html
 * <uix-stats-section variant="bordered" heading="Key Metrics" columns="4">
 * <uix-stat title="Metric A" value="85%"></uix-stat>
 * <uix-stat title="Metric B" value="42"></uix-stat>
 * <uix-stat title="Metric C" value="12k"></uix-stat>
 * <uix-stat title="Metric D" value="3.5"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Cards Variant
 * ```html
 * <uix-stats-section
 * variant="cards"
 * heading="Performance Overview"
 * columns="3"
 * centered
 * >
 * <uix-stat title="Speed" value="0.2s" desc="Average load time"></uix-stat>
 * <uix-stat title="Reliability" value="99.99%" desc="Uptime guarantee"></uix-stat>
 * <uix-stat title="Scale" value="Auto" desc="Elastic scaling"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Two Column Layout
 * ```html
 * <uix-stats-section columns="2" heading="Company Growth" size="lg">
 * <uix-stat
 * title="Year Founded"
 * value="2018"
 * desc="Building the future since day one"
 * ></uix-stat>
 * <uix-stat
 * title="Employees"
 * value="120+"
 * desc="Talented individuals worldwide"
 * ></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Using Slot for Custom Stats
 * ```html
 * <uix-stats-section heading="Custom Statistics" columns="3">
 * <uix-stat title="Custom Stat 1" value="100" desc="Description here"></uix-stat>
 * <uix-stat title="Custom Stat 2" value="200" variant="success">
 * <uix-icon slot="figure" name="circle-check"></uix-icon>
 * <div slot="desc">
 * <span style="color: var(--color-success)">↑ 15%</span> from last month
 * </div>
 * </uix-stat>
 * <uix-stat title="Custom Stat 3" value="300" variant="primary">
 * Custom description content
 * </uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Centered Stats
 * ```html
 * <uix-stats-section
 * heading="Success Metrics"
 * columns="3"
 * centered
 * variant="cards"
 * >
 * <uix-stat title="Uptime" value="99.9%" variant="success"></uix-stat>
 * <uix-stat title="Response Time" value="< 100ms" variant="primary"></uix-stat>
 * <uix-stat title="Support Rating" value="4.9/5" variant="warning"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Large Size Stats
 * ```html
 * <uix-stats-section
 * heading="Big Numbers"
 * columns="3"
 * size="lg"
 * centered
 * >
 * <uix-stat title="Users" value="1M+"></uix-stat>
 * <uix-stat title="Transactions" value="$10B+"></uix-stat>
 * <uix-stat title="Countries" value="195"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Different Variants
 * ```html
 * <uix-stats-section heading="Stats with Trends" columns="4">
 * <uix-stat title="Sales" value="$45K" desc="↑ 12% increase" variant="success"></uix-stat>
 * <uix-stat title="Expenses" value="$12K" desc="↓ 5% decrease" variant="danger"></uix-stat>
 * <uix-stat title="Profit" value="$33K" desc="→ 0% change" variant="warning"></uix-stat>
 * <uix-stat title="ROI" value="275%" desc="↑ 18% increase" variant="primary"></uix-stat>
 * </uix-stats-section>
 * ```
 *
 * @example Minimal Without Heading
 * ```html
 * <uix-stats-section columns="4">
 * <uix-stat title="Quick Stat 1" value="10"></uix-stat>
 * <uix-stat title="Quick Stat 2" value="20"></uix-stat>
 * <uix-stat title="Quick Stat 3" value="30"></uix-stat>
 * <uix-stat title="Quick Stat 4" value="40"></uix-stat>
 * </uix-stats-section>
 * ```
 */
