import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-faq-section",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "separated"],
    }),
    faqs: T.array([]), // [{ question, answer, category }]
    heading: T.string(""),
    subheading: T.string(""),
    showSearch: T.boolean(true),
    searchPlaceholder: T.string("Search FAQs..."),
    single: T.boolean(true), // Only one FAQ open at a time
  },
  style: true,
  shadow: true,

  state: {
    searchQuery: "",
    filteredFaqs: [],
  },

  connected() {
    this.filteredFaqs = this.faqs;
  },

  updated(changedProps) {
    if (changedProps.has("faqs")) {
      this.filterFaqs();
    }
  },

  handleSearch(e) {
    this.searchQuery = e.target.value.toLowerCase();
    this.filterFaqs();
  },

  filterFaqs() {
    if (!this.searchQuery) {
      this.filteredFaqs = this.faqs;
    } else {
      this.filteredFaqs = this.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(this.searchQuery) ||
          faq.answer.toLowerCase().includes(this.searchQuery) ||
          (faq.category &&
            faq.category.toLowerCase().includes(this.searchQuery)),
      );
    }
    this.requestUpdate();
  },

  render() {
    const hasFaqs = this.faqs.length > 0;
    const displayFaqs = hasFaqs ? this.filteredFaqs : [];
    const noResults = hasFaqs && this.searchQuery && displayFaqs.length === 0;

    return html`
      <section part="section" class="faq-section">
        ${
          this.heading || this.subheading
            ? html`
              <div part="header" class="faq-header">
                ${this.heading ? html`<h2 part="heading">${this.heading}</h2>` : ""}
                ${this.subheading ? html`<p part="subheading">${this.subheading}</p>` : ""}
              </div>
            `
            : ""
        }

        ${
          this.showSearch && hasFaqs
            ? html`
              <div part="search" class="faq-search">
                <uix-input
                  part="search-input"
                  type="text"
                  placeholder=${this.searchPlaceholder}
                  @input=${this.handleSearch}
                >
                  <uix-icon slot="prefix" name="search"></uix-icon>
                </uix-input>
              </div>
            `
            : ""
        }

        ${
          noResults
            ? html`
              <div part="no-results" class="faq-no-results">
                <uix-icon name="search" size="xl"></uix-icon>
                <p>No FAQs found matching "${this.searchQuery}"</p>
              </div>
            `
            : ""
        }

        ${
          hasFaqs && !noResults
            ? html`
              <div part="container" class="faq-container">
                <uix-accordion part="accordion" variant=${this.variant} ?single=${this.single}>
                  ${displayFaqs.map(
                    (faq, index) => html`
                      <div part="question" class="faq-question" header>
                        <span class="question-text">${faq.question}</span>
                        <uix-icon part="icon" name="chevron-down" class="accordion-icon"></uix-icon>
                      </div>
                      <div part="answer" class="faq-answer">
                        ${
                          typeof faq.answer === "string"
                            ? html`<p>${faq.answer}</p>`
                            : faq.answer
                        }
                      </div>
                    `,
                  )}
                </uix-accordion>
              </div>
            `
            : !hasFaqs
              ? html`<slot></slot>`
              : ""
        }
      </section>
    `;
  },
};

