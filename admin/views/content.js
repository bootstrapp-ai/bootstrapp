import { html } from "/npm/lit-html";
import Controller from "/node_modules/@bootstrapp/controller/index.js";
export default {
  tag: "admin-content",

  async bundleAppSPA() {
    await Controller.backend("BUNDLE_APP_SPA");
  },

  async bundleAppSSG() {
    await Controller.backend("BUNDLE_APP_SSG");
  },

  render() {
    return html`
      <uix-list gap="md">
        <uix-button @click=${this.bundleAppSPA.bind(this)} label="Bundle SPA"></uix-button>
        <uix-button @click=${this.bundleAppSSG.bind(this)} label="Bundle SSG"></uix-button>
        <uix-button href="/admin" label="Admin"></uix-button>
      </uix-list>
    `;
  },
};
