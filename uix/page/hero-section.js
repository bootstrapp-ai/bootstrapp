import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-hero-section",
  properties: {
    variant: T.string({
      defaultValue: "centered",
      enum: ["centered", "split", "image-bg", "video-bg", "gradient"],
    }),
    height: T.string({
      defaultValue: "auto",
      enum: ["auto", "screen", "lg", "md", "sm"],
    }),
    align: T.string({
      defaultValue: "center",
      enum: ["left", "center", "right"],
    }),
    overlay: T.boolean(false),
    overlayOpacity: T.number(0.5),
    backgroundImage: T.string(""),
    backgroundVideo: T.string(""),
    gradientFrom: T.string(""),
    gradientTo: T.string(""),
  },
  style: true,
  shadow: true,

  render() {
    const isCentered = this.variant === "centered";
    const isSplit = this.variant === "split";
    const hasBackground =
      this.variant === "image-bg" || this.variant === "video-bg";
    const isGradient = this.variant === "gradient";

    return html`
      <section part="section" class="hero-section">
        ${
          this.variant === "video-bg" && this.backgroundVideo
            ? html`
              <video
                part="background-video"
                class="background-media"
                autoplay
                loop
                muted
                playsinline
              >
                <source src=${this.backgroundVideo} type="video/mp4" />
              </video>
            `
            : ""
        }
        ${
          this.overlay && hasBackground
            ? html`<div part="overlay" class="overlay"></div>`
            : ""
        }

        <div part="container" class="hero-container">
          ${
            isSplit
              ? html`
                <div part="content" class="hero-content">
                  <div part="text" class="hero-text">
                    <slot name="headline"></slot>
                    <slot name="subheading"></slot>
                    <div part="actions" class="hero-actions">
                      <slot name="actions"></slot>
                    </div>
                  </div>
                  <div part="media" class="hero-media">
                    <slot name="media"></slot>
                  </div>
                </div>
              `
              : html`
                <div part="content" class="hero-content">
                  <slot name="headline"></slot>
                  <slot name="subheading"></slot>
                  <div part="actions" class="hero-actions">
                    <slot name="actions"></slot>
                  </div>
                  ${
                    this.variant === "centered"
                      ? html`
                        <div part="features" class="hero-features">
                          <slot name="features"></slot>
                        </div>
                      `
                      : ""
                  }
                </div>
              `
          }
        </div>
      </section>
    `;
  },
};

/**
 * Hero Section Component
 *
 * @component
 * @category layout
 * @tag uix-hero-section
 *
 * A versatile hero section for landing pages with multiple layout variants,
 * background options, and customizable content areas.
 *
 * @slot headline - Main headline content
 * @slot subheading - Subheading or tagline content
 * @slot actions - Call-to-action buttons
 * @slot media - Image or media content (for split variant)
 * @slot features - Feature highlights (for centered variant)
 *
 * @part section - The main section container
 * @part container - The content container
 * @part content - The content wrapper
 * @part text - The text content area (split variant)
 * @part media - The media area (split variant)
 * @part actions - The actions container
 * @part features - The features container
 * @part overlay - The overlay (when enabled)
 * @part background-video - The background video element
 *
 * @example Centered Hero
 * ```html
 * <uix-hero-section variant="centered" height="screen">
 *   <h1 slot="headline">Build faster with UIX</h1>
 *   <p slot="subheading">A comprehensive component library for modern web apps</p>
 *   <div slot="actions">
 *     <uix-button variant="primary" size="lg">Get Started</uix-button>
 *     <uix-button ghost size="lg">Learn More</uix-button>
 *   </div>
 * </uix-hero-section>
 * ```
 *
 * @example Split Layout
 * ```html
 * <uix-hero-section variant="split" height="lg">
 *   <h1 slot="headline">Ship products faster</h1>
 *   <p slot="subheading">Everything you need to build modern applications</p>
 *   <div slot="actions">
 *     <uix-button variant="primary">Start Free Trial</uix-button>
 *   </div>
 *   <img slot="media" src="/hero-image.png" alt="Product screenshot">
 * </uix-hero-section>
 * ```
 *
 * @example Background Image with Overlay
 * ```html
 * <uix-hero-section
 *   variant="image-bg"
 *   height="screen"
 *   background-image="/hero-bg.jpg"
 *   overlay
 *   overlay-opacity="0.6"
 *   align="left"
 * >
 *   <h1 slot="headline" style="color: white;">Transform your business</h1>
 *   <p slot="subheading" style="color: white;">Join thousands of companies already using our platform</p>
 *   <div slot="actions">
 *     <uix-button variant="primary" size="lg">Get Started</uix-button>
 *   </div>
 * </uix-hero-section>
 * ```
 *
 * @example Background Video
 * ```html
 * <uix-hero-section
 *   variant="video-bg"
 *   height="screen"
 *   background-video="/hero-video.mp4"
 *   overlay
 *   overlay-opacity="0.5"
 *   align="center"
 * >
 *   <h1 slot="headline" style="color: white;">Experience the future</h1>
 *   <p slot="subheading" style="color: white;">Innovative solutions for modern challenges</p>
 *   <div slot="actions">
 *     <uix-button variant="primary" size="lg">Watch Demo</uix-button>
 *   </div>
 * </uix-hero-section>
 * ```
 *
 * @example Gradient Background
 * ```html
 * <uix-hero-section
 *   variant="gradient"
 *   height="lg"
 *   gradient-from="#667eea"
 *   gradient-to="#764ba2"
 * >
 *   <h1 slot="headline" style="color: white;">Next-gen platform</h1>
 *   <p slot="subheading" style="color: white;">Built for developers, loved by users</p>
 *   <div slot="actions">
 *     <uix-button variant="primary" size="lg">Start Building</uix-button>
 *     <uix-button ghost size="lg" style="color: white;">View Docs</uix-button>
 *   </div>
 * </uix-hero-section>
 * ```
 *
 * @example With Features
 * ```html
 * <uix-hero-section variant="centered" height="lg">
 *   <h1 slot="headline">The complete toolkit</h1>
 *   <p slot="subheading">Everything you need, nothing you don't</p>
 *   <div slot="actions">
 *     <uix-button variant="primary">Get Started</uix-button>
 *   </div>
 *   <div slot="features" style="display: flex; gap: 2rem; margin-top: 3rem;">
 *     <div style="text-align: center;">
 *       <uix-icon name="zap"></uix-icon>
 *       <p>Fast</p>
 *     </div>
 *     <div style="text-align: center;">
 *       <uix-icon name="shield"></uix-icon>
 *       <p>Secure</p>
 *     </div>
 *     <div style="text-align: center;">
 *       <uix-icon name="layers"></uix-icon>
 *       <p>Scalable</p>
 *     </div>
 *   </div>
 * </uix-hero-section>
 * ```
 *
 * @example Different Heights
 * ```html
 * <!-- Small height -->
 * <uix-hero-section height="sm">...</uix-hero-section>
 *
 * <!-- Medium height -->
 * <uix-hero-section height="md">...</uix-hero-section>
 *
 * <!-- Large height -->
 * <uix-hero-section height="lg">...</uix-hero-section>
 *
 * <!-- Full screen -->
 * <uix-hero-section height="screen">...</uix-hero-section>
 * ```
 *
 * @example Text Alignment
 * ```html
 * <!-- Left aligned -->
 * <uix-hero-section align="left">...</uix-hero-section>
 *
 * <!-- Center aligned (default) -->
 * <uix-hero-section align="center">...</uix-hero-section>
 *
 * <!-- Right aligned -->
 * <uix-hero-section align="right">...</uix-hero-section>
 * ```
 */
