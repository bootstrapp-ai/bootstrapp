import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import $APP from "/node_modules/@bootstrapp/base/app.js";
import Router from "/node_modules/@bootstrapp/router/index.js";

export default {
  tag: "admin-template",

  properties: {
    component: T.object(),
    horizontal: T.boolean(true),
    full: T.boolean(true),
    currentRoute: T.object({ sync: Router }),
    class: T.string("flex"),
  },
  render() {
    const { modules } = $APP;
    const navbarItems = modules
      ? Object.keys($APP.settings)
          .filter((ext) => $APP.settings[ext]?.appbar)
          .map((ext) => ({
            ...$APP.settings[ext].appbar,
            label: ext,
            href: `/admin/${ext}`,
          }))
          .map(
            (item) => html`
              <uix-button
                label=${item.label}
                href=${item.href}
                icon=${item.icon}
                hideLabel
                tooltip
                vertical
                selectable
                ghost
                iconSize="lg"
                class="w-full"
              ></uix-button>
            `,
          )
      : [];

    return html`
      <div class="flex flex-col flex-shrink-0 justify-between bg-gray-100">
        <uix-navbar class="w-full flex flex-col">${navbarItems}</uix-navbar>
        <uix-navbar class="w-full flex flex-col">
          <uix-darkmode
              hideLabel               
              tooltip
              vertical
              ghost
              iconSize="lg"
              label="Dark Mode"
              class="w-full"></uix-darkmode>            
          <uix-button
          icon="settings"
          hideLabel
          tooltip
          vertical
          ghost
          iconSize="lg"
          label="Settings"
          class="w-full"></uix-button>
          </uix-navbar>
      </div>
      <div class="flex flex-1 h-full">
        ${this.component}
      </div>
    `;
  },
};