/**
 * FAQ Section Component
 *
 * @component
 * @category layout
 * @tag uix-faq-section
 *
 * A section component for displaying Frequently Asked Questions with accordion
 * behavior and search functionality.
 *
 * @slot default - Custom FAQ content (when faqs array is empty)
 *
 * @part section - The main section container
 * @part header - The header section
 * @part heading - The heading element
 * @part subheading - The subheading element
 * @part search - The search container
 * @part search-input - The search input field
 * @part no-results - No results message container
 * @part container - The FAQs container
 * @part accordion - The accordion component
 * @part question - Individual question element
 * @part answer - Individual answer element
 * @part icon - Chevron icon for accordion
 *
 * @example Basic FAQ Section
 * ```html
 * <uix-faq-section
 *   heading="Frequently Asked Questions"
 *   subheading="Find answers to common questions"
 *   .faqs=${[
 *     {
 *       question: 'What is your return policy?',
 *       answer: 'We offer a 30-day money-back guarantee on all purchases.'
 *     },
 *     {
 *       question: 'How long does shipping take?',
 *       answer: 'Standard shipping takes 5-7 business days. Express shipping is 2-3 days.'
 *     },
 *     {
 *       question: 'Do you ship internationally?',
 *       answer: 'Yes, we ship to over 100 countries worldwide.'
 *     }
 *   ]}
 * ></uix-faq-section>
 * ```
 *
 * @example With Categories
 * ```html
 * <uix-faq-section
 *   heading="Help Center"
 *   .faqs=${[
 *     {
 *       question: 'How do I create an account?',
 *       answer: 'Click the Sign Up button and fill out the registration form.',
 *       category: 'Account'
 *     },
 *     {
 *       question: 'How do I reset my password?',
 *       answer: 'Use the Forgot Password link on the login page.',
 *       category: 'Account'
 *     },
 *     {
 *       question: 'What payment methods do you accept?',
 *       answer: 'We accept all major credit cards, PayPal, and bank transfers.',
 *       category: 'Billing'
 *     }
 *   ]}
 * ></uix-faq-section>
 * ```
 *
 * @example Bordered Variant
 * ```html
 * <uix-faq-section
 *   variant="bordered"
 *   heading="Common Questions"
 *   .faqs=${this.faqs}
 * ></uix-faq-section>
 * ```
 *
 * @example Separated Variant
 * ```html
 * <uix-faq-section
 *   variant="separated"
 *   heading="Got Questions?"
 *   .faqs=${this.questions}
 * ></uix-faq-section>
 * ```
 *
 * @example Without Search
 * ```html
 * <uix-faq-section
 *   heading="Quick Answers"
 *   show-search="false"
 *   .faqs=${this.quickFaqs}
 * ></uix-faq-section>
 * ```
 *
 * @example Multiple Items Open
 * ```html
 * <uix-faq-section
 *   heading="All Questions"
 *   single="false"
 *   .faqs=${this.allFaqs}
 * ></uix-faq-section>
 * ```
 *
 * @example Custom Search Placeholder
 * ```html
 * <uix-faq-section
 *   heading="Support"
 *   search-placeholder="Type to search questions..."
 *   .faqs=${this.supportFaqs}
 * ></uix-faq-section>
 * ```
 *
 * @example With HTML Answers
 * ```html
 * <uix-faq-section
 *   heading="Documentation"
 *   .faqs=${[
 *     {
 *       question: 'How do I get started?',
 *       answer: html`
 *         <p>Follow these steps:</p>
 *         <ol>
 *           <li>Install the package</li>
 *           <li>Import the components</li>
 *           <li>Start building!</li>
 *         </ol>
 *       `
 *     },
 *     {
 *       question: 'Where can I find the documentation?',
 *       answer: html`
 *         <p>Visit our <a href="/docs">documentation site</a> for detailed guides.</p>
 *       `
 *     }
 *   ]}
 * ></uix-faq-section>
 * ```
 *
 * @example Using Slot for Custom FAQs
 * ```html
 * <uix-faq-section heading="Custom FAQ">
 *   <uix-accordion variant="bordered" single>
 *     <div header>Custom Question 1?</div>
 *     <div>Custom answer 1...</div>
 *     <div header>Custom Question 2?</div>
 *     <div>Custom answer 2...</div>
 *   </uix-accordion>
 * </uix-faq-section>
 * ```
 *
 * @example Comprehensive FAQ
 * ```html
 * <uix-faq-section
 *   heading="Everything You Need to Know"
 *   subheading="Can't find what you're looking for? Contact support."
 *   variant="separated"
 *   .faqs=${[
 *     {
 *       question: 'What is included in the free plan?',
 *       answer: 'The free plan includes up to 5 projects, 1GB storage, and community support.',
 *       category: 'Pricing'
 *     },
 *     {
 *       question: 'Can I upgrade my plan later?',
 *       answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings.',
 *       category: 'Pricing'
 *     },
 *     {
 *       question: 'Is my data secure?',
 *       answer: 'Yes, we use industry-standard encryption and security practices to protect your data.',
 *       category: 'Security'
 *     },
 *     {
 *       question: 'Do you offer refunds?',
 *       answer: 'Yes, we offer a full refund within 30 days of purchase, no questions asked.',
 *       category: 'Billing'
 *     },
 *     {
 *       question: 'How do I contact support?',
 *       answer: 'You can reach our support team at support@example.com or through the chat widget.',
 *       category: 'Support'
 *     }
 *   ]}
 * ></uix-faq-section>
 * ```
 */
