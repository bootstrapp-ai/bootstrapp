# Bootstrapp

A modular, platform-agnostic development tool for building web applications.

## Features

- 🚀 Dev server with hot-reload
- 📦 Project scaffolding
- 🔌 Plugin system
- 🌐 Platform-agnostic (Node.js, Browser, Electron)
- ⚡ Functional programming style

## Installation

``ash
npm install -g bootstrapp
```

## Usage

### Start Dev Server
``ash
bootstrapp
bootstrapp ./my-project
```

### Create New Project
``ash
bootstrapp new basic my-app
bootstrapp new react my-react-app
bootstrapp new electron my-electron-app
```

### Generate Code
``ash
bootstrapp generate component Button
bootstrapp generate page Dashboard
bootstrapp generate api users
```

### Electron Commands
``ash
bootstrapp electron ./my-electron-app
bootstrapp electron:build
```

## Programmatic Usage

```javascript
import * as adapter from 'bootstrapp/adapters/node';
import { generate, newProject } from 'bootstrapp';

// Generate a component
await generate(adapter, 'component', { name: 'Button' });

// Create a new project
await newProject(adapter, 'react', 'my-app');
```

## Architecture

- **Adapters**: Platform-specific implementations (Node.js, Browser, Electron)
- **Commands**: Business logic for CLI commands
- **Core**: Shared utilities and plugin system

## License

MIT
