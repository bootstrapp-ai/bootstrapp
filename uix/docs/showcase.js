/**
 * UIX Component Showcase
 * Interactive component library viewer with lazy loading
 */

import Theme from "@bootstrapp/theme";
import T from "@bootstrapp/types";
import { html, nothing } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { html as staticHTML, unsafeStatic } from "lit-html/static.js";
import View from "@bootstrapp/view";
import {
  getComponentList,
  getDefaultValues,
  loadComponent,
} from "../utils/component-registry.js";
import "./showcase-sidebar.js";
import "./showcase-property-editor.js";
import "./showcase-code-viewer.js";
import "./theme-generator.js";

const ShowcaseDefinition = {
  tag: "uix-showcase",
  style: true,
  properties: {
    selectedCategory: T.string({ sync: "querystring" }),
    selectedComponentName: T.string({ sync: "querystring" }),
    selectedResourcePage: T.string({ sync: "querystring" }),
    currentTheme: T.string("gruvbox-dark"),
    componentList: T.object(),
    selectedComponent: T.string(),
    loading: T.boolean(),
    error: T.string(),
    liveProps: T.object(),
  },
  connected() {
    this.componentList = getComponentList();
    if (this.selectedComponentName)
      this._handleComponentSelect({
        detail: {
          type: "component",
          category: this.selectedCategory,
          name: this.selectedComponentName,
        },
      });
  },

  async _handleComponentSelect({ detail }) {
    const { type, category, name, page } = detail;

    // Handle resource page selection
    if (type === "resource") {
      this.selectedResourcePage = page;
      this.selectedCategory = null;
      this.selectedComponentName = null;
      this.selectedComponent = null;
      return;
    }

    // Handle component selection
    if (
      this.selectedCategory === category &&
      this.selectedComponentName === name &&
      this.selectedComponent
    ) {
      return;
    }

    this.selectedResourcePage = null;
    this.selectedCategory = category;
    this.selectedComponentName = name;
    this.selectedComponent = null;
    this.loading = true;
    this.error = null;

    try {
      // Lazy load the component
      const metadata = await loadComponent(category, name);

      this.selectedComponent = {
        name,
        category,
        ...metadata,
      };

      // Initialize live props with defaults
      this.liveProps = getDefaultValues(metadata.properties);
    } catch (err) {
      console.error("Failed to load component:", err);
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },

  _handlePropertyChange({ detail }) {
    const { key, value } = detail;
    this.liveProps = {
      ...this.liveProps,
      [key]: value,
    };
  },

  _handleReset() {
    if (this.selectedComponent) {
      this.liveProps = getDefaultValues(this.selectedComponent.properties);
    }
  },

  _handleThemeChange(themeName) {
    Theme.loadTheme(themeName);
  },

  renderLiveComponent() {
    if (!this.selectedComponent) return nothing;

    const { tag } = this.selectedComponent;
    const props = this.liveProps;

    // Build attributes string
    const attributes = Object.entries(props)
      .map(([key, value]) => {
        if (value === undefined || value === null) return "";
        if (typeof value === "boolean") {
          return value ? key : "";
        }
        if (typeof value === "string" || typeof value === "number") {
          return `${key}="${value}"`;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");

    // Render component dynamically
    try {
      return staticHTML`
        <${unsafeStatic(tag)} ${unsafeStatic(attributes)}>
          ${this.renderComponentSlotContent(tag)}
        </${unsafeStatic(tag)}>
      `;
    } catch (err) {
      return html`<div class="preview-error">Failed to render component</div>`;
    }
  },

  renderComponentSlotContent(tag) {
    // Provide default slot content based on component type
    if (tag.includes("button")) {
      return "Click me";
    }
    if (tag.includes("input")) {
      return nothing;
    }
    if (tag.includes("badge")) {
      return "Badge";
    }
    if (tag.includes("modal")) {
      return html`
        <div slot="header">Modal Header</div>
        <p>Modal content goes here...</p>
        <div slot="footer">
          <uix-button>Cancel</uix-button>
          <uix-button variant="primary">OK</uix-button>
        </div>
      `;
    }
    return "Component content";
  },

  renderComponentInfo() {
    if (!this.selectedComponent) return nothing;

    const { hasShadow, parts = [], slots = [] } = this.selectedComponent;
    const hasInfo =
      hasShadow !== undefined || parts.length > 0 || slots.length > 0;

    if (!hasInfo) return nothing;

    return html`
      <uix-card variant="elevated" padding="lg">
        <h3 slot="header">Component Information</h3>
        <uix-grid cols="repeat(auto-fit,minmax(300px,1fr))" gap="md">
          ${
            hasShadow !== undefined
              ? html`
            <uix-card variant="filled" padding="md">
              <uix-flex direction="column" gap="sm">
                <uix-text size="sm" weight="semibold">Shadow DOM</uix-text>
                <div>
                  ${
                    hasShadow
                      ? html`<uix-badge variant="success" size="sm">Enabled</uix-badge>`
                      : html`<uix-badge variant="default" size="sm">Disabled</uix-badge>`
                  }
                </div>
              </uix-flex>
            </uix-card>
          `
              : nothing
          }

          ${
            slots.length > 0
              ? html`
            <uix-card variant="filled" padding="md">
              <uix-flex direction="column" gap="sm">
                <uix-text size="sm" weight="semibold">Slots</uix-text>
                <div>
                  <uix-list variant="unstyled" spacing="sm">
                    ${slots.map(
                      (slot) => html`
                      <uix-list-item>
                        <uix-flex align="baseline" gap="xs">
                          <uix-text size="xs" weight="semibold" mono style="background: var(--color-surface-darker); padding: 2px 6px; border-radius: 3px;">${slot.name}</uix-text>
                          ${slot.description ? html`<uix-text size="xs">- ${slot.description}</uix-text>` : nothing}
                        </uix-flex>
                      </uix-list-item>
                    `,
                    )}
                  </uix-list>
                </div>
              </uix-flex>
            </uix-card>
          `
              : nothing
          }

          ${
            parts.length > 0
              ? html`
            <uix-card variant="filled" padding="md">
              <uix-flex direction="column" gap="sm">
                <uix-text size="sm" weight="semibold">CSS Parts</uix-text>
                <div>
                  <uix-list variant="unstyled" spacing="sm">
                    ${parts.map(
                      (part) => html`
                      <uix-list-item>
                        <uix-flex align="baseline" gap="xs">
                          <uix-text size="xs" weight="semibold" mono style="background: var(--color-surface-darker); padding: 2px 6px; border-radius: 3px;">${part.name}</uix-text>
                          ${part.description ? html`<uix-text size="xs">- ${part.description}</uix-text>` : nothing}
                        </uix-flex>
                      </uix-list-item>
                    `,
                    )}
                  </uix-list>
                </div>
              </uix-flex>
            </uix-card>
          `
              : nothing
          }
        </uix-grid>
      </uix-card>
    `;
  },

  executeJavaScript(code) {
    try {
      // Create context with Lit imports
      const context = { html, unsafeHTML, nothing };

      // Execute code with controlled scope
      const fn = new Function(...Object.keys(context), `return (${code})`);
      const result = fn(...Object.values(context));

      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  renderExamples() {
    if (!this.selectedComponent?.examples?.length) return nothing;

    return html`
      <uix-card variant="outlined" padding="lg" style="margin-bottom: 24px;">
        <uix-heading level="3" size="lg">Examples</uix-heading>
        <uix-flex direction="column" gap="lg">
          ${this.selectedComponent.examples.map(
            (example, idx) => html`
            <uix-card variant="elevated" padding="lg">
              <uix-heading level="4" size="base" slot="header">${example.title}</uix-heading>
              ${
                example.description
                  ? html`
                <uix-text size="sm" style="line-height: 1.6;">${example.description}</uix-text>
              `
                  : nothing
              }
              <uix-flex direction="column" gap="sm">
                ${example.codeBlocks.map((block) => {
                  const isJavaScript =
                    block.language === "js" || block.language === "javascript";
                  if (isJavaScript) {
                    const execution = this.executeJavaScript(block.code);

                    return html`
                      <uix-flex>
                        <div flex-1 style="padding: 16px;">
                          ${
                            execution.success
                              ? execution.result
                              : html`<uix-text text="danger">Error: ${execution.error}</uix-text>`
                          }
                        </div>
                        <uix-code style="max-height: 600px;" flex-1 language=${block.language} .content=${block.code} readonly></uix-code>
                      </uix-flex>
                    `;
                  }

                  return html`
                    <uix-flex>
                      <div flex-1 style="padding: 16px;">${unsafeHTML(block.code)}</div>
                      <uix-code style="max-height: 600px;" flex-1 language=${block.language} .content=${block.code} readonly></uix-code>
                    </uix-flex>
                  `;
                })}
              </uix-flex>
            </uix-card>
          `,
          )}
        </uix-flex>
      </uix-card>
    `;
  },

  renderResourcePage() {
    if (this.selectedResourcePage === "theme-generator")
      return html`<uix-theme-generator></uix-theme-generator>`;

    return html`
      <div style="max-width: 800px; margin: 0 auto;">
        <uix-heading level="1" size="3xl" style="margin-bottom: 24px; text-transform: capitalize;">${this.selectedResourcePage}</uix-heading>
        <uix-card variant="filled" padding="lg">
          <p>
            Documentation for <strong>${this.selectedResourcePage}</strong> coming soon...
          </p>
        </uix-card>
      </div>
    `;
  },

  renderMainContent() {
    // Resource page view
    if (this.selectedResourcePage) {
      return this.renderResourcePage();
    }

    // Empty state
    if (!this.selectedCategory && !this.selectedComponentName) {
      return html`
        <uix-flex direction="column" align="center" justify="center" gap="md" style="min-height: 400px; text-align: center;">
          <uix-icon name="package" style="width: 64px; height: 64px; opacity: 0.3;"></uix-icon>
          <uix-heading level="2" size="2xl">Select a component</uix-heading>
          <p>Choose a component from the sidebar to view its details and properties</p>
        </uix-flex>
      `;
    }

    // Loading state
    if (this.loading) {
      return html`
        <uix-flex direction="column" align="center" justify="center" gap="md" style="min-height: 400px; text-align: center;">
          <uix-spinner size="lg"></uix-spinner>
          <p>Loading ${this.selectedComponentName}...</p>
        </uix-flex>
      `;
    }

    // Error state
    if (this.error) {
      return html`
        <uix-flex direction="column" align="center" justify="center" gap="md" style="min-height: 400px; text-align: center;">
          <uix-icon name="alert-circle" color="danger" style="width: 48px; height: 48px;"></uix-icon>
          <uix-heading level="3" size="xl">Failed to load component</uix-heading>
          <p>${this.error}</p>
        </uix-flex>
      `;
    }

    // Component loaded
    if (!this.selectedComponent) return nothing;

    const { tag, properties } = this.selectedComponent;

    return html`
      <uix-flex direction="column" gap="lg" style="max-width: 1200px; margin: 0 auto; padding: 24px;">
        <div>
          <uix-flex align="center" gap="md">
            <uix-heading level="1" size="2xl">&lt;${tag}&gt;</uix-heading>
            <uix-badge variant="info" size="sm">${this.selectedCategory}</uix-badge>
          </uix-flex>
        </div>

        ${this.renderComponentInfo()}

        <uix-card variant="elevated" padding="lg">
          <uix-showcase-property-editor
            .properties=${properties}
            .values=${this.liveProps}
            @property-change=${this._handlePropertyChange}
            @reset=${this._handleReset}
          ></uix-showcase-property-editor>
        </uix-card>

        ${this.renderExamples()}

        <uix-card variant="elevated" padding="lg">
          <h3 slot="header">Generated Code</h3>
          <uix-showcase-code-viewer
            .tag=${tag}
            .props=${this.liveProps}
            .category=${this.selectedCategory}
            .name=${this.selectedComponentName}
          ></uix-showcase-code-viewer>
        </uix-card>
      </uix-flex>
    `;
  },

  render() {
    const availableThemes = Theme.availableThemes || {};

    return html`
      <uix-split-pane direction="vertical"  initialSize="50px" minSize="50px" style="height: 100vh;">
        <uix-flex w-full slot="primary" justify="space-between" align="center" style="padding: 12px 16px;">
          <uix-flex align="center" gap="sm">
            <uix-icon name="package"></uix-icon>
            <uix-heading level="1" size="xl">UIX Components</uix-heading>
          </uix-flex>
          <uix-flex align="center" gap="sm">
            <uix-text size="sm">Theme</uix-text>
            <uix-select
              value=${this.currentTheme}
              .options=${Object.keys(availableThemes)}
              @change=${(e) => !this._handleThemeChange(e.target.value)}
            ></uix-select>
          </uix-flex>
        </uix-flex>
        <uix-split-pane slot="secondary" initialSize="280px" minSize="280px">
          <uix-showcase-sidebar slot="primary"
            .componentList=${this.componentList}
            @select=${this._handleComponentSelect}
            flex-1
          ></uix-showcase-sidebar>
          <div slot="secondary" flex-1>
            ${this.renderMainContent()}
          </div>
        </uix-split-pane>
      </uix-split-pane>
    `;
  },
};

View.define("uix-showcase", ShowcaseDefinition);

export default ShowcaseDefinition;
