import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-footer",
  properties: {
    variant: T.string({
      defaultValue: "multi-column",
      enum: ["simple", "multi-column", "centered"],
    }),
    logo: T.string(""),
    brandText: T.string(""),
    copyright: T.string(""),
    showNewsletter: T.boolean(false),
    newsletterHeading: T.string("Subscribe to our newsletter"),
  },
  style: true,
  shadow: true,

  renderBrand() {
    return html`
      <div part="brand" class="footer-brand">
        ${
          this.logo
            ? html`
              <img part="logo" src=${this.logo} alt="Logo" class="footer-logo" />
            `
            : html`<slot name="logo"></slot>`
        }
        ${
          this.brandText
            ? html`<p part="brand-text" class="brand-text">${this.brandText}</p>`
            : html`<slot name="brand-text"></slot>`
        }
        ${this.variant === "centered" ? this.renderSocialLinks() : ""}
      </div>
    `;
  },

  render() {
    const hasColumns = this.columns.length > 0;

    return html`
      <footer part="footer" class="footer">
        <div part="container" class="footer-container">
          <!-- Main footer content -->
          <div part="main" class="footer-main">
            ${
              this.variant === "simple"
                ? html`
                  <div class="footer-simple-layout">
                    ${this.renderBrand()}
                    ${
                      hasColumns
                        ? html`
                          <div class="footer-links">
                            ${this.columns[0] ? this.renderColumn(this.columns[0], 0) : ""}
                          </div>
                        `
                        : ""
                    }
                    ${this.socialLinks.length > 0 ? this.renderSocialLinks() : ""}
                  </div>
                `
                : this.variant === "centered"
                  ? html`
                    <div class="footer-centered-layout">
                      ${this.renderBrand()}
                      ${
                        hasColumns
                          ? html`
                            <div class="footer-nav">
                              ${this.columns.map((column, index) =>
                                this.renderColumn(column, index),
                              )}
                            </div>
                          `
                          : html`<slot name="columns"></slot>`
                      }
                    </div>
                  `
                  : html`
                    <div class="footer-multi-column-layout">
                      ${this.renderBrand()}
                      ${
                        hasColumns
                          ? html`
                            <div part="columns" class="footer-columns">
                              ${this.columns.map((column, index) =>
                                this.renderColumn(column, index),
                              )}
                            </div>
                          `
                          : html`<slot name="columns"></slot>`
                      }
                      ${
                        this.showNewsletter
                          ? html`
                            <div part="newsletter" class="footer-newsletter">
                              <h3>${this.newsletterHeading}</h3>
                              <slot name="newsletter"></slot>
                            </div>
                          `
                          : ""
                      }
                    </div>
                    ${
                      this.socialLinks.length > 0
                        ? html`
                          <div class="footer-social-row">${this.renderSocialLinks()}</div>
                        `
                        : ""
                    }
                  `
            }
          </div>

          <!-- Bottom bar -->
          ${
            this.copyright || this.variant === "multi-column"
              ? html`
                <div part="bottom" class="footer-bottom">
                  ${
                    this.copyright
                      ? html`<p part="copyright" class="footer-copyright">${this.copyright}</p>`
                      : html`<slot name="copyright"></slot>`
                  }
                  <slot name="bottom-links"></slot>
                </div>
              `
              : ""
          }
        </div>
      </footer>
    `;
  },
};

