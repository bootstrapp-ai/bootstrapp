import T from "@bootstrapp/types";
import { html } from "lit-html";
export default {
  tag: "uix-darkmode",
  icons: ["moon", "sun"],
  properties: {
    width: T.string({ defaultValue: "fit" }),
    compact: T.boolean(),
    darkmode: T.boolean({
      sync: "local",
      defaultValue: true,
    }),
  },

  click(e) {
    e.stopPropagation();
    this.darkmode = !this.darkmode;
    this.icon = this.darkmode ? "sun" : "moon";
  },
  willUpdate(changedProps) {
    if (changedProps.has("darkmode"))
      document.documentElement.classList.toggle("dark");
  },
  connected() {
    this.icon = this.darkmode ? "sun" : "moon";
    if (this.darkmode) document.documentElement.classList.add("dark");
    this.on("button#click", this.click.bind(this));
  },
  render() {
    return this.compact
      ? html`<button>
        <uix-icon ghost name=${this.icon} class="w-7 h-7 cursor-pointer shrink-0"></uix-icon>
        </button>
        `
      : html`<button class="cursor-pointer w-full flex items-center p-2 rounded-md hover:bg-surface-lighter text-left text-sm">
                    <uix-icon name=${this.icon} class="w-5 h-5 mr-3 shrink-0"></uix-icon>
                    <span>${this.darkmode ? "Light Mode" : "Dark Mode"}</span>
                    <div class="ml-auto w-10 h-5 ${
                      this.darkmode ? "bg-red-700" : "bg-gray-600"
                    } rounded-full flex items-center p-1 transition-colors">
                        <div class="w-4 h-4 bg-white rounded-full transform transition-transform ${
                          this.darkmode ? "translate-x-4" : ""
                        }"></div>
                    </div>
                </button>`;
  },
};
