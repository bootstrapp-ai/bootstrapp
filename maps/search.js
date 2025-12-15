import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import { createMapsClient } from "./index.js";

export default {
  tag: "maps-search",
  style: true,

  properties: {
    query: T.string({ defaultValue: "" }),
    results: T.array({ defaultValue: [] }),
    loading: T.boolean({ defaultValue: false }),
    selectedResult: T.object(),
    placeholder: T.string({ defaultValue: "Search for a place..." }),
  },

  async search() {
    if (!this.query.trim()) return;

    this.loading = true;
    try {
      const client = createMapsClient();
      this.results = await client.search(this.query);
    } catch (err) {
      console.error("Maps search error:", err);
      this.results = [];
    }
    this.loading = false;
  },

  selectResult(result) {
    this.selectedResult = result;
    this.emit("place-selected", result);
  },

  handleKeydown(e) {
    if (e.key === "Enter") this.search();
  },

  render() {
    return html`<div class="maps-search-input">
          <uix-input
            .value=${this.query}
            @input=${(e) => (this.query = e.target.value)}
            @keydown=${this.handleKeydown}
            placeholder=${this.placeholder}
            icon="search"
          ></uix-input>
          <uix-button @click=${() => this.search()} ?loading=${this.loading}>
            <uix-icon name="search" size="18"></uix-icon>
            Search
          </uix-button>
        </div>

        ${
          this.results.length > 0
            ? html`
              <div class="maps-results">
                ${this.results.map(
                  (r) => html`
                    <div
                      class="maps-result ${this.selectedResult?.id === r.id ? "selected" : ""}"
                      @click=${() => this.selectResult(r)}
                    >
                      <uix-icon name="map-pin" size="16" class="maps-result-icon"></uix-icon>
                      <div class="maps-result-content">
                        <strong class="maps-result-name">${r.name}</strong>
                        <small class="maps-result-address">${r.address}</small>
                      </div>
                    </div>
                  `,
                )}
              </div>
            `
            : ""
        }
    `;
  },
};
