# @bootstrapp/uix

Modern UI/UX component toolkit built on @bootstrapp/view. Production-ready components for building beautiful web applications.

## Installation

### Via npm

```bash
npm install @bootstrapp/uix
```

### Via CDN (no build step)

```html
<script type="importmap">
{
  "imports": {
    "lit-html": "https://esm.sh/lit-html",
    "@bootstrapp/types": "https://esm.sh/@bootstrapp/types@0.1.0",
    "@bootstrapp/view": "https://esm.sh/@bootstrapp/view@0.1.0",
    "@bootstrapp/uix": "https://esm.sh/@bootstrapp/uix@0.1.0"
  }
}
</script>
```

## Quick Example

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
  {
    "imports": {
      "lit-html": "https://esm.sh/lit-html",
      "@bootstrapp/view": "https://esm.sh/@bootstrapp/view@0.1.0",
      "@bootstrapp/uix": "https://esm.sh/@bootstrapp/uix@0.1.0"
    }
  }
  </script>
  <link rel="stylesheet" href="https://esm.sh/@bootstrapp/uix@0.1.0/theme.css">
  <script type="module">
    import '@bootstrapp/uix/display/button.js';
    import '@bootstrapp/uix/layout/card.js';
  </script>
</head>
<body>
  <uix-card>
    <h2>Welcome to UIX</h2>
    <uix-button variant="primary">Get Started</uix-button>
  </uix-card>
</body>
</html>
```

## Component Categories

- **Display**: Buttons, badges, avatars, icons
- **Layout**: Grids, cards, containers, sections
- **Form**: Inputs, selects, checkboxes, forms
- **Navigation**: Menus, tabs, breadcrumbs, pagination
- **Overlay**: Modals, tooltips, dropdowns, popovers
- **Feedback**: Alerts, toasts, progress, spinners
- **Page**: Hero sections, footers, pricing tables
- **App**: Sidebars, headers, navigation bars
- **Utility**: Helpers and utility components

---

# Component Development Guide

> Comprehensive guide for creating and contributing components to UIX

**Last Updated:** 2025-01-26

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Component Categories](#component-categories)
4. [File Structure & Naming](#file-structure--naming)
5. [Component Definition Patterns](#component-definition-patterns)
6. [Property & Type System](#property--type-system)
7. [CSS & Styling Patterns](#css--styling-patterns)
8. [JSDoc Documentation](#jsdoc-documentation)
9. [Decision Trees](#decision-trees)
10. [Templates & Snippets](#templates--snippets)
11. [Real Examples Reference](#real-examples-reference)
12. [Best Practices](#best-practices)
13. [Common Patterns](#common-patterns)

---

## Quick Start

### TL;DR - Creating a Component in 30 Seconds

1. **Create two files:** `component-name.js` + `component-name.css`
2. **Use this minimal template:**

```javascript
import View from "@bootstrapp/view";
import { html } from "lit-html";
import T from "@bootstrapp/types";

