import $APP from "/$app.js";

// ============================================================================
// EVENTS PLUGIN
// ============================================================================
const eventsPlugin = {
  name: "events",

  initialize(engine) {
    const listeners = new Map();

    this.api.on = (eventType, handler) => {
      if (!listeners.has(eventType)) {
        listeners.set(eventType, new Set());
      }
      listeners.get(eventType).add(handler);

      return () => listeners.get(eventType)?.delete(handler);
    };

    this.api.once = (eventType, handler) => {
      const unsubscribe = this.api.on(eventType, (...args) => {
        handler(...args);
        unsubscribe();
      });
      return unsubscribe;
    };

    this.api.emit = (eventType, data) => {
      if (!listeners.has(eventType)) return;
      listeners.get(eventType).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${eventType}":`, error);
        }
      });
    };

    this.api.off = (eventType, handler) => {
      if (!handler) {
        listeners.delete(eventType);
      } else {
        listeners.get(eventType)?.delete(handler);
      }
    };

    this.api.clear = () => {
      listeners.clear();
    };
  },

  api: {},
};

// ============================================================================
// STATE PLUGIN
// ============================================================================
const statePlugin = {
  name: "state",

  initialize(engine) {
    let gameState = {};
    const listeners = new Set();
    const eventsApi = engine.plugin("events");

    const notifyListeners = (key, value) => {
      listeners.forEach((listener) => {
        try {
          listener(key, value, gameState);
        } catch (error) {
          console.error("Error in state listener:", error);
        }
      });
    };

    this.api.get = (key) => {
      return key ? gameState[key] : { ...gameState };
    };

    this.api.getAll = () => ({ ...gameState });

    this.api.set = (key, value) => {
      const changed = gameState[key] !== value;
      gameState[key] = value;
      if (changed) {
        notifyListeners(key, value);
        eventsApi?.emit("state:change", { key, value });
      }
    };

    this.api.update = (updates) => {
      Object.entries(updates).forEach(([key, value]) => {
        this.api.set(key, value);
      });
    };

    this.api.delete = (key) => {
      const hadKey = key in gameState;
      delete gameState[key];
      if (hadKey) {
        notifyListeners(key, undefined);
        eventsApi?.emit("state:delete", { key });
      }
    };

    this.api.reset = () => {
      const oldState = gameState;
      gameState = {};
      listeners.forEach((listener) => listener(null, null, gameState));
      eventsApi?.emit("state:reset", { oldState });
    };

    this.api.subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };

    engine.addStore("state", gameState);
  },

  api: {},
};

