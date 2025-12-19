
import { registerAdapter } from "/$app/model/factory.js";

const ADAPTER_PATHS = {
  indexeddb: "/$app/model-indexeddb/adapter.js",
  pocketbase: "/$app/model-pocketbase/adapter.js",
  hybrid: "/$app/model-hybrid/adapter.js",
};

function createConfiguredAdapter(BaseAdapter, dependencies) {
  return class ConfiguredAdapter extends BaseAdapter {
    constructor(cfg) {
      super({
        ...cfg,
        ...dependencies,
      });
    }
  };
}

export async function loadAdapter(type, dependencies) {
  const path = ADAPTER_PATHS[type];
  if (!path) {
    throw new Error(
      `Unknown adapter type: "${type}". Available types: ${Object.keys(ADAPTER_PATHS).join(", ")}`,
    );
  }

  // Handle hybrid adapter specially - it needs both IndexedDB and PocketBase classes
  if (type === "hybrid") {
    await loadHybridAdapter(dependencies);
    return;
  }

  try {
    const module = await import(path);
    const AdapterClass =
      module.default || module.IndexedDBAdapter || module.PocketBaseAdapter;

    if (!AdapterClass) {
      throw new Error(`Failed to load adapter class for type: "${type}"`);
    }

    // For PocketBase adapter, dynamically import PocketBase and inject it
    let adapterDeps = dependencies;
    if (type === "pocketbase") {
      const PocketBase = (await import("/npm/pocketbase")).default;
      adapterDeps = { ...dependencies, PocketBase };
    }

    const ConfiguredAdapter = createConfiguredAdapter(AdapterClass, adapterDeps);
    registerAdapter(type, ConfiguredAdapter);

    console.info(`AdapterLoader: Loaded and registered "${type}" adapter`);
  } catch (error) {
    console.error(`AdapterLoader: Failed to load "${type}" adapter:`, error);
    throw error;
  }
}

async function loadHybridAdapter(dependencies) {
  try {
    // Load all adapter modules and PocketBase in parallel
    const [indexeddbModule, pocketbaseModule, hybridModule, pocketbaseLib] = await Promise.all([
      import(ADAPTER_PATHS.indexeddb),
      import(ADAPTER_PATHS.pocketbase),
      import(ADAPTER_PATHS.hybrid),
      import("/npm/pocketbase"),
    ]);

    const IndexedDBAdapter =
      indexeddbModule.default || indexeddbModule.IndexedDBAdapter;
    const PocketBaseAdapter =
      pocketbaseModule.default || pocketbaseModule.PocketBaseAdapter;
    const HybridAdapter = hybridModule.default || hybridModule.HybridAdapter;
    const PocketBase = pocketbaseLib.default;

    if (!IndexedDBAdapter || !PocketBaseAdapter || !HybridAdapter) {
      throw new Error("Failed to load required adapter classes for hybrid mode");
    }

    // Create configured versions of the sub-adapters
    const ConfiguredIndexedDB = createConfiguredAdapter(
      IndexedDBAdapter,
      dependencies,
    );
    const ConfiguredPocketBase = createConfiguredAdapter(
      PocketBaseAdapter,
      { ...dependencies, PocketBase },
    );

    // Create hybrid adapter that uses configured sub-adapters
    const ConfiguredHybrid = class extends HybridAdapter {
      constructor(cfg) {
        super({
          ...cfg,
          ...dependencies,
          IndexedDBAdapter: ConfiguredIndexedDB,
          PocketBaseAdapter: ConfiguredPocketBase,
        });
      }
    };

    registerAdapter("hybrid", ConfiguredHybrid);

    console.info(
      `AdapterLoader: Loaded and registered "hybrid" adapter (with indexeddb + pocketbase)`,
    );
  } catch (error) {
    console.error(`AdapterLoader: Failed to load hybrid adapter:`, error);
    throw error;
  }
}

export default { loadAdapter };
