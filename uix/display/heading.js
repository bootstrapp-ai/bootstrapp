/**
 * UIX Heading Component
 * Semantic headings (h1-h6) with consistent styling
 */

import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  properties: {
    level: T.number({ defaultValue: 2, min: 1, max: 6 }),
    size: T.string({
      enum: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"],
    }), // Optional size override
  },

  render() {
    const HeadingTag = `h${this.level}`;
    return html`<${HeadingTag}><slot></slot></${HeadingTag}>`;
  },
};
