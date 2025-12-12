import T from "/node_modules/@bootstrapp/types/index.js";
import { settings } from "/node_modules/@bootstrapp/view/index.js";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";

const Icons = new Map();
export default {
  tag: "uix-icon",
  style: true,
  static: { Icons },
  properties: {
    name: T.string(),
    svg: T.string(),
    solid: T.boolean(),
    size: T.string("xs"),
    color: T.string({
      enum: [
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "inverse",
      ],
    }),
  },
  async getIcon(name) {
    if (Icons.has(name)) this.svg = Icons.get(name);
    else {
      try {
        const response = await fetch(`${settings.iconFontFamily}/${name}.svg`);
        if (response.ok) {
          const svgElement = await response.text();
          Icons.set(name, svgElement);
          this.svg = svgElement;
        } else {
          console.error(`Failed to fetch icon: ${name}`);
        }
      } catch (error) {
        console.error(`Error fetching icon: ${name}`, error);
      }
    }
  },
  willUpdate({ changedProps }) {
    if (changedProps.has("name")) this.getIcon(this.name);
  },
  connected() {
    this.getIcon(this.name);
  },
  render() {
    return !this.svg ? null : unsafeHTML(this.svg);
  },
};

/**
 * Copyright (c) Alan Carlos Meira Leal
 *
 * Icon Component
 *
 * @component
 * @category media
 * @tag uix-icon
 *
 * Displays an SVG icon fetched dynamically from the configured icon font family.
 * Supports various sizes, semantic colors, and solid/outline styles.
 *
 * @property {string} name - The name of the icon to display (e.g., "home", "user", "settings")
 * @property {string} size - The size of the icon (xs, sm, md, lg, xl, 2xl, 3xl)
 * @property {string} color - Semantic color (primary, secondary, success, danger, warning, info, inverse)
 * @property {boolean} solid - Whether to use the solid/filled version of the icon style
 *
 * @example Basic Usage
 * ```html
 * <uix-icon name="house"></uix-icon>
 * ```
 *
 * @example All Sizes
 * ```html
 * * <uix-icon name="star" size="xs"></uix-icon>
 *
 * * <uix-icon name="star" size="sm"></uix-icon>
 *
 * * <uix-icon name="star" size="md"></uix-icon>
 *
 * * <uix-icon name="star" size="lg"></uix-icon>
 *
 * * <uix-icon name="star" size="xl"></uix-icon>
 *
 * * <uix-icon name="star" size="2xl"></uix-icon>
 *
 * * <uix-icon name="star" size="3xl"></uix-icon>
 *
 * * <uix-icon name="star" size="4xl"></uix-icon>
 * ```
 *
 * @example With Semantic Colors
 * ```html
 * <uix-icon name="circle-check" color="success" size="lg"></uix-icon>
 * <uix-icon name="exclamation-circle" color="danger" size="lg"></uix-icon>
 * <uix-icon name="info-circle" color="info" size="lg"></uix-icon>
 * ```
 *
 * @example Solid Style
 * ```html
 * * <uix-icon name="heart" size="xl" color="danger"></uix-icon>
 *
 * * <uix-icon name="heart" size="xl" color="danger" solid></uix-icon>
 * ```
 */