View.define("uix-component-name", {
  properties: {
    variant: T.string({ defaultValue: "default" })
  },

  shadow: true,  // or false for layout/form components
  style: true,   // only if you need light DOM CSS injection

  render() {
    return html`
      <style>
        :host { display: block; }
      </style>
      <div part="container">
        <slot></slot>
      </div>
    `;
  }
});
```

3. **Document with JSDoc** (see [Templates](#templates--snippets))
4. **Choose category:** display, layout, form, navigation, overlay, feedback, page, app, utility

**→ See [Templates & Snippets](#templates--snippets) for complete starter templates**

---

## Architecture Overview

### Framework Integration

UIX components are built on a custom framework that integrates:

- **Base Framework:** `/node_modules/@bootstrapp/base` - Custom component system
- **Template Engine:** [Lit](https://lit.dev) - HTML template literals with `html` tagged template
- **Type System:** Custom `T` object for reactive property definitions
- **Shadow DOM:** Selective use based on component needs
- **Styling:** Light DOM CSS injection OR shadow DOM `<style>` tags

### File Organization

**Every component requires TWO files:**

```
component-name.js   → Component logic, properties, render
component-name.css  → Styles (light DOM or ::part() selectors)
```

**Directory structure:**
```
modules/uix/
├── display/        → Atomic UI elements
├── layout/         → Containers & structure
├── form/           → Input & data collection
├── navigation/     → Nav & menus
├── overlay/        → Modals & floating elements
├── feedback/       → Status & progress
├── page/           → Pre-built sections
├── app/            → Application chrome
└── utility/        → Helper components
```

### Core Concepts

**1. Shadow DOM vs Light DOM**
- **Shadow DOM** (`shadow: true`) - Encapsulated styling, uses `<style>` tags internally
- **Light DOM** (`shadow: false`) - No encapsulation, styles apply globally

**2. CSS Injection** (`style: true`)
- Injects external .css file into the **light DOM**
- Use for:
  - Light DOM components (`.uix-component-name` selectors)
  - Shadow DOM components exposing `::part()` for customization
- **Note:** `:host` selectors won't work in injected light DOM CSS (use internal `<style>` tags for `:host`)

**3. Reactive Properties**
- Defined with `T.string()`, `T.boolean()`, `T.number()`, etc.
- Automatically trigger re-renders on change
- Support enums for variants

---

## Component Categories

| Category | Purpose | Shadow DOM | `style: true` | Examples |
|----------|---------|------------|---------------|----------|
| **display** | Atomic UI elements | Usually true | If exposing ::part() | avatar, badge, icon, button |
| **layout** | Structure & containers | Usually false | Yes (light DOM) | flex, grid, card, container |
| **form** | Input & data collection | **False** (form association) | Yes (light DOM) | input, checkbox, select |
| **navigation** | User guidance | True | If exposing ::part() | navbar, tabs, sidebar |
| **overlay** | Floating/modal | True | If exposing ::part() | modal, drawer, tooltip |
| **feedback** | Status & progress | True | If exposing ::part() | spinner, toast, skeleton |
| **page** | Pre-built sections | True | Yes (::part()) | hero-section, stat-card |
| **app** | Application chrome | True | Yes (::part()) | app-container, app-header |
| **utility** | Helper tools | Varies | Varies | draggable, theme-toggle |

**Key Rules:**
- Form components → `shadow: false` (need light DOM for form association)
- Layout components (no wrapping) → `shadow: false`
- Most others → `shadow: true`

---

## File Structure & Naming

### Naming Conventions

- **Files:** `kebab-case` (e.g., `stat-card.js`, `contact-avatar.js`)
- **Tags:** `uix-component-name` (always prefixed with `uix-`)
- **Directories:** Singular names (`display/`, not `displays/`)

### File Pairing

**Always create both files:**

```
page/
├── stat-card.js     ← Component definition
└── stat-card.css    ← Styles
```

### Component Tag Names

```javascript
export default {
  tag: "uix-stat-card",  // Must match: uix-{filename}
  // ...
};
```

**Pattern:** `uix-` + filename without extension

---

## Component Definition Patterns

### Basic Structure

```javascript
import { html } from "lit-html";
import T from "@bootstrapp/types";

export default {
  // Required: Custom element tag name
  tag: "uix-component-name",

  // Component properties (reactive)
  properties: {
    // See "Property & Type System" section
  },

  // CSS injection (see "CSS & Styling Patterns")
  style: true,     // true = inject .css file into light DOM

  // Shadow DOM (see "Architecture Overview")
  shadow: true,    // true = use shadow DOM encapsulation

  // Optional: Lifecycle hooks
  connected() {
    // Called when element added to DOM
  },

  disconnected() {
    // Called when element removed from DOM
  },

  updated({changedProps}) {
    // Called after properties change
  },

  firstUpdated() {
    // Called after first render
  },

  // Required: Render method
  render() {
    return html`
      <style>
        /* Shadow DOM internal styles */
        :host { display: block; }
      </style>
      <div part="container">
        <slot></slot>
      </div>
    `;
  }
};
```

### Shadow DOM Component with Internal Styles

```javascript
export default {
  tag: "uix-example",
  shadow: true,
  style: true,  // External .css for ::part() selectors

  render() {
    return html`
      <style>
        /* Internal shadow DOM styles */
        :host {
          display: inline-block;
        }
        :host([size="lg"]) {
          --size: 2rem;
        }
        .container {
          padding: var(--spacing-md);
        }
      </style>
      <div part="container" class="container">
        <slot></slot>
      </div>
    `;
  }
};
```

**External .css file:**
```css
/* Light DOM styles for customization */
.uix-example::part(container) {
  /* External styling hook */
}
```

### Light DOM Component

```javascript
export default {
  tag: "uix-layout",
  shadow: false,  // No shadow DOM
  style: true,    // Inject .css into light DOM

  render() {
    // Usually no render needed for layout components
  }
};
```

**External .css file:**
```css
/* Styles the component directly in light DOM */
.uix-layout {
  display: flex;
  gap: var(--spacing-md);
}

