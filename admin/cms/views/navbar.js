import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import Router from "/$app/router/index.js";
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