// ============================================================================
// TYPING PLUGIN (NEW - Core mechanic)
// ============================================================================
const typingPlugin = {
  name: "typing",

  initialize(engine) {
    let currentKey = null;
    let comboCount = 0;
    let comboMultiplier = 1;
    let lastKeyTime = 0;
    const keySequence = [];
    let snippetIndex = 0;
    let typedText = "";
    let correctKeys = 0;
    let totalKeys = 0;

    const eventsApi = engine.plugin("events");
    const stateApi = engine.plugin("state");

    // Code snippets for learning mode
    // REFACTOR 2: Added snippets with more special chars
    const codeSnippets = [
      "function greet(name) { return 'Hello ' + name; }",
      "const sum = (a, b) => a + b;",
      "for (let i = 0; i < 10; i++) { console.log(i); }",
      "const users = data.filter(u => u.age > 18);",
      "async function fetchData() { const res = await fetch(url); }",
      "class User { constructor(name) { this.name = name; } }",
      "const squared = numbers.map(n => n * n);",
      "if (condition) { doSomething(); } else { doOther(); }",
      "const person = { name: 'Dev', level: 1 };",
      "let arr = [1, 2, 3, 4, 5];",
      "fetch('api.url').then(res => res.json());",
    ];

    let currentSnippet = codeSnippets[0];

    // Generate next key based on mode
    this.api.generateKey = (mode, context = null) => {
      if (mode === "brainrot") {
        // REFACTOR 2: Updated key list
        const keys = "abcdefghijklmnopqrstuvwxyz{}[]()<>.,".split("");
        return keys[Math.floor(Math.random() * keys.length)];
      } else if (mode === "learning") {
        // Use current snippet
        if (snippetIndex >= currentSnippet.length) {
          // Move to next snippet
          const nextSnippetIdx =
            (codeSnippets.indexOf(currentSnippet) + 1) % codeSnippets.length;
          currentSnippet = codeSnippets[nextSnippetIdx];
          snippetIndex = 0;
          typedText = "";
          eventsApi?.emit("typing:snippet-complete", {
            snippet: currentSnippet,
          });
        }

        let nextChar = currentSnippet[snippetIndex];

        // Skip spaces, as they aren't on the keyboard
        while (nextChar === " ") {
          snippetIndex++;
          typedText += " "; // Auto-complete the space
          if (snippetIndex >= currentSnippet.length) {
            // Snippet ended on a space, loop around
            return this.api.generateKey(mode, context);
          }
          nextChar = currentSnippet[snippetIndex];
        }

        return nextChar;
      }
      return "a";
    };

    // Handle key press
    this.api.handleKeyPress = (key, expectedKey) => {
      const now = performance.now();
      const timeSinceLastKey = now - lastKeyTime;

      totalKeys++;

      // Ensure expectedKey is also lowercase for comparison
      const lowExpected = expectedKey.toLowerCase();

      // Check if correct
      if (key === lowExpected) {
        correctKeys++;
        comboCount++;

        // Calculate multiplier (increases every 10 combo)
        comboMultiplier = 1 + Math.floor(comboCount / 10);

        // Calculate LoC earned
        const baseLoC = 1;
        const playerClickMult = stateApi.get("clickMultiplier") || 1;
        const permanentClickMult =
          stateApi.get("permanentClickMultiplier") || 1;
        const earned =
          baseLoC * comboMultiplier * playerClickMult * permanentClickMult;

        // === FIX: ADD EXPERIENCE GAIN ===
        // Calculate Experience earned
        const baseExp = 1; // Base EXP per key
        const expMult = stateApi.get("expMultiplier") || 1;
        const earnedExp = baseExp * comboMultiplier * expMult;

        // Update experience state
        const currentExp = stateApi.get("experience") || 0;
        stateApi.set("experience", currentExp + earnedExp);
        // === END FIX ===

        // Update state
        const currentLoC = stateApi.get("linesOfCode") || 0;
        stateApi.set("linesOfCode", currentLoC + earned);
        stateApi.set("currentCombo", comboCount);

        const totalEarned = stateApi.get("totalEarned") || 0;
        stateApi.set("totalEarned", totalEarned + earned);

        const totalPressed = stateApi.get("totalKeysPressed") || 0;
        stateApi.set("totalKeysPressed", totalPressed + 1);

        // Update max combo
        const maxCombo = stateApi.get("maxCombo") || 0;
        if (comboCount > maxCombo) {
          stateApi.set("maxCombo", comboCount);
        }

        // Update typing accuracy
        const accuracy = (correctKeys / totalKeys) * 100;
        stateApi.set("typingAccuracy", accuracy);

        // For learning mode, track typed text
        const mode = stateApi.get("currentMode") || "brainrot";
        if (mode === "learning") {
          typedText += expectedKey; // Use original expectedKey to preserve case
          snippetIndex++;
          eventsApi?.emit("typing:text-updated", { typedText, currentSnippet });
        }

        eventsApi?.emit("typing:correct", {
          key,
          combo: comboCount,
          multiplier: comboMultiplier,
          earned,
        });

        // Emit events for achievements
        eventsApi?.emit("key:correct", { totalKeysPressed: totalPressed + 1 });
        eventsApi?.emit("combo:updated", { combo: comboCount });
        eventsApi?.emit("loc:updated", { linesOfCode: currentLoC + earned });

        lastKeyTime = now;
        return true;
      } else {
        // Wrong key - break combo
        const brokenCombo = comboCount;
        comboCount = 0;
        comboMultiplier = 1;

        stateApi.set("currentCombo", 0);

        // Update accuracy
        const accuracy = (correctKeys / totalKeys) * 100;
        stateApi.set("typingAccuracy", accuracy);

        eventsApi?.emit("typing:incorrect", { key, expectedKey, brokenCombo });

        return false;
      }
    };

    this.api.getCurrentCombo = () => comboCount;
    this.api.getComboMultiplier = () => comboMultiplier;
    this.api.getTypedText = () => typedText;
    this.api.getCurrentSnippet = () => currentSnippet;

    this.api.resetCombo = () => {
      comboCount = 0;
      comboMultiplier = 1;
      stateApi.set("currentCombo", 0);
    };

    this.api.resetStats = () => {
      correctKeys = 0;
      totalKeys = 0;
      typedText = "";
      snippetIndex = 0;
      // Reset snippet to first one
      currentSnippet = codeSnippets[0];
    };

    this.api.setMode = (mode) => {
      stateApi.set("currentMode", mode);
      this.api.resetStats();
      this.api.resetCombo(); // Also reset combo on mode switch
      eventsApi?.emit("typing:mode-changed", { mode });
      // Generate a new key for the new mode
      const nextKey = this.api.generateKey(mode);
      stateApi.set("currentKey", nextKey);
    };

    // Generate initial key
    const initialMode = stateApi.get("currentMode") || "brainrot";
    currentKey = this.api.generateKey(initialMode);
    stateApi.set("currentKey", currentKey);
  },

  api: {},
};

