import Theme from "/node_modules/@bootstrapp/theme/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import UIX from "./index.js";

$APP.routes.set({ "/showcase": () => html`<uix-showcase></uix-showcase>` });
Theme.loadCSS("/node_modules/@bootstrapp/uix/theme.css", true);

$APP.addModule(UIX);
