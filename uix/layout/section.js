import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-section",
  properties: {
    padding: T.string({
      defaultValue: "md",
      enum: ["none", "sm", "md", "lg", "xl"],
    }),
    maxWidth: T.string({
      defaultValue: "lg",
      enum: ["sm", "md", "lg", "xl", "2xl", "full"],
    }),
    centered: T.boolean(false),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <section part="container" class="section ${this.centered ? "centered" : ""}">
        <div part="inner" class="section-container">
          <slot></slot>
        </div>
      </section>
    `;
  },
};

/**
 * Section Component
 *
 * @component
 * @category layout
 * @tag uix-section
 *
 * A semantic section container with configurable padding and max-width constraints.
 *
 * @example
 * // Basic section
 * ```html
 * <uix-section>
 *   <h2>Section Title</h2>
 *   <p>Section content goes here...</p>
 * </uix-section>
 * ```
 *
 * @example
 * // Centered content
 * ```html
 * <uix-section centered>
 *   <h2>Centered Section</h2>
 *   <p>This content is centered within the section.</p>
 * </uix-section>
 * ```
 *
 * @example
 * // Padding variants
 * ```html
 * <div>
 *   <uix-section padding="none" style="background: #f0f0f0;">
 *     <h3>No Padding</h3>
 *   </uix-section>
 *
 *   <uix-section padding="sm" style="background: #e0e0e0;">
 *     <h3>Small Padding</h3>
 *   </uix-section>
 *
 *   <uix-section padding="lg" style="background: #d0d0d0;">
 *     <h3>Large Padding</h3>
 *   </uix-section>
 *
 *   <uix-section padding="xl" style="background: #c0c0c0;">
 *     <h3>Extra Large Padding</h3>
 *   </uix-section>
 * </div>
 * ```
 *
 * @example
 * // Max width variants
 * ```html
 * <div>
 *   <uix-section max-width="sm" style="background: #f5f5f5;">
 *     <h3>Small Container</h3>
 *     <p>Content is constrained to a small width.</p>
 *   </uix-section>
 *
 *   <uix-section max-width="xl" style="background: #e5e5e5;">
 *     <h3>Extra Large Container</h3>
 *     <p>Content can span a wider area.</p>
 *   </uix-section>
 *
 *   <uix-section max-width="full" style="background: #d5d5d5;">
 *     <h3>Full Width</h3>
 *     <p>Content spans the full viewport width.</p>
 *   </uix-section>
 * </div>
 * ```
 *
 * @example
 * // Landing page sections
 * ```html
 * <!-- Hero Section -->
 * <uix-section padding="xl" centered style="background: linear-gradient(to right, #667eea, #764ba2); color: white;">
 *   <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to Our Product</h1>
 *   <p style="font-size: 1.25rem; margin-bottom: 2rem;">The best solution for your needs</p>
 *   <uix-button variant="primary" size="lg">Get Started</uix-button>
 * </uix-section>
 *
 * <!-- Features Section -->
 * <uix-section padding="lg">
 *   <h2 style="text-align: center; margin-bottom: 3rem;">Features</h2>
 *   <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
 *     <uix-panel variant="elevated" centered>
 *       <uix-icon name="zap" size="xl"></uix-icon>
 *       <h3>Fast</h3>
 *       <p>Lightning fast performance</p>
 *     </uix-panel>
 *     <uix-panel variant="elevated" centered>
 *       <uix-icon name="shield" size="xl"></uix-icon>
 *       <h3>Secure</h3>
 *       <p>Enterprise-grade security</p>
 *     </uix-panel>
 *     <uix-panel variant="elevated" centered>
 *       <uix-icon name="trending-up" size="xl"></uix-icon>
 *       <h3>Scalable</h3>
 *       <p>Grows with your business</p>
 *     </uix-panel>
 *   </div>
 * </uix-section>
 *
 * <!-- CTA Section -->
 * <uix-section padding="xl" centered style="background: #f7fafc;">
 *   <h2>Ready to get started?</h2>
 *   <p>Join thousands of satisfied customers today.</p>
 *   <uix-button variant="primary" size="lg">Sign Up Now</uix-button>
 * </uix-section>
 * ```
 *
 * @example
 * // Content sections
 * ```html
 * <div>
 *   <uix-section>
 *     <h2>Introduction</h2>
 *     <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
 *   </uix-section>
 *
 *   <uix-section style="background: #f9f9f9;">
 *     <h2>Features</h2>
 *     <ul>
 *       <li>Feature 1</li>
 *       <li>Feature 2</li>
 *       <li>Feature 3</li>
 *     </ul>
 *   </uix-section>
 *
 *   <uix-section>
 *     <h2>Pricing</h2>
 *     <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
 *       <uix-panel variant="bordered">
 *         <h3>Basic</h3>
 *         <p>$9/month</p>
 *       </uix-panel>
 *       <uix-panel variant="bordered">
 *         <h3>Pro</h3>
 *         <p>$29/month</p>
 *       </uix-panel>
 *       <uix-panel variant="bordered">
 *         <h3>Enterprise</h3>
 *         <p>$99/month</p>
 *       </uix-panel>
 *     </div>
 *   </uix-section>
 * </div>
 * ```
 */