// ============================================================================
// ENTITIES PLUGIN
// ============================================================================
const entitiesPlugin = {
  name: "entities",

  initialize(engine) {
    const entities = new Map();
    let nextId = 1;
    const eventsApi = engine.plugin("events");

    const createEntity = (components = {}, id = null) => {
      const entityId = id || `entity_${nextId++}`;
      const entity = {
        id: entityId,
        active: true,
        components: { ...components },
        tags: new Set(),
      };

      entities.set(entityId, entity);
      eventsApi?.emit("entity:created", { entity });
      return entity;
    };

    this.api.create = createEntity;

    this.api.destroy = (entityId) => {
      const entity = entities.get(entityId);
      if (!entity) return false;

      entities.delete(entityId);
      eventsApi?.emit("entity:destroyed", { entityId, entity });
      return true;
    };

    this.api.get = (entityId) => {
      return entities.get(entityId);
    };

    this.api.getAll = () => {
      return Array.from(entities.values());
    };

    this.api.query = (filter) => {
      return Array.from(entities.values()).filter((entity) => {
        if (!entity.active) return false;
        if (filter.components) {
          const hasAllComponents = filter.components.every(
            (comp) => comp in entity.components,
          );
          if (!hasAllComponents) return false;
        }
        if (filter.tags) {
          const hasAllTags = filter.tags.every((tag) => entity.tags.has(tag));
          if (!hasAllTags) return false;
        }
        return true;
      });
    };

    this.api.addComponent = (entityId, componentName, componentData) => {
      const entity = entities.get(entityId);
      if (!entity) return false;

      entity.components[componentName] = componentData;
      eventsApi?.emit("component:added", { entityId, componentName });
      return true;
    };

    this.api.removeComponent = (entityId, componentName) => {
      const entity = entities.get(entityId);
      if (!entity) return false;

      delete entity.components[componentName];
      eventsApi?.emit("component:removed", { entityId, componentName });
      return true;
    };

    this.api.getComponent = (entityId, componentName) => {
      const entity = entities.get(entityId);
      return entity?.components[componentName];
    };

    this.api.hasComponent = (entityId, componentName) => {
      const entity = entities.get(entityId);
      return entity ? componentName in entity.components : false;
    };

    this.api.addTag = (entityId, tag) => {
      const entity = entities.get(entityId);
      if (!entity) return false;
      entity.tags.add(tag);
      return true;
    };

    this.api.removeTag = (entityId, tag) => {
      const entity = entities.get(entityId);
      if (!entity) return false;
      entity.tags.delete(tag);
      return true;
    };

    this.api.hasTag = (entityId, tag) => {
      const entity = entities.get(entityId);
      return entity ? entity.tags.has(tag) : false;
    };

    this.api.clear = () => {
      entities.clear();
      nextId = 1;
      eventsApi?.emit("entities:cleared", {});
    };

    engine.addStore("entities", entities);
  },

  api: {},
};

