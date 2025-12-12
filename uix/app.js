import Theme from "/$app/theme/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";
import UIX from "./index.js";

$APP.routes.set({ "/showcase": () => html`<uix-showcase></uix-showcase>` });
Theme.loadCSS("/$app/uix/theme.css", true);

$APP.addModule(UIX);
