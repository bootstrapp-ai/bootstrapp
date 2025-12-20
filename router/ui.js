import T from "/$app/types/index.js";
import $APP from "/$app.js";
import { html } from "/npm/lit-html";
import { keyed } from "/npm/lit-html/directives/keyed.js";
import { html as staticHTML, unsafeStatic } from "/npm/lit-html/static.js";
export default {
  tag: "router-ui",
  properties: {
    currentRoute: T.object({
      sync: $APP.Router,
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
    console.error(this.currentRoute, "current Route");
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