// ============================================================================
// SYSTEMS PLUGIN
// ============================================================================
const systemsPlugin = {
  name: "systems",

  initialize(engine) {
    const systems = new Map();
    const systemOrder = [];
    const eventsApi = engine.plugin("events");

    const createSystem = (name, config) => {
      const system = {
        name,
        enabled: config.enabled !== false,
        priority: config.priority || 0,
        update: config.update || (() => {}),
        init: config.init || (() => {}),
        destroy: config.destroy || (() => {}),
        query: config.query || null,
      };

      systems.set(name, system);
      systemOrder.push(name);
      systemOrder.sort((a, b) => {
        return (
          (systems.get(b)?.priority || 0) - (systems.get(a)?.priority || 0)
        );
      });

      if (system.init) {
        try {
          system.init(engine);
        } catch (error) {
          console.error(`Error initializing system "${name}":`, error);
        }
      }

      eventsApi?.emit("system:registered", { name, system });
      return system;
    };

    this.api.register = createSystem;

    this.api.unregister = (name) => {
      const system = systems.get(name);
      if (!system) return false;

      if (system.destroy) {
        try {
          system.destroy(engine);
        } catch (error) {
          console.error(`Error destroying system "${name}":`, error);
        }
      }

      systems.delete(name);
      const index = systemOrder.indexOf(name);
      if (index > -1) systemOrder.splice(index, 1);

      eventsApi?.emit("system:unregistered", { name });
      return true;
    };

    this.api.get = (name) => {
      return systems.get(name);
    };

    this.api.getAll = () => {
      return systemOrder.map((name) => systems.get(name));
    };

    this.api.enable = (name) => {
      const system = systems.get(name);
      if (system) system.enabled = true;
    };

    this.api.disable = (name) => {
      const system = systems.get(name);
      if (system) system.enabled = false;
    };

    this.api.update = (deltaTime, totalTime) => {
      const entitiesApi = engine.plugin("entities");

      for (const systemName of systemOrder) {
        const system = systems.get(systemName);
        if (!system || !system.enabled) continue;

        try {
          let entities = null;
          if (system.query && entitiesApi) {
            entities = entitiesApi.query(system.query);
          }

          system.update(deltaTime, totalTime, entities, engine);
        } catch (error) {
          console.error(`Error in system "${systemName}":`, error);
        }
      }

      eventsApi?.emit("systems:updated", { deltaTime, totalTime });
    };

    this.api.clear = () => {
      systemOrder.forEach((name) => {
        const system = systems.get(name);
        if (system?.destroy) {
          try {
            system.destroy(engine);
          } catch (error) {
            console.error(`Error destroying system "${name}":`, error);
          }
        }
      });
      systems.clear();
      systemOrder.length = 0;
    };

    engine.addStore("systems", systems);
  },

  api: {},
};

// ============================================================================
// RESOURCES PLUGIN
// ============================================================================
const resourcesPlugin = {
  name: "resources",

  initialize(engine) {
    const resources = new Map();
    const loading = new Map();
    const eventsApi = engine.plugin("events");

    const loadResource = async (key, loader) => {
      if (resources.has(key)) {
        return resources.get(key);
      }

      if (loading.has(key)) {
        return loading.get(key);
      }

      const promise = (async () => {
        try {
          eventsApi?.emit("resource:loading", { key });
          const resource = await loader();
          resources.set(key, resource);
          loading.delete(key);
          eventsApi?.emit("resource:loaded", { key, resource });
          return resource;
        } catch (error) {
          loading.delete(key);
          eventsApi?.emit("resource:error", { key, error });
          throw error;
        }
      })();

      loading.set(key, promise);
      return promise;
    };

    this.api.load = loadResource;

    this.api.get = (key) => {
      return resources.get(key);
    };

    this.api.has = (key) => {
      return resources.has(key);
    };

    this.api.set = (key, resource) => {
      resources.set(key, resource);
      eventsApi?.emit("resource:set", { key, resource });
    };

    this.api.unload = (key) => {
      const resource = resources.get(key);
      if (!resource) return false;

      resources.delete(key);
      eventsApi?.emit("resource:unloaded", { key, resource });
      return true;
    };

    this.api.clear = () => {
      resources.clear();
      loading.clear();
      eventsApi?.emit("resources:cleared", {});
    };

    this.api.loadImage = async (key, url) => {
      return loadResource(key, () => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      });
    };

    this.api.loadJSON = async (key, url) => {
      return loadResource(key, async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return response.json();
      });
    };

    this.api.getAll = () => {
      return new Map(resources);
    };

    this.api.getLoadingStatus = () => {
      return {
        loaded: resources.size,
        loading: loading.size,
        total: resources.size + loading.size,
      };
    };

    engine.addStore("resources", resources);
  },

  api: {},
};

