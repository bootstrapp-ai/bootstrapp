import { html } from "lit-html";

const mv3Events = {
  PLACE_LIST_DATA: (message, popup) => {
    const { queryTitle, places } = message.data;
    chrome.storage.local.get([queryTitle], (result) => {
      const existingPlaces = result[queryTitle] || [];
      let newPlacesAdded = 0;

      places.forEach((place) => {
        if (
          !existingPlaces.some(
            (existingPlace) => existingPlace.placeId === place.placeId,
          )
        ) {
          existingPlaces.push(place);
          newPlacesAdded++;
        }
      });

      chrome.storage.local.set({ [queryTitle]: existingPlaces }, () => {
        console.log(
          `Updated place list for "${queryTitle}". Total places: ${existingPlaces.length}, New places added: ${newPlacesAdded}`,
        );
        popup.placesCount += newPlacesAdded;
        popup.requestUpdate("placesCount", popup.placesCount - newPlacesAdded);
      });
    });
  },
};

$APP.mv3Connections.add("gmaps");