/**
 * Footer Component
 *
 * @component
 * @category layout
 * @tag uix-footer
 *
 * A comprehensive footer component with multi-column links, branding,
 * social media links, and newsletter integration.
 *
 * @slot logo - Custom logo content
 * @slot brand-text - Custom brand text/tagline
 * @slot columns - Custom column content
 * @slot social - Custom social links
 * @slot newsletter - Newsletter form content
 * @slot copyright - Custom copyright text
 * @slot bottom-links - Additional bottom bar links
 *
 * @part footer - The main footer element
 * @part container - Inner container
 * @part main - Main footer content area
 * @part brand - Brand section
 * @part logo - Logo image
 * @part brand-text - Brand text/tagline
 * @part columns - Columns container
 * @part column - Individual column
 * @part column-title - Column title
 * @part link-list - Link list
 * @part link-item - Individual link item
 * @part link - Link anchor
 * @part social - Social links container
 * @part social-link - Individual social link
 * @part social-icon - Social icon
 * @part newsletter - Newsletter section
 * @part bottom - Bottom bar
 * @part copyright - Copyright text
 *
 * @example Multi-Column Footer
 * ```html
 * <uix-footer
 *   logo="/logo.svg"
 *   brand-text="Building the future of web development"
 *   copyright="© 2024 YourCompany. All rights reserved."
 *   .columns=${[
 *     {
 *       title: 'Product',
 *       links: [
 *         { text: 'Features', href: '/features' },
 *         { text: 'Pricing', href: '/pricing' },
 *         { text: 'FAQ', href: '/faq' }
 *       ]
 *     },
 *     {
 *       title: 'Company',
 *       links: [
 *         { text: 'About', href: '/about' },
 *         { text: 'Blog', href: '/blog' },
 *         { text: 'Careers', href: '/careers' }
 *       ]
 *     },
 *     {
 *       title: 'Support',
 *       links: [
 *         { text: 'Help Center', href: '/help' },
 *         { text: 'Contact', href: '/contact' },
 *         { text: 'Status', href: '/status' }
 *       ]
 *     }
 *   ]}
 *   .socialLinks=${[
 *     { platform: 'Twitter', url: 'https://twitter.com/company', icon: 'twitter' },
 *     { platform: 'GitHub', url: 'https://github.com/company', icon: 'github' },
 *     { platform: 'LinkedIn', url: 'https://linkedin.com/company', icon: 'linkedin' }
 *   ]}
 * ></uix-footer>
 * ```
 *
 * @example Simple Footer
 * ```html
 * <uix-footer
 *   variant="simple"
 *   logo="/logo.svg"
 *   copyright="© 2024 Company"
 *   .columns=${[
 *     {
 *       links: [
 *         { text: 'Privacy', href: '/privacy' },
 *         { text: 'Terms', href: '/terms' },
 *         { text: 'Contact', href: '/contact' }
 *       ]
 *     }
 *   ]}
 *   .socialLinks=${[
 *     { platform: 'Twitter', url: 'https://twitter.com/company' },
 *     { platform: 'Facebook', url: 'https://facebook.com/company' }
 *   ]}
 * ></uix-footer>
 * ```
 *
 * @example Centered Footer
 * ```html
 * <uix-footer
 *   variant="centered"
 *   brand-text="Your trusted partner"
 *   copyright="© 2024 All rights reserved"
 *   .columns=${[
 *     {
 *       links: [
 *         { text: 'Home', href: '/' },
 *         { text: 'About', href: '/about' },
 *         { text: 'Services', href: '/services' },
 *         { text: 'Contact', href: '/contact' }
 *       ]
 *     }
 *   ]}
 *   .socialLinks=${[
 *     { platform: 'Instagram', url: 'https://instagram.com/company' },
 *     { platform: 'LinkedIn', url: 'https://linkedin.com/company' }
 *   ]}
 * ></uix-footer>
 * ```
 *
 * @example With Newsletter
 * ```html
 * <uix-footer
 *   logo="/logo.svg"
 *   show-newsletter
 *   newsletter-heading="Stay in the loop"
 *   copyright="© 2024 Company"
 *   .columns=${this.footerColumns}
 * >
 *   <uix-newsletter-section
 *     slot="newsletter"
 *     variant="inline"
 *     placeholder="Enter your email"
 *   ></uix-newsletter-section>
 * </uix-footer>
 * ```
 *
 * @example Using Slots
 * ```html
 * <uix-footer variant="multi-column">
 *   <img slot="logo" src="/logo.svg" alt="Logo" />
 *   <p slot="brand-text">Innovation starts here</p>
 *
 *   <div slot="columns" class="custom-columns">
 *     <!-- Custom column content -->
 *   </div>
 *
 *   <div slot="social">
 *     <a href="https://twitter.com">Twitter</a>
 *     <a href="https://github.com">GitHub</a>
 *   </div>
 *
 *   <p slot="copyright">© 2024 Company. All rights reserved.</p>
 *
 *   <div slot="bottom-links">
 *     <a href="/privacy">Privacy</a>
 *     <a href="/terms">Terms</a>
 *   </div>
 * </uix-footer>
 * ```
 */
