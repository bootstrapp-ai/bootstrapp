import T from "@bootstrapp/types";
import { html, nothing } from "lit";

export default {
  tag: "uix-stat",
  properties: {
    title: T.string(""),
    value: T.any(""),
    desc: T.string(""),
    size: T.string({
      defaultValue: "md",
      enum: ["sm", "md", "lg"],
    }),
    variant: T.string({
      defaultValue: "default",
      enum: [
        "default",
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
      ],
    }),
    centered: T.boolean(false),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <div part="figure">
        <slot name="figure"></slot>
      </div>
      <div part="body">
        ${this.title ? html`<div part="title">${this.title}</div>` : nothing}
        ${this.value !== "" ? html`<div part="value">${this.value}</div>` : nothing}
        <div part="desc">
          ${this.desc ? this.desc : html`<slot></slot>`}
        </div>
      </div>
    `;
  },
};

/**
 * Stat Component
 *
 * @component
 * @category display
 * @tag uix-stat
 *
 * Display statistics with title, value, and description in a clean format.
 * Supports icons/figures and works great when grouped with uix-join.
 *
 * @slot default - Description content below the value
 * @slot figure - Icon, avatar, or image to display alongside the stat
 *
 * @part figure - Container for the figure slot
 * @part body - Container for title, value, and description
 * @part title - The stat title/label
 * @part value - The main stat value (hero element)
 * @part desc - Description text below the value
 *
 * @example
 * // Basic stat
 * ```html
 * <uix-stat title="Total Users" value="1,234"></uix-stat>
 * ```
 *
 * @example
 * // With description
 * ```html
 * <uix-stat title="Downloads" value="31K" desc="Jan 1st - Feb 1st"></uix-stat>
 * ```
 *
 * @example
 * // With icon figure
 * ```html
 * <uix-stat title="Total Likes" value="25.6K" variant="primary">
 *   <uix-icon slot="figure" name="heart" size="lg"></uix-icon>
 *   21% more than last month
 * </uix-stat>
 * ```
 *
 * @example
 * // With colored variants
 * ```html
 * <uix-stat title="Active" value="85" variant="success">↑ 12%</uix-stat>
 * <uix-stat title="Errors" value="3" variant="danger">↓ 5%</uix-stat>
 * ```
 *
 * @example
 * // Grouped stats with uix-join
 * ```html
 * <uix-join>
 *   <uix-stat title="Downloads" value="31K">Jan 1st - Feb 1st</uix-stat>
 *   <uix-stat title="New Users" value="4,200">↑ 400 (22%)</uix-stat>
 *   <uix-stat title="New Registers" value="1,200">↓ 90 (14%)</uix-stat>
 * </uix-join>
 * ```
 *
 * @example
 * // Stats with icons grouped
 * ```html
 * <uix-join>
 *   <uix-stat title="Total Likes" value="25.6K" variant="primary">
 *     <uix-icon slot="figure" name="heart"></uix-icon>
 *     21% more than last month
 *   </uix-stat>
 *   <uix-stat title="Page Views" value="2.6M" variant="secondary">
 *     <uix-icon slot="figure" name="zap"></uix-icon>
 *     21% more than last month
 *   </uix-stat>
 * </uix-join>
 * ```
 *
 * @example
 * // Centered stats
 * ```html
 * <uix-join>
 *   <uix-stat title="Passed" value="85" variant="success" centered></uix-stat>
 *   <uix-stat title="Failed" value="3" variant="danger" centered></uix-stat>
 *   <uix-stat title="Pending" value="12" variant="warning" centered></uix-stat>
 * </uix-join>
 * ```
 */
