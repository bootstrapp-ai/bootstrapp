/**
 * UIX Container Component
 * Generic container component with padding, overflow, and variant support
 */

import T from "/$app/types/index.js";

export default {
  style: true,
  properties: {
    padding: T.string({
      defaultValue: "md",
      enum: ["none", "sm", "md", "lg"],
    }),
    overflow: T.string({
      enum: ["visible", "hidden", "auto", "scroll"],
    }),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "filled", "outlined", "elevated"],
    }),
  },
};
