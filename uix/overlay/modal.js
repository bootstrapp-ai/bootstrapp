import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-modal",
  properties: {
    open: T.boolean(false),
    closeOnEscape: T.boolean(true),
    closeOnBackdropClick: T.boolean(true),
  },
  style: true,
  shadow: true,
  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector("dialog");
    this.dialog.addEventListener("close", () => {
      this.open = false;
      this.emit("modal-close", { returnValue: this.dialog.returnValue });
    });
    this.dialog.addEventListener("cancel", (e) => {
      if (!this.closeOnEscape) {
        e.preventDefault();
      } else {
        this.emit("modal-cancel");
      }
    });
    this.dialog.addEventListener("click", (e) => {
      if (this.closeOnBackdropClick && e.target === this.dialog) {
        const rect = this.dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;

        if (!isInDialog) this.close();
      }
    });

    const closeLinks = this.querySelectorAll("[data-close]");
    closeLinks.forEach((link) => {
      link.addEventListener("click", this.close.bind(this));
    });
  },
  updated({ changedProps }) {
    if (changedProps.has("open") && this.dialog) {
      if (this.open && !this.dialog.open) {
        this.showModal();
      } else if (!this.open && this.dialog.open) {
        this.dialog.close();
      }
    }
  },
  showModal() {
    if (this.dialog && !this.dialog.open) {
      this.dialog.showModal();
      this.open = true;
      this.emit("modal-open");
    }
  },
  show() {
    if (this.dialog && !this.dialog.open) {
      this.dialog.show();
      this.open = true;
      this.emit("modal-open");
    }
  },
  close(returnValue) {
    if (this.dialog?.open) {
      this.dialog.close(returnValue);
      this.open = false;
    }
  },
  render() {
    return html`
      <slot name="trigger" @click=${this.showModal.bind(this)}></slot>
      <dialog part="dialog">
        <div part="header" class="modal-header">
          <slot name="header"></slot>
        </div>
        <div part="body" class="modal-body">
          <slot></slot>
        </div>
        <div part="footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  },
};

/**
 * Modal Component
 *
 * @component
 * @category overlay
 * @tag uix-modal
 *
 * Modal dialog using native HTML dialog API with flexible trigger options
 *
 * @example
 * // Pattern 1: Modal with trigger button in slot
 * ```html
 * <uix-modal>
 *   <button slot="trigger">Open Modal</button>
 *   <h2 slot="header">Modal Title</h2>
 *   <p>Modal content goes here...</p>
 *   <div slot="footer">
 *     <uix-button data-close>Cancel</uix-button>
 *     <uix-button variant="primary">Confirm</uix-button>
 *   </div>
 * </uix-modal>
 * ```
 *
 * @example
 * // Pattern 2: Modal opened from external button
 * ```js
 * html`<button @click=${() => document.querySelector('#myModal').showModal()}>
 *   Open Modal
 * </button>
 *
 * <uix-modal id="myModal">
 *   <h2 slot="header">Delete Item</h2>
 *   <p>Are you sure you want to delete this item?</p>
 *   <div slot="footer">
 *     <uix-button @click=${(e) => e.target.closest('uix-modal').close()}>
 *       Cancel
 *     </uix-button>
 *     <uix-button variant="danger" @click=${this.handleDelete}>
 *       Delete
 *     </uix-button>
 *   </div>
 * </uix-modal>`
 * ```
 *
 * @example
 *  Pattern 3: Controlled modal with open property
 * ```js
 * html`<uix-modal
 *   .open=${this.isModalOpen}
 *   @modal-close=${() => this.isModalOpen = false}
 * >
 *   <h2 slot="header">Settings</h2>
 *   <p>Modal content...</p>
 *   <div slot="footer">
 *     <uix-button @click=${() => this.isModalOpen = false}>Close</uix-button>
 *   </div>
 * </uix-modal>`
 * ```
 *
 * @example
 * // With options
 * ```js
 * html`<uix-modal
 *   .closeOnEscape=${false}
 *   .closeOnBackdropClick=${false}
 *   @modal-close=${this.handleClose}
 * >
 *   <h2 slot="header">Important Notice</h2>
 *   <p>This modal cannot be closed by clicking outside or pressing Escape.</p>
 *   <div slot="footer">
 *     <uix-button @click=${(e) => e.target.closest('uix-modal').close('confirmed')}>
 *       I Understand
 *     </uix-button>
 *   </div>
 * </uix-modal>`
 * ```
 */
