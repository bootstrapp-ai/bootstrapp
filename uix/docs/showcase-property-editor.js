/**
 * UIX Showcase Property Editor
 * Interactive controls to modify component properties in real-time
 */

import T from "/node_modules/@bootstrapp/types/index.js";
import { html } from "lit-html";
import View from "/node_modules/@bootstrapp/view/index.js";

const ShowcasePropertyEditorDefinition = {
  tag: "uix-showcase-property-editor",
  properties: {
    properties: T.object(), // Component property metadata
    values: T.object(), // Current property values
  },

  handleChange(key, value) {
    // Emit change event to parent
    this.emit("property-change", { key, value });
  },

  renderPropertyControl(key, metadata) {
    const currentValue = this.values?.[key] ?? metadata.defaultValue;
    const { type, enum: enumValues, defaultValue } = metadata;

    // Helper for default value text
    const renderDefault = () =>
      defaultValue !== undefined
        ? html`<uix-text size="xs" muted style="font-style: italic">default: ${defaultValue}</uix-text>`
        : null;

    // Boolean: Toggle switch
    if (type === "boolean") {
      return html`
        <uix-card variant="filled" padding="sm">
          <uix-grid cols="200px 1fr auto" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>boolean</uix-text>
            </uix-flex>
            <uix-switch
              .checked=${currentValue}
              @change=${(e) => this.handleChange(key, e.detail.checked)}
            ></uix-switch>
            ${renderDefault()}
          </uix-grid>
        </uix-card>
      `;
    }

    // String with enum: Dropdown
    if (type === "string" && enumValues && enumValues.length > 0) {
      return html`
        <uix-card variant="filled" padding="sm">
          <uix-grid cols="200px 1fr auto" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>enum</uix-text>
            </uix-flex>
            <uix-select
              .value=${currentValue}
              .options=${enumValues}
              @change=${(e) => this.handleChange(key, e.detail.value)}
            ></uix-select>
            ${renderDefault()}
          </uix-grid>
        </uix-card>
      `;
    }

    // Number: Number input
    if (type === "number") {
      return html`
        <uix-card variant="filled" padding="sm">
          <uix-grid cols="200px 1fr auto" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>number</uix-text>
            </uix-flex>
            <uix-input
              type="number"
              size="sm"
              .value=${currentValue}
              @input=${(e) => this.handleChange(key, parseFloat(e.target.value) || 0)}
            ></uix-input>
            ${renderDefault()}
          </uix-grid>
        </uix-card>
      `;
    }

    // String (no enum): Text input
    if (type === "string") {
      return html`
        <uix-card variant="filled" padding="sm">
          <uix-grid cols="200px 1fr auto" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>string</uix-text>
            </uix-flex>
            <uix-input
              type="text"
              size="sm"
              .value=${currentValue || ""}
              @input=${(e) => this.handleChange(key, e.target.value)}
            ></uix-input>
            ${renderDefault()}
          </uix-grid>
        </uix-card>
      `;
    }

    // Array or Object: JSON editor
    if (type === "array" || type === "object") {
      const jsonValue = JSON.stringify(currentValue, null, 2);
      return html`
        <uix-card variant="filled" padding="sm">
          <uix-grid cols="200px 1fr" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>${type}</uix-text>
            </uix-flex>
            <uix-textarea
              size="sm"
              .value=${jsonValue}
              style="min-height: 80px; font-family: monospace"
              @input=${(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  this.handleChange(key, parsed);
                  e.target.removeAttribute("error");
                } catch (err) {
                  // Visual feedback for invalid JSON
                  e.target.setAttribute("error", "");
                }
              }}
            ></uix-textarea>
          </uix-grid>
        </uix-card>
      `;
    }

    // Function: Display only
    if (type === "function") {
      return html`
        <uix-card variant="filled" padding="sm" style="opacity: 0.6">
          <uix-grid cols="200px 1fr" gap="md">
            <uix-flex direction="column" gap="xs">
              <uix-text size="sm" weight="semibold">${key}</uix-text>
              <uix-text size="xs" muted mono>function</uix-text>
            </uix-flex>
            <uix-text size="sm" muted style="font-style: italic">Event handler (immutable)</uix-text>
          </uix-grid>
        </uix-card>
      `;
    }

    // Unknown type
    return html`
      <uix-card variant="filled" padding="sm" style="opacity: 0.6">
        <uix-grid cols="200px 1fr" gap="md">
          <uix-flex direction="column" gap="xs">
            <uix-text size="sm" weight="semibold">${key}</uix-text>
            <uix-text size="xs" muted mono>${type || "unknown"}</uix-text>
          </uix-flex>
          <uix-text size="sm" muted>Not editable</uix-text>
        </uix-grid>
      </uix-card>
    `;
  },

  render() {
    if (!this.properties || Object.keys(this.properties).length === 0) {
      return html`
        <uix-card variant="filled" padding="md" style="text-align: center">
          <uix-text muted>No configurable properties</uix-text>
        </uix-card>
      `;
    }

    return html`
      <uix-flex direction="column" gap="md" style="font-family: var(--font-sans)">
        <uix-flex justify="space-between" align="center">
          <uix-heading level="3" size="lg">Properties</uix-heading>
          <uix-button
            outline
            size="xs"
            @click=${() => this.emit("reset")}
            title="Reset to defaults"
          >
          <uix-icon name="rotate-ccw"></uix-icon>    
          Reset
          </uix-button>
        </uix-flex>
        <uix-flex direction="column" gap="sm">
          ${Object.entries(this.properties).map(([key, metadata]) =>
            this.renderPropertyControl(key, metadata),
          )}
        </uix-flex>
      </uix-flex>
    `;
  },
};

View.define("uix-showcase-property-editor", ShowcasePropertyEditorDefinition);

export default ShowcasePropertyEditorDefinition;
