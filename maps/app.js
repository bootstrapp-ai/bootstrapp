import $APP from "/$app.js";
import mapsSearchComponent from "./search.js";

$APP.addModule({ name: "maps" });

$APP.define("maps-search", mapsSearchComponent);
