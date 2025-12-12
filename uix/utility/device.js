import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "uix-device",

  properties: {
    device: T.string({
      defaultValue: "iphone",
      enum: ["iphone", "android", "ipad", "desktop"],
    }),
    width: T.string({ defaultValue: "375px" }), // iPhone width
    height: T.string({ defaultValue: "812px" }), // iPhone height
    scale: T.string({ defaultValue: "1" }),
    showNotch: T.boolean(true),
    showControls: T.boolean(true), // Home button, etc.
  },

  style: true,
  shadow: true,

  render() {
    return html`
      <style>
        :host {
          display: inline-block;
          --device-width: ${this.width};
          --device-height: ${this.height};
          --device-scale: ${this.scale};
        }

        .device-container {
          width: var(--device-width);
          height: var(--device-height);
          transform: scale(var(--device-scale));
          transform-origin: top center;
          background: var(--device-bg, #000);
          border-radius: var(--device-radius, 36px);
          padding: var(--device-padding, 12px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .device-screen {
          width: 100%;
          height: 100%;
          background: var(--color-surface, #fff);
          border-radius: var(--screen-radius, 28px);
          overflow-y: auto;
          overflow-x: hidden;
          position: relative;

          /* Hide scrollbars for mobile devices */
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */

          /* Enable momentum scrolling on iOS */
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbar for Chrome, Safari, Opera */
        .device-screen::-webkit-scrollbar {
          display: none;
        }

        /* iPhone notch */
        .device-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 150px;
          height: 24px;
          background: var(--device-bg, #000);
          border-radius: 0 0 16px 16px;
          z-index: 10;
        }

        /* Home indicator (iPhone) */
        .device-home-indicator {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
          z-index: 10;
        }
      </style>

      <div part="container" class="device-container">
        <div part="screen" class="device-screen">
          ${
            this.showNotch && this.device === "iphone"
              ? html`<div part="notch" class="device-notch"></div>`
              : ""
          }

          <slot></slot>

          ${
            this.showControls && this.device === "iphone"
              ? html`<div part="home-indicator" class="device-home-indicator"></div>`
              : ""
          }
        </div>
      </div>
    `;
  },
};

/**
 * Device Frame Component
 *
 * @component
 * @category utility
 * @tag uix-device
 *
 * A device simulator component that wraps content in a realistic phone/tablet mockup.
 * Perfect for displaying app examples, demos, and screenshots in a professional way.
 *
 * @property {string} device - Device type: iphone, android, ipad, desktop (default: iphone)
 * @property {string} width - Device width (default: 375px for iPhone)
 * @property {string} height - Device height (default: 812px for iPhone)
 * @property {string} scale - Scale factor for responsive sizing (default: 1)
 * @property {boolean} showNotch - Show iPhone notch (default: true)
 * @property {boolean} showControls - Show home indicator/controls (default: true)
 *
 * @part container - The device outer frame
 * @part screen - The device screen area
 * @part notch - The iPhone notch element
 * @part home-indicator - The iPhone home indicator
 *
 * @example Basic iPhone Frame
 * ```html
 * <uix-device>
 *   <uix-app-container layout="mobile">
 *     <uix-app-header slot="header">
 *       <uix-heading level="3">My App</uix-heading>
 *     </uix-app-header>
 *     <p>App content here</p>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Android Device
 * ```html
 * <uix-device device="android" width="360px" height="740px">
 *   <uix-app-container layout="mobile">
 *     <p>Android app example</p>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example iPad Frame
 * ```html
 * <uix-device device="ipad" width="768px" height="1024px">
 *   <uix-app-container layout="tablet">
 *     <p>iPad app example</p>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Without Notch/Controls
 * ```html
 * <uix-device
 *   device="iphone"
 *   showNotch={false}
 *   showControls={false}
 * >
 *   <uix-app-container layout="mobile">
 *     <p>Clean frame without iPhone UI elements</p>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Scaled for Demo
 * ```html
 * <uix-device scale="0.8">
 *   <uix-app-container layout="mobile">
 *     <p>80% scale for fitting in smaller spaces</p>
 *   </uix-app-container>
 * </uix-device>
 * ```
 *
 * @example Full Example with Drawer
 * ```html
 * <uix-device device="iphone" height="800px">
 *   <uix-app-container layout="mobile">
 *     <uix-app-header slot="header">
 *       <button slot="start" onclick="document.querySelector('#myDrawer').toggleDrawer()">
 *         <uix-icon name="menu"></uix-icon>
 *       </button>
 *       <uix-heading level="3">My App</uix-heading>
 *     </uix-app-header>
 *
 *     <uix-drawer id="myDrawer" position="left">
 *       <nav style="padding: var(--spacing-lg);">
 *         <uix-heading level="4">Navigation</uix-heading>
 *         <uix-link href="/">Home</uix-link>
 *         <uix-link href="/about">About</uix-link>
 *       </nav>
 *     </uix-drawer>
 *
 *     <div style="padding: var(--spacing-lg);">
 *       <p>Main content area</p>
 *     </div>
 *   </uix-app-container>
 * </uix-device>
 * ```
 */
