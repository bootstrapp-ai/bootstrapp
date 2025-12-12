import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-feature-grid",
  properties: {
    variant: T.string({
      defaultValue: "grid",
      enum: ["grid", "list", "cards", "horizontal"],
    }),
    columns: T.number(3),
    heading: T.string(""),
    subheading: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="section" class="feature-grid-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="feature-grid-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        <div part="container" class="feature-container">
          <slot></slot>
        </div>
      </section>
    `;
  },
};

/**
 * Feature Grid Component
 *
 * @component
 * @category layout
 * @tag uix-feature-grid
 *
 * A section component for displaying product features in a grid or list layout.
 * Each feature includes an icon, title, and description.
 *
 * @slot default - Feature items (use divs or custom elements)
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part container - The features container
 *
 * @example Basic Feature Grid
 * ```html
 * <uix-feature-grid heading="Why Choose Us" subheading="Everything you need" columns="3">
 *   <div>
 *     <uix-icon name="zap" size="lg"></uix-icon>
 *     <h3>Lightning Fast</h3>
 *     <p>Optimized for speed and performance</p>
 *   </div>
 *   <div>
 *     <uix-icon name="shield" size="lg"></uix-icon>
 *     <h3>Secure by Default</h3>
 *     <p>Enterprise-grade security built in</p>
 *   </div>
 *   <div>
 *     <uix-icon name="users" size="lg"></uix-icon>
 *     <h3>Team Collaboration</h3>
 *     <p>Work together seamlessly</p>
 *   </div>
 * </uix-feature-grid>
 * ```
 *
 * @example List Variant
 * ```html
 * <uix-feature-grid
 *   variant="list"
 *   heading="Features"
 *   .features=${this.featureList}
 * ></uix-feature-grid>
 * ```
 *
 * @example Cards Variant
 * ```html
 * <uix-feature-grid
 *   variant="cards"
 *   heading="Key Features"
 *   columns="3"
 *   .features=${[
 *     {
 *       icon: 'code',
 *       title: 'Developer Friendly',
 *       description: 'Clean APIs and excellent documentation'
 *     },
 *     {
 *       icon: 'smartphone',
 *       title: 'Mobile First',
 *       description: 'Responsive design out of the box'
 *     },
 *     {
 *       icon: 'globe',
 *       title: 'Global CDN',
 *       description: 'Fast delivery worldwide'
 *     }
 *   ]}
 * ></uix-feature-grid>
 * ```
 *
 * @example Horizontal Variant
 * ```html
 * <uix-feature-grid
 *   variant="horizontal"
 *   heading="Core Benefits"
 *   .features=${this.coreBenefits}
 * ></uix-feature-grid>
 * ```
 *
 * @example With Icon Variants
 * ```html
 * <uix-feature-grid
 *   heading="Platform Features"
 *   columns="4"
 *   .features=${[
 *     {
 *       icon: 'circle-check',
 *       iconVariant: 'success',
 *       title: 'Easy Setup',
 *       description: 'Get started in minutes'
 *     },
 *     {
 *       icon: 'lock',
 *       iconVariant: 'primary',
 *       title: 'Privacy First',
 *       description: 'Your data stays private'
 *     },
 *     {
 *       icon: 'trending-up',
 *       iconVariant: 'warning',
 *       title: 'Analytics',
 *       description: 'Track your growth'
 *     },
 *     {
 *       icon: 'headphones',
 *       iconVariant: 'secondary',
 *       title: '24/7 Support',
 *       description: 'We are here to help'
 *     }
 *   ]}
 * ></uix-feature-grid>
 * ```
 *
 * @example Two Column Layout
 * ```html
 * <uix-feature-grid
 *   columns="2"
 *   heading="Main Features"
 *   icon-size="xl"
 *   .features=${this.mainFeatures}
 * ></uix-feature-grid>
 * ```
 *
 * @example Using Slots
 * ```html
 * <uix-feature-grid heading="Custom Features">
 *   <div class="custom-feature">
 *     <uix-icon name="star" size="lg"></uix-icon>
 *     <h3>Custom Feature 1</h3>
 *     <p>Custom description here</p>
 *   </div>
 *   <div class="custom-feature">
 *     <uix-icon name="heart" size="lg"></uix-icon>
 *     <h3>Custom Feature 2</h3>
 *     <p>Another custom description</p>
 *   </div>
 * </uix-feature-grid>
 * ```
 *
 * @example Different Icon Sizes
 * ```html
 * <uix-feature-grid
 *   heading="Small Icons"
 *   icon-size="sm"
 *   columns="4"
 *   .features=${this.features}
 * ></uix-feature-grid>
 *
 * <uix-feature-grid
 *   heading="Large Icons"
 *   icon-size="xl"
 *   columns="2"
 *   .features=${this.features}
 * ></uix-feature-grid>
 * ```
 *
 * @example Comprehensive Feature Set
 * ```html
 * <uix-feature-grid
 *   variant="cards"
 *   heading="All Features"
 *   subheading="Everything you need in one platform"
 *   columns="3"
 *   .features=${[
 *     {
 *       icon: 'database',
 *       title: 'Data Storage',
 *       description: 'Unlimited storage for all your data'
 *     },
 *     {
 *       icon: 'cloud',
 *       title: 'Cloud Sync',
 *       description: 'Automatic synchronization across devices'
 *     },
 *     {
 *       icon: 'share-2',
 *       title: 'Easy Sharing',
 *       description: 'Share files with anyone, anytime'
 *     },
 *     {
 *       icon: 'bell',
 *       title: 'Notifications',
 *       description: 'Stay updated with real-time alerts'
 *     },
 *     {
 *       icon: 'search',
 *       title: 'Smart Search',
 *       description: 'Find anything instantly'
 *     },
 *     {
 *       icon: 'settings',
 *       title: 'Customizable',
 *       description: 'Make it work your way'
 *     }
 *   ]}
 * ></uix-feature-grid>
 * ```
 */
