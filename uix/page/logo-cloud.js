import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-logo-cloud",
  properties: {
    variant: T.string({
      defaultValue: "grid",
      enum: ["grid", "scroll", "carousel"],
    }),
    columns: T.number(6),
    grayscale: T.boolean(true),
    heading: T.string(""),
    subheading: T.string(""),
    autoplay: T.boolean(false),
    autoplaySpeed: T.number(3000),
  },
  style: true,
  shadow: true,

  state: {
    currentIndex: 0,
    autoplayInterval: null,
  },

  connected() {
    if (this.variant === "carousel" && this.autoplay) {
      this.startAutoplay();
    }
  },

  disconnected() {
    this.stopAutoplay();
  },

  updated(changedProps) {
    if (changedProps.has("autoplay") || changedProps.has("variant")) {
      if (this.variant === "carousel" && this.autoplay) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }
  },

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplaySpeed);
  },

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  },

  nextSlide() {
    if (this.variant !== "carousel") return;
    const container = this.shadowRoot.querySelector(".logo-container");
    if (!container) return;

    const itemWidth = container.children[0]?.offsetWidth || 0;
    const gap = 24; // var(--spacing-lg) default
    container.scrollBy({ left: itemWidth + gap, behavior: "smooth" });
  },

  prevSlide() {
    if (this.variant !== "carousel") return;
    const container = this.shadowRoot.querySelector(".logo-container");
    if (!container) return;

    const itemWidth = container.children[0]?.offsetWidth || 0;
    const gap = 24;
    container.scrollBy({ left: -(itemWidth + gap), behavior: "smooth" });
  },

  handleCarouselPrev() {
    this.stopAutoplay();
    this.prevSlide();
  },

  handleCarouselNext() {
    this.stopAutoplay();
    this.nextSlide();
  },

  render() {
    return html`
      <section part="section" class="logo-cloud-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="logo-cloud-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        <div part="container" class="logo-container">
          <slot></slot>
        </div>

        ${
          this.variant === "carousel"
            ? html`
              <div part="controls" class="carousel-controls">
                <button
                  part="prev"
                  class="carousel-button prev"
                  @click=${this.handleCarouselPrev}
                  aria-label="Previous"
                ></button>
                <button
                  part="next"
                  class="carousel-button next"
                  @click=${this.handleCarouselNext}
                  aria-label="Next"
                ></button>
              </div>
            `
            : ""
        }
      </section>
    `;
  },
};

/**
 * Logo Cloud Component
 *
 * @component
 * @category layout
 * @tag uix-logo-cloud
 *
 * A section component for displaying company logos or brand marks in various
 * layouts including grid, horizontal scroll, and carousel.
 *
 * @slot default - Logo images or links
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part container - The logos container
 * @part controls - Carousel controls (carousel variant)
 * @part prev - Previous button (carousel variant)
 * @part next - Next button (carousel variant)
 *
 * @example Basic Grid Layout
 * ```html
 * <uix-logo-cloud heading="Trusted by Industry Leaders" columns="6">
 *   <img src="/logos/company-a.svg" alt="Company A" />
 *   <img src="/logos/company-b.svg" alt="Company B" />
 *   <img src="/logos/company-c.svg" alt="Company C" />
 *   <img src="/logos/company-d.svg" alt="Company D" />
 *   <img src="/logos/company-e.svg" alt="Company E" />
 *   <img src="/logos/company-f.svg" alt="Company F" />
 * </uix-logo-cloud>
 * ```
 *
 * @example With Links
 * ```html
 * <uix-logo-cloud variant="scroll" heading="Our Partners">
 *   <a href="https://companya.com" target="_blank">
 *     <img src="/logos/company-a.svg" alt="Company A" />
 *   </a>
 *   <a href="https://companyb.com" target="_blank">
 *     <img src="/logos/company-b.svg" alt="Company B" />
 *   </a>
 * </uix-logo-cloud>
 * ```
 *
 * @example Carousel with Autoplay
 * ```html
 * <uix-logo-cloud
 *   variant="carousel"
 *   autoplay
 *   autoplay-speed="4000"
 *   heading="Featured Clients"
 *   .logos=${this.clientLogos}
 * ></uix-logo-cloud>
 * ```
 *
 * @example With Clickable Logos
 * ```html
 * <uix-logo-cloud
 *   heading="Our Customers"
 *   columns="5"
 *   .logos=${[
 *     {
 *       name: 'TechCorp',
 *       src: '/logos/techcorp.svg',
 *       alt: 'TechCorp Logo',
 *       url: 'https://techcorp.com'
 *     },
 *     {
 *       name: 'StartupXYZ',
 *       src: '/logos/startupxyz.svg',
 *       alt: 'StartupXYZ Logo',
 *       url: 'https://startupxyz.com'
 *     }
 *   ]}
 * ></uix-logo-cloud>
 * ```
 *
 * @example Without Grayscale Filter
 * ```html
 * <uix-logo-cloud
 *   heading="Brand Partners"
 *   grayscale="false"
 *   columns="4"
 *   .logos=${this.brandLogos}
 * ></uix-logo-cloud>
 * ```
 *
 * @example Custom Column Count
 * ```html
 * <uix-logo-cloud
 *   columns="3"
 *   subheading="Select partners we work with"
 *   .logos=${this.selectPartners}
 * ></uix-logo-cloud>
 * ```
 *
 * @example Using Slot for Custom Logos
 * ```html
 * <uix-logo-cloud heading="Technology Stack">
 *   <img src="/logos/react.svg" alt="React" />
 *   <img src="/logos/vue.svg" alt="Vue" />
 *   <img src="/logos/angular.svg" alt="Angular" />
 *   <img src="/logos/svelte.svg" alt="Svelte" />
 * </uix-logo-cloud>
 * ```
 *
 * @example Minimal Without Heading
 * ```html
 * <uix-logo-cloud
 *   variant="scroll"
 *   columns="8"
 *   .logos=${this.allPartnerLogos}
 * ></uix-logo-cloud>
 * ```
 *
 * @example With Subheading Only
 * ```html
 * <uix-logo-cloud
 *   subheading="Trusted by 500+ companies worldwide"
 *   columns="6"
 *   .logos=${this.trustedBy}
 * ></uix-logo-cloud>
 * ```
 */