.uix-layout[direction="column"] {
  flex-direction: column;
}
```

---

## Property & Type System

### Type Definitions

```javascript
properties: {
  // STRING - Simple
  name: T.string(""),
  title: T.string({ defaultValue: "Default" }),

  // STRING - With enum (for variants)
  size: T.string({
    defaultValue: "md",
    enum: ["xs", "sm", "md", "lg", "xl"]
  }),

  variant: T.string({
    defaultValue: "default",
    enum: ["default", "primary", "secondary", "success", "danger", "warning", "info"]
  }),

  // BOOLEAN
  disabled: T.boolean(false),
  open: T.boolean(true),
  checked: T.boolean(false),

  // NUMBER
  level: T.number({ defaultValue: 2, min: 1, max: 6 }),
  count: T.number(0),
  progress: T.number({ defaultValue: 0, min: 0, max: 100 }),

  // ARRAY
  items: T.array([]),
  tags: T.array(["default", "values"]),

  // OBJECT
  config: T.object({}),
  routes: T.object({ "/": "Home" }),

  // ANY - Use sparingly
  value: T.any("")
}
```

### Standard Property Patterns

**Size variants:**
```javascript
size: T.string({
  defaultValue: "md",
  enum: ["xs", "sm", "md", "lg", "xl"]
})
```

**Visual variants:**
```javascript
variant: T.string({
  defaultValue: "default",
  enum: ["default", "primary", "secondary", "success", "danger", "warning", "info"]
})
```

**Shadow elevation:**
```javascript
shadow: T.string({
  defaultValue: "",
  enum: ["", "sm", "md", "lg", "brutalist"]
})
```

**Spacing:**
```javascript
padding: T.string({
  defaultValue: "md",
  enum: ["none", "sm", "md", "lg"]
}),

gap: T.string({
  defaultValue: "md",
  enum: ["none", "xs", "sm", "md", "lg", "xl"]
})
```

### Accessing Properties in Render

```javascript
render() {
  return html`
    <div class="container-${this.variant}">
      ${this.title}
      ${this.disabled ? html`<span>Disabled</span>` : ""}
    </div>
  `;
}
```

---

## CSS & Styling Patterns

### Understanding `style: true`

**When to use `style: true`:**

1. **Light DOM components** - Need to style the component globally
2. **Shadow DOM components exposing `::part()` for customization**

**What it does:**
- Injects the external .css file content into the **light DOM**
- `:host` selectors **won't work** (use internal `<style>` for `:host`)
- Use for `.uix-component::part()` selectors or light DOM `.uix-component` selectors

### Shadow DOM Styling

**Internal styles (in render method):**

```javascript
render() {
  return html`
    <style>
      :host {
        display: inline-block;
        --avatar-size: 2.5rem;
      }

      :host([size="xs"]) { --avatar-size: 1.5rem; }
      :host([size="sm"]) { --avatar-size: 2rem; }
      :host([size="md"]) { --avatar-size: 2.5rem; }
      :host([size="lg"]) { --avatar-size: 3.5rem; }
      :host([size="xl"]) { --avatar-size: 5rem; }

      :host([variant="primary"]) {
        --avatar-bg: var(--color-primary);
      }

      .avatar-container {
        width: var(--avatar-size);
        height: var(--avatar-size);
        background: var(--avatar-bg);
      }
    </style>
    <div part="container" class="avatar-container">
      <slot></slot>
    </div>
  `;
}
```

**External styles (when `style: true`):**

```css
/* External file: avatar.css */
/* These are injected into LIGHT DOM */

/* Style the component via ::part() */
.uix-avatar::part(container) {
  border-radius: var(--avatar-border-radius, 50%);
}

/* Attribute selectors work */
.uix-avatar[shape="square"]::part(container) {
  border-radius: var(--radius-md);
}
```

### Light DOM Styling

**When `shadow: false`:**

```css
/* Component file: flex.css */

.uix-flex {
  display: flex;
}

.uix-flex[direction="column"] {
  flex-direction: column;
}

.uix-flex[gap="xs"] { gap: var(--spacing-xs); }
.uix-flex[gap="sm"] { gap: var(--spacing-sm); }
.uix-flex[gap="md"] { gap: var(--spacing-md); }
.uix-flex[gap="lg"] { gap: var(--spacing-lg); }
.uix-flex[gap="xl"] { gap: var(--spacing-xl); }

/* Style child elements with attributes */
.uix-flex > [flex-1] { flex: 1 1 0%; }
.uix-flex > [flex-auto] { flex: 1 1 auto; }
.uix-flex > [align-self="center"] { align-self: center; }
```

### CSS Variable Naming

**Component-specific:**
- `--component-property` pattern
- Examples: `--avatar-size`, `--card-padding`, `--button-bg`

**Global color system:**
- `--color-primary`, `--color-secondary`
- `--color-success`, `--color-danger`, `--color-warning`, `--color-info`
- `--color-text`, `--color-text-muted`, `--color-inverse`
- `--color-surface`, `--color-surface-lighter`, `--color-background`
- `--color-border`

**Spacing:**
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`, `--spacing-2xl`, `--spacing-3xl`