// ============================================================================
// RENDER PLUGIN
// ============================================================================
const renderPlugin = {
  name: "render",

  initialize(engine) {
    let canvas = null;
    let ctx = null;
    const renderLayers = new Map();
    const eventsApi = engine.plugin("events");

    this.api.setCanvas = (canvasElement) => {
      canvas = canvasElement;
      ctx = canvas?.getContext("2d");
      eventsApi?.emit("render:canvas-set", { canvas });
    };

    this.api.getCanvas = () => canvas;
    this.api.getContext = () => ctx;

    this.api.clear = (color = "#000000") => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    this.api.registerLayer = (name, renderFn, priority = 0) => {
      renderLayers.set(name, { name, renderFn, priority, enabled: true });
      eventsApi?.emit("render:layer-registered", { name, priority });
    };

    this.api.unregisterLayer = (name) => {
      const had = renderLayers.delete(name);
      if (had) eventsApi?.emit("render:layer-unregistered", { name });
      return had;
    };

    this.api.enableLayer = (name) => {
      const layer = renderLayers.get(name);
      if (layer) layer.enabled = true;
    };

    this.api.disableLayer = (name) => {
      const layer = renderLayers.get(name);
      if (layer) layer.enabled = false;
    };

    this.api.render = (deltaTime, totalTime) => {
      if (!ctx || !canvas) return;

      const layers = Array.from(renderLayers.values())
        .filter((layer) => layer.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const layer of layers) {
        try {
          ctx.save();
          layer.renderFn(ctx, canvas, deltaTime, totalTime, engine);
          ctx.restore();
        } catch (error) {
          console.error(`Error rendering layer "${layer.name}":`, error);
        }
      }

      eventsApi?.emit("render:frame", { deltaTime, totalTime });
    };

    this.api.drawSprite = (sprite, x, y, width, height) => {
      if (!ctx || !sprite) return;
      ctx.drawImage(sprite, x, y, width, height);
    };

    this.api.drawText = (text, x, y, style = {}) => {
      if (!ctx) return;
      const {
        font = "16px sans-serif",
        color = "#ffffff",
        align = "left",
        baseline = "top",
      } = style;

      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(text, x, y);
    };

    this.api.drawRect = (x, y, width, height, style = {}) => {
      if (!ctx) return;
      const { fill, stroke, lineWidth = 1 } = style;

      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, width, height);
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, width, height);
      }
    };

    this.api.drawCircle = (x, y, radius, style = {}) => {
      if (!ctx) return;
      const { fill, stroke, lineWidth = 1 } = style;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };
  },

  api: {},
};

// ============================================================================
// LOOP PLUGIN
// ============================================================================
const loopPlugin = {
  name: "loop",

  initialize(engine) {
    let animationFrameId = null;
    let lastTime = 0;
    let totalTime = 0;
    let frameCount = 0;
    let fpsTime = 0;
    let currentFPS = 0;

    const eventsApi = engine.plugin("events");
    const systemsApi = engine.plugin("systems");
    const renderApi = engine.plugin("render");

    const loop = (currentTime) => {
      animationFrameId = requestAnimationFrame(loop);

      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      totalTime += deltaTime;
      frameCount++;

      fpsTime += deltaTime;
      if (fpsTime >= 1) {
        currentFPS = frameCount;
        frameCount = 0;
        fpsTime = 0;
        eventsApi?.emit("loop:fps", { fps: currentFPS });
      }

      eventsApi?.emit("loop:before-update", { deltaTime, totalTime });

      if (systemsApi) {
        systemsApi.update(deltaTime, totalTime);
      }

      eventsApi?.emit("loop:after-update", { deltaTime, totalTime });
      eventsApi?.emit("loop:before-render", { deltaTime, totalTime });

      if (renderApi) {
        renderApi.render(deltaTime, totalTime);
      }

      eventsApi?.emit("loop:after-render", { deltaTime, totalTime });
    };

    this.api.start = () => {
      if (animationFrameId !== null) {
        console.warn("Game loop is already running.");
        return;
      }

      lastTime = performance.now();
      totalTime = 0;
      frameCount = 0;
      fpsTime = 0;

      eventsApi?.emit("loop:start", {});
      animationFrameId = requestAnimationFrame(loop);
    };

    this.api.stop = () => {
      if (animationFrameId === null) return;

      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;

      eventsApi?.emit("loop:stop", { totalTime });
    };

    this.api.isRunning = () => {
      return animationFrameId !== null;
    };

    this.api.getFPS = () => {
      return currentFPS;
    };

    this.api.getTotalTime = () => {
      return totalTime;
    };

    this.api.getFrameCount = () => {
      return frameCount;
    };
  },

  api: {},
};

