import T from "@bootstrapp/types";
import { html } from "lit-html";

export default {
  tag: "uix-alert-dialog",
  properties: {
    open: T.boolean(false),
    title: T.string(""),
    message: T.string(""),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "success", "warning", "error", "info"],
    }),
    confirmText: T.string({ defaultValue: "OK" }),
    cancelText: T.string({ defaultValue: "Cancel" }),
    showCancel: T.boolean(false),
    closeOnBackdropClick: T.boolean(false),
  },
  style: true,
  shadow: true,

  _dialog: null,

  connected() {
    this._dialog = this.shadowRoot.querySelector("dialog");
    if (this.open) {
      this.show();
    }
  },

  updated({ changedProps }) {
    if (changedProps.has("open")) {
      if (this.open) {
        this.show();
      } else {
        this.close();
      }
    }
  },

  show() {
    if (!this._dialog) {
      this._dialog = this.shadowRoot.querySelector("dialog");
    }
    this._dialog?.showModal();
    this.open = true;
    this.emit("open");
  },

  close(confirmed = false) {
    this._dialog?.close(confirmed ? "confirm" : "cancel");
    this.open = false;
    this.emit("close", { confirmed });
  },

  confirm() {
    this.close(true);
    this.emit("confirm");
  },

  cancel() {
    this.close(false);
    this.emit("cancel");
  },

  handleBackdropClick(e) {
    if (this.closeOnBackdropClick && e.target === this._dialog) {
      this.cancel();
    }
  },

  _getIcon(variant) {
    const icons = {
      success: "circle-check",
      error: "x-circle",
      warning: "alert-triangle",
      info: "info",
      default: null,
    };
    return icons[variant];
  },

  render() {
    const icon = this._getIcon(this.variant);

    return html`
      <dialog
        class="alert-dialog"
        @click=${this.handleBackdropClick}
        @cancel=${(e) => {
          e.preventDefault();
          this.cancel();
        }}
      >
        <div class="alert-dialog-content ${this.variant}">
          ${
            icon
              ? html`
                <div class="alert-dialog-icon">
                  <uix-icon name=${icon}></uix-icon>
                </div>
              `
              : ""
          }

          <div class="alert-dialog-body">
            ${this.title ? html`<h3 class="alert-dialog-title">${this.title}</h3>` : ""}

            <div class="alert-dialog-message">
              ${this.message ? html`<p>${this.message}</p>` : ""}
              <slot></slot>
            </div>
          </div>

          <div class="alert-dialog-actions">
            ${
              this.showCancel
                ? html`
                  <button class="alert-dialog-button cancel" @click=${this.cancel}>
                    ${this.cancelText}
                  </button>
                `
                : ""
            }
            <button class="alert-dialog-button confirm" @click=${this.confirm}>
              ${this.confirmText}
            </button>
          </div>
        </div>
      </dialog>
    `;
  },
};

/**
 * Alert Dialog Component
 *
 * @component
 * @category overlay
 * @tag uix-alert-dialog
 *
 * A modal dialog for important messages, confirmations, and alerts.
 *
 * @example
 * // Basic alert
 * ```html
 * <uix-alert-dialog
 *   title="Welcome"
 *   message="Thank you for signing up!"
 * ></uix-alert-dialog>
 *
 * <uix-button onclick="this.previousElementSibling.show()">
 *   Show Alert
 * </uix-button>
 * ```
 *
 * @example
 * // Confirmation dialog
 * ```html
 * <uix-alert-dialog
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="error"
 *   show-cancel
 *   confirm-text="Delete"
 *   cancel-text="Cancel"
 * ></uix-alert-dialog>
 *
 * <uix-button onclick="this.previousElementSibling.show()">
 *   Delete
 * </uix-button>
 * ```
 *
 * @example
 * // Success alert
 * ```html
 * <uix-alert-dialog
 *   title="Success!"
 *   message="Your changes have been saved successfully."
 *   variant="success"
 *   confirm-text="Great!"
 * ></uix-alert-dialog>
 * ```
 *
 * @example
 * // Warning alert
 * ```html
 * <uix-alert-dialog
 *   title="Warning"
 *   message="Your session is about to expire. Would you like to continue?"
 *   variant="warning"
 *   show-cancel
 *   confirm-text="Continue"
 *   cancel-text="Logout"
 * ></uix-alert-dialog>
 * ```
 *
 * @example
 * // Info alert
 * ```html
 * <uix-alert-dialog
 *   title="New Features"
 *   message="Check out our latest updates and improvements!"
 *   variant="info"
 *   confirm-text="Learn More"
 * ></uix-alert-dialog>
 * ```
 *
 * @example
 * // With custom content
 * ```html
 * <uix-alert-dialog title="Custom Content" variant="info">
 *   <p>This dialog can contain any HTML content:</p>
 *   <ul>
 *     <li>Bullet points</li>
 *     <li>Links</li>
 *     <li>Images</li>
 *   </ul>
 *   <img src="/image.jpg" alt="Example" style="max-width: 100%;">
 * </uix-alert-dialog>
 * ```
 *
 * @example
 * // With event handling
 * ```html
 * <uix-alert-dialog
 *   id="confirmDialog"
 *   title="Confirm Action"
 *   message="Do you want to proceed?"
 *   show-cancel
 * ></uix-alert-dialog>
 *
 * <script>
 *   const dialog = document.querySelector('#confirmDialog');
 *   dialog.addEventListener('confirm', () => {
 *     console.log('User confirmed');
 *     // Perform action
 *   });
 *   dialog.addEventListener('cancel', () => {
 *     console.log('User cancelled');
 *   });
 * </script>
 * ```
 *
 * @example
 * // Programmatic control
 * ```js
 * const dialog = document.querySelector('uix-alert-dialog');
 *
 * // Show the dialog
 * dialog.show();
 *
 * // Close the dialog
 * dialog.close();
 *
 * // Confirm (triggers confirm event)
 * dialog.confirm();
 *
 * // Cancel (triggers cancel event)
 * dialog.cancel();
 * ```
 *
 * @example
 * // Close on backdrop click
 * ```html
 * <uix-alert-dialog
 *   title="Click Outside to Close"
 *   message="This dialog will close when you click the backdrop."
 *   close-on-backdrop-click
 * ></uix-alert-dialog>
 * ```
 */