**Shadows:**
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

**Typography:**
- `--font-size-xs`, `--font-size-sm`, `--font-size-base`, `--font-size-lg`, `--font-size-xl`
- `--radius-sm`, `--radius-md`, `--radius-lg` (border-radius)

### Parts for External Customization

**Expose parts for styling:**

```javascript
render() {
  return html`
    <div part="container">
      <div part="header">Header</div>
      <div part="body">Body</div>
      <div part="footer">Footer</div>
    </div>
  `;
}
```

**External styling:**

```css
uix-card::part(header) {
  background: var(--color-surface);
  padding: var(--spacing-lg);
}

uix-card::part(body) {
  flex: 1;
}
```

### Gradient Support Pattern

**In component:**

```javascript
render() {
  const cardStyle = this.gradientFrom
    ? `--card-gradient-from: ${this.gradientFrom}; ${this.gradientTo ? `--card-gradient-to: ${this.gradientTo};` : ""}`
    : "";

  return html`
    <uix-card style=${cardStyle}>
      <slot></slot>
    </uix-card>
  `;
}
```

**In CSS:**

```css
.uix-card[style*="--card-gradient-from"]::part(body) {
  background: linear-gradient(
    135deg,
    var(--card-gradient-from),
    var(--card-gradient-to, var(--card-gradient-from))
  );
}
```

---

## JSDoc Documentation

### Complete Template

```javascript
/**
 * Component Title
 *
 * @component
 * @category [display|layout|form|navigation|overlay|feedback|page|app|utility]
 * @tag uix-component-name
 *
 * Brief description of what the component does and when to use it.
 * Can be multiple lines explaining use cases and features.
 *
 * @property {string} propName - Description (default: value)
 * @property {string} variant - Visual variant: default, primary, success (default: default)
 * @property {string} size - Size: xs, sm, md, lg, xl (default: md)
 * @property {boolean} disabled - Disable component (default: false)
 *
 * @slot default - Main content slot
 * @slot header - Optional header slot
 * @slot footer - Optional footer slot
 *
 * @part container - Main wrapper element
 * @part header - Header section
 * @part body - Body content area
 * @part footer - Footer section
 *
 * @example Basic Usage
 * ```html
 * <uix-component>Content</uix-component>
 * ```
 *
 * @example With Properties
 * ```html
 * <uix-component variant="primary" size="lg">
 *   Content
 * </uix-component>
 * ```
 *
 * @example Advanced Pattern
 * ```html
 * <uix-component variant="primary">
 *   <div slot="header">Header Content</div>
 *   <div>Main Content</div>
 *   <div slot="footer">Footer Content</div>
 * </uix-component>
 * ```
 *
 * @example Real-world Context
 * ```html
 * <uix-grid columns="3" gap="lg">
 *   <uix-component variant="primary">Item 1</uix-component>
 *   <uix-component variant="success">Item 2</uix-component>
 *   <uix-component variant="danger">Item 3</uix-component>
 * </uix-grid>
 * ```
 */
```

### Example Organization

1. **Basic Usage** - Minimal, simplest possible example
2. **With Properties** - Show common property combinations
3. **Advanced Pattern** - Slots, composition, complex usage
4. **Real-world Context** - How it's used in actual applications (dashboard, form, page layout)

---

## Decision Trees

### Decision Tree 1: Should I use Shadow DOM?

```
START: Creating a component
│
├─ Is it a layout component that doesn't wrap content?
│  │  (e.g., uix-flex, uix-grid)
│  ├─ YES → shadow: false
│  └─ NO → Continue
│
├─ Is it a form input component?
│  │  (needs form association)
│  ├─ YES → shadow: false
│  └─ NO → Continue
│
├─ Does it need full style encapsulation?
│  ├─ YES → shadow: true
│  └─ NO → shadow: false
│
DEFAULT: shadow: true (most components)
```

### Decision Tree 2: Should I use `style: true`?

```
START: Do I need external CSS?
│
├─ Is it a light DOM component?
│  │  (shadow: false)
│  ├─ YES → style: true
│  │         (inject .css for .uix-component selectors)
│  └─ NO → Continue
│
├─ Does it expose ::part() for external customization?
│  ├─ YES → style: true
│  │         (inject .css for ::part() selectors)
│  └─ NO → style: false or omit
│           (use only internal <style> tags)
│
NOTE: All styling can be done with internal <style> tags in render()
      Use style: true only when you need light DOM CSS injection
```

