
const ADAPTER_REGISTRY = new Map();

export function registerAdapter(type, AdapterClass) {
  if (ADAPTER_REGISTRY.has(type)) {
    console.warn(`Database: Overwriting existing adapter type "${type}"`);
  }
  ADAPTER_REGISTRY.set(type, AdapterClass);
  console.info(`Database: Registered adapter type "${type}"`);
}

export async function createDatabase(config) {
  if (typeof config === "string") {
    config = { type: config };
  }

  const { type = "indexeddb", name, version = 1, models = {} } = config;

  if (!name) {
    throw new Error("Database name is required");
  }

  if (!models || Object.keys(models).length === 0) {
    console.warn(`Database: No models provided for database "${name}"`);
  }

  // Check registry first
  if (!ADAPTER_REGISTRY.has(type)) {
    throw new Error(
      `Unknown adapter type "${type}". Available types: ${getAvailableAdapters().join(", ")}. Use registerAdapter() to register adapters.`,
    );
  }

  const AdapterClass = ADAPTER_REGISTRY.get(type);
  const adapter = new AdapterClass(config);

  console.info(`Database: Created ${type} adapter for "${name}" v${version}`);

  return adapter;
}

export function getAvailableAdapters() {
  return Array.from(ADAPTER_REGISTRY.keys());
}

export function hasAdapter(type) {
  return ADAPTER_REGISTRY.has(type);
}

export default {
  createDatabase,
  registerAdapter,
  getAvailableAdapters,
  hasAdapter,
};
