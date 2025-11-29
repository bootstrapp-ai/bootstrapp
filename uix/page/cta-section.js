import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-cta-section",
  properties: {
    variant: T.string({
      defaultValue: "simple",
      enum: ["simple", "split", "boxed", "banner"],
    }),
    heading: T.string(""),
    subheading: T.string(""),
    backgroundImage: T.string(""),
    backgroundGradient: T.string(""),
    overlay: T.boolean(false),
    overlayOpacity: T.number(0.5),
    align: T.string({
      defaultValue: "center",
      enum: ["left", "center", "right"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    const hasBackground = this.backgroundImage || this.backgroundGradient;
    const backgroundStyle = this.backgroundImage
      ? `background-image: url(${this.backgroundImage});`
      : this.backgroundGradient
        ? `background: ${this.backgroundGradient};`
        : "";

    return html`
      <section
        part="section"
        class="cta-section"
        style=${backgroundStyle}
      >
        ${
          this.overlay && hasBackground
            ? html`
              <div
                part="overlay"
                class="cta-overlay"
                style="opacity: ${this.overlayOpacity}"
              ></div>
            `
            : ""
        }

        <div part="container" class="cta-container">
          <div part="content" class="cta-content">
            ${
              this.heading
                ? html`<h2 part="heading" class="cta-heading">${this.heading}</h2>`
                : html`<slot name="heading"></slot>`
            }
            ${
              this.subheading
                ? html`<p part="subheading" class="cta-subheading">${this.subheading}</p>`
                : html`<slot name="subheading"></slot>`
            }
            <div part="actions" class="cta-actions">
              <slot name="actions"></slot>
            </div>
          </div>

          ${
            this.variant === "split"
              ? html`
                <div part="media" class="cta-media">
                  <slot name="media"></slot>
                </div>
              `
              : ""
          }
        </div>
      </section>
    `;
  },
};

/**
 * CTA Section Component
 *
 * @component
 * @category layout
 * @tag uix-cta-section
 *
 * A call-to-action section component for encouraging user engagement.
 * Supports multiple layouts, backgrounds, and button configurations.
 *
 * @slot heading - Custom heading content
 * @slot subheading - Custom subheading content
 * @slot actions - Custom action buttons
 * @slot media - Media content for split variant
 *
 * @part section - The main section container
 * @part overlay - Background overlay (when enabled)
 * @part container - Inner container
 * @part content - Content wrapper
 * @part heading - Heading element
 * @part subheading - Subheading element
 * @part actions - Actions container
 * @part primary-button - Primary CTA button
 * @part secondary-button - Secondary CTA button
 * @part media - Media container (split variant)
 *
 * @example Simple CTA
 * ```html
 * <uix-cta-section
 *   heading="Ready to Get Started?"
 *   subheading="Join thousands of satisfied customers today"
 *   .primaryCta=${{ text: 'Start Free Trial', variant: 'primary' }}
 *   .secondaryCta=${{ text: 'Learn More', variant: 'outline' }}
 * ></uix-cta-section>
 * ```
 *
 * @example With Background Image
 * ```html
 * <uix-cta-section
 *   heading="Transform Your Business"
 *   subheading="Get started with our platform today"
 *   background-image="/images/cta-bg.jpg"
 *   overlay
 *   overlay-opacity="0.7"
 *   .primaryCta=${{ text: 'Get Started', variant: 'primary' }}
 * ></uix-cta-section>
 * ```
 *
 * @example With Gradient Background
 * ```html
 * <uix-cta-section
 *   heading="Join Our Community"
 *   subheading="Connect with like-minded individuals"
 *   background-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
 *   .primaryCta=${{ text: 'Sign Up Now', variant: 'white' }}
 *   .secondaryCta=${{ text: 'Learn More', variant: 'outline-white' }}
 * ></uix-cta-section>
 * ```
 *
 * @example Split Variant with Media
 * ```html
 * <uix-cta-section
 *   variant="split"
 *   heading="See It In Action"
 *   subheading="Watch how our platform can help your team"
 *   .primaryCta=${{ text: 'Start Free Trial' }}
 *   .secondaryCta=${{ text: 'Schedule Demo' }}
 * >
 *   <img slot="media" src="/images/dashboard.png" alt="Dashboard preview" />
 * </uix-cta-section>
 * ```
 *
 * @example Boxed Variant
 * ```html
 * <uix-cta-section
 *   variant="boxed"
 *   heading="Limited Time Offer"
 *   subheading="Get 50% off your first month"
 *   .primaryCta=${{ text: 'Claim Offer', variant: 'primary' }}
 * ></uix-cta-section>
 * ```
 *
 * @example Banner Variant
 * ```html
 * <uix-cta-section
 *   variant="banner"
 *   heading="🎉 New Feature Launch"
 *   subheading="Check out our latest updates"
 *   align="left"
 *   .primaryCta=${{ text: 'Explore Features', variant: 'primary' }}
 * ></uix-cta-section>
 * ```
 *
 * @example Custom Buttons Using Slots
 * ```html
 * <uix-cta-section
 *   heading="Ready to Scale?"
 *   subheading="Choose the perfect plan for your needs"
 * >
 *   <div slot="actions" style="display: flex; gap: 1rem;">
 *     <uix-button variant="primary" size="lg">Get Started</uix-button>
 *     <uix-button variant="secondary" size="lg">Contact Sales</uix-button>
 *   </div>
 * </uix-cta-section>
 * ```
 *
 * @example With Event Handlers
 * ```html
 * <uix-cta-section
 *   heading="Start Your Journey"
 *   subheading="No credit card required"
 *   .primaryCta=${{ text: 'Try It Free' }}
 *   .secondaryCta=${{ text: 'View Pricing' }}
 *   @primary-click=${(e) => console.log('Primary clicked:', e.detail)}
 *   @secondary-click=${(e) => console.log('Secondary clicked:', e.detail)}
 * ></uix-cta-section>
 * ```
 *
 * @example Left Aligned
 * ```html
 * <uix-cta-section
 *   heading="Boost Your Productivity"
 *   subheading="Tools designed for modern teams"
 *   align="left"
 *   .primaryCta=${{ text: 'Get Started' }}
 * ></uix-cta-section>
 * ```
 *
 * @example Minimal Single Button
 * ```html
 * <uix-cta-section
 *   variant="boxed"
 *   heading="Have Questions?"
 *   subheading="Our team is here to help"
 *   .primaryCta=${{ text: 'Contact Support', variant: 'primary' }}
 * ></uix-cta-section>
 * ```
 */
