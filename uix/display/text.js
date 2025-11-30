/**
 * UIX Text Component
 * Styled text with size, weight, and variant options
 */

import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  style: true,
  properties: {
    size: T.string({
      defaultValue: "base",
      enum: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl"],
    }),
    weight: T.string({
      defaultValue: "normal",
      enum: ["normal", "medium", "semibold", "bold"],
    }),
    color: T.string({
      enum: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "muted",
        "inverse",
      ],
    }),
    muted: T.boolean(false),
    mono: T.boolean(false),
    align: T.string({
      defaultValue: "left",
      enum: ["left", "center", "right"],
    }),
    transform: T.string({
      enum: ["capitalize", "uppercase", "lowercase", "none"],
    }),
    as: T.string({ defaultValue: "span", enum: ["span", "p", "div"] }),
  },
};
