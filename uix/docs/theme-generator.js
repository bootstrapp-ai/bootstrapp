/**
 * UIX Theme Generator
 * Interactive tool for creating custom themes
 * Uses the new semantic shade format (lighter, light, DEFAULT, dark, darker)
 */
import Theme from "/node_modules/@bootstrapp/theme/index.js";
import T from "/node_modules/@bootstrapp/types/index.js";
import { html, nothing } from "lit-html";

// Color categories with their default values (Gruvbox-inspired)
const DEFAULT_COLORS = {
  primary: {
    DEFAULT: "#fabd2f",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  secondary: {
    DEFAULT: "#83a598",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  success: {
    DEFAULT: "#b8bb26",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  danger: {
    DEFAULT: "#fb4934",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  warning: {
    DEFAULT: "#fe8019",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  info: {
    DEFAULT: "#83a598",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  surface: {
    DEFAULT: "#504945",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
  inverse: {
    DEFAULT: "#282828",
    lighter: null,
    light: null,
    dark: null,
    darker: null,
  },
};

export default {
  properties: {
    themeName: T.string("custom-theme"),
    sectionTab: T.number(0),
    // Color palette - new semantic format
    colors: T.object({ defaultValue: structuredClone(DEFAULT_COLORS) }),
    // Track which colors have expanded shade editors
    expandedColors: T.object({ defaultValue: {} }),
    // Text color
    textColor: T.string("default"),
    // Spacing scale
    spacing: T.object({
      defaultValue: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
      },
    }),
    // Border radius
    radius: T.object({
      defaultValue: {
        none: "0",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    }),
    // Typography
    typography: T.object({
      defaultValue: {
        fontSize: {
          xs: "0.75rem",
          sm: "0.875rem",
          base: "1rem",
          lg: "1.125rem",
          xl: "1.25rem",
          "2xl": "1.5rem",
          "3xl": "1.875rem",
        },
        fontWeight: {
          normal: "400",
          medium: "500",
          semibold: "600",
          bold: "700",
        },
        lineHeight: {
          tight: "1.2",
          normal: "1.5",
          relaxed: "1.75",
        },
      },
    }),
  },

  _updateColor(category, shade, value) {
    this.colors = {
      ...this.colors,
      [category]: {
        ...this.colors[category],
        [shade]: value,
      },
    };
    this._applyPreview();
  },

  _applyPreview() {
    const theme = this.generateThemeObject();
    Theme.applyTheme(theme);
  },

  _toggleExpanded(category) {
    this.expandedColors = {
      ...this.expandedColors,
      [category]: !this.expandedColors[category],
    };
  },

  _toggleAutoShade(category, shade) {
    const currentValue = this.colors[category][shade];
    if (currentValue === null) {
      // Set to a default value (copy from DEFAULT)
      this._updateColor(category, shade, this.colors[category].DEFAULT);
    } else {
      // Set back to auto
      this._updateColor(category, shade, null);
    }
  },

  generateThemeObject() {
    // Generate theme object matching gruvbox-dark.js format
    const colorOutput = {};

    for (const [category, shades] of Object.entries(this.colors)) {
      // Check if any shades are customized (non-null)
      const hasCustomShades = Object.entries(shades).some(
        ([key, val]) => key !== "DEFAULT" && val !== null,
      );

      if (hasCustomShades) {
        // Output as object with only non-null values
        const colorObj = { DEFAULT: shades.DEFAULT };
        for (const [shade, value] of Object.entries(shades)) {
          if (shade !== "DEFAULT" && value !== null) {
            colorObj[shade] = value;
          }
        }
        colorOutput[category] = colorObj;
      } else {
        // Output as simple string
        colorOutput[category] = shades.DEFAULT;
      }
    }

    return {
      name: this.themeName,
      link: { color: "var(--color-primary)" },
      text: { color: this.textColor },
      color: colorOutput,
      spacing: this.spacing,
      typography: this.typography,
      radius: this.radius,
    };
  },

  exportTheme() {
    const theme = this.generateThemeObject();
    const themeCode = `/**
 * ${theme.name} Theme
 * Generated with UIX Theme Generator
 */

export default ${JSON.stringify(theme, null, 2)};
`;

    const blob = new Blob([themeCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.themeName}.js`;
    a.click();
    URL.revokeObjectURL(url);
  },

  renderColorPaletteSection() {
    const categories = Object.keys(this.colors);
    const shadeNames = ["lighter", "light", "dark", "darker"];

    return html`
      <uix-container padding="md">
        <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-md)">Color Palette</uix-heading>

        <!-- Text Color -->
        <uix-container variant="filled" padding="sm" style="margin-bottom: var(--spacing-lg)">
          <uix-flex direction="row" align="center" justify="space-between" style="margin-bottom: var(--spacing-xs)">
            <uix-text size="sm" weight="medium">Text Color</uix-text>
            <uix-input
              type="text"
              .value=${this.textColor}
              @input=${(e) => {
                this.textColor = e.target.value;
                this._applyPreview();
              }}
              size="xs"
              mono
              style="width: 6rem"
            ></uix-input>
          </uix-flex>
          <input
            type="color"
            .value=${this.textColor}
            @input=${(e) => {
              this.textColor = e.target.value;
              this._applyPreview();
            }}
            w-full
            cursor-pointer
          />
        </uix-container>

        <!-- Color Categories -->
        <uix-flex direction="column" gap="md">
          ${categories.map((category) => {
            const colorData = this.colors[category];
            const isExpanded = this.expandedColors[category];

            return html`
              <uix-container variant="filled" padding="sm">
                <!-- Main color row -->
                <uix-flex direction="row" align="center" gap="sm" style="margin-bottom: var(--spacing-xs)">
                  <input
                    type="color"
                    .value=${colorData.DEFAULT}
                    @input=${(e) => this._updateColor(category, "DEFAULT", e.target.value)}
                    style="width: 3rem; height: 3rem; flex-shrink: 0; border-radius: var(--radius-md); cursor: pointer"
                  />
                  <uix-flex direction="column" gap="xs" style="flex: 1">
                    <uix-text size="sm" weight="medium" transform="capitalize">${category}</uix-text>
                    <uix-input
                      type="text"
                      .value=${colorData.DEFAULT}
                      @input=${(e) => this._updateColor(category, "DEFAULT", e.target.value)}
                      size="xs"
                      mono
                      w-full
                    ></uix-input>
                  </uix-flex>
                  <uix-button
                    @click=${() => this._toggleExpanded(category)}
                    ghost
                    size="sm"
                    title="Customize shades"
                  >
                    <uix-icon name=${isExpanded ? "chevron-up" : "chevron-down"} size="sm"></uix-icon>
                  </uix-button>
                </uix-flex>

                <!-- Expanded shade editors -->
                ${
                  isExpanded
                    ? html`
                  <uix-grid cols="2" gap="sm" style="margin-top: var(--spacing-sm); padding-top: var(--spacing-sm); border-top: 1px solid var(--color-surface)">
                    ${shadeNames.map((shade) => {
                      const shadeValue = colorData[shade];
                      const isAuto = shadeValue === null;

                      return html`
                        <uix-flex direction="row" align="center" gap="sm">
                          <input
                            type="color"
                            .value=${isAuto ? colorData.DEFAULT : shadeValue}
                            ?disabled=${isAuto}
                            @input=${(e) => this._updateColor(category, shade, e.target.value)}
                            style="width: 2rem; height: 2rem; border-radius: var(--radius-md); cursor: pointer"
                            class="${isAuto ? "opacity-50" : ""}"
                          />
                          <uix-flex direction="column" style="flex: 1; min-width: 0">
                            <uix-flex direction="row" align="center" gap="xs">
                              <uix-text size="xs" weight="medium" transform="capitalize">${shade}</uix-text>
                              <label style="margin-left: auto; display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; opacity: 0.7">
                                <input
                                  type="checkbox"
                                  ?checked=${isAuto}
                                  @change=${() => this._toggleAutoShade(category, shade)}
                                  style="width: 0.75rem; height: 0.75rem"
                                />
                                Auto
                              </label>
                            </uix-flex>
                          </uix-flex>
                        </uix-flex>
                      `;
                    })}
                  </uix-grid>
                `
                    : nothing
                }
              </uix-container>
            `;
          })}
        </uix-flex>
      </uix-container>
    `;
  },

  renderSpacingSection() {
    return html`
      <uix-container padding="md">
        <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Spacing</uix-heading>
        <uix-grid cols="2" gap="sm">
          ${Object.entries(this.spacing).map(
            ([key, value]) => html`
              <uix-flex direction="column">
                <uix-text size="sm" weight="medium" style="margin-bottom: var(--spacing-xs)">${key}</uix-text>
                <uix-input
                  type="text"
                  .value=${value}
                  @input=${(e) => {
                    this.spacing = { ...this.spacing, [key]: e.target.value };
                  }}
                  size="sm"
                  mono
                  w-full
                ></uix-input>
              </uix-flex>
            `,
          )}
        </uix-grid>
      </uix-container>
    `;
  },

  renderEdgesSection() {
    return html`
      <uix-container padding="md">
        <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Border Radius</uix-heading>
        <uix-grid cols="2" gap="sm">
          ${Object.entries(this.radius).map(
            ([key, value]) => html`
              <uix-flex direction="column">
                <uix-text size="sm" weight="medium" style="margin-bottom: var(--spacing-xs)">${key}</uix-text>
                <uix-input
                  type="text"
                  .value=${value}
                  @input=${(e) => {
                    this.radius = { ...this.radius, [key]: e.target.value };
                  }}
                  size="sm"
                  mono
                  w-full
                ></uix-input>
              </uix-flex>
            `,
          )}
        </uix-grid>
      </uix-container>
    `;
  },

  renderTypographySection() {
    return html`
      <uix-container padding="md">
        <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Typography</uix-heading>

        <uix-heading level="4" size="sm" style="margin-bottom: var(--spacing-xs)">Font Sizes</uix-heading>
        <uix-grid cols="2" gap="sm" style="margin-bottom: var(--spacing-md)">
          ${Object.entries(this.typography.fontSize).map(
            ([key, value]) => html`
              <uix-flex direction="column">
                <uix-text size="sm" weight="medium" style="margin-bottom: var(--spacing-xs)">${key}</uix-text>
                <uix-input
                  type="text"
                  .value=${value}
                  @input=${(e) => {
                    this.typography = {
                      ...this.typography,
                      fontSize: {
                        ...this.typography.fontSize,
                        [key]: e.target.value,
                      },
                    };
                  }}
                  size="sm"
                  mono
                  w-full
                ></uix-input>
              </uix-flex>
            `,
          )}
        </uix-grid>

        <uix-heading level="4" size="sm" style="margin-bottom: var(--spacing-xs)">Font Weights</uix-heading>
        <uix-grid cols="2" gap="sm">
          ${Object.entries(this.typography.fontWeight).map(
            ([key, value]) => html`
              <uix-flex direction="column">
                <uix-text size="sm" weight="medium" style="margin-bottom: var(--spacing-xs)">${key}</uix-text>
                <uix-input
                  type="text"
                  .value=${value}
                  @input=${(e) => {
                    this.typography = {
                      ...this.typography,
                      fontWeight: {
                        ...this.typography.fontWeight,
                        [key]: e.target.value,
                      },
                    };
                  }}
                  size="sm"
                  mono
                  w-full
                ></uix-input>
              </uix-flex>
            `,
          )}
        </uix-grid>
      </uix-container>
    `;
  },

  renderControlsPanel() {
    const sections = [
      {
        id: "colors",
        label: "Colors",
        render: this.renderColorPaletteSection.bind(this),
      },
      {
        id: "spacing",
        label: "Spacing",
        render: this.renderSpacingSection.bind(this),
      },
      {
        id: "edges",
        label: "Edges",
        render: this.renderEdgesSection.bind(this),
      },
      {
        id: "typography",
        label: "Type",
        render: this.renderTypographySection.bind(this),
      },
    ];

    return html`
      <uix-flex direction="column" style="height: 100%;overflow-x: hidden;">
        <uix-tabs @tab-change=${(e) => (this.sectionTab = e.detail)} style="flex: 1; display: flex; flex-direction: column; min-height: 0">
          ${sections.map((section) => html`<button slot="tab">${section.label}</button>`)}
          <div slot="panel" style="flex: 1">
            ${sections[this.sectionTab] ? sections[this.sectionTab].render() : nothing}
          </div>
        </uix-tabs>

        <uix-container padding="md" style="border-top: 1px solid var(--color-surface)">
          <uix-input
            type="text"
            .value=${this.themeName}
            @input=${(e) => {
              this.themeName = e.target.value;
            }}
            placeholder="Theme name..."
            size="sm"
            w-full
            style="margin-bottom: var(--spacing-sm)"
          ></uix-input>
          <uix-button variant="primary" w-full @click=${() => this.exportTheme()}>
            <uix-icon name="download"></uix-icon>
            Export Theme
          </uix-button>
        </uix-container>
      </uix-flex>
    `;
  },

  renderPreviewPanel() {
    return html`
      <uix-flex direction="column" style="flex: 1; overflow-y: auto; padding: var(--spacing-lg); background: var(--color-surface)">
        <uix-heading level="2" size="2xl" style="margin-bottom: var(--spacing-lg)">Preview</uix-heading>

        <uix-flex direction="column" gap="xl" style="max-width: 800px">
          <!-- Buttons -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Buttons</uix-heading>
            <uix-flex direction="row" gap="sm" style="flex-wrap: wrap">
              <uix-button>Default</uix-button>
              <uix-button variant="primary">Primary</uix-button>
              <uix-button variant="secondary">Secondary</uix-button>
              <uix-button variant="success">Success</uix-button>
              <uix-button variant="danger">Danger</uix-button>
              <uix-button variant="warning">Warning</uix-button>
            </uix-flex>
            <uix-flex direction="row" gap="sm" style="flex-wrap: wrap; margin-top: var(--spacing-sm)">
              <uix-button ghost>Ghost</uix-button>
              <uix-button ghost variant="primary">Ghost Primary</uix-button>
              <uix-button outline variant="primary">Outline</uix-button>
              <uix-button bordered variant="primary">Bordered</uix-button>
            </uix-flex>
          </section>

          <!-- Stats -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Stats</uix-heading>
            <uix-join>
              <uix-stat title="Downloads" value="31K">Jan 1st - Feb 1st</uix-stat>
              <uix-stat title="New Users" value="4,200" variant="success">+400 (22%)</uix-stat>
              <uix-stat title="Errors" value="12" variant="danger">-5 (14%)</uix-stat>
            </uix-join>
          </section>

          <!-- Badges -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Badges</uix-heading>
            <uix-flex direction="row" gap="sm" style="flex-wrap: wrap">
              <uix-badge>Default</uix-badge>
              <uix-badge variant="success">Success</uix-badge>
              <uix-badge variant="danger">Danger</uix-badge>
              <uix-badge variant="warning">Warning</uix-badge>
              <uix-badge variant="info">Info</uix-badge>
            </uix-flex>
          </section>

          <!-- Form Controls -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Form Controls</uix-heading>
            <uix-flex direction="column" gap="md">
              <uix-grid cols="2" gap="sm">
                <uix-input placeholder="Text input"></uix-input>
                <uix-input type="email" placeholder="Email input"></uix-input>
              </uix-grid>
              <uix-flex direction="row" gap="md" style="flex-wrap: wrap">
                <uix-checkbox checked>Checkbox</uix-checkbox>
                <uix-switch checked>Switch</uix-switch>
              </uix-flex>
              <uix-slider min="0" max="100" value="50"></uix-slider>
            </uix-flex>
          </section>

          <!-- Navigation -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Navigation</uix-heading>
            <uix-tabs>
              <button slot="tab">Tab 1</button>
              <button slot="tab">Tab 2</button>
              <button slot="tab">Tab 3</button>
              <div slot="panel">Tab 1 content</div>
              <div slot="panel">Tab 2 content</div>
              <div slot="panel">Tab 3 content</div>
            </uix-tabs>
          </section>

          <!-- Feedback -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Feedback</uix-heading>
            <uix-flex direction="column" gap="sm">
              <uix-progress-bar value="65" max="100"></uix-progress-bar>
              <uix-progress-bar value="30" max="100" variant="success"></uix-progress-bar>
              <uix-flex direction="row" gap="sm" align="center">
                <uix-spinner size="sm"></uix-spinner>
                <uix-spinner size="md"></uix-spinner>
                <uix-spinner size="lg"></uix-spinner>
              </uix-flex>
            </uix-flex>
          </section>

          <!-- Card -->
          <section>
            <uix-heading level="3" size="lg" style="margin-bottom: var(--spacing-sm)">Card</uix-heading>
            <uix-card variant="elevated" padding="lg">
              <h4 slot="header">Card Header</h4>
              <p>Card content with theme colors applied.</p>
              <div slot="footer">
                <uix-button size="sm">Action</uix-button>
              </div>
            </uix-card>
          </section>
        </uix-flex>
      </uix-flex>
    `;
  },

  render() {
    return html`
      <uix-flex direction="row" style="height: 100%; min-height: 0">
        ${this.renderPreviewPanel()}
        <div style="width: 400px; flex-shrink: 0; height: 100%; min-height: 0">
          ${this.renderControlsPanel()}
        </div>
      </uix-flex>
    `;
  },
};
