/**
 * Runtime component discovery from package.json files
 * Loads bootstrapp.components mappings for lazy component resolution
 */

/**
 * Load component path mappings from package.json files
 * @returns {Promise<Object>} Mappings: { prefix: { paths: { componentName: "folder/file" }, base: "..." } }
 */
export async function loadComponentMappings() {
  const mappings = {}; // prefix → { paths, base }

  // 1. Fetch project's package.json
  const projectPkg = await fetch("/package.json").then((r) => r.json());
  const projectComponents = projectPkg.bootstrapp?.components;

  if (projectComponents) {
    for (const [prefix, config] of Object.entries(projectComponents)) {
      if (typeof config === "object" && !Array.isArray(config)) {
        // New format: { "button": "display/button", ... }
        mappings[prefix] = {
          base: "/",
          paths: config,
        };
      } else {
        // Legacy format: ["display/", "form/", ...] - convert to empty paths (loader will handle)
        const folderList = Array.isArray(config) ? config : [config];
        mappings[prefix] = {
          base: "/",
          folders: folderList.map((f) => (f.endsWith("/") ? f : f + "/")),
        };
      }
    }
  }

  // 2. Scan @bootstrapp/* dependencies for components
  const deps = Object.keys(projectPkg.dependencies || {}).filter((d) =>
    d.startsWith("@bootstrapp/")
  );

  for (const dep of deps) {
    const pkgPath = `/node_modules/${dep}/package.json`;
    try {
      const pkg = await fetch(pkgPath).then((r) => r.json());
      const comps = pkg?.bootstrapp?.components;

      if (comps) {
        for (const [prefix, config] of Object.entries(comps)) {
          if (mappings[prefix]) continue; // Project overrides package

          if (typeof config === "object" && !Array.isArray(config)) {
            // New format: { "button": "display/button", ... }
            mappings[prefix] = {
              base: `/node_modules/${dep}/`,
              paths: config,
            };
          } else {
            // Legacy format: ["display/", "form/", ...]
            const folderList = Array.isArray(config) ? config : [config];
            mappings[prefix] = {
              base: `/node_modules/${dep}/`,
              folders: folderList.map((f) => (f.endsWith("/") ? f : f + "/")),
            };
          }
        }
      }
    } catch {
      // Package doesn't exist or doesn't have bootstrapp.components
    }
  }

  return mappings;
}
