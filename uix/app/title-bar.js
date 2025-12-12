import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-title-bar",
  properties: {
    title: T.string(""),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "unified", "hidden"],
    }),
    showControls: T.boolean(true),
    draggable: T.boolean(true),
  },
  style: true,
  shadow: true,

  handleMinimize() {
    this.emit("minimize");
  },

  handleMaximize() {
    this.emit("maximize");
  },

  handleClose() {
    this.emit("close");
  },

  render() {
    if (this.variant === "hidden") {
      return html``;
    }

    return html`
      <div part="titlebar" class="title-bar" role="banner">
        <div part="left" class="title-bar-left">
          <slot name="left"></slot>
        </div>

        <div part="center" class="title-bar-center">
          ${this.title ? html`<span part="title" class="title-text">${this.title}</span>` : ""}
          <slot name="center"></slot>
        </div>

        <div part="right" class="title-bar-right">
          <slot name="right"></slot>
          ${
            this.showControls
              ? html`
                <div part="controls" class="window-controls">
                  <button
                    part="minimize"
                    class="control-button minimize"
                    @click=${this.handleMinimize}
                    aria-label="Minimize window"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </button>
                  <button
                    part="maximize"
                    class="control-button maximize"
                    @click=${this.handleMaximize}
                    aria-label="Maximize window"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <rect
                        x="2"
                        y="2"
                        width="8"
                        height="8"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                    </svg>
                  </button>
                  <button
                    part="close"
                    class="control-button close"
                    @click=${this.handleClose}
                    aria-label="Close window"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.5" />
                      <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                  </button>
                </div>
              `
              : ""
          }
        </div>
      </div>
    `;
  },
};

/**
 * Title Bar Component
 *
 * @component
 * @category layout
 * @tag uix-title-bar
 *
 * A desktop window title bar with draggable region and window controls.
 * Designed for desktop applications with native-like window chrome.
 *
 * @slot left - Left side content (app icon, menu, etc.)
 * @slot center - Center content (window title, tabs, etc.)
 * @slot right - Right side content (before window controls)
 *
 * @part titlebar - The title bar container
 * @part left - The left section
 * @part center - The center section
 * @part right - The right section
 * @part title - The title text
 * @part controls - The window controls container
 * @part minimize - The minimize button
 * @part maximize - The maximize button
 * @part close - The close button
 *
 * @example Basic Title Bar
 * ```html
 * <uix-title-bar title="My Application"></uix-title-bar>
 * ```
 *
 * @example With App Icon
 * ```html
 * <uix-title-bar title="My App">
 *   <div slot="left" style="display: flex; align-items: center; gap: 8px;">
 *     <img src="/icon.png" alt="App Icon" width="20" height="20">
 *     <span style="font-weight: 600;">MyApp</span>
 *   </div>
 * </uix-title-bar>
 * ```
 *
 * @example With Menu
 * ```html
 * <uix-title-bar title="Document.txt - Editor">
 *   <div slot="left" style="display: flex; gap: 12px; padding-left: 12px;">
 *     <button>File</button>
 *     <button>Edit</button>
 *     <button>View</button>
 *     <button>Help</button>
 *   </div>
 * </uix-title-bar>
 * ```
 *
 * @example Unified Variant (macOS-style)
 * ```html
 * <uix-title-bar
 *   title="My Document"
 *   variant="unified"
 * ></uix-title-bar>
 * ```
 *
 * @example With Custom Controls
 * ```html
 * <uix-title-bar title="My App">
 *   <div slot="right">
 *     <button><uix-icon name="settings"></uix-icon></button>
 *     <button><uix-icon name="circle-help"></uix-icon></button>
 *   </div>
 * </uix-title-bar>
 * ```
 *
 * @example Without Controls
 * ```html
 * <uix-title-bar
 *   title="Embedded Window"
 *   show-controls="false"
 * ></uix-title-bar>
 * ```
 *
 * @example With Event Handling
 * ```html
 * <uix-title-bar
 *   title="My App"
 *   @minimize=${() => console.log('Minimize')}
 *   @maximize=${() => console.log('Maximize')}
 *   @close=${() => console.log('Close')}
 * ></uix-title-bar>
 * ```
 *
 * @example Non-Draggable
 * ```html
 * <uix-title-bar
 *   title="Locked Window"
 *   draggable="false"
 * ></uix-title-bar>
 * ```
 *
 * @example With Tabs (Chromium-style)
 * ```html
 * <uix-title-bar show-controls>
 *   <div slot="center" style="display: flex; gap: 4px;">
 *     <button class="tab active">Home</button>
 *     <button class="tab">Documents</button>
 *     <button class="tab">Settings</button>
 *     <button class="tab-new">+</button>
 *   </div>
 * </uix-title-bar>
 * ```
 *
 * @example Hidden Variant
 * ```html
 * <uix-title-bar variant="hidden"></uix-title-bar>
 * ```
 */
