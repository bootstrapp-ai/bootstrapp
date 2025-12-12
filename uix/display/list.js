/**
 * UIX List Component
 * Container for list items with consistent spacing
 */

import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  properties: {
    spacing: T.string({
      defaultValue: "sm",
      enum: ["none", "xs", "sm", "md", "lg", "xl"],
    }),
    variant: T.string({
      defaultValue: "unordered",
      enum: ["ordered", "unordered", "unstyled"],
    }),
  },

  render() {
    const ListTag = this.variant === "ordered" ? "ol" : "ul";
    return html`<${ListTag} class="uix-list-inner"><slot></slot></${ListTag}>`;
  },
};
