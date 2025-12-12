import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-newsletter-section",
  properties: {
    variant: T.string({
      defaultValue: "simple",
      enum: ["simple", "boxed", "inline"],
    }),
    heading: T.string(""),
    subheading: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="section" class="newsletter-section">
        <div part="container" class="newsletter-container">
          ${
            this.heading || this.subheading
              ? html`
                <div part="header" class="newsletter-header">
                  ${
                    this.heading
                      ? html`<h2 part="heading" class="newsletter-heading">${this.heading}</h2>`
                      : html`<slot name="heading"></slot>`
                  }
                  ${
                    this.subheading
                      ? html`<p part="subheading" class="newsletter-subheading">
                        ${this.subheading}
                      </p>`
                      : html`<slot name="subheading"></slot>`
                  }
                </div>
              `
              : ""
          }

          <div part="content" class="newsletter-content">
            <slot></slot>
          </div>
        </div>
      </section>
    `;
  },
};

/**
 * Newsletter Section Component
 *
 * @component
 * @category layout
 * @tag uix-newsletter-section
 *
 * A section component for newsletter subscription layouts. Provides the structural
 * container and headings, allowing full control over the form implementation via slots.
 *
 * @slot default - The form content (inputs, buttons, success messages)
 * @slot heading - Custom heading content
 * @slot subheading - Custom subheading content
 *
 * @part section - The main section container
 * @part container - Inner container
 * @part header - Header section
 * @part heading - Heading element
 * @part subheading - Subheading element
 * @part content - The content container wrapping the slot
 *
 * @example Basic Newsletter
 * ```html
 * <uix-newsletter-section
 * heading="Stay Updated"
 * subheading="Get the latest news and updates delivered to your inbox"
 * >
 * <form style="display: flex; gap: 0.5rem; max-width: 400px; margin: 0 auto;">
 * <uix-input type="email" placeholder="Enter your email" style="flex: 1"></uix-input>
 * <uix-button>Subscribe</uix-button>
 * </form>
 * <p style="text-align: center; font-size: 0.875rem; opacity: 0.7; margin-top: 1rem;">
 * We respect your privacy. Unsubscribe at any time.
 * </p>
 * </uix-newsletter-section>
 * ```
 *
 * @example Boxed Variant
 * ```html
 * <uix-newsletter-section
 * variant="boxed"
 * heading="Join Our Newsletter"
 * subheading="Weekly insights and tips for your business"
 * >
 * <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px; margin: 0 auto;">
 * <uix-input type="email" placeholder="you@example.com"></uix-input>
 * <uix-button variant="primary" style="width: 100%">Sign Up Now</uix-button>
 * </div>
 * </uix-newsletter-section>
 * ```
 *
 * @example Inline Variant
 * ```html
 * <uix-newsletter-section variant="inline" heading="Subscribe">
 * <form style="display: flex; gap: 0.5rem; align-items: center;">
 * <uix-input type="email" placeholder="Your email address"></uix-input>
 * <uix-button>Join</uix-button>
 * </form>
 * </uix-newsletter-section>
 * ```
 *
 * @example Custom Success State
 * ```html
 * <uix-newsletter-section heading="Newsletter Signup">
 * <!-- Example of swapping content based on state in your app -->
 * <div class="success-message" style="text-align: center; color: var(--color-success);">
 * <uix-icon name="circle-check" size="lg" style="margin-bottom: 0.5rem;"></uix-icon>
 * <h3>🎉 Successfully subscribed!</h3>
 * <p>Check your email for confirmation.</p>
 * </div>
 * </uix-newsletter-section>
 * ```
 *
 * @example With Event Handler
 * ```html
 * <uix-newsletter-section heading="Get Updates">
 * <form
 * onsubmit="event.preventDefault(); console.log('Submitting:', this.elements.email.value);"
 * style="display: flex; gap: 0.5rem; justify-content: center;"
 * >
 * <input
 * name="email"
 * type="email"
 * placeholder="email@domain.com"
 * required
 * style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc;"
 * />
 * <button
 * type="submit"
 * style="padding: 0.5rem 1rem; background: black; color: white; border-radius: 4px; border: none; cursor: pointer;"
 * >
 * Subscribe
 * </button>
 * </form>
 * </uix-newsletter-section>
 * ```
 *
 * @example Custom Header with Slot
 * ```html
 * <uix-newsletter-section variant="simple">
 * <h2 slot="heading" style="font-size: 2.5rem; background: linear-gradient(45deg, #f06, #4a90e2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
 * Join <strong>10,000+</strong> subscribers
 * </h2>
 * <p slot="subheading">
 * Get exclusive content, early access, and special offers directly to your inbox.
 * </p>
 * <form style="margin-top: 2rem;">
 * <!-- Form inputs -->
 * </form>
 * </uix-newsletter-section>
 * ```
 */
