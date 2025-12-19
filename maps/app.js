import $APP from "/$app.js";
import mapsSearchComponent from "./search.js";

$APP.addModule({
  name: "maps",
  path: "/$app/maps",
});

$APP.define("maps-search", mapsSearchComponent);
