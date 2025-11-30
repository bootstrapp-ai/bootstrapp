import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-pricing-table",
  properties: {
    columns: T.number({
      defaultValue: 3,
      enum: [2, 3, 4],
    }),
    variant: T.string({
      defaultValue: "cards",
      enum: ["cards", "table", "minimal"],
    }),
    heading: T.string(""),
    subheading: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="section" class="pricing-table-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="pricing-table-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        <div part="toggle" class="billing-toggle">
          <slot name="toggle"></slot>
        </div>

        <slot name="header"></slot>

        <div part="grid" class="pricing-grid">
          <slot></slot>
        </div>

        <div part="footer" class="pricing-table-footer">
          <slot name="footer"></slot>
        </div>
      </section>
    `;
  },
};

/**
 * Pricing Table Component
 *
 * @component
 * @category layout
 * @tag uix-pricing-table
 *
 * A container component for displaying multiple pricing plans in a grid layout
 * with optional billing period toggle.
 *
 * @slot default - Place uix-pricing-card components here
 * @slot header - Header content (alternative to heading/subheading props)
 * @slot toggle - Billing period toggle component
 * @slot footer - Footer content below the pricing cards
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part toggle - The billing toggle container
 * @part grid - The pricing cards grid
 * @part footer - The footer section
 *
 * @example Basic Pricing Table
 * ```html
 * <uix-pricing-table
 * heading="Choose Your Plan"
 * subheading="Start with a 14-day free trial, no credit card required"
 * >
 * <uix-pricing-card>
 * <h3 slot="name">Starter</h3>
 * <div slot="price">$9<span>/month</span></div>
 * <ul slot="features">
 * <li>10 Projects</li>
 * <li>5GB Storage</li>
 * <li>Email Support</li>
 * </ul>
 * <uix-button slot="cta">Get Started</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card featured>
 * <h3 slot="name">Pro</h3>
 * <div slot="price">$29<span>/month</span></div>
 * <ul slot="features">
 * <li>Unlimited Projects</li>
 * <li>50GB Storage</li>
 * <li>Priority Support</li>
 * </ul>
 * <uix-button slot="cta" variant="primary">Get Started</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card>
 * <h3 slot="name">Enterprise</h3>
 * <div slot="price">Custom</div>
 * <ul slot="features">
 * <li>Everything</li>
 * <li>Dedicated Support</li>
 * <li>SLA</li>
 * </ul>
 * <uix-button slot="cta">Contact Sales</uix-button>
 * </uix-pricing-card>
 * </uix-pricing-table>
 * ```
 *
 * @example With Monthly/Annual Toggle
 * ```html
 * <uix-pricing-table heading="Flexible Pricing">
 * <div slot="toggle" style="display: flex; align-items: center; gap: 1rem;">
 * <span>Monthly</span>
 * <uix-switch></uix-switch>
 * <span>Annual <uix-badge size="sm" variant="success">Save 20%</uix-badge></span>
 * </div>
 *
 * <uix-pricing-card>
 * <h3 slot="name">Basic</h3>
 * <div slot="price">$10<span>/mo</span></div>
 * <ul slot="features">
 * <li>5 Projects</li>
 * <li>10GB Storage</li>
 * </ul>
 * <uix-button slot="cta">Get Started</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card featured>
 * <h3 slot="name">Pro</h3>
 * <div slot="price">$30<span>/mo</span></div>
 * <ul slot="features">
 * <li>Unlimited Projects</li>
 * <li>100GB Storage</li>
 * </ul>
 * <uix-button slot="cta" variant="primary">Get Started</uix-button>
 * </uix-pricing-card>
 * </uix-pricing-table>
 * ```
 *
 * @example Two Column Layout
 * ```html
 * <uix-pricing-table columns="2">
 * <uix-pricing-card>
 * <h3 slot="name">Personal</h3>
 * <div slot="price">$15</div>
 * <p slot="description">For individuals</p>
 * <ul slot="features">
 * <li>Basic features</li>
 * <li>Community support</li>
 * </ul>
 * <uix-button slot="cta">Buy Now</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card featured>
 * <h3 slot="name">Team</h3>
 * <div slot="price">$49</div>
 * <p slot="description">For teams</p>
 * <ul slot="features">
 * <li>Advanced features</li>
 * <li>Priority support</li>
 * </ul>
 * <uix-button slot="cta" variant="primary">Buy Now</uix-button>
 * </uix-pricing-card>
 * </uix-pricing-table>
 * ```
 *
 * @example With Footer
 * ```html
 * <uix-pricing-table>
 * <uix-pricing-card>
 * <h3 slot="name">Standard</h3>
 * <div slot="price">$20</div>
 * <uix-button slot="cta">Select</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card>
 * <h3 slot="name">Premium</h3>
 * <div slot="price">$40</div>
 * <uix-button slot="cta">Select</uix-button>
 * </uix-pricing-card>
 *
 * <div slot="footer" style="text-align: center; margin-top: 2rem;">
 * <p>All plans include:</p>
 * <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;">
 * <div><uix-icon name="check"></uix-icon> Free SSL</div>
 * <div><uix-icon name="check"></uix-icon> 99.9% Uptime</div>
 * <div><uix-icon name="check"></uix-icon> 24/7 Support</div>
 * </div>
 * </div>
 * </uix-pricing-table>
 * ```
 *
 * @example Complex Plans with All Features
 * ```html
 * <uix-pricing-table
 * heading="Choose the Perfect Plan"
 * subheading="Start free, upgrade when you're ready"
 * >
 * <uix-pricing-card>
 * <h3 slot="name">Free</h3>
 * <div slot="price">$0</div>
 * <p slot="description">Perfect to get started</p>
 * <ul slot="features">
 * <li>3 Projects</li>
 * <li>1GB Storage</li>
 * <li>Community Support</li>
 * <li style="opacity: 0.5; text-decoration: line-through">Advanced Features</li>
 * </ul>
 * <uix-button slot="cta" variant="secondary">Start Free</uix-button>
 * </uix-pricing-card>
 *
 * <uix-pricing-card featured>
 * <h3 slot="name">Professional</h3>
 * <div slot="price">$29</div>
 * <p slot="description">For professional use</p>
 * <ul slot="features">
 * <li>Unlimited Projects</li>
 * <li>100GB Storage</li>
 * <li>Priority Email Support</li>
 * <li>Advanced Analytics</li>
 * </ul>
 * <uix-button slot="cta" variant="primary">Start Free Trial</uix-button>
 * <p slot="footer" style="font-size: 0.8em; margin-top: 1em;">No credit card required</p>
 * </uix-pricing-card>
 *
 * <uix-pricing-card>
 * <h3 slot="name">Enterprise</h3>
 * <div slot="price">Custom</div>
 * <p slot="description">For large organizations</p>
 * <ul slot="features">
 * <li>Everything in Pro</li>
 * <li>Unlimited Storage</li>
 * <li>Dedicated Support</li>
 * <li>Custom Integrations</li>
 * </ul>
 * <uix-button slot="cta" variant="primary">Contact Sales</uix-button>
 * </uix-pricing-card>
 * </uix-pricing-table>
 * ```
 */
