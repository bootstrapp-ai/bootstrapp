# @bootstrapp/controller

Reactive state management with multiple storage backends (localStorage, sessionStorage, RAM, URL) and custom adapters.

## Installation

```bash
npm install @bootstrapp/controller
```

## Usage

### Basic Usage

```javascript
import Controller from '@bootstrapp/controller';

// localStorage adapter
Controller.local.set('user', { name: 'John', age: 30 });
const user = Controller.local.get('user'); // { name: 'John', age: 30 }

// sessionStorage adapter
Controller.session.set('theme', 'dark');

// RAM adapter (in-memory)
Controller.ram.set('cache', [1, 2, 3]);

// URL query string adapter
Controller.querystring.set('page', '2'); // Updates ?page=2 in URL
Controller.hash.set('section', 'intro'); // Updates #section=intro in URL
```

### Reactive State with Events

```javascript
import Controller from '@bootstrapp/controller';

// Listen for changes
Controller.local.on('user', (user) => {
  console.log('User changed:', user);
});

// Emit events when values change
Controller.local.set('user', { name: 'Jane' }); // Triggers listener
```

### Nested Properties (Dot Notation)

```javascript
import Controller from '@bootstrapp/controller';

Controller.local.set('settings.theme', 'dark');
Controller.local.set('settings.language', 'en');

const theme = Controller.local.get('settings.theme'); // 'dark'
const settings = Controller.local.get('settings'); // { theme: 'dark', language: 'en' }
```

### Custom Adapters

```javascript
import { createController } from '@bootstrapp/controller';

const customStore = {
  data: new Map(),
  get: (key) => customStore.data.get(key),
  set: (key, val) => customStore.data.set(key, val),
  remove: (key) => customStore.data.delete(key),
  has: (key) => customStore.data.has(key),
  keys: () => Array.from(customStore.data.keys()),
  entries: () => Array.from(customStore.data.entries())
};

const Controller = createController();
Controller.add('custom', customStore);

Controller.custom.set('key', 'value');
```

### Sync Factory

```javascript
import { createSync } from '@bootstrapp/controller/sync-factory';
import Controller from '@bootstrapp/controller';

const syncObj = createSync(Controller.local, 'myNamespace');

syncObj.set('count', 42);
const count = syncObj.get('count'); // 42

// Subscribe to changes
const unsubscribe = syncObj.subscribe('count', (value) => {
  console.log('Count changed:', value);
});
```

## Built-in Adapters

### localStorage (`Controller.local`)
- Persists data across browser sessions
- Supports cross-tab synchronization (via service workers)
- Automatic JSON serialization/deserialization

### sessionStorage (`Controller.session`)
- Persists data for the current session only
- Automatic JSON serialization/deserialization

### RAM (`Controller.ram`)
- In-memory storage (lost on page reload)
- Fastest option for temporary data

### Query String (`Controller.querystring`)
- Manages URL query parameters (`?key=value`)
- Automatically updates URL without page reload
- Syncs with browser back/forward buttons

### Hash (`Controller.hash`)
- Manages URL hash parameters (`#key=value`)
- Automatically updates URL without page reload
- Syncs with browser back/forward buttons

## API Reference

### Adapter Methods

#### `get(key)`
Retrieve a value from storage.

#### `set(key, value)`
Store a value and emit change event.

#### `remove(key)`
Delete a value from storage.

#### `has(key)`
Check if a key exists.

#### `keys()`
Get all keys.

#### `entries()`
Get all key-value pairs.

#### `on(key, callback)`
Listen for changes to a specific key.

#### `off(key, callback)`
Remove a change listener.

#### `emit(key, value)`
Manually trigger a change event.

### Controller Methods

#### `Controller.add(name, store)`
Add a custom adapter.

```javascript
Controller.add('myAdapter', customStore);
// Or add multiple:
Controller.add({ adapter1: store1, adapter2: store2 });
```

#### `Controller.createAdapter(store, name)`
Create an adapter from a store object.

#### `Controller.createSync(instance, adapterName, props)`
Create a sync object for reactive property binding.

## Integration with Bootstrapp

When used with the Bootstrapp framework, the controller integrates with:

### Service Workers (Cross-Tab Sync)
```javascript
// Automatically syncs localStorage changes across browser tabs
Controller.local.set('user', userData); // Synced to all tabs
```

### View Components (Reactive Properties)
```javascript
import T from '@bootstrapp/types';

$APP.define('my-component', {
  properties: {
    // Syncs with localStorage
    user: T.object({ sync: 'local' }),

    // Syncs with URL query string
    page: T.number({ sync: 'querystring', defaultValue: 1 }),

    // Scoped sync (per-component instance)
    count: T.number({ sync: 'local', scope: 'id' })
  }
});
```

### App Integration
```javascript
import initControllerApp from '@bootstrapp/controller/app';
import $APP from '/app';
import Controller from '@bootstrapp/controller';
import View from '@bootstrapp/view';

// Initialize framework integration
$APP.events.on('APP:INIT', () => {
  initControllerApp($APP, Controller, View);
});
```

## Examples

### User Preferences

```javascript
import Controller from '@bootstrapp/controller';

// Save user preferences
Controller.local.set('preferences', {
  theme: 'dark',
  language: 'en',
  notifications: true
});

// Listen for theme changes
Controller.local.on('preferences.theme', (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
});
```

### Pagination State in URL

```javascript
import Controller from '@bootstrapp/controller';

// Update page in URL
Controller.querystring.set('page', 2);
// URL becomes: ?page=2

// Listen for page changes (e.g., browser back button)
Controller.querystring.on('page', (page) => {
  loadPage(parseInt(page) || 1);
});
```

### Shopping Cart

```javascript
import Controller from '@bootstrapp/controller';

// Add item to cart
const cart = Controller.local.get('cart') || [];
cart.push({ id: 1, name: 'Product', price: 29.99 });
Controller.local.set('cart', cart);

// Listen for cart updates
Controller.local.on('cart', (cart) => {
  updateCartUI(cart);
  updateCartCount(cart.length);
});
```

## Migration from /app/controller

```javascript
// Old
import Controller from '/app/controller';

// New
import Controller from '@bootstrapp/controller';

// Integration (if using with Bootstrapp)
import initControllerApp from '@bootstrapp/controller/app';
```

## TypeScript

```typescript
import Controller from '@bootstrapp/controller';

interface User {
  name: string;
  age: number;
}

Controller.local.set<User>('user', { name: 'John', age: 30 });
const user = Controller.local.get<User>('user');
```

## License

AGPL-3.0
