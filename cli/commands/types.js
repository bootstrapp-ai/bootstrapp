/**
 * @file CLI command for generating TypeScript types from schema.js
 * @description Generates .d.ts files from T.* schema definitions
 */

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Generate TypeScript declarations from schema.js
 * @param {Object} adapter - CLI adapter
 * @param {Object} options - Command options
 */
export async function generateTypes(adapter, options = {}) {
  const {
    input = "./models/schema.js",
    output = "./types/global.d.ts",
    verbose = false,
  } = options;

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log("\x1b[1m\x1b[35m              GENERATE TYPES FROM SCHEMA\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  console.log(`\x1b[90mInput:  ${inputPath}\x1b[0m`);
  console.log(`\x1b[90mOutput: ${outputPath}\x1b[0m\n`);

  // Check input file exists
  if (!fs.existsSync(inputPath)) {
    console.log("\x1b[31mSchema file not found.\x1b[0m");
    console.log(`\x1b[90mExpected: ${input}\x1b[0m\n`);
    return false;
  }

  // Load codegen from types package
  const { generateTypesFromSchema, generateAppDts } = await import(
    "../../types/codegen.js"
  );

  // Register /$app/ loader for virtual path resolution
  const { register } = await import("node:module");
  register("../loader-hooks.js", import.meta.url);

  // Import schema.js
  const fileUrl = pathToFileURL(inputPath).href;
  const importUrl = `${fileUrl}?t=${Date.now()}`;

  let schemaModule;
  try {
    schemaModule = await import(importUrl);
  } catch (error) {
    console.log(`\x1b[31mFailed to import schema:\x1b[0m ${error.message}`);
    if (verbose) {
      console.error(error.stack);
    }
    return false;
  }

  const models = schemaModule.default;
  if (!models) {
    console.log("\x1b[33mNo default export found in schema.js\x1b[0m");
    console.log(
      "\x1b[90mHint: Use 'export default { users: {...}, places: {...} }'\x1b[0m"
    );
    return false;
  }

  // Generate TypeScript using types/codegen
  const { content: globalDtsContent, modelCount } = generateTypesFromSchema(
    models,
    {
      schemaName: path.basename(input),
    }
  );

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write global.d.ts
  fs.writeFileSync(outputPath, globalDtsContent);

  // Write $app.d.ts
  const appDtsPath = path.join(outputDir, "$app.d.ts");
  fs.writeFileSync(appDtsPath, generateAppDts());

  if (verbose) {
    console.log(`  \x1b[32m✓\x1b[0m Generated ${modelCount} model interfaces`);
  }

  console.log(
    `\x1b[32mGenerated ${modelCount} model(s) + AppModel → ${path.relative(process.cwd(), outputPath)}\x1b[0m`
  );
  console.log(
    `\x1b[32mGenerated $app.d.ts → ${path.relative(process.cwd(), appDtsPath)}\x1b[0m`
  );
  return true;
}

/**
 * Parse CLI arguments for types command
 */
export function parseTypesArgs(args) {
  const options = {
    input: "./models/schema.js",
    output: "./types/global.d.ts",
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--input":
      case "-i":
        options.input = args[++i];
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Generate types for all framework packages from types.js schema files
 * @param {Object} adapter - CLI adapter
 * @param {Object} options - Command options
 */
export async function generateAllPackageTypes(adapter, options = {}) {
  const { package: packageFilter, verbose = false } = options;

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log("\x1b[1m\x1b[35m           GENERATE PACKAGE TYPES FROM SCHEMA\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  // Load codegen from types package
  const { generatePackageTypes } = await import("../../types/codegen.js");

  // Register /$app/ loader for virtual path resolution
  const { register } = await import("node:module");
  register("../loader-hooks.js", import.meta.url);

  // Find public directory (relative to CLI)
  const publicDir = path.resolve(import.meta.dirname, "../..");

  // Find all types.js files in packages
  const typeFiles = [];
  const packages = fs.readdirSync(publicDir);

  for (const pkg of packages) {
    if (packageFilter && pkg !== packageFilter) continue;

    const pkgDir = path.join(publicDir, pkg);
    if (!fs.statSync(pkgDir).isDirectory()) continue;

    // Look for types.js in package root
    const typesPath = path.join(pkgDir, "types.js");
    if (fs.existsSync(typesPath)) {
      typeFiles.push({
        package: pkg,
        path: typesPath,
      });
    }
  }

  console.log(`\x1b[90mFound ${typeFiles.length} types.js file(s)\x1b[0m\n`);

  let generatedCount = 0;
  let skippedCount = 0;

  for (const { package: pkg, path: typesPath } of typeFiles) {
    const relativePath = path.relative(process.cwd(), typesPath);

    try {
      // Import types.js to get schema (default export)
      const fileUrl = pathToFileURL(typesPath).href;
      const importUrl = `${fileUrl}?t=${Date.now()}`;
      const typesModule = await import(importUrl);

      // Check for default export (the schema)
      const schema = typesModule.default;
      if (!schema) {
        if (verbose) {
          console.log(`\x1b[90m  ⊘ ${relativePath} (no default export)\x1b[0m`);
        }
        skippedCount++;
        continue;
      }

      // Validate schema
      if (!schema.name || !schema.exports) {
        console.log(
          `\x1b[33m  ⚠ ${relativePath}: schema missing 'name' or 'exports'\x1b[0m`
        );
        skippedCount++;
        continue;
      }

      // Generate types
      const { content, exportCount } = generatePackageTypes(schema);

      // Write to package's index.d.ts
      const pkgDir = path.dirname(typesPath);
      const outputPath = path.join(pkgDir, "index.d.ts");

      fs.writeFileSync(outputPath, content);

      console.log(
        `\x1b[32m  ✓ ${schema.name}\x1b[0m → ${path.relative(process.cwd(), outputPath)} (${exportCount} exports)`
      );
      generatedCount++;
    } catch (error) {
      console.log(`\x1b[31m  ✗ ${relativePath}: ${error.message}\x1b[0m`);
      if (verbose) {
        console.error(error.stack);
      }
      skippedCount++;
    }
  }

  console.log("");
  console.log(
    `\x1b[32mGenerated: ${generatedCount}\x1b[0m  \x1b[90mSkipped: ${skippedCount}\x1b[0m`
  );

  return generatedCount > 0;
}

/**
 * Parse CLI arguments for types:generate command
 */
export function parseTypesGenerateArgs(args) {
  const options = {
    package: null,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--package":
      case "-p":
        options.package = args[++i];
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Scan a directory for component files and extract metadata
 * @param {string} dir - Directory to scan
 * @param {string} tagPrefix - Tag prefix to derive tag names (e.g., "uix", "view")
 * @param {Object} options - Scan options
 * @returns {Promise<Array<{tag: string, properties: Object, extendsTag?: string}>>}
 */
async function scanComponentDirectory(dir, tagPrefix, options = {}) {
  const { verbose = false, extractMetadata } = options;
  const components = [];

  if (!fs.existsSync(dir)) {
    if (verbose) {
      console.log(`\x1b[90m  Directory not found: ${dir}\x1b[0m`);
    }
    return components;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    // Skip utility files
    if (file === "utils.js" || file === "index.js" || file === "types.js") {
      continue;
    }

    const filePath = path.join(dir, file);

    try {
      // Import the component file
      const fileUrl = pathToFileURL(filePath).href;
      const importUrl = `${fileUrl}?t=${Date.now()}`;
      const componentModule = await import(importUrl);

      const componentDef = componentModule.default;
      if (!componentDef || typeof componentDef !== "object") {
        continue;
      }

      // Derive tag name if not specified
      const baseName = file.replace(".js", "");
      const fallbackTag = `${tagPrefix}-${baseName}`;

      const metadata = extractMetadata(componentDef, fallbackTag);
      if (metadata) {
        components.push(metadata);
        if (verbose) {
          console.log(`\x1b[90m    ✓ ${metadata.tag}\x1b[0m`);
        }
      }
    } catch (error) {
      if (verbose) {
        console.log(`\x1b[33m    ⚠ ${file}: ${error.message}\x1b[0m`);
      }
    }
  }

  return components;
}

/**
 * Load components from explicit path mappings (new object format)
 * @param {string} baseDir - Base directory for resolving paths
 * @param {string} prefix - Tag prefix (e.g., "uix")
 * @param {Object} pathMappings - Object mapping component names to paths
 * @param {Object} options - Options including extractMetadata function
 * @returns {Promise<Array>} Array of component metadata
 */
async function loadComponentsFromPaths(baseDir, prefix, pathMappings, options = {}) {
  const { verbose = false, extractMetadata } = options;
  const components = [];

  for (const [componentName, relativePath] of Object.entries(pathMappings)) {
    const filePath = path.join(baseDir, relativePath + ".js");

    if (!fs.existsSync(filePath)) {
      if (verbose) {
        console.log(`\x1b[33m    ⚠ ${prefix}-${componentName}: file not found at ${relativePath}.js\x1b[0m`);
      }
      continue;
    }

    try {
      const fileUrl = pathToFileURL(filePath).href;
      const importUrl = `${fileUrl}?t=${Date.now()}`;
      const componentModule = await import(importUrl);

      const componentDef = componentModule.default;
      if (!componentDef || typeof componentDef !== "object") {
        continue;
      }

      // Use prefix-componentName as fallback tag
      const fallbackTag = `${prefix}-${componentName}`;
      const metadata = extractMetadata(componentDef, fallbackTag);

      if (metadata) {
        components.push(metadata);
        if (verbose) {
          console.log(`\x1b[90m    ✓ ${metadata.tag}\x1b[0m`);
        }
      }
    } catch (error) {
      if (verbose) {
        console.log(`\x1b[33m    ⚠ ${prefix}-${componentName}: ${error.message}\x1b[0m`);
      }
    }
  }

  return components;
}

/**
 * Read bootstrapp.components from a package.json file
 * @param {string} packageJsonPath - Path to package.json
 * @returns {Object|null} Components mapping or null
 */
function readComponentMappings(packageJsonPath) {
  try {
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    return pkg.bootstrapp?.components || null;
  } catch {
    return null;
  }
}

/**
 * Discover all packages with bootstrapp.components in node_modules
 * @param {string} nodeModulesDir - Path to node_modules
 * @returns {Array<{packageDir: string, components: Object}>}
 */
function discoverPackageComponents(nodeModulesDir) {
  const results = [];

  if (!fs.existsSync(nodeModulesDir)) {
    return results;
  }

  // Check @bootstrapp/* packages
  const scopeDir = path.join(nodeModulesDir, "@bootstrapp");
  if (fs.existsSync(scopeDir)) {
    const packages = fs.readdirSync(scopeDir);
    for (const pkg of packages) {
      const pkgDir = path.join(scopeDir, pkg);
      const pkgJsonPath = path.join(pkgDir, "package.json");
      const components = readComponentMappings(pkgJsonPath);
      if (components) {
        results.push({ packageDir: pkgDir, components });
      }
    }
  }

  return results;
}

/**
 * Generate html.d.ts for component autocomplete
 * Uses bootstrapp.components from package.json for discovery
 * @param {Object} adapter - CLI adapter
 * @param {Object} options - Command options
 */
export async function generateComponentTypes(adapter, options = {}) {
  const { output = "./types/html.d.ts", verbose = false } = options;

  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m"
  );
  console.log("\x1b[1m\x1b[35m            GENERATE COMPONENT TYPES (html.d.ts)\x1b[0m");
  console.log(
    "\x1b[1m\x1b[35m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n"
  );

  // Load codegen functions
  const { generateHtmlTypes, extractComponentMetadata } = await import(
    "../../types/codegen.js"
  );

  // Register /$app/ loader for virtual path resolution
  const { register } = await import("node:module");
  register("../loader-hooks.js", import.meta.url);

  const allComponents = [];
  const projectDir = process.cwd();

  // 1. Read project's package.json for component mappings
  const projectPkgPath = path.join(projectDir, "package.json");
  const projectComponents = readComponentMappings(projectPkgPath);

  if (projectComponents) {
    console.log("\x1b[36mScanning project components...\x1b[0m");
    for (const [prefix, config] of Object.entries(projectComponents)) {
      // New object format: { "button": "display/button", ... }
      if (typeof config === "object" && !Array.isArray(config)) {
        if (verbose) {
          console.log(`\x1b[90m  ${prefix}-* (${Object.keys(config).length} components)\x1b[0m`);
        }
        const scanned = await loadComponentsFromPaths(projectDir, prefix, config, {
          verbose,
          extractMetadata: extractComponentMetadata,
        });
        allComponents.push(...scanned);
      } else {
        // Legacy array format: ["views/", "components/", ...]
        const folderList = Array.isArray(config) ? config : [config];
        for (const folder of folderList) {
          const dir = path.join(projectDir, folder);
          if (verbose) {
            console.log(`\x1b[90m  ${folder} → ${prefix}-*\x1b[0m`);
          }
          const components = await scanComponentDirectory(dir, prefix, {
            verbose,
            extractMetadata: extractComponentMetadata,
          });
          allComponents.push(...components);
        }
      }
    }
  }

  // 2. Scan node_modules for packages with bootstrapp.components
  const nodeModulesDir = path.join(projectDir, "node_modules");
  const packageMappings = discoverPackageComponents(nodeModulesDir);

  for (const { packageDir, components } of packageMappings) {
    const pkgName = path.basename(path.dirname(packageDir)) === "@bootstrapp"
      ? `@bootstrapp/${path.basename(packageDir)}`
      : path.basename(packageDir);

    console.log(`\x1b[36mScanning ${pkgName}...\x1b[0m`);

    for (const [prefix, config] of Object.entries(components)) {
      // New object format: { "button": "display/button", ... }
      if (typeof config === "object" && !Array.isArray(config)) {
        if (verbose) {
          console.log(`\x1b[90m  ${prefix}-* (${Object.keys(config).length} components)\x1b[0m`);
        }
        const scanned = await loadComponentsFromPaths(packageDir, prefix, config, {
          verbose,
          extractMetadata: extractComponentMetadata,
        });
        allComponents.push(...scanned);
      } else {
        // Legacy array format: ["display/", "form/", ...]
        const folderList = Array.isArray(config) ? config : [config];
        for (const folder of folderList) {
          const dir = path.join(packageDir, folder);
          if (verbose) {
            console.log(`\x1b[90m  ${folder} → ${prefix}-*\x1b[0m`);
          }
          const scanned = await scanComponentDirectory(dir, prefix, {
            verbose,
            extractMetadata: extractComponentMetadata,
          });
          allComponents.push(...scanned);
        }
      }
    }
  }

  if (allComponents.length === 0) {
    console.log("\x1b[33mNo components found.\x1b[0m");
    console.log("\x1b[90mHint: Add bootstrapp.components to your package.json\x1b[0m");
    return false;
  }

  // Generate html.d.ts content
  const { content, componentCount } = generateHtmlTypes(allComponents);

  // Write output
  const outputPath = path.resolve(process.cwd(), output);
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content);

  console.log("");
  console.log(
    `\x1b[32mGenerated ${componentCount} component types → ${path.relative(process.cwd(), outputPath)}\x1b[0m`
  );

  return true;
}

export default generateTypes;