### Decision Tree 3: Which Component Category?

```
START: What does the component do?
│
├─ Displays atomic content (text, icon, badge)?
│  → Category: display
│
├─ Arranges/structures content (flex, grid, card)?
│  → Category: layout
│
├─ Collects user input (input, checkbox, select)?
│  → Category: form
│
├─ Helps users navigate (navbar, tabs, breadcrumbs)?
│  → Category: navigation
│
├─ Floats above content (modal, dropdown, tooltip)?
│  → Category: overlay
│
├─ Shows status/progress (spinner, toast, skeleton)?
│  → Category: feedback
│
├─ Pre-built page section (hero, pricing, stats)?
│  → Category: page
│
├─ Application chrome (header, container, nav)?
│  → Category: app
│
├─ Utility/helper (draggable, theme-toggle)?
│  → Category: utility
```

### Decision Tree 4: Size Property Pattern

```
Does the component have visual sizing?
│
├─ YES → Use standard size enum:
│         size: T.string({
│           defaultValue: "md",
│           enum: ["xs", "sm", "md", "lg", "xl"]
│         })
│
└─ NO → Skip size property
```

---

## Templates & Snippets

### Template 1: Basic Display Component

**Use for:** Icons, badges, tags, simple visual elements

**File: `display/example.js`**

```javascript
import { html } from "lit-html";
import T from "@bootstrapp/types";

export default {
  tag: "uix-example",

  properties: {
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "primary", "success", "danger"]
    }),
    size: T.string({
      defaultValue: "md",
      enum: ["xs", "sm", "md", "lg", "xl"]
    })
  },

  shadow: true,
  style: true,  // For ::part() customization

  render() {
    return html`
      <style>
        :host {
          display: inline-block;
          --component-size: 1rem;
          --component-color: var(--color-text);
        }

        :host([size="xs"]) { --component-size: 0.75rem; }
        :host([size="sm"]) { --component-size: 0.875rem; }
        :host([size="md"]) { --component-size: 1rem; }
        :host([size="lg"]) { --component-size: 1.25rem; }
        :host([size="xl"]) { --component-size: 1.5rem; }

        :host([variant="primary"]) { --component-color: var(--color-primary); }
        :host([variant="success"]) { --component-color: var(--color-success); }
        :host([variant="danger"]) { --component-color: var(--color-danger); }

        .container {
          font-size: var(--component-size);
          color: var(--component-color);
        }
      </style>
      <div part="container" class="container">
        <slot></slot>
      </div>
    `;
  }
};

/**
 * Example Component
 *
 * @component
 * @category display
 * @tag uix-example
 *
 * Description here.
 *
 * @property {string} variant - Visual variant: default, primary, success, danger (default: default)
 * @property {string} size - Size: xs, sm, md, lg, xl (default: md)
 *
 * @part container - Main container
 *
 * @example Basic Usage
 * ```html
 * <uix-example>Content</uix-example>
 * ```
 *
 * @example With Variant
 * ```html
 * <uix-example variant="primary" size="lg">
 *   Content
 * </uix-example>
 * ```
 */
```

**File: `display/example.css`**

```css
/* External styling for ::part() customization */

.uix-example::part(container) {
  padding: var(--example-padding, 0.5rem);
  border-radius: var(--example-radius, var(--radius-md));
}

.uix-example[variant="primary"]::part(container) {
  background: var(--color-primary-light);
}
```

### Template 2: Layout Component

**Use for:** Containers, grids, flex layouts

**File: `layout/example.js`**

```javascript
import { html } from "lit-html";
import T from "@bootstrapp/types";

export default {
  tag: "uix-example-layout",

  properties: {
    gap: T.string({
      defaultValue: "md",
      enum: ["none", "xs", "sm", "md", "lg", "xl"]
    }),
    padding: T.string({
      defaultValue: "none",
      enum: ["none", "sm", "md", "lg"]
    })
  },

  shadow: false,  // Light DOM for layout
  style: true,    // Inject CSS into light DOM

  render() {
    // Layout components often don't need render
  }
};

/**
 * Example Layout Component
 *
 * @component
 * @category layout
 * @tag uix-example-layout
 *
 * Description here.
 *
 * @property {string} gap - Spacing between children: none, xs, sm, md, lg, xl (default: md)
 * @property {string} padding - Internal padding: none, sm, md, lg (default: none)
 *
 * @example Basic Usage
 * ```html
 * <uix-example-layout gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </uix-example-layout>
 * ```
 */
```

**File: `layout/example.css`**

