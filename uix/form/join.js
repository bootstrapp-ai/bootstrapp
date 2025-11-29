import T from "@bootstrapp/types";

export default {
  tag: "uix-join",
  properties: {
    orientation: T.string({
      defaultValue: "horizontal",
      enum: ["horizontal", "vertical"],
    }),
  },
  style: true,
};

/**
 * Join Component
 *
 * @component
 * @category form
 * @tag uix-join
 *
 * Groups elements together by joining their borders
 *
 * @example
 * // Button group
 * ```html
 * <uix-join>
 *   <uix-button>Button 1</uix-button>
 *   <uix-button>Button 2</uix-button>
 *   <uix-button>Button 3</uix-button>
 * </uix-join>
 * ```
 *
 * @example
 * // Input with button
 * ```html
 * <uix-join>
 *   <uix-input placeholder="Search..."></uix-input>
 *   <uix-button variant="primary">Search</uix-button>
 * </uix-join>
 * ```
 *
 * @example
 * // Vertical orientation
 * ```html
 * <uix-join orientation="vertical">
 *   <uix-button>Top</uix-button>
 *   <uix-button>Middle</uix-button>
 *   <uix-button>Bottom</uix-button>
 * </uix-join>
 * ```
 *
 * @example
 * // Mixed components
 * ```html
 * <uix-join>
 *   <uix-select options='["Option 1", "Option 2"]'></uix-select>
 *   <uix-input placeholder="Value"></uix-input>
 *   <uix-button variant="primary">Submit</uix-button>
 * </uix-join>
 * ```
 */
