import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-testimonial-section",
  properties: {
    variant: T.string({
      defaultValue: "grid",
      enum: ["grid", "carousel", "masonry", "single"],
    }),
    columns: T.number(3),
    autoplay: T.boolean(false),
    heading: T.string(""),
    subheading: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="section" class="testimonial-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="testimonial-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        <div part="container" class="testimonial-container">
          <slot></slot>
        </div>

        ${
          this.variant === "carousel"
            ? html`
              <div part="controls" class="carousel-controls">
                <button part="prev" class="carousel-button prev" aria-label="Previous"></button>
                <button part="next" class="carousel-button next" aria-label="Next"></button>
              </div>
            `
            : ""
        }
      </section>
    `;
  },
};

/**
 * Testimonial Section Component
 *
 * @component
 * @category layout
 * @tag uix-testimonial-section
 *
 * A section component for displaying multiple customer testimonials in various
 * layouts including grid, carousel, and masonry.
 *
 * @slot default - Place uix-testimonial-card elements here
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part container - The testimonials container
 * @part card - Individual testimonial card
 * @part controls - Carousel controls (carousel variant)
 * @part prev - Previous button (carousel variant)
 * @part next - Next button (carousel variant)
 *
 * @example Basic Grid Layout
 * ```html
 * <uix-testimonial-section
 * heading="What Our Customers Say"
 * subheading="Join thousands of satisfied users"
 * columns="3"
 * >
 * <uix-testimonial-card name="Sarah Johnson" role="CEO" company="TechCorp">
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * <blockquote slot="quote">Amazing product that transformed our workflow!</blockquote>
 * </uix-testimonial-card>
 *
 * <uix-testimonial-card name="Michael Chen" role="Product Manager" company="StartupXYZ">
 * <uix-avatar slot="avatar" src="/avatars/michael.jpg"></uix-avatar>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * <blockquote slot="quote">Best investment we made this year.</blockquote>
 * </uix-testimonial-card>
 *
 * <uix-testimonial-card name="Emily Rodriguez" role="Designer" company="CreativeStudio">
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * <blockquote slot="quote">Beautiful and easy to use.</blockquote>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example Carousel Variant
 * ```html
 * <uix-testimonial-section variant="carousel" heading="Customer Stories">
 * <uix-testimonial-card name="User 1" role="CEO">
 * <blockquote slot="quote">We love this product!</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="User 2" role="CTO">
 * <blockquote slot="quote">Highly scalable and robust.</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="User 3" role="Designer">
 * <blockquote slot="quote">Pixel perfect designs every time.</blockquote>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example Masonry Layout
 * ```html
 * <uix-testimonial-section variant="masonry" columns="4">
 * <!-- Add multiple cards of varying content lengths here -->
 * <uix-testimonial-card name="User A">
 * <blockquote slot="quote">Short quote.</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="User B">
 * <blockquote slot="quote">
 * A much longer quote that will take up more vertical space,
 * demonstrating the masonry layout capabilities effectively.
 * </blockquote>
 * </uix-testimonial-card>
 * <!-- ... more cards -->
 * </uix-testimonial-section>
 * ```
 *
 * @example Single Testimonial (Featured)
 * ```html
 * <uix-testimonial-section variant="single">
 * <uix-testimonial-card
 * variant="detailed"
 * name="John Smith"
 * role="CTO"
 * company="Enterprise Inc."
 * >
 * <uix-avatar slot="avatar" src="/john.jpg"></uix-avatar>
 * <blockquote slot="quote">
 * This platform has completely revolutionized how we handle our operations.
 * </blockquote>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example Two Column Layout
 * ```html
 * <uix-testimonial-section columns="2" heading="Featured Reviews">
 * <uix-testimonial-card name="Reviewer 1">
 * <blockquote slot="quote">Excellent service.</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="Reviewer 2">
 * <blockquote slot="quote">Would buy again.</blockquote>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example With Autoplay Carousel
 * ```html
 * <uix-testimonial-section variant="carousel" autoplay heading="Success Stories">
 * <uix-testimonial-card name="Story 1">
 * <blockquote slot="quote">Success story content...</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="Story 2">
 * <blockquote slot="quote">Another success story...</blockquote>
 * </uix-testimonial-card>
 * <uix-testimonial-card name="Story 3">
 * <blockquote slot="quote">Yet another success story...</blockquote>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example Full Width Single Testimonial
 * ```html
 * <uix-testimonial-section variant="single" heading="Featured Testimonial">
 * <uix-testimonial-card
 * variant="detailed"
 * name="Lisa Anderson"
 * role="Marketing Director"
 * company="BigCorp"
 * >
 * <uix-avatar slot="avatar" src="/lisa.jpg"></uix-avatar>
 * <blockquote slot="quote">
 * We have seen a 200% increase in productivity since adopting this solution.
 * The ROI was immediate and the team loves using it daily.
 * </blockquote>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 *
 * @example Mixed Testimonial Variants
 * ```html
 * <uix-testimonial-section heading="Customer Voices" columns="3">
 * <uix-testimonial-card variant="compact" name="User 1">
 * <blockquote slot="quote">Short review</blockquote>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * </uix-testimonial-card>
 *
 * <uix-testimonial-card variant="detailed" name="User 2" role="Manager" company="Company A">
 * <blockquote slot="quote">Detailed review with more information</blockquote>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * </uix-testimonial-card>
 *
 * <uix-testimonial-card name="User 3" role="Developer">
 * <blockquote slot="quote">Standard review</blockquote>
 * <div slot="rating">
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * <uix-icon name="star-fill"></uix-icon>
 * </div>
 * </uix-testimonial-card>
 * </uix-testimonial-section>
 * ```
 */
