import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import { keyed } from "lit-html/directives/keyed.js";
export default {
  tag: "cms-ui",

  properties: {
    model: T.string(),
    directory: T.string(),
    selectedId: T.string(),
  },
  class: "flex h-screen justify-between",
  render() {
    return html`
        <div
          class="w-64 h-screen overflow-y-auto">
          <cms-navbar model=${this.model} directory=${this.directory}></cms-navbar>
        </div>
        <uix-divider resizable vertical class="border-l cursor-col-resize"></uix-divider>
        <div class="w-full p-8 h-screen overflow-auto">
          ${
            !this.model
              ? null
              : keyed(
                  this.model,
                  html`<cms-crud 
                          .data-query=${{ model: this.model, key: "rows" }} 
                          selectedId=${this.selectedId}></cms-crud>`,
                )
          }
        </div>
      `;
  },
};
