/**
 * App Link Component
 * Core link component for navigation and routing
 * Popup behaviors (tooltip, dropdown, etc.) moved to separate uix components
 */

import Router from "/node_modules/@bootstrapp/router/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";

export default {
  tag: "app-link",
  style: true,
  shadow: true,
  properties: {
    content: T.object(),
    external: T.boolean(),
    skipRoute: T.boolean(),
    hideLabel: T.boolean(),
    disabled: T.boolean(),
    name: T.string(),
    alt: T.string(),
    label: T.string(),
    type: T.string(),
    href: T.string(),
    related: T.string(),
    icon: T.string(),
    click: T.function(),
    confirmation: T.string(),
    popovertarget: T.string(),
    popovertargetaction: T.string(),
  },
  _handlePopoverTarget(e) {
    if (!this.popovertarget) return false;

    const target = document.getElementById(this.popovertarget);
    if (!target || typeof target.toggle !== "function") return false;

    e.preventDefault();
    e.stopPropagation();

    // Get the actual button/anchor element from shadow DOM
    const triggerElement = this.shadowRoot.querySelector("button, a");

    const action = this.popovertargetaction || "toggle";
    if (action === "toggle") {
      target.toggle(triggerElement);
    } else if (action === "show") {
      target._open(triggerElement);
    } else if (action === "hide") {
      target._close();
    }

    return true;
  },

  _defaultOnClick(e) {
    // Prevent any action if disabled
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }

    // Handle popover target first
    if (this._handlePopoverTarget(e)) {
      return;
    }

    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      return;
    }
    const link = e.currentTarget;
    const localLink =
      this.href && link.origin === window.location.origin && !this.external;
    // Prevent default for local links
    if (!this.href || localLink) {
      e.preventDefault();
    }
    // Handle local routing
    if (localLink && !this.skipRoute) {
      const path = [link.pathname, link.search].filter(Boolean).join("");
      Router.go(path);
      return;
    }
    // Handle custom click handler
    if (this.click && this.type !== "submit") {
      if (this.confirmation) {
        if (window.confirm(this.confirmation)) {
          this.click(e);
        }
      } else {
        this.click(e);
      }
      e.stopImmediatePropagation();
    }
  },
  render() {
    const content = html`
      ${this.icon ? html`<uix-icon name=${this.icon}></uix-icon>` : null}
      <slot></slot>
      ${this.hideLabel ? null : this.label}
    `;
    const useButton = !this.href && this.popovertarget;

    if (useButton) {
      return html`
        <button
          part="anchor"
          @click=${this._defaultOnClick}
          name=${this.name || this.label || this.alt}
          aria-disabled=${this.disabled ? "true" : "false"}
          ?disabled=${this.disabled}
          type="button"
        >
          ${content}
        </button>
      `;
    }

    return html`
      <a
        part="anchor"
        href=${this.disabled ? undefined : this.href || "#"}
        @click=${this._defaultOnClick}
        related=${this.related}
        name=${this.name || this.label || this.alt}
        alt=${this.alt || this.label || this.name}
        aria-disabled=${this.disabled ? "true" : "false"}
        ?disabled=${this.disabled}
      >
        ${content}
      </a>
    `;
  },
};
