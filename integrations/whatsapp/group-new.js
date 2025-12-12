import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Controller from "/node_modules/@bootstrapp/controller/index.js";
export default {
  tag: "whatsapp-group-new",

  properties: {
    url: T.string(),
    category: T.string({ defaultValue: "foodie" }),
  },

  addGroup() {
    Controller.backend("WHATSAPP_JOIN_GROUP", { url: this.url });
  },

  render() {
    return html`      
        <div full gap="lg">				
					<uix-input type="select" label="Category" .bind=${this.prop("category")} .options=${["foodie", "dancing", "sports", "hikes", "parties", "bars", "tours", "whatsapp"]}></uix-input>
					<uix-divider></uix-divider>
					<uix-list horizontal join>
						<uix-input label="Group Link" type="url" .bind=${this.prop("url")}></uix-input>
						<uix-button @click=${this.addGroup.bind(this)} label="Add"></uix-button>
					</uix-list>
        </div>
    `;
  },
};