```css
.uix-example-layout {
  display: flex;
  flex-wrap: wrap;
}

/* Gap variants */
.uix-example-layout[gap="none"] { gap: 0; }
.uix-example-layout[gap="xs"] { gap: var(--spacing-xs); }
.uix-example-layout[gap="sm"] { gap: var(--spacing-sm); }
.uix-example-layout[gap="md"] { gap: var(--spacing-md); }
.uix-example-layout[gap="lg"] { gap: var(--spacing-lg); }
.uix-example-layout[gap="xl"] { gap: var(--spacing-xl); }

/* Padding variants */
.uix-example-layout[padding="sm"] { padding: var(--spacing-sm); }
.uix-example-layout[padding="md"] { padding: var(--spacing-md); }
.uix-example-layout[padding="lg"] { padding: var(--spacing-lg); }
```

### Template 3: Composite Page Component

**Use for:** Stat cards, feature cards, pre-built sections that compose other UIX components

**File: `page/example-card.js`**

```javascript
import { html } from "lit-html";
import T from "@bootstrapp/types";

export default {
  tag: "uix-example-card",

  properties: {
    label: T.string(""),
    value: T.string(""),
    variant: T.string({
      defaultValue: "default",
      enum: ["default", "primary", "success"]
    })
  },

  shadow: true,
  style: true,  // For ::part() customization

  render() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <uix-card part="card" shadow="md">
        <uix-flex part="container" direction="column" gap="sm">
          <uix-text part="label" size="sm" color="muted">
            ${this.label}
          </uix-text>
          <uix-heading part="value" level="3">
            ${this.value}
          </uix-heading>
          <slot></slot>
        </uix-flex>
      </uix-card>
    `;
  }
};

/**
 * Example Card Component
 *
 * @component
 * @category page
 * @tag uix-example-card
 *
 * Pre-built card component for displaying labeled values.
 * Composes uix-card, uix-flex, uix-text, and uix-heading.
 *
 * @property {string} label - Label text above value
 * @property {string} value - Main value to display
 * @property {string} variant - Style variant (default: default)
 *
 * @slot default - Additional content below value
 *
 * @part card - Card wrapper
 * @part container - Flex container
 * @part label - Label text element
 * @part value - Value heading element
 *
 * @example Basic Usage
 * ```html
 * <uix-example-card label="Users" value="1,234"></uix-example-card>
 * ```
 *
 * @example With Slot Content
 * ```html
 * <uix-example-card label="Revenue" value="$8,628">
 *   <uix-badge variant="success">+12%</uix-badge>
 * </uix-example-card>
 * ```
 *
 * @example Dashboard Grid
 * ```html
 * <uix-grid columns="3" gap="lg">
 *   <uix-example-card label="Users" value="1,234"></uix-example-card>
 *   <uix-example-card label="Revenue" value="$8,628"></uix-example-card>
 *   <uix-example-card label="Orders" value="456"></uix-example-card>
 * </uix-grid>
 * ```
 */
```

**File: `page/example-card.css`**

```css
/* External styling for customization */

.uix-example-card::part(card) {
  /* Card customization */
}

.uix-example-card::part(value) {
  color: var(--example-card-value-color, var(--color-text));
}
```

### Snippet 1: Lifecycle Hooks

```javascript
connected() {
  // Called when element is added to DOM
  // Setup: event listeners, initialization
  this._clickHandler = this.handleClick.bind(this);
  this.addEventListener("click", this._clickHandler);
}

disconnected() {
  // Called when element is removed from DOM
  // Cleanup: remove listeners, cancel operations
  this.removeEventListener("click", this._clickHandler);
}

updated({changedProps}) {
  // Called after properties change
  if (changedProps.has("value")) {
    this.emit("value-changed", { value: this.value });
  }

  if (changedProps.has("height")) {
    this.style.setProperty("--component-height", this.height);
  }
}

firstUpdated() {
  // Called after first render - access shadow DOM here
  this._element = this.shadowRoot.querySelector(".element");
}
```

### Snippet 2: Event Emission

```javascript
handleAction() {
  // Emit custom event
  this.emit("custom-event", {
    detail: "data",
    timestamp: Date.now()
  });
}

handleClick(e) {
  this.emit("click-action", {
    x: e.clientX,
    y: e.clientY
  });
}

