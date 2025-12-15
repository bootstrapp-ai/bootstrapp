/**
 * @bootstrapp/maps - App Module
 * Register maps components
 */

import $APP from "/$app.js";
import mapsSearchComponent from "./search.js";

// Register as module
$APP.addModule({
  name: "maps",
  path: "/$app/maps",
});

// Define the maps-search component
$APP.define("maps-search", mapsSearchComponent);
