import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
export default {
  tag: "app-button",
  render() {
    return html`<div class="fixed bottom-[30px] right-[160px]">
                  <uix-button .float=${html`<div class="flex flex-col items-center gap-2">
                    <mcp-inspector></mcp-inspector>
								    <mcp-chatbot></mcp-chatbot>
                    <uix-darkmode></uix-darkmode>
                    <app-dev-only>
                      <template>
                        <bundler-button></bundler-button>
                      </template>
                    </app-dev-only>
                    <p2p-button></p2p-button> 
                  </div>`} icon="plus"></uix-button>
                </div>`;
  },
  properties: {
    label: T.string("Actions"),
  },
};
