import T from "@bootstrapp/types";
import { html } from "lit-html";
import { html as staticHTML, unsafeStatic } from "lit-html/static.js";
export default {
  tag: "router-ui",
  properties: {
    currentRoute: T.object({
      sync: "ram",
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
    console.log(this.currentRoute);
    return route
      ? this.renderRoute(
          typeof route === "function" ? { component: route } : route,
          params,
        )
      : html`404: Page not found`;
  },
};
