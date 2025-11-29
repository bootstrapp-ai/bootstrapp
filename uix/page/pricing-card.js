import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  extends: "uix-card",
  properties: {
    planName: T.string(""),
    price: T.string(""),
    period: T.string("month"),
    currency: T.string("$"),
    featured: T.boolean(false),
    description: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <div part="pricing-card" class="pricing-card">
        ${
          this.featured
            ? html`<div part="badge" class="featured-badge">Most Popular</div>`
            : ""
        }

        <div part="header" class="pricing-header">
          <slot name="header">
            ${this.planName ? html`<h3 part="plan-name">${this.planName}</h3>` : ""}
            ${this.description ? html`<p part="description">${this.description}</p>` : ""}
          </slot>
        </div>

        <div part="price" class="pricing-price">
          <slot name="price">
            <span part="currency" class="currency">${this.currency}</span>
            <span part="amount" class="amount">${this.price}</span>
            ${
              this.period
                ? html`<span part="period" class="period">/ ${this.period}</span>`
                : ""
            }
          </slot>
        </div>

        <div part="features" class="features-list">
          <slot name="features"></slot>
        </div>

        <div part="cta" class="pricing-cta">
          <slot name="cta"></slot>
        </div>

        <div part="footer" class="pricing-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  },
};

/**
 * Pricing Card Component
 *
 * @component
 * @category layout
 * @tag uix-pricing-card
 *
 * A pricing card component for displaying pricing plans and packages.
 * Extends uix-card with pricing-specific features.
 *
 * @slot footer - Additional footer content (terms, links, etc.)
 *
 * @part pricing-card - The main pricing card container
 * @part badge - The featured badge
 * @part header - The header section
 * @part plan-name - The plan name
 * @part description - The plan description
 * @part price - The price container
 * @part currency - The currency symbol
 * @part amount - The price amount
 * @part period - The billing period
 * @part features - The features list
 * @part feature - Individual feature item
 * @part feature-excluded - Excluded feature item
 * @part cta - The CTA button container
 * @part footer - The footer section
 *
 * @example Basic Pricing Card
 * ```html
 * <uix-pricing-card
 *   plan-name="Starter"
 *   price="9"
 *   period="month"
 *   .features=${['10 Projects', '5GB Storage', 'Email Support']}
 * ></uix-pricing-card>
 * ```
 *
 * @example Featured Plan
 * ```html
 * <uix-pricing-card
 *   plan-name="Pro"
 *   price="29"
 *   period="month"
 *   featured
 *   description="Perfect for growing teams"
 *   .features=${[
 *     'Unlimited Projects',
 *     '50GB Storage',
 *     'Priority Support',
 *     'Advanced Analytics'
 *   ]}
 *   cta-text="Start Free Trial"
 * ></uix-pricing-card>
 * ```
 *
 * @example With Excluded Features
 * ```html
 * <uix-pricing-card
 *   plan-name="Free"
 *   price="0"
 *   .features=${[
 *     { text: '3 Projects', included: true },
 *     { text: '1GB Storage', included: true },
 *     { text: 'Community Support', included: true },
 *     { text: 'Advanced Features', included: false },
 *     { text: 'Priority Support', included: false }
 *   ]}
 *   cta-text="Sign Up Free"
 *   cta-variant="secondary"
 * ></uix-pricing-card>
 * ```
 *
 * @example Annual Pricing
 * ```html
 * <uix-pricing-card
 *   plan-name="Business"
 *   price="99"
 *   period="year"
 *   description="Save 20% with annual billing"
 *   .features=${[
 *     'Everything in Pro',
 *     'Custom Domain',
 *     'Dedicated Support',
 *     'SLA Guarantee'
 *   ]}
 * >
 *   <small slot="footer" style="color: var(--color-text-muted);">
 *     Billed annually at $99/year
 *   </small>
 * </uix-pricing-card>
 * ```
 *
 * @example Custom Currency
 * ```html
 * <uix-pricing-card
 *   plan-name="Premium"
 *   price="49"
 *   period="month"
 *   currency="€"
 *   .features=${['All Features', 'White Label', 'API Access']}
 * ></uix-pricing-card>
 * ```
 *
 * @example With Event Handling
 * ```html
 * <uix-pricing-card
 *   plan-name="Enterprise"
 *   price="Custom"
 *   cta-text="Contact Sales"
 *   @cta-click=${(e) => {
 *     console.log('Plan selected:', e.detail);
 *     // Navigate to checkout or contact form
 *   }}
 *   .features=${[
 *     'Unlimited Everything',
 *     'Dedicated Account Manager',
 *     '24/7 Phone Support',
 *     'Custom Integrations'
 *   ]}
 * ></uix-pricing-card>
 * ```
 *
 * @example No Period (One-time price)
 * ```html
 * <uix-pricing-card
 *   plan-name="Lifetime"
 *   price="299"
 *   period=""
 *   description="Pay once, use forever"
 *   .features=${[
 *     'Lifetime Updates',
 *     'All Future Features',
 *     'Priority Support'
 *   ]}
 *   cta-text="Buy Now"
 * ></uix-pricing-card>
 * ```
 *
 * @example Full Example with Footer
 * ```html
 * <uix-pricing-card
 *   plan-name="Professional"
 *   price="79"
 *   period="month"
 *   featured
 *   description="For professional teams"
 *   .features=${[
 *     'Unlimited Projects',
 *     '500GB Storage',
 *     'Advanced Analytics',
 *     'Custom Domains',
 *     'API Access',
 *     'Priority Support'
 *   ]}
 *   cta-text="Start 14-day Trial"
 * >
 *   <div slot="footer" style="text-align: center; margin-top: 1rem;">
 *     <small style="color: var(--color-text-muted);">
 *       No credit card required<br>
 *       Cancel anytime
 *     </small>
 *   </div>
 * </uix-pricing-card>
 * ```
 */
