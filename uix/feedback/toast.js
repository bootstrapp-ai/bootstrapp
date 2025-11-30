import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-toast",
  properties: {
    message: T.string(""),
    title: T.string(""),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "success", "warning", "error", "info"],
    }),
    duration: T.number({ defaultValue: 3000 }), // 0 = permanent
    position: T.string({
      defaultValue: "top-right",
      enum: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    }),
    closable: T.boolean(true),
    visible: T.boolean(),
    toasts: T.array([]),
  },
  style: true,
  shadow: true,
  connected() {
    // Auto-show if message is set
    if (this.message) {
      this.show();
    }
  },

  show(options = {}) {
    const toast = {
      id: Date.now() + Math.random(),
      title: options.title || this.title,
      message: options.message || this.message,
      variant: options.variant || this.variant,
      duration:
        options.duration !== undefined ? options.duration : this.duration,
      closable:
        options.closable !== undefined ? options.closable : this.closable,
    };

    this.toasts = [...this.toasts, toast];
    this.visible = true;
    this.emit("show", toast);

    // Auto-hide after duration
    if (toast.duration > 0) {
      setTimeout(() => this.hide(toast.id), toast.duration);
    }

    return toast.id;
  },

  hide(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    if (this.toasts.length === 0) {
      this.visible = false;
    }
    this.emit("hide", { id });
  },

  hideAll() {
    this.toasts = [];
    this.visible = false;
    this.emit("hide-all");
  },

  _getIcon(variant) {
    const icons = {
      success: "circle-check",
      error: "x-circle",
      warning: "alert-triangle",
      info: "info",
      default: "bell",
    };
    return icons[variant] || icons.default;
  },

  render() {
    if (!this.visible) return "";

    return html`
      <div part="container" class="toast-container ${this.position}">
        ${this.toasts.map(
          (toast) => html`
            <div
              part="toast"
              class="toast toast-${toast.variant}"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              <div part="icon" class="toast-icon">
                <uix-icon name=${this._getIcon(toast.variant)}></uix-icon>
              </div>
              <div part="content" class="toast-content">
                ${toast.title ? html`<div part="title" class="toast-title">${toast.title}</div>` : ""}
                <div part="message" class="toast-message">${toast.message}</div>
              </div>
              ${
                toast.closable
                  ? html`
                    <button
                      part="close"
                      class="toast-close"
                      @click=${() => this.hide(toast.id)}
                      aria-label="Close"
                    >
                      <uix-icon name="x"></uix-icon>
                    </button>
                  `
                  : ""
              }
            </div>
          `,
        )}
      </div>
    `;
  },
};

/**
 * Toast Component
 *
 * @component
 * @category feedback
 * @tag uix-toast
 *
 * Toast notifications for displaying temporary messages to users.
 *
 * @example
 * // Basic toast (programmatic)
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({ message: 'Hello World!' });
 * ```
 *
 * @example
 * // Success toast
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   title: 'Success!',
 *   message: 'Your changes have been saved.',
 *   variant: 'success'
 * });
 * ```
 *
 * @example
 * // Error toast
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   title: 'Error',
 *   message: 'Failed to save changes. Please try again.',
 *   variant: 'error',
 *   duration: 5000
 * });
 * ```
 *
 * @example
 * // Warning toast
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   title: 'Warning',
 *   message: 'Your session will expire in 5 minutes.',
 *   variant: 'warning'
 * });
 * ```
 *
 * @example
 * // Info toast
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   title: 'Did you know?',
 *   message: 'You can press Ctrl+S to save.',
 *   variant: 'info',
 *   duration: 6000
 * });
 * ```
 *
 * @example
 * // Permanent toast (manual close only)
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   message: 'This stays until you close it.',
 *   duration: 0
 * });
 * ```
 *
 * @example
 * // Different positions
 * ```html
 * <uix-toast position="top-left"></uix-toast>
 * <uix-toast position="top-center"></uix-toast>
 * <uix-toast position="top-right"></uix-toast>
 * <uix-toast position="bottom-left"></uix-toast>
 * <uix-toast position="bottom-center"></uix-toast>
 * <uix-toast position="bottom-right"></uix-toast>
 * ```
 *
 * @example
 * // Non-closable toast
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({
 *   message: 'Processing...',
 *   closable: false,
 *   duration: 2000
 * });
 * ```
 *
 * @example
 * // Multiple toasts
 * ```js
 * const toast = document.querySelector('uix-toast');
 * toast.show({ message: 'First toast', variant: 'info' });
 * toast.show({ message: 'Second toast', variant: 'success' });
 * toast.show({ message: 'Third toast', variant: 'warning' });
 * ```
 *
 * @example
 * // Complete example with button triggers
 * ```html
 * <div>
 *   <uix-toast id="myToast"></uix-toast>
 *
 *   <uix-button onclick="document.querySelector('#myToast').show({ message: 'Info message', variant: 'info' })">
 *     Show Info
 *   </uix-button>
 *
 *   <uix-button onclick="document.querySelector('#myToast').show({ title: 'Success', message: 'Operation completed!', variant: 'success' })">
 *     Show Success
 *   </uix-button>
 *
 *   <uix-button onclick="document.querySelector('#myToast').show({ title: 'Error', message: 'Something went wrong!', variant: 'error' })">
 *     Show Error
 *   </uix-button>
 *
 *   <uix-button onclick="document.querySelector('#myToast').hideAll()">
 *     Hide All
 *   </uix-button>
 * </div>
 * ```
 */
