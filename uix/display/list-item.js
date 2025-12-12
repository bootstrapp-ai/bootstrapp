/**
 * UIX List Item Component
 * Simple list item for use within uix-list
 */

import { html } from "/npm/lit-html";

export default {
  shadowDOM: false,

  render() {
    return html`<li><slot></slot></li>`;
  },
};
