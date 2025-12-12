import T from "/$app/types/index.js";
import { html } from "/npm/lit-html";
import $APP from "/$app.js";

export default {
  tag: "admin-theme",
  properties: {
    currentTheme: T.string({ sync: "local", defaultValue: "default" }),
    showGenerator: T.boolean({ defaultValue: false }),
    customColors: T.object({
      defaultValue: {
        primary: "#000000",
        secondary: "#6b7280",
        accent: "#f472b6",
        success: "#22c55e",
        warning: "#eab308",
        error: "#ef4444",
      },
    }),
  },

  themes: [
    {
      id: "default",
      name: "Default",
      description: "Clean and minimal",
      colors: { primary: "#000000", accent: "#3b82f6" },
    },
    {
      id: "nbs",
      name: "Neubrutalist",
      description: "Bold borders and shadows",
      colors: { primary: "#000000", accent: "#f472b6" },
    },
    {
      id: "ocean",
      name: "Ocean",
      description: "Calm blues and greens",
      colors: { primary: "#0284c7", accent: "#06b6d4" },
    },
    {
      id: "sunset",
      name: "Sunset",
      description: "Warm oranges and reds",
      colors: { primary: "#ea580c", accent: "#f43f5e" },
    },
    {
      id: "forest",
      name: "Forest",
      description: "Natural greens",
      colors: { primary: "#16a34a", accent: "#84cc16" },
    },
    {
      id: "midnight",
      name: "Midnight",
      description: "Dark and elegant",
      colors: { primary: "#1e1b4b", accent: "#8b5cf6" },
    },
  ],

  async applyTheme(themeId) {
    this.currentTheme = themeId;

    // Try to use Theme module if available
    if ($APP.Theme?.loadTheme) {
      try {
        await $APP.Theme.loadTheme(themeId);
      } catch (e) {
        console.log("Theme module not available, applying CSS variables directly");
      }
    }

    // Apply CSS variables for the selected theme
    const theme = this.themes.find((t) => t.id === themeId);
    if (theme?.colors) {
      document.documentElement.style.setProperty("--color-primary", theme.colors.primary);
      document.documentElement.style.setProperty("--color-accent", theme.colors.accent);
    }
  },

  applyCustomColors() {
    const colors = this.customColors;
    document.documentElement.style.setProperty("--color-primary", colors.primary);
    document.documentElement.style.setProperty("--color-secondary", colors.secondary);
    document.documentElement.style.setProperty("--color-accent", colors.accent);
    document.documentElement.style.setProperty("--color-success", colors.success);
    document.documentElement.style.setProperty("--color-warning", colors.warning);
    document.documentElement.style.setProperty("--color-error", colors.error);
  },

  updateCustomColor(colorName, value) {
    this.customColors = { ...this.customColors, [colorName]: value };
  },

  renderThemeCard(theme) {
    const isActive = this.currentTheme === theme.id;

    return html`
      <button
        @click=${() => this.applyTheme(theme.id)}
        class="p-6 text-left border-3 border-black rounded-2xl transition-all duration-150
               ${isActive
                 ? "bg-black text-white shadow-none translate-x-[4px] translate-y-[4px]"
                 : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}"
      >
        <!-- Color Preview -->
        <div class="flex gap-2 mb-4">
          <div
            class="w-8 h-8 rounded-lg border-2 border-black"
            style="background-color: ${theme.colors.primary}"
          ></div>
          <div
            class="w-8 h-8 rounded-lg border-2 border-black"
            style="background-color: ${theme.colors.accent}"
          ></div>
        </div>

        <h3 class="font-black text-lg">${theme.name}</h3>
        <p class="text-sm ${isActive ? "text-gray-300" : "text-gray-600"}">
          ${theme.description}
        </p>

        ${isActive
          ? html`
              <div class="flex items-center gap-2 mt-4 text-sm">
                <uix-icon name="check" size="16"></uix-icon>
                Active
              </div>
            `
          : ""}
      </button>
    `;
  },

  renderColorInput(name, label) {
    return html`
      <div class="flex items-center gap-4">
        <input
          type="color"
          .value=${this.customColors[name]}
          @input=${(e) => this.updateCustomColor(name, e.target.value)}
          class="w-12 h-12 border-3 border-black rounded-lg cursor-pointer"
        />
        <div>
          <p class="font-bold text-sm">${label}</p>
          <p class="text-xs text-gray-500 font-mono">${this.customColors[name]}</p>
        </div>
      </div>
    `;
  },

  render() {
    return html`
      <div class="p-8">
        <div class="mb-8">
          <h1 class="text-3xl font-black uppercase mb-2">Theme</h1>
          <p class="text-gray-600">Customize the look and feel of your application</p>
        </div>

        <!-- Theme Presets -->
        <div class="mb-8">
          <h2 class="text-xl font-black uppercase mb-4">Presets</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${this.themes.map((theme) => this.renderThemeCard(theme))}
          </div>
        </div>

        <!-- Custom Theme Generator -->
        <div
          class="bg-white border-3 border-black rounded-2xl overflow-hidden
                 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          <button
            @click=${() => (this.showGenerator = !this.showGenerator)}
            class="w-full flex items-center justify-between px-6 py-4 font-black
                   hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <uix-icon name="palette" size="24"></uix-icon>
              <span>Custom Theme Generator</span>
            </div>
            <uix-icon
              name=${this.showGenerator ? "chevron-up" : "chevron-down"}
              size="24"
            ></uix-icon>
          </button>

          ${this.showGenerator
            ? html`
                <div class="p-6 border-t-3 border-black">
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                    ${this.renderColorInput("primary", "Primary")}
                    ${this.renderColorInput("secondary", "Secondary")}
                    ${this.renderColorInput("accent", "Accent")}
                    ${this.renderColorInput("success", "Success")}
                    ${this.renderColorInput("warning", "Warning")}
                    ${this.renderColorInput("error", "Error")}
                  </div>

                  <button
                    @click=${this.applyCustomColors}
                    class="px-6 py-3 bg-black text-white font-bold rounded-xl
                           border-3 border-black
                           shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
                           hover:translate-x-[2px] hover:translate-y-[2px]
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]
                           transition-all duration-150"
                  >
                    Apply Custom Theme
                  </button>
                </div>
              `
            : ""}
        </div>

        <!-- Preview Section -->
        <div class="mt-8">
          <h2 class="text-xl font-black uppercase mb-4">Preview</h2>
          <div
            class="p-6 bg-white border-3 border-black rounded-2xl
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div class="flex flex-wrap gap-4 mb-6">
              <button
                class="px-4 py-2 bg-black text-white font-bold rounded-lg
                       border-2 border-black"
              >
                Primary Button
              </button>
              <button
                class="px-4 py-2 bg-white text-black font-bold rounded-lg
                       border-2 border-black"
              >
                Secondary
              </button>
              <button class="px-4 py-2 bg-pink-300 font-bold rounded-lg border-2 border-black">
                Accent
              </button>
              <button class="px-4 py-2 bg-green-300 font-bold rounded-lg border-2 border-black">
                Success
              </button>
              <button class="px-4 py-2 bg-yellow-300 font-bold rounded-lg border-2 border-black">
                Warning
              </button>
              <button class="px-4 py-2 bg-red-300 font-bold rounded-lg border-2 border-black">
                Error
              </button>
            </div>

            <div class="space-y-4">
              <input
                type="text"
                placeholder="Text input preview"
                class="w-full px-4 py-3 border-3 border-black rounded-xl"
              />
              <div class="p-4 bg-gray-100 border-3 border-black rounded-xl">
                <p class="font-bold">Card Preview</p>
                <p class="text-sm text-gray-600">
                  This is how cards will look with the current theme.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
