import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-page",
  properties: {
    maxWidth: T.string({
      defaultValue: "lg",
      enum: ["sm", "md", "lg", "xl", "2xl", "full"],
    }),
    padding: T.boolean(true),
  },
  style: true,
  shadow: true,

  render() {
    return html`
      <div part="container" class="page">
        <header part="header" class="page-header">
          <slot name="header"></slot>
        </header>

        <main part="content" class="page-content">
          <slot></slot>
        </main>

        <footer part="footer" class="page-footer">
          <slot name="footer"></slot>
        </footer>
      </div>
    `;
  },
};

/**
 * Page Component
 *
 * @component
 * @category layout
 * @tag uix-page
 *
 * A page layout container with header, content, and footer areas.
 *
 * @slot header - Page header content
 * @slot default - Main page content
 * @slot footer - Page footer content
 *
 * @example
 * // Basic page
 * ```html
 * <uix-page>
 *   <div slot="header">
 *     <h1>Page Title</h1>
 *   </div>
 *   <div>
 *     <p>Page content goes here...</p>
 *   </div>
 *   <div slot="footer">
 *     <p>&copy; 2025 Company Name</p>
 *   </div>
 * </uix-page>
 * ```
 *
 * @example
 * // With navbar header
 * ```html
 * <uix-page>
 *   <uix-navbar slot="header">
 *     <div slot="brand">MyApp</div>
 *     <div slot="start">
 *       <a href="#home">Home</a>
 *       <a href="#about">About</a>
 *     </div>
 *   </uix-navbar>
 *
 *   <div>
 *     <h1>Welcome</h1>
 *     <p>Main content here...</p>
 *   </div>
 * </uix-page>
 * ```
 *
 * @example
 * // Max width variants
 * ```html
 * <!-- Small container -->
 * <uix-page max-width="sm">
 *   <h1>Narrow Page</h1>
 *   <p>Content is constrained to a small width.</p>
 * </uix-page>
 *
 * <!-- Full width -->
 * <uix-page max-width="full">
 *   <h1>Full Width Page</h1>
 *   <p>Content spans the full viewport width.</p>
 * </uix-page>
 * ```
 *
 * @example
 * // Without padding
 * ```html
 * <uix-page padding="false">
 *   <div style="padding: 2rem; background: linear-gradient(to right, #667eea, #764ba2);">
 *     <h1 style="color: white;">Full Bleed Content</h1>
 *   </div>
 * </uix-page>
 * ```
 *
 * @example
 * // Complete landing page
 * ```html
 * <uix-page max-width="xl">
 *   <div slot="header">
 *     <uix-navbar>
 *       <div slot="brand"><strong>MyProduct</strong></div>
 *       <div slot="end">
 *         <uix-button ghost>Login</uix-button>
 *         <uix-button variant="primary">Sign Up</uix-button>
 *       </div>
 *     </uix-navbar>
 *   </div>
 *
 *   <div style="text-align: center; padding: 4rem 0;">
 *     <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to MyProduct</h1>
 *     <p style="font-size: 1.25rem; margin-bottom: 2rem;">The best solution for your needs</p>
 *     <uix-button variant="primary" size="lg">Get Started</uix-button>
 *   </div>
 *
 *   <div slot="footer" style="text-align: center; padding: 2rem 0; border-top: 1px solid #ddd;">
 *     <p>&copy; 2025 MyProduct. All rights reserved.</p>
 *   </div>
 * </uix-page>
 * ```
 */
