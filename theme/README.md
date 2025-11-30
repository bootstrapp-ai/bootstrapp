# @bootstrapp/theme

Standalone theming system with dynamic CSS variable generation, color utilities, and HSL-based shade generation.

## Features

- 🎨 **Color Utilities**: Parse HEX, RGB, HSL formats
- 🌈 **Automatic Shade Generation**: Creates lighter/light/dark/darker variants
- 📦 **CSS Variable Management**: Generate and inject theme variables dynamically
- 🔄 **Runtime Theme Switching**: Load themes on-the-fly
- 🎯 **Zero Dependencies**: Pure JavaScript

## Installation

### Via npm
```bash
npm install @bootstrapp/theme
```

### Via CDN
```html
<script type="importmap">
{
  "imports": {
    "@bootstrapp/theme": "https://esm.sh/@bootstrapp/theme@0.1.0"
  }
}
</script>
```

## Quick Start

```javascript
import Theme from '@bootstrapp/theme';

// Load a built-in theme
await Theme.loadTheme('gruvbox-dark');

// Or apply a custom theme
Theme.applyTheme({
  color: {
    primary: '#fabd2f',
    secondary: '#83a598',
  },
  spacing: {
    sm: '0.5rem',
    md: '0.75rem',
  }
});
```

## API Reference

### Core Functions

#### `loadTheme(themeName: string): Promise<void>`
Load and apply a registered theme.

#### `applyTheme(themeData: object): void`
Apply a theme object directly without registration.

#### `registerTheme(name: string, loader: Function): void`
Register a new theme with dynamic import.

#### `generateShades(baseHSL: object, config?: object): object`
Generate color shade variations from a base HSL color.

#### `parseColor(colorString: string): object | null`
Parse HEX, RGB, or HSL color strings into HSL format.

### Built-in Themes

- `gruvbox-dark` - Warm, retro dark theme
- `gruvbox-light` - Warm, retro light theme

## Theme Structure

```javascript
export default {
  color: {
    primary: '#fabd2f',      // Auto-generates: lighter, light, dark, darker
    secondary: '#83a598',
    success: '#b8bb26',
    danger: '#fb4934',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
  },
  typography: {
    fontSize: {
      base: '1rem',
      lg: '1.125rem',
    }
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
  }
}
```

## CSS Variables Generated

```css
:root {
  --color-primary: hsl(45 99% 60%);
  --color-primary-lighter: hsl(45 99% 80%);
  --color-primary-light: hsl(45 99% 70%);
  --color-primary-dark: hsl(45 99% 50%);
  --color-primary-darker: hsl(45 99% 40%);
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  /* ... etc */
}
```

## License

AGPL-3.0
