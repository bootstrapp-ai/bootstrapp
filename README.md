# @bootstrapp/view

Web components framework built on Custom Elements API with lit-html templating.

## Installation

### Via npm

```bash
npm install @bootstrapp/view
```

### Via CDN (no build step)

Use importmaps to load directly from esm.sh:

```html
<script type="importmap">
{
  "imports": {
    "lit-html": "https://esm.sh/lit-html",
    "@bootstrapp/types": "https://esm.sh/@bootstrapp/types@0.1.0",
    "@bootstrapp/view": "https://esm.sh/@bootstrapp/view@0.1.0"
  }
}
</script>
```

## Overview

`@bootstrapp/view` is a lightweight, reactive web components framework that extends the Custom Elements API. It provides a familiar component model with reactive properties, lifecycle hooks, and efficient templating via lit-html.

## Quick Start

Here's a complete example showing how to create and use a component with importmaps:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Counter - Bootstrapp Example</title>

  <script type="importmap">
  {
    "imports": {
      "lit-html": "https://esm.sh/lit-html",
      "@bootstrapp/types": "https://esm.sh/@bootstrapp/types@0.1.0",
      "@bootstrapp/view": "https://esm.sh/@bootstrapp/view@0.1.0"
    }
  }
  </script>

  <script type="module">
    import View from '@bootstrapp/view';
    import { html } from 'lit';
    import T from '@bootstrapp/types';

    View.define('my-counter', {
      properties: {
        count: T.number({ defaultValue: 0 }),
        label: T.string({ defaultValue: 'Counter' })
      },

      increment() {
        this.count++;
      },

      render() {
        return html`
          <div>
            <h2>${this.label}</h2>
            <p>Count: ${this.count}</p>
            <button @click=${this.increment}>Increment</button>
          </div>
        `;
      }
    });
  </script>
</head>
<body>
  <h1>Bootstrapp Counter Example</h1>

  <!-- Using the component -->
  <my-counter label="Click Counter"></my-counter>
  <my-counter count="5" label="Started at 5"></my-counter>
</body>
</html>
```

## Key Features

- **Reactive Properties** - Automatic re-rendering when properties change
- **Type Coercion** - Seamless conversion from HTML attributes to JavaScript types
- **Lifecycle Hooks** - `connected`, `disconnected`, `willUpdate`, `firstUpdated`, `updated`
- **Shadow DOM Support** - Optional shadow DOM with scoped styles
- **Event System** - Simple `on()`, `off()`, `emit()` methods for events
- **Component Inheritance** - Extend existing components with `extends` property
- **Plugin System** - Extensible architecture for adding behaviors

## Component Options

```javascript
View.define('my-component', {
  properties: {},        // Property definitions with types
  shadow: true,          // Enable shadow DOM (optional)
  css: '/* styles */',   // Component-scoped CSS (requires shadow: true)
  formAssociated: false, // Form-associated custom element

  // Lifecycle hooks
  connected() {},
  disconnected() {},
  willUpdate({changedProps}) {},
  firstUpdated({changedProps}) {},
  updated({changedProps}) {},

  // Custom methods
  render() {
    return html`...`;
  }
});
```

## Defining Components

The View API provides a simple way to define and register components:

```javascript
import View from '@bootstrapp/view';

// Define components
View.define('my-component', {
  properties: {},
  render() {
    return html`...`;
  }
});

// Advanced: Get a component class programmatically
const MyComponent = await View.get('my-component');
```

## Links

- [GitHub Repository](https://github.com/bootstrapp-ai/bootstrapp)
- [Report Issues](https://github.com/bootstrapp-ai/bootstrapp/issues)
- [Bootstrapp Framework](https://github.com/bootstrapp-ai/bootstrapp#readme)

## License

AGPL-3.0
