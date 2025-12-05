import T from "@bootstrapp/types";
import { html } from "lit-html";
import { keyed } from "lit-html/directives/keyed.js";
import { html as staticHTML, unsafeStatic } from "lit-html/static.js";
import Router from "./index.js";

export default {
  tag: "router-ui",
  properties: {
    currentRoute: T.object({
      sync: Router,
    }),
  },
  renderRoute(route, params) {
    const component =
      typeof route.component === "function"
        ? route.component(params)
        : route.component;
    return route.template
      ? staticHTML`<${unsafeStatic(route.template)} .component=${component}>
			</${unsafeStatic(route.template)}>`
      : component;
  },

  render() {
    const { route, params } = this.currentRoute || {};
    return route
      ? keyed(
          route.name ?? route.path,
          this.renderRoute(
            typeof route === "function" ? { component: route } : route,
            params,
          ),
        )
      : html`404: Page not found`;
  },
};
