/**
 * UIX Showcase Code Viewer
 * Displays code examples with syntax highlighting
 */

import T from "/$app/types/index.js";
import View from "/$app/view/index.js";
import { html } from "/npm/lit-html";

const ShowcaseCodeViewerDefinition = {
  tag: "uix-showcase-code-viewer",
  properties: {
    componentTag: T.string(), // Component tag name
    props: T.object(), // Current property values
    category: T.string(), // Component category
    name: T.string(), // Component file name
    copiedBasic: T.boolean(),
    copiedImport: T.boolean(),
  },
  generateBasicExample() {
    if (!this.componentTag) return "";

    const { tag, props } = this;
    const attributes = [];

    // Generate attributes from props
    for (const [key, value] of Object.entries(props || {})) {
      if (value === undefined || value === null) continue;

      if (typeof value === "boolean") {
        if (value) attributes.push(key);
      } else if (typeof value === "string") {
        attributes.push(`${key}="${value}"`);
      } else if (typeof value === "number") {
        attributes.push(`${key}="${value}"`);
      }
    }

    const attrsString = attributes.length > 0 ? " " + attributes.join(" ") : "";

    return `<${tag}${attrsString}>
  <!-- Component Content -->
</${tag}>`;
  },

  generateImportCode() {
    if (!this.category || !this.name) return "";

    return `import "/$app/uix/app.js";

// Component auto-loaded from:
// /$app/uix/${this.category}/${this.name}.js`;
  },

  async copyToClipboard(text, type) {
    const triggerSuccess = () => {
      this[`copied${type}`] = true;
      setTimeout(() => {
        this[`copied${type}`] = false;
      }, 2000);
    };

    try {
      // 1. Try Modern API
      await navigator.clipboard.writeText(text);
      triggerSuccess();
    } catch (err) {
      // 2. Fallback (iframe/legacy)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) triggerSuccess();
      } catch (fallbackErr) {
        console.error("Failed to copy:", fallbackErr);
      }
    }
  },

  render() {
    if (!this.componentTag) {
      return html`
        <uix-card variant="outlined" padding="md">
          <uix-text size="sm" align="center" muted>No code example available</uix-text>
        </uix-card>
      `;
    }

    const basicExample = this.generateBasicExample();
    const importCode = this.generateImportCode();

    return html`
      <uix-flex direction="column" gap="md">
        <!-- Import Section -->
        <uix-flex direction="column" gap="sm" style="position: relative;">
          <uix-flex justify="space-between" align="center">
            <uix-text size="sm" weight="semibold" text="inverse" style="text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">Import</uix-text>
            <uix-button
              size="xs"
              ghost
              primary
              @click=${() => this.copyToClipboard(importCode, "Import")}
              title="Copy import path"
            >
              <uix-icon name=${this.copiedImport ? "check" : "copy"} size="14"></uix-icon>
              ${this.copiedImport ? "Copied" : "Copy"}
            </uix-button>
          </uix-flex>
          <uix-card variant="outlined" overflow="hidden">
            <uix-code language="javascript" .content=${importCode} ?lineNumber=${false} readonly></uix-code>
          </uix-card>
        </uix-flex>

        <!-- Basic Usage Section -->
        <uix-flex direction="column" gap="sm" style="position: relative;">
          <uix-flex justify="space-between" align="center">
            <uix-text size="sm" weight="semibold" text="inverse" style="text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">Usage</uix-text>
            <uix-button
              size="xs"
              ghost
              primary
              @click=${() => this.copyToClipboard(basicExample, "Basic")}
              title="Copy code example"
            >
              <uix-icon name=${this.copiedBasic ? "check" : "copy"} size="14"></uix-icon>
              ${this.copiedBasic ? "Copied" : "Copy"}
            </uix-button>
          </uix-flex>
          <uix-card variant="outlined" overflow="hidden">
            <uix-code language="html" .content=${basicExample} readonly></uix-code>
          </uix-card>
        </uix-flex>
      </uix-flex>
    `;
  },
};

View.define("uix-showcase-code-viewer", ShowcaseCodeViewerDefinition);

export default ShowcaseCodeViewerDefinition;
