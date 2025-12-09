import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  extends: "uix-container",
  i18n: {},
  style: true,
  shadow: true,
  properties: {
    borderWidth: T.string({
      defaultValue: "1",
      enum: ["none", "1", "2", "3"],
    }),
    borderStyle: T.string({
      defaultValue: "solid",
      enum: ["solid", "dashed", "dotted"],
    }),
    shadow: T.string({
      defaultValue: "none",
      enum: ["none", "sm", "md", "lg", "brutalist"],
    }),
    hover: T.boolean({
      defaultValue: false,
    }),
    gap: T.string({
      defaultValue: "md",
      enum: ["none", "xs", "sm", "md", "lg", "xl"],
    }),
  },
  render() {
    return html`
      <slot name="header" part="header"></slot>
      <slot part="body"><slot></slot></slot>
      
      <slot part="footer" name="footer"></slot>
    `;
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Card Component
 *
 * @component
 * @category layout
 * @tag uix-card
 *
 * A versatile container component for displaying grouped content with optional
 * header and footer sections. Supports different variants and padding options.
 *
 * @slot header - Optional header content
 * @slot - Default slot for card body content
 * @slot footer - Optional footer content
 * @part header - The card header container
 * @part body - The card body container
 * @part footer - The card footer container
 *
 * @example Basic Card
 * ```html
 * <uix-card>
 *   <h3 slot="header">Card Title</h3>
 *   <p>Card content goes here...</p>
 * </uix-card>
 * ```
 *
 * @example Card with Footer
 * ```html
 * <uix-card>
 *   <header slot="header"><h3 class="flex">User Profile</h3></header>
 *   <article>
 *     <p>John Doe</p>
 *     <p>Software Engineer</p>
 *   </article>
 *   <footer slot="footer">
 *     <uix-button primary>Edit</uix-button>
 *     <uix-button>Cancel</uix-button>
 *   </footer>
 * </uix-card>
 * ```
 *
 * @example Card Variants
 * ```html
 * <div class="flex flex-row gap-2">
 *  <uix-card variant="default">Default Card</uix-card>
 *  <uix-card variant="elevated">Elevated Card</uix-card>
 * </div>
 * ```
 *
 * @example Card Padding Options
 * ```html
 * <div class="flex flex-row gap-2">
 *  <uix-card padding="none">No Padding</uix-card>
 *  <uix-card padding="sm">Small Padding</uix-card>
 *  <uix-card padding="md">Medium Padding</uix-card>
 *  <uix-card padding="lg">Large Padding</uix-card>
 * </div>
 * ```
 */
