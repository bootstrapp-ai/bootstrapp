# @bootstrapp/events

Lightweight event system with pub/sub pattern and event handler installation.

## Installation

```bash
npm install @bootstrapp/events
```

## Usage

### Singleton Instance (Global Events)

```javascript
import events from '@bootstrapp/events';

// Subscribe to events
events.on('user:login', (user) => {
  console.log('User logged in:', user);
});

// Emit events
events.emit('user:login', { id: 1, name: 'John' });

// Unsubscribe
const handler = (user) => console.log(user);
events.on('user:login', handler);
events.off('user:login', handler);
```

### Factory Function (Create Independent Instances)

```javascript
import createEventHandler from '@bootstrapp/events';

const myEvents = createEventHandler();

myEvents.on('data:update', (data) => {
  console.log('Data updated:', data);
});

myEvents.emit('data:update', { value: 42 });
```

### Install on Existing Objects

```javascript
import { install } from '@bootstrapp/events';

const myObject = { name: 'MyObject' };
install(myObject);

// Now myObject has event methods
myObject.on('change', () => console.log('Changed!'));
myObject.emit('change');
```

## API Reference

### Methods

#### `on(key, callback)`
Register an event listener.
- `key` - Event key/name
- `callback` - Function to call when event is emitted

#### `off(key, callback)`
Remove an event listener.
- `key` - Event key/name
- `callback` - Function to remove

#### `emit(key, data)`
Emit an event to all registered listeners.
- `key` - Event key/name
- `data` - Data to pass to listeners
- Returns: Array of results from all listeners

#### `set(events)`
Register multiple events at once.
- `events` - Object with key-value pairs of event names and callbacks

```javascript
events.set({
  'user:login': (user) => console.log('Login:', user),
  'user:logout': () => console.log('Logout')
});
```

#### `get(key)`
Get all listeners for a specific event.
- `key` - Event key/name
- Returns: Array of callback functions

#### `onAny(callback)`
Listen to all events.
- `callback` - Function that receives `{ key, data }` for any event

```javascript
events.onAny(({ key, data }) => {
  console.log(`Event ${key} fired with`, data);
});
```

#### `offAny(callback)`
Remove an "any" listener.
- `callback` - Function to remove

#### `hasListeners(key)`
Check if an event has any listeners.
- `key` - Event key/name
- Returns: Boolean

### Properties

#### `listeners`
Internal Map of event listeners. Useful for debugging.

## Migration from $APP.events

If you're migrating from the built-in $APP.events:

```javascript
// Old
import $APP from '/app';
$APP.events.on('event', callback);

// New
import events from '@bootstrapp/events';
events.on('event', callback);

// Or for the install function
// Old
$APP.events.install(myObject);

// New
import { install } from '@bootstrapp/events';
install(myObject);
```

## License

AGPL-3.0
