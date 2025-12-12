import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  extends: "uix-card",
  properties: {
    name: T.string(""),
    role: T.string(""),
    company: T.string(""),
    avatar: T.string(""),
    quote: T.string(""),
    rating: T.number(5),
    showRating: T.boolean(true),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "compact", "detailed"],
    }),
  },
  style: true,
  shadow: true,

  render() {
    const isCompact = this.variant === "compact";
    const isDetailed = this.variant === "detailed";

    return html`
      <div part="testimonial-card" class="testimonial-card">
        <div part="rating" class="testimonial-rating">
          <slot name="rating"></slot>
        </div>

        <div part="quote" class="testimonial-quote">
          ${
            this.quote
              ? html`<blockquote>${this.quote}</blockquote>`
              : html`<slot name="quote"></slot>`
          }
        </div>

        <div part="author" class="testimonial-author">
          <slot name="avatar"></slot>

          <div part="author-info" class="author-info">
            ${this.name ? html`<div part="name" class="author-name">${this.name}</div>` : ""}
            ${
              this.role || this.company
                ? html`
                  <div part="details" class="author-details">
                    ${this.role ? html`<span class="role">${this.role}</span>` : ""}
                    ${this.role && this.company ? html`<span class="separator">•</span>` : ""}
                    ${this.company ? html`<span class="company">${this.company}</span>` : ""}
                  </div>
                `
                : ""
            }
          </div>
        </div>

        ${
          isDetailed
            ? html`
              <div part="footer" class="testimonial-footer">
                <slot name="footer"></slot>
              </div>
            `
            : ""
        }
      </div>
    `;
  },
};

/**
 * Testimonial Card Component
 *
 * @component
 * @category display
 * @tag uix-testimonial-card
 *
 * A card component for displaying customer testimonials with avatar, name, role,
 * company, and rating. Extends uix-card.
 *
 * @slot rating - Star rating or custom rating component
 * @slot quote - Custom quote content (alternative to quote property)
 * @slot avatar - Avatar component
 * @slot footer - Additional footer content (detailed variant)
 *
 * @part testimonial-card - The main testimonial card container
 * @part rating - The rating container
 * @part quote - The quote section
 * @part author - The author section
 * @part author-info - The author info container
 * @part name - The author name
 * @part details - The author details (role/company)
 * @part footer - The footer section (detailed variant)
 *
 * @example Basic Testimonial
 * ```html
 * <uix-testimonial-card name="Sarah Johnson" role="CEO" company="TechCorp">
 *   <div slot="rating">
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *   </div>
 *   <blockquote slot="quote">
 *     This product has transformed how we work. Highly recommended!
 *   </blockquote>
 * </uix-testimonial-card>
 * ```
 *
 * @example With Avatar
 * ```html
 * <uix-testimonial-card name="Michael Chen" role="Product Manager" company="StartupXYZ">
 *   <uix-avatar slot="avatar" src="/avatars/michael.jpg" size="md"></uix-avatar>
 *   <div slot="rating">
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *     <uix-icon name="star"></uix-icon>
 *   </div>
 *   <blockquote slot="quote">
 *     The best tool we've ever used. Our team productivity increased by 40%.
 *   </blockquote>
 * </uix-testimonial-card>
 * ```
 *
 * @example Simple Quote Only
 * ```html
 * <uix-testimonial-card name="Emily Rodriguez"
 *   role="Designer"
 *   company="CreativeStudio"
 *   show-rating="false"
 *   quote="Beautiful design and incredibly easy to use."
 * ></uix-testimonial-card>
 * ```
 *
 * @example Compact Variant
 * ```html
 * <uix-testimonial-card
 *   variant="compact"
 *   name="David Kim"
 *   role="Developer"
 *   quote="Simple, fast, and reliable."
 *   rating="5"
 * ></uix-testimonial-card>
 * ```
 *
 * @example Detailed Variant with Footer
 * ```html
 * <uix-testimonial-card
 *   variant="detailed"
 *   name="Lisa Anderson"
 *   role="Marketing Director"
 *   company="BigCorp Inc."
 *   avatar="/avatars/lisa.jpg"
 *   quote="We've seen incredible results since switching to this platform. Our conversion rate doubled in just three months."
 *   rating="5"
 * >
 *   <div slot="footer" style="display: flex; gap: 1rem; margin-top: 1rem;">
 *     <uix-badge>Featured</uix-badge>
 *     <small style="color: var(--color-text-muted);">Posted 2 weeks ago</small>
 *   </div>
 * </uix-testimonial-card>
 * ```
 *
 * @example Using Quote Slot
 * ```html
 * <uix-testimonial-card
 *   name="Alex Thompson"
 *   role="Founder"
 *   company="NewVenture"
 * >
 *   <div slot="quote">
 *     <p>"Game-changing platform that exceeded all our expectations."</p>
 *     <p>"The support team is also fantastic!"</p>
 *   </div>
 * </uix-testimonial-card>
 * ```
 *
 * @example Different Ratings
 * ```html
 * <!-- 5 stars -->
 * <uix-testimonial-card
 *   name="John Doe"
 *   quote="Perfect!"
 *   rating="5"
 * ></uix-testimonial-card>
 *
 * <!-- 4 stars -->
 * <uix-testimonial-card
 *   name="Jane Smith"
 *   quote="Very good, with room for improvement"
 *   rating="4"
 * ></uix-testimonial-card>
 * ```
 *
 * @example Without Avatar (Initials)
 * ```html
 * <uix-testimonial-card
 *   name="Robert Brown"
 *   role="CTO"
 *   company="TechStartup"
 *   quote="Excellent product with great features."
 *   rating="5"
 * ></uix-testimonial-card>
 * ```
 *
 * @example Minimal Information
 * ```html
 * <uix-testimonial-card
 *   name="Anonymous"
 *   quote="Love this product!"
 *   rating="5"
 * ></uix-testimonial-card>
 * ```
 *
 * @example Grid of Testimonials
 * ```html
 * <uix-grid columns="3" gap="lg">
 *   <uix-testimonial-card
 *     name="User 1"
 *     role="Role 1"
 *     quote="Great product!"
 *     rating="5"
 *   ></uix-testimonial-card>
 *   <uix-testimonial-card
 *     name="User 2"
 *     role="Role 2"
 *     quote="Highly recommended!"
 *     rating="5"
 *   ></uix-testimonial-card>
 *   <uix-testimonial-card
 *     name="User 3"
 *     role="Role 3"
 *     quote="Best investment we made!"
 *     rating="5"
 *   ></uix-testimonial-card>
 * </uix-grid>
 * ```
 */
