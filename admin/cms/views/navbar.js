import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import Router from "/node_modules/@bootstrapp/router/index.js";
export default {
  tag: "cms-navbar",

  properties: {
    model: T.string(),
    directory: T.string({ defaultValue: "data" }),
  },

  willUpdate() {
    if (this.model || !$APP.models) return;
    this.model = Object.keys($APP.models)[0];
    Router.go(`/admin/cms/${this.model}`);
  },

  render() {
    return html`
		<uix-list full vertical>
			${Object.keys($APP.models).map(
        (key) => html`<uix-button
			padding="sm"
			width="full"
			?selected=${key === this.model}
			href=${`/${this.directory}/${key}`}
			ghost
			label=${key}></uix-button>`,
      )}
		</uix-list>
          `;
  },
};
