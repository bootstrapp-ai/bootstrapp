export const loadServerModules = async (adapter, projectDir) => {
    const serverModules = [];
    const packageJsonPath = adapter.join(projectDir, "package.json");
    const packageExists = await adapter.exists(packageJsonPath);
    
    if (packageExists) {
        try {
            const packageJsonContent = await adapter.readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);
            
            if (
                packageJson.serverModules &&
                typeof packageJson.serverModules === "object"
            ) {
                adapter.log("🔌 Loading server plugins...");
                const plugins = Object.entries(packageJson.serverModules);
                
                for (const [name, pluginPath] of plugins) {
                    const fullPath = adapter.join(projectDir, pluginPath);
                    const pluginExists = await adapter.exists(fullPath);
                    
                    if (pluginExists) {
                        try {
                            // Dynamic import with cache-busting
                            const moduleUrl = `${fullPath}?t=${Date.now()}`;
                            const pluginModule = await import(moduleUrl);
                            
                            if (
                                pluginModule.default &&
                                typeof pluginModule.default.fetch === "function"
                            ) {
                                serverModules.push(pluginModule.default);
                                adapter.log(`   - Loaded plugin: ${name}`);
                            }
                        } catch (e) {
                            adapter.error(
                                `Error loading plugin '${name}' from ${fullPath}:`,
                                e,
                            );
                        }
                    }
                }
            }
        } catch (e) {
            adapter.error(
                "Error reading or parsing package.json for server plugins:",
                e,
            );
        }
    }
    
    return serverModules;
};
