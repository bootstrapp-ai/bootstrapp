import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";

export default {
  tag: "uix-accordion",
  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "bordered", "filled", "flush", "separated"],
    }),
    single: T.boolean(false),
    rounded: T.boolean(true),
    openItems: T.array([]),
  },
  style: true,
  shadow: true,
  connected() {
    this.openItems = [];
  },
  firstUpdated() {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => {
        this.initializeItems();
      });
      this.initializeItems();
    }
  },
  initializeItems() {
    const slot = this.shadowRoot.querySelector("slot");
    if (!slot) return;
    const items = slot.assignedElements();
    items.forEach((item, index) => {
      if (
        index % 2 === 0 &&
        (item.hasAttribute("open") || item.hasAttribute("prevent-collapse"))
      ) {
        const panelIndex = Math.floor(index / 2);
        if (!this.openItems.includes(panelIndex)) {
          this.openItems.push(panelIndex);
        }
      }
    });

    this.updatePanels();
  },

  updatePanels() {
    const slot = this.shadowRoot.querySelector("slot");
    if (!slot) return;

    const items = slot.assignedElements();

    items.forEach((item, index) => {
      const isHeader = index % 2 === 0;
      const panelIndex = Math.floor(index / 2);

      if (isHeader) {
        // Header element (even index)
        if (this.openItems.includes(panelIndex)) {
          item.setAttribute("active", "");
        } else {
          item.removeAttribute("active");
        }
      } else {
        // Panel element (odd index)
        if (this.openItems.includes(panelIndex)) {
          item.removeAttribute("hide");
        } else {
          item.setAttribute("hide", "");
        }
      }
    });
  },
  handleClick(e) {
    // Find the closest element with the 'header' attribute
    const headerElement = e.target.closest("[header]");

    if (!headerElement) return;
    if (headerElement.hasAttribute("prevent-collapse")) return;

    // Get all direct children of the accordion element
    const items = Array.from(this.children);
    const clickedIndex = items.indexOf(headerElement);

    // Calculate which panel was clicked (every header+content pair)
    const panelIndex = Math.floor(clickedIndex / 2);

    if (this.single) {
      // Single mode: only one item open at a time
      if (this.openItems.includes(panelIndex)) {
        this.openItems = [];
      } else {
        this.openItems = [panelIndex];
      }
    } else {
      // Multiple mode: toggle individual items
      if (this.openItems.includes(panelIndex)) {
        this.openItems = this.openItems.filter((i) => i !== panelIndex);
      } else {
        this.openItems = [...this.openItems, panelIndex];
      }
    }

    this.updatePanels();
    this.emit("accordion-toggle", {
      index: panelIndex,
      open: this.openItems.includes(panelIndex),
    });
  },
  render() {
    return html`
      <div part="container" class="accordion-container">
        <slot @click=${this.handleClick.bind(this)}></slot>
      </div>
    `;
  },
};

/**
 * Accordion Component
 *
 * @component
 * @category layout
 * @tag uix-accordion
 *
 * Collapsible container with alternating header/content pairs. Click even-indexed elements to toggle odd-indexed elements.
 *
 * @example
 * // Basic accordion - alternating headers and content
 * ```html
 * <uix-accordion>
 *   <button>Section 1</button>
 *   <div>Content for section 1</div>
 *   <button>Section 2</button>
 *   <div>Content for section 2</div>
 *   <button>Section 3</button>
 *   <div>Content for section 3</div>
 * </uix-accordion>
 * ```
 *
 * @example
 * // FAQ style accordion
 * ```html
 * <uix-accordion variant="bordered">
 *   <div>What is UIX?</div>
 *   <div><p>UIX is a component library built with Lit and web components.</p></div>
 *   <div>How do I install it?</div>
 *   <div><p>Follow the installation guide in the documentation.</p></div>
 *   <div>Is it free?</div>
 *   <div><p>Yes, UIX is completely free and open source.</p></div>
 * </uix-accordion>
 * ```
 *
 * @example
 * // Single mode - only one item open at a time
 * ```html
 * <uix-accordion single>
 *   <button>Profile</button>
 *   <div>Profile settings content...</div>
 *   <button>Settings</button>
 *   <div>General settings content...</div>
 *   <button>Privacy</button>
 *   <div>Privacy settings content...</div>
 * </uix-accordion>
 * ```
 *
 * @example
 * // With initial open state
 * ```html
 * <uix-accordion>
 *   <button open>Already Open</button>
 *   <div>This panel starts open</div>
 *   <button>Closed</button>
 *   <div>This panel starts closed</div>
 *   <button open>Also Open</button>
 *   <div>This panel starts open too</div>
 * </uix-accordion>
 * ```
 *
 * @example
 * // With variants
 * ```html
 * <uix-accordion variant="filled">
 *   <div>Header 1</div>
 *   <div>Panel 1 content</div>
 *   <div>Header 2</div>
 *   <div>Panel 2 content</div>
 * </uix-accordion>
 * ```
 *
 * @example
 * // With event handler
 * ```js
 * html`<uix-accordion
 *   @accordion-toggle=${(e) => console.log('Item', e.detail.index, 'is now', e.detail.open ? 'open' : 'closed')}
 * >
 *   <button>Item 1</button>
 *   <div>Content 1</div>
 *   <button>Item 2</button>
 *   <div>Content 2</div>
 * </uix-accordion>`
 * ```
 */
