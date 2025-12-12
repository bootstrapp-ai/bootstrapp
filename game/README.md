# @bootstrapp/game - Game Engine Module

A lightweight, plugin-based game engine module for the Bootstrapp framework. Built with functional programming patterns and designed to work seamlessly with the Bootstrapp ecosystem.

## Architecture

The game engine follows a **plugin-based architecture** similar to the AI module, using closures and functional patterns instead of classes.

### Core Plugins

1. **events** - Event system for pub/sub communication
2. **state** - Global game state management with reactive updates
3. **entities** - Entity-Component System (ECS) for game objects
4. **systems** - Game logic systems that process entities
5. **resources** - Asset loading and caching
6. **render** - Canvas rendering with layer support
7. **loop** - Game loop with fixed timestep updates
8. **scenes** - Scene management for different game screens

## Usage

### Basic Setup

```javascript
import GameEngine from "/node_modules/@bootstrapp/game/index.js";

// Initialize the engine
GameEngine.init({
  targetFPS: 60,
  enableDebug: true,
  autoStart: false
});

// Start the game loop
GameEngine.start();
```

### Using Plugins

All plugins expose their API through the engine:

```javascript
// Events
const eventsApi = GameEngine.plugin("events");
eventsApi.on("player:death", (data) => console.log(data));
eventsApi.emit("player:death", { playerId: 123 });

// State
const stateApi = GameEngine.plugin("state");
stateApi.set("score", 100);
const score = stateApi.get("score");

// Entities
const entitiesApi = GameEngine.plugin("entities");
const player = entitiesApi.create({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  sprite: { image: playerImg }
});

// Systems
const systemsApi = GameEngine.plugin("systems");
systemsApi.register("movement", {
  priority: 10,
  query: { components: ["position", "velocity"] },
  update(deltaTime, totalTime, entities, engine) {
    entities.forEach(entity => {
      entity.components.position.x += entity.components.velocity.x * deltaTime;
      entity.components.position.y += entity.components.velocity.y * deltaTime;
    });
  }
});
```

### Rendering

```javascript
const renderApi = GameEngine.plugin("render");

// Set canvas
renderApi.setCanvas(document.querySelector("canvas"));

// Register render layers
renderApi.registerLayer("background", (ctx, canvas) => {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}, 0);

renderApi.registerLayer("sprites", (ctx, canvas, deltaTime, totalTime, engine) => {
  const entities = engine.plugin("entities").query({ components: ["position", "sprite"] });
  entities.forEach(entity => {
    const { position, sprite } = entity.components;
    ctx.drawImage(sprite.image, position.x, position.y);
  });
}, 10);
```

### Scene Management

```javascript
const scenesApi = GameEngine.plugin("scenes");

scenesApi.register("menu", {
  enter(engine, data) {
    console.log("Entering menu scene");
  },
  exit(engine) {
    console.log("Leaving menu scene");
  },
  update(deltaTime, totalTime, engine) {
    // Update menu logic
  },
  render(ctx, canvas, deltaTime, totalTime, engine) {
    // Render menu
  }
});

scenesApi.switch("menu");
```

## Web Components

The engine includes several web components for UI:

- `<game-canvas>` - Canvas wrapper with automatic engine integration
- `<game-stat>` - Stat display with progress bars
- `<game-button>` - Interactive button with cooldown support
- `<game-ui-panel>` - Collapsible UI panel

### Example

```html
<game-canvas width="800" height="600" auto-start></game-canvas>

<game-stat
  label="Health"
  value="80"
  max="100"
  show-progress
  color="#ff0000"
  icon="❤️">
</game-stat>

<game-button
  label="Attack"
  icon="⚔️"
  cooldown="2"
  variant="danger">
</game-button>
```

## Patterns Used

- **Closure-based Privacy** - State encapsulated in closures, not classes
- **Plugin System** - Modular, composable architecture
- **Entity-Component System** - Data-driven game object management
- **Pub/Sub Events** - Decoupled communication
- **Functional Programming** - Pure functions, immutability where possible

## Integration with Bootstrapp

The engine integrates with:

- **Model** - Use Bootstrapp's Model system for save data
- **View** - Web components for UI elements
- **Controller** - Game-specific controllers
- **$APP** - Registered as `$APP.GameEngine`

## Examples

See `/projects/devlife` for a complete example of an idle game built with this engine.
