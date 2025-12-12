import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "/npm/lit-html";
import Model from "/node_modules/@bootstrapp/model/index.js";
export default {
  tag: "gmaps-content",

  properties: {
    actionResult: T.string(),
    category: T.string(),
  },

  handleQueryClick() {
    const input = document.querySelector("#omnibox-singlebox input");
    const button = document.querySelector("#omnibox-singlebox button");
    if (input && button) {
      input.value = "hikes";
      button.click();
    }
  },

  handleSaveClick() {
    chrome.storage.local.get(null, (result) => {
      let allPlaces = [];
      for (const key in result) {
        if (Array.isArray(result[key])) {
          allPlaces = allPlaces.concat(result[key]);
        }
      }
      Model.places.addMany(
        allPlaces.map((place) => ({
          ...place,
          category: this.category,
        })),
      );
      this.actionResult = `Saved ${allPlaces.length} places to the model.`;
      this.requestUpdate("actionResult", null);
    });
  },

  handleClearClick() {
    // Implement clear functionality here
  },

  render() {
    if (!$APP.settings.currentUrl.startsWith("https://www.google.com/maps")) {
      return null;
    }

    return html`
			<div class="flex flex-col gap-4">
				<uix-button
					label="Query Google Maps"
					@click=${this.handleQueryClick.bind(this)}
					class="w-full max-w-xs"
				></uix-button>

				<div class="flex flex-wrap gap-4 items-center">
					<uix-button
						label="Save Places"
						@click=${this.handleSaveClick.bind(this)}
						class="flex-shrink-0"
					></uix-button>

					<uix-button
						label="Clear Places"
						variant="error"
						@click=${this.handleClearClick.bind(this)}
						class="flex-shrink-0"
					></uix-button>

					<h3 class="ml-4 whitespace-nowrap">Places in Storage:</h3>
					${
            this.actionResult
              ? html`<div class="text-gray-700">${this.actionResult}</div>`
              : ""
          }
				</div>
			</div>
		`;
  },
};
