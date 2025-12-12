import { keyed } from "lit-html/directives/keyed.js";

const actions = ["groups", "members"];

import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
export default {
  tag: "whatsapp-admin",

  properties: {
    action: T.string(),
  },

  render() {
    return html`
			<div
				class="flex h-screen justify-between"
			>
				<div
					class="w-72 h-screen overflow-y-auto flex flex-col items-start gap-2 px-2"
				>
					${actions.map(
            (key) => html`
							<uix-button
								padding="sm"
								width="full"
								?selected=${key === this.action}
								href=${`/admin/whatsapp/${key}`}
								ghost
								label=${key}
								class="w-full"
							></uix-button>
						`,
          )}
				</div>

				<uix-divider
					resizable
					vertical
					class="h-screen"
				></uix-divider>

				<div
					class="flex-grow p-10 h-screen overflow-auto"
				>
					${
            !this.action
              ? null
              : keyed(
                  this.action,
                  html`<cms-crud
									.data-query=${{ model: this.action, key: "rows" }}
								></cms-crud>`,
                )
          }
				</div>
			</div>
		`;
  },
};
