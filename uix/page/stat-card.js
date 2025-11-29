import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-stat-card",
  properties: {
    label: T.string(""),
    value: T.string(""),
    change: T.string(""),
    changeVariant: T.string({
      defaultValue: "neutral",
      enum: ["success", "danger", "warning", "neutral"],
    }),
    icon: T.string(""),
    shadow: T.string({
      defaultValue: "md",
      enum: ["", "sm", "md", "lg", "brutalist"],
    }),
    padding: T.string({
      defaultValue: "md",
      enum: ["none", "sm", "md", "lg"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <uix-card
        part="card"
        shadow=${this.shadow}
        padding=${this.padding}
      >
        <uix-flex part="container" direction="column" gap="sm">
          <uix-flex part="header" align="center" justify="space-between">
            <uix-text part="label" size="sm" color="muted">
              ${this.label}
            </uix-text>
            ${
              this.icon
                ? html`
                  <uix-icon
                    part="icon"
                    name=${this.icon}
                    size="sm"
                    color="muted"
                  ></uix-icon>
                `
                : ""
            }
          </uix-flex>

          <uix-flex part="content" align="center" justify="space-between">
            <uix-heading part="value" level="3" weight="bold">
              ${this.value}
            </uix-heading>
            ${
              this.change
                ? html`
                  <uix-badge
                    part="badge"
                    variant=${this.changeVariant}
                    size="sm"
                  >
                    ${this.change}
                  </uix-badge>
                `
                : ""
            }
          </uix-flex>
        </uix-flex>
      </uix-card>
    `;
  },
};

/**
 * Stat Card Component
 *
 * @component
 * @category page
 * @tag uix-stat-card
 *
 * A pre-built card component for displaying statistics with optional
 * change indicators and icons. Perfect for dashboards and analytics views.
 *
 * @property {string} label - The stat label/description
 * @property {string} value - The main stat value to display
 * @property {string} change - Optional change indicator (e.g., "+12%", "-5%")
 * @property {string} changeVariant - Badge variant for change: success, danger, warning, neutral (default: neutral)
 * @property {string} icon - Optional icon name to display
 * @property {string} shadow - Card shadow: sm, md, lg, brutalist (default: md)
 * @property {string} padding - Card padding: none, sm, md, lg (default: md)
 *
 * @part card - The card wrapper
 * @part container - The flex container
 * @part header - The header section with label and icon
 * @part label - The label text
 * @part icon - The icon element
 * @part content - The content section with value and badge
 * @part value - The value heading
 * @part badge - The change badge
 *
 * @example Basic Usage
 * ```html
 * <uix-stat-card
 *   label="Total Users"
 *   value="1,024"
 * ></uix-stat-card>
 * ```
 *
 * @example With Change Indicator
 * ```html
 * <uix-stat-card
 *   label="Revenue"
 *   value="$8,628"
 *   change="+12%"
 *   changeVariant="success"
 * ></uix-stat-card>
 * ```
 *
 * @example With Icon
 * ```html
 * <uix-stat-card
 *   label="Page Views"
 *   value="12.4K"
 *   change="+8%"
 *   changeVariant="success"
 *   icon="eye"
 * ></uix-stat-card>
 * ```
 *
 * @example Dashboard Grid
 * ```html
 * <uix-grid columns="2" gap="md">
 *   <uix-stat-card
 *     label="Total Users"
 *     value="1,024"
 *     change="+12%"
 *     changeVariant="success"
 *     icon="users"
 *   ></uix-stat-card>
 *   <uix-stat-card
 *     label="Tasks Done"
 *     value="89"
 *     change="+5%"
 *     changeVariant="success"
 *     icon="circle-check"
 *   ></uix-stat-card>
 *   <uix-stat-card
 *     label="Page Views"
 *     value="12.4K"
 *     change="+8%"
 *     changeVariant="success"
 *     icon="eye"
 *   ></uix-stat-card>
 *   <uix-stat-card
 *     label="Active Now"
 *     value="573"
 *     change="-3%"
 *     changeVariant="danger"
 *     icon="activity"
 *   ></uix-stat-card>
 * </uix-grid>
 * ```
 */