// ============================================================================
// MINIGAMES PLUGIN
// ============================================================================
const minigamesPlugin = {
  name: "minigames",

  initialize(engine) {
    const minigames = new Map();
    const unlockedMinigames = new Set();
    let initialized = false;
    const eventsApi = engine.plugin("events");

    // Register a minigame
    this.api.register = (definition) => {
      if (!definition.id) {
        throw new Error("Minigame must have an id");
      }

      if (minigames.has(definition.id)) {
        console.warn(
          `Minigame ${definition.id} already registered, replacing...`,
        );
      }

      // Create minigame instance
      const minigame = {
        id: definition.id,
        definition,
        unlocked: false,
      };

      minigames.set(definition.id, minigame);

      // Setup event listeners
      if (definition.events?.listens) {
        for (const [eventName, handler] of Object.entries(
          definition.events.listens,
        )) {
          eventsApi?.on(eventName, (data) => {
            if (minigame.unlocked || definition.unlock?.default) {
              handler(data, engine);
            }
          });
        }
      }

      // If already initialized and should start unlocked, unlock it
      if (initialized && definition.unlock?.default === true) {
        this.api.unlock(definition.id);
      }

      console.log(`Minigame registered: ${definition.name || definition.id}`);
      return minigame;
    };

    // Initialize all minigames
    this.api.init = async (gameState) => {
      initialized = true;

      // Sort by dependencies
      const sorted = topologicalSort(minigames);

      // Initialize minigames in dependency order
      for (const minigameId of sorted) {
        const minigame = minigames.get(minigameId);
        const def = minigame.definition;

        // Check if should start unlocked
        if (def.unlock?.default === true) {
          await this.api.unlock(minigameId, gameState);
        }

        // Always call onInit (even if locked, for setup)
        if (def.lifecycle?.onInit) {
          await def.lifecycle.onInit(engine, gameState);
        }
      }

      console.log(
        `Minigame system initialized with ${minigames.size} minigames`,
      );
    };

    // Unlock a minigame
    this.api.unlock = async (minigameId, gameState = null) => {
      const minigame = minigames.get(minigameId);
      if (!minigame) {
        console.error(`Minigame ${minigameId} not found`);
        return false;
      }

      if (unlockedMinigames.has(minigameId)) {
        return true; // Already unlocked
      }

      // Check dependencies
      const deps = minigame.definition.unlock?.requires?.minigames || [];
      for (const depId of deps) {
        if (!unlockedMinigames.has(depId)) {
          console.warn(
            `Cannot unlock ${minigameId}: dependency ${depId} not unlocked`,
          );
          return false;
        }
      }

      unlockedMinigames.add(minigameId);
      minigame.unlocked = true;

      // Call onUnlock lifecycle hook
      if (minigame.definition.lifecycle?.onUnlock) {
        await minigame.definition.lifecycle.onUnlock(engine, gameState);
      }

      // Emit unlock event
      eventsApi?.emit("minigame:unlocked", { minigameId, minigame });

      console.log(`Minigame unlocked: ${minigame.definition.name}`);
      return true;
    };

    // Check all minigames for unlock conditions
    this.api.checkUnlocks = async (gameState) => {
      for (const [minigameId, minigame] of minigames) {
        if (!unlockedMinigames.has(minigameId)) {
          const def = minigame.definition;
          const unlock = def.unlock;

          if (!unlock) continue;

          let shouldUnlock = false;

          // Check custom unlock function
          if (typeof unlock.condition === "function") {
            shouldUnlock = unlock.condition(gameState, engine);
          } else if (unlock.requires) {
            // Check simple requires
            const { level, minigames: depMinigames } = unlock.requires;

            // Check level requirement
            if (level !== undefined && gameState.level < level) {
              continue;
            }

            // Check minigame dependencies
            if (depMinigames) {
              const allDepsMet = depMinigames.every((depId) =>
                unlockedMinigames.has(depId),
              );
              if (!allDepsMet) continue;
            }

            shouldUnlock = true;
          }

          if (shouldUnlock) {
            await this.api.unlock(minigameId, gameState);
          }
        }
      }
    };

    // Update all unlocked minigames
    this.api.update = async (deltaTime, gameState) => {
      for (const minigameId of unlockedMinigames) {
        const minigame = minigames.get(minigameId);
        if (minigame.definition.lifecycle?.onUpdate) {
          await minigame.definition.lifecycle.onUpdate(
            deltaTime,
            gameState,
            engine,
          );
        }
      }
    };

    // Get all minigames
    this.api.getAll = () => {
      return Array.from(minigames.values());
    };

    // Get all unlocked minigames
    this.api.getUnlocked = () => {
      return Array.from(unlockedMinigames)
        .map((id) => minigames.get(id))
        .filter(Boolean);
    };

    // Get minigame by id
    this.api.get = (id) => {
      return minigames.get(id);
    };

    // Check if minigame is unlocked
    this.api.isUnlocked = (id) => {
      return unlockedMinigames.has(id);
    };

    // Get unlocked tabs sorted by tabIndex
    this.api.getTabs = () => {
      return this.api
        .getUnlocked()
        .filter((mg) => mg.definition.ui?.tabs)
        .flatMap((mg) =>
          mg.definition.ui.tabs.map((tab) => ({
            ...tab,
            minigameId: mg.id,
          })),
        )
        .sort((a, b) => (a.tabIndex || 999) - (b.tabIndex || 999));
    };

    // Call gameplay hook on a minigame
    this.api.callGameplayHook = async (minigameId, hookName, ...args) => {
      const minigame = minigames.get(minigameId);
      if (!minigame || !minigame.unlocked) return;

      const hook = minigame.definition.gameplay?.[hookName];
      if (hook) {
        return await hook(...args, engine);
      }
    };

    // Call gameplay hook on all unlocked minigames
    this.api.callGameplayHookAll = async (hookName, ...args) => {
      for (const minigameId of unlockedMinigames) {
        await this.api.callGameplayHook(minigameId, hookName, ...args);
      }
    };

    // Topological sort for dependency resolution
    const topologicalSort = (minigamesMap) => {
      const sorted = [];
      const visited = new Set();
      const temp = new Set();

      const visit = (id) => {
        if (temp.has(id)) {
          throw new Error(
            `Circular dependency detected involving minigame: ${id}`,
          );
        }
        if (visited.has(id)) return;

        temp.add(id);

        const minigame = minigamesMap.get(id);
        const deps = minigame.definition.unlock?.requires?.minigames || [];

        for (const depId of deps) {
          if (minigamesMap.has(depId)) {
            visit(depId);
          }
        }

        temp.delete(id);
        visited.add(id);
        sorted.push(id);
      };

      for (const id of minigamesMap.keys()) {
        visit(id);
      }

      return sorted;
    };

    engine.addStore("minigames", minigames);
  },

  api: {},
};

