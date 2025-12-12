import { html } from "/npm/lit-html";
export default {
  tag: "bundler-button",
  extends: "uix-modal",
  cta: html``,
  render() {
    return html`<uix-button icon="file-box"></uix-button>
								<dialog>
									<bundler-ui></bundler-ui>
								</dialog>`;
  },
};
