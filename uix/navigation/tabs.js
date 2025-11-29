import T from "@bootstrapp/types";
import { html } from "lit";

export default {
  tag: "uix-tabs",
  properties: {
    activeTab: T.number(0),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "pills", "underline"],
    }),
    vertical: T.boolean(),
  },
  style: true,
  shadow: true,

  firstUpdated() {
    const slot = this.shadowRoot.querySelector("slot[name=panel]");
    slot.addEventListener("slotchange", () => {
      this.updateActivePanels();
    });
  },

  updateActivePanels() {
    const panelSlot = this.shadowRoot.querySelector("slot[name=panel]");
    const tabSlot = this.shadowRoot.querySelector("slot[name=tab]");

    if (!panelSlot) return;

    const panels = panelSlot.assignedNodes({ flatten: true });
    const tabs = tabSlot?.assignedElements() || [];

    // Update panel visibility
    if (panels.length > 1) {
      panels.forEach((panel, index) => {
        if (index === this.activeTab) {
          panel.removeAttribute("hide");
        } else {
          panel.setAttribute("hide", "");
        }
      });
    }

    // Update tab active state
    tabs.forEach((tab, index) => {
      if (index === this.activeTab) {
        tab.setAttribute("active", "");
      } else {
        tab.removeAttribute("active");
      }
    });
  },

  selectTab(e) {
    const clickedElement = e.target;
    const slot = clickedElement.assignedSlot;
    if (slot && slot.name === "tab") {
      const tabs = slot.assignedElements();
      const index = tabs.indexOf(clickedElement);
      this.activeTab = index;
      this.updateActivePanels();
      this.emit("tab-change", index);
    }
  },

  render() {
    return html`
        <div
          part="tab-list"
          role="tablist"
          aria-orientation=${this.vertical ? "vertical" : "horizontal"}
        >
          <slot name="tab" part="tab" @click=${this.selectTab.bind(this)}></slot>
        </div>
        <slot part="tab-panel" name="panel" part="panel"></slot>
     
    `;
  },
};

/**
 * Tabs Component
 *
 * @component
 * @category navigation
 * @tag uix-tabs
 *
 * Accessible tabs with keyboard navigation and flexible content
 *
 * @example
 * // Pattern 1: Static tabs with multiple panels (each panel rendered separately)
 * ```html
 * <uix-tabs activeTab=2>
 *   <button slot="tab">Profile</button>
 *   <button slot="tab">Settings</button>
 *   <button slot="tab">Account</button>
 *
 *   <div slot="panel">Profile content...</div>
 *   <div slot="panel">Settings content...</div>
 *   <div slot="panel">Account content...</div>
 * </uix-tabs>
 * ```
 *
 * @example
 * // Pattern 2: Dynamic tabs with single panel (content switches based on active tab)
 * ```js
 * html`<uix-tabs>
 *   ${sections.map(section => html`
 *     <button slot="tab">
 *       <uix-icon name=${section.icon}></uix-icon>
 *       ${section.label}
 *     </button>
 *   `)}
 *   <div slot="panel">
 *     ${sections[this.activeTab].render()}
 *   </div>
 * </uix-tabs>`
 * ```
 * @example
 * // With variants
 *
 * ```html
 * <uix-tabs variant="pills">
 *   <button slot="tab">Tab 1</button>
 *   <button slot="tab">Tab 2</button>
 *   <div slot="panel">Panel 1</div>
 *   <div slot="panel">Panel 2</div>
 * </uix-tabs>
 * ```
 *
 * @example
 * // Vertical orientation
 * ```html
 * <uix-tabs vertical variant="underline">
 *   <button slot="tab">Navigation</button>
 *   <button slot="tab">Content</button>
 *   <div slot="panel">Nav content</div>
 *   <div slot="panel">Main content</div>
 * </uix-tabs>
 * ```
 * @example
 * // Controlled with property binding
 * ```js
 * html`<uix-tabs .activeTab=${this.currentTab} @tab-change=${this.handleTabChange}>
 *   <button slot="tab">First</button>
 *   <button slot="tab">Second</button>
 *   <div slot="panel">First panel</div>
 *   <div slot="panel">Second panel</div>
 * </uix-tabs>`
 */