// ============================================================================
// SCENES PLUGIN
// ============================================================================
const scenesPlugin = {
  name: "scenes",

  initialize(engine) {
    const scenes = new Map();
    let currentScene = null;
    const eventsApi = engine.plugin("events");

    const createScene = (name, config) => {
      const scene = {
        name,
        active: false,
        init: config.init || (() => {}),
        enter: config.enter || (() => {}),
        exit: config.exit || (() => {}),
        update: config.update || (() => {}),
        render: config.render || (() => {}),
        data: config.data || {},
      };

      scenes.set(name, scene);
      eventsApi?.emit("scene:registered", { name, scene });
      return scene;
    };

    this.api.register = createScene;

    this.api.unregister = (name) => {
      if (currentScene?.name === name) {
        console.warn(
          `Cannot unregister active scene "${name}". Switch scenes first.`,
        );
        return false;
      }

      const had = scenes.delete(name);
      if (had) eventsApi?.emit("scene:unregistered", { name });
      return had;
    };

    this.api.switch = async (name, data = {}) => {
      const nextScene = scenes.get(name);
      if (!nextScene) {
        console.error(`Scene "${name}" not found.`);
        return false;
      }

      if (currentScene) {
        currentScene.active = false;
        eventsApi?.emit("scene:exit", { name: currentScene.name });
        try {
          await currentScene.exit(engine);
        } catch (error) {
          console.error(`Error exiting scene "${currentScene.name}":`, error);
        }
      }

      currentScene = nextScene;
      currentScene.active = true;
      currentScene.data = { ...currentScene.data, ...data };

      eventsApi?.emit("scene:enter", { name, data });
      try {
        await nextScene.enter(engine, data);
      } catch (error) {
        console.error(`Error entering scene "${name}":`, error);
      }

      return true;
    };

    this.api.getCurrent = () => {
      return currentScene;
    };

    this.api.get = (name) => {
      return scenes.get(name);
    };

    this.api.getAll = () => {
      return Array.from(scenes.values());
    };

    this.api.updateCurrent = (deltaTime, totalTime) => {
      if (!currentScene || !currentScene.active) return;

      try {
        currentScene.update(deltaTime, totalTime, engine);
      } catch (error) {
        console.error(`Error updating scene "${currentScene.name}":`, error);
      }
    };

    this.api.renderCurrent = (ctx, canvas, deltaTime, totalTime) => {
      if (!currentScene || !currentScene.active) return;

      try {
        currentScene.render(ctx, canvas, deltaTime, totalTime, engine);
      } catch (error) {
        console.error(`Error rendering scene "${currentScene.name}":`, error);
      }
    };
  },

  api: {},
};

