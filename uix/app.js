import Theme from "@bootstrapp/theme";
import { html } from "lit-html";
import $APP from "@bootstrapp/base/app.js";
import UIX from "./index.js";

$APP.routes.set({ "/showcase": () => html`<uix-showcase></uix-showcase>` });
Theme.loadCSS("/node_modules/@bootstrapp/uix/theme.css", true);

$APP.addModule(UIX);