// In template:
render() {
  return html`
    <button @click=${this.handleClick.bind(this)}>
      Click Me
    </button>
  `;
}
```

### Snippet 3: Conditional Rendering

```javascript
render() {
  return html`
    <!-- Conditional element -->
    ${this.condition ? html`<div>Shown when true</div>` : ""}

    <!-- Conditional with else -->
    ${this.isLoading
      ? html`<uix-spinner></uix-spinner>`
      : html`<div>Content loaded</div>`
    }

    <!-- Array mapping -->
    ${this.items.map(item => html`
      <div class="item">${item.name}</div>
    `)}

    <!-- Array with index -->
    ${this.items.map((item, index) => html`
      <div class="item-${index}">${item.name}</div>
    `)}

    <!-- Nested conditionals -->
    ${this.showSection ? html`
      <section>
        ${this.showHeader ? html`<header>Title</header>` : ""}
        <div>Content</div>
      </section>
    ` : ""}
  `;
}
```

### Snippet 4: Gradient Background Support

```javascript
// In component properties:
properties: {
  gradientFrom: T.string(""),
  gradientTo: T.string("")
}

// In render():
render() {
  const cardStyle = this.gradientFrom
    ? `--card-gradient-from: ${this.gradientFrom}; ${this.gradientTo ? `--card-gradient-to: ${this.gradientTo};` : ""}`
    : "";

  return html`
    <uix-card style=${cardStyle}>
      <slot></slot>
    </uix-card>
  `;
}
```

**In CSS file:**
```css
.uix-card[style*="--card-gradient-from"]::part(body) {
  background: linear-gradient(
    135deg,
    var(--card-gradient-from),
    var(--card-gradient-to, var(--card-gradient-from))
  );
  color: white;
}
```

---

## Real Examples Reference

### Exemplar Components

Study these well-documented components that follow all patterns:

1. **`display/avatar.js`** - Shadow DOM, auto-initials generation, status indicator, size variants
2. **`display/badge.js`** - Variants, sizes, simple display component
3. **`layout/card.js`** - Slots (header/body/footer), parts, extends container
4. **`layout/flex.js`** - Light DOM, layout properties, child element attributes
5. **`page/stat-card.js`** - Composite component using other UIX components
6. **`page/contact-avatar.js`** - Wraps avatar, optional href for links
7. **`page/metric-hero-card.js`** - Gradient support, chart slot
8. **`form/input.js`** - Light DOM, form association, validation
9. **`app/app-container.js`** - Complex lifecycle, responsive behavior, routing
10. **`overlay/modal.js`** - Backdrop, keyboard handling (Escape), z-index management

### Anti-patterns to Avoid

❌ **Don't:** Hardcode colors
```css
.component { color: #FF0000; }
```
✅ **Do:** Use CSS variables
```css
.component { color: var(--color-danger); }
```

❌ **Don't:** Skip JSDoc examples
```javascript
/**
 * Component Name
 */
```
✅ **Do:** Include comprehensive JSDoc
```javascript
/**
 * Component Name
 *
 * @example Basic Usage
 * ```html
 * <uix-component></uix-component>
 * ```
 */
```

❌ **Don't:** Use `shadow: true` for form inputs
```javascript
// Form won't work properly
export default {
  tag: "uix-input",
  shadow: true  // ❌ Wrong!
}
```
✅ **Do:** Use `shadow: false` for form inputs
```javascript
export default {
  tag: "uix-input",
  shadow: false  // ✓ Correct
}
```

❌ **Don't:** Forget to expose parts
```javascript
render() {
  return html`<div class="container">...</div>`;
}
```
✅ **Do:** Expose parts for customization
```javascript
render() {
  return html`<div part="container" class="container">...</div>`;
}
```

---

## Best Practices

### DO ✓

✓ Always create both .js and .css files
✓ Use `style: true` only when you need light DOM CSS injection
✓ Use internal `<style>` tags in render() for shadow DOM component styling
✓ Define properties with T.string/T.boolean/T.number/etc.
✓ Use enums for variant properties (size, variant, shadow, etc.)
✓ Document with comprehensive JSDoc (@component, @category, @tag, @property, @slot, @part, @example)
✓ Include multiple @example sections (basic → advanced)
✓ Expose parts for external styling customization
✓ Use CSS variables for colors, spacing, and theming
✓ Follow consistent naming conventions (size, variant, shadow, gap, padding, etc.)
✓ Emit custom events for important state changes
✓ Clean up listeners in disconnected() lifecycle
✓ Use semantic HTML and proper ARIA attributes

### DON'T ✗

✗ Use `shadow: true` for form inputs (breaks form association)
✗ Hardcode colors or sizes (use CSS variables)
✗ Skip JSDoc documentation
✗ Create components without @example sections
✗ Forget to expose parts for customization
✗ Mix concerns (keep display/layout/form separate)
✗ Use inline styles instead of CSS variables
✗ Forget lifecycle cleanup (memory leaks)
✗ Use `style: true` everywhere without purpose
✗ Put `:host` selectors in external .css files (won't work in light DOM)

---

## Common Patterns

### Pattern: Auto-generated Initials (Avatar)

```javascript
_getInitials(name) {
  if (!name) return "";

  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

render() {
  const initials = this.src ? "" : this._getInitials(this.name);

  return html`
    <div class="avatar">
      ${this.src
        ? html`<img src=${this.src} alt=${this.name} />`
        : html`<span class="initials">${initials}</span>`
      }
    </div>
  `;
}
```

### Pattern: Keyboard Event Handling

```javascript
_handleEscape(e) {
  if (e.key === "Escape" && this.open) {
    this.close();
  }
}

_handleArrowKeys(e) {
  if (e.key === "ArrowDown") {
    this.selectNext();
  } else if (e.key === "ArrowUp") {
    this.selectPrevious();
  }
}

connected() {
  this._escapeHandler = this._handleEscape.bind(this);
  this._arrowHandler = this._handleArrowKeys.bind(this);

  document.addEventListener("keydown", this._escapeHandler);
  this.addEventListener("keydown", this._arrowHandler);
}

disconnected() {
  document.removeEventListener("keydown", this._escapeHandler);
  this.removeEventListener("keydown", this._arrowHandler);
}
```

### Pattern: CSS Variable Syncing

```javascript
updated({changedProps}) {
  // Sync property to CSS variable for flexibility
  if (changedProps.has("height")) {
    this.style.setProperty("--component-height", this.height);
  }

  if (changedProps.has("width")) {
    this.style.setProperty("--component-width", this.width);
  }
}
```

### Pattern: Form Value Association

```javascript
export default {
  tag: "uix-custom-input",
  formAssociated: true,  // Enable form association
  shadow: false,         // Must be light DOM

  connected() {
    this._internals = this.attachInternals();
  },

  _updateFormValue() {
    // Update form value when component value changes
    this._internals.setFormValue(this.value);
  },

  updated({changedProps}) {
    if (changedProps.has("value")) {
      this._updateFormValue();
    }
  }
};
```

### Pattern: Responsive Breakpoint Handling

```javascript
import { getCurrentBreakpoint, useBreakpoint } from "../utils/breakpoints.js";

connected() {
  this.currentBreakpoint = getCurrentBreakpoint();
  this.isMobile = ["xs", "sm"].includes(this.currentBreakpoint);

  // Listen for breakpoint changes
  this.breakpointCleanup = useBreakpoint((bp) => {
    this.isMobile = ["xs", "sm"].includes(bp);
    this.requestUpdate();
  });
}

disconnected() {
  this.breakpointCleanup?.cleanup();
}

render() {
  return this.isMobile
    ? this.renderMobile()
    : this.renderDesktop();
}
```

### Pattern: Slot Change Detection

```javascript
connected() {
  this.addEventListener("slotchange", this._handleSlotChange);
}

_handleSlotChange(e) {
  const slot = e.target;
  const assignedNodes = slot.assignedNodes();

  console.log("Slot changed:", assignedNodes.length, "nodes");

  // React to slot content changes
  this.hasContent = assignedNodes.length > 0;
}
```

### Pattern: Backdrop Click Handling (Modals/Drawers)

```javascript
_handleBackdropClick(e) {
  // Only close if clicking directly on backdrop, not children
  if (e.target === e.currentTarget) {
    this.close();
  }
}

render() {
  return html`
    <div
      class="backdrop"
      @click=${this._handleBackdropClick}
    >
      <div class="content">
        <slot></slot>
      </div>
    </div>
  `;
}
```

---

## Quick Reference

### Component Checklist

When creating a new component:

- [ ] Created both `.js` and `.css` files
- [ ] Chose correct `shadow` value (true/false)
- [ ] Chose correct `style` value based on CSS needs
- [ ] Defined properties with proper types
- [ ] Used enums for variant properties
- [ ] Wrote JSDoc with @component, @category, @tag
- [ ] Documented all @property, @slot, @part
- [ ] Included 3-4 @example sections
- [ ] Exposed parts for customization
- [ ] Used CSS variables (no hardcoded colors/sizes)
- [ ] Added lifecycle cleanup if needed
- [ ] Tested in both light and shadow contexts (if applicable)

### Common Gotchas

1. **`:host` in external .css doesn't work** → Use internal `<style>` tags
2. **Form inputs need `shadow: false`** → Otherwise form association breaks
3. **Forgetting to bind event handlers** → Use `.bind(this)` or arrow functions
4. **Not cleaning up listeners** → Memory leaks in disconnected()
5. **Using `style: true` without purpose** → Only use when you need light DOM CSS
6. **Missing parts** → Always expose customization points
7. **Hardcoded values** → Use CSS variables for theming

---

**End of Guide**

For questions or contributions, please refer to the project documentation or contact the UIX team.