// ============================================================================
// GAME ENGINE FACTORY
// ============================================================================
const createGameEngine = (initialPlugins = []) => {
  const engine = {
    plugins: new Map(),
    config: {},
    isInitialized: false,
    isRunning: false,

    use(plugin) {
      if (this.plugins.has(plugin.name)) {
        console.warn(`Plugin "${plugin.name}" is already registered.`);
        return this;
      }
      this.plugins.set(plugin.name, plugin);
      if (typeof plugin.initialize === "function") plugin.initialize(this);
      return this;
    },

    addStore(name, store = {}) {
      if (!this[name]) this[name] = store;
    },

    init(initialConfig) {
      if (this.isInitialized) {
        console.log("Game Engine already initialized.");
        return this;
      }

      this.config = {
        targetFPS: 60,
        enableDebug: false,
        autoStart: false,
        ...initialConfig,
      };

      this.isInitialized = true;
      console.log("Game Engine Initialized.");
      return this;
    },

    plugin(pluginName) {
      const plugin = this.plugins.get(pluginName);
      return plugin ? plugin.api : null;
    },

    start() {
      if (!this.isInitialized) {
        console.error("Game Engine not initialized. Call .init() first.");
        return this;
      }
      if (this.isRunning) {
        console.warn("Game Engine is already running.");
        return this;
      }

      const loopApi = this.plugin("loop");
      if (loopApi) {
        loopApi.start();
        this.isRunning = true;
        console.log("Game Engine started.");
      }
      return this;
    },

    stop() {
      if (!this.isRunning) return this;

      const loopApi = this.plugin("loop");
      if (loopApi) {
        loopApi.stop();
        this.isRunning = false;
        console.log("Game Engine stopped.");
      }
      return this;
    },

    reset() {
      this.stop();
      const stateApi = this.plugin("state");
      if (stateApi) stateApi.reset();
      console.log("Game Engine reset.");
      return this;
    },
  };

  initialPlugins.forEach((plugin) => engine.use(plugin));
  return engine;
};

// ============================================================================
// GAME ENGINE INSTANCE
// ============================================================================
const defaultPlugins = [
  eventsPlugin,
  statePlugin,
  typingPlugin,
  entitiesPlugin,
  systemsPlugin,
  resourcesPlugin,
  renderPlugin,
  loopPlugin,
  scenesPlugin,
  minigamesPlugin, // NEW!
];

const GameEngine = createGameEngine(defaultPlugins);

for (const plugin of defaultPlugins)
  if (plugin.api) Object.assign(GameEngine, plugin.api);

$APP.addModule({ name: "GameEngine", base: GameEngine });

export default GameEngine;
