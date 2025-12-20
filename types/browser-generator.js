/**
 * Browser-based component type generator
 * Runs in the browser where all imports (including /npm/*) work via Service Worker
 * Generates html.d.ts and posts to dev server
 */

/**
 * Converts a kebab-case tag name to PascalCase interface name
 */
function tagToPascalCase(tag) {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Extracts TypeScript type from a T.* type definition
 */
function extractType(typeDef) {
  if (!typeDef || typeof typeDef !== "object") {
    return "any";
  }

  const { type, relationship, targetModel, many } = typeDef;

  // Handle relationship types
  if (relationship) {
    if (targetModel === "*") return many ? "any[]" : "any";
    if (Array.isArray(targetModel)) {
      const types = targetModel.map((m) => toPascalCase(m)).join(" | ");
      return many ? `(${types})[]` : types;
    }
    switch (relationship) {
      case "belongs":
        return "string";
      case "belongs_many":
        return "string[]";
      case "one":
        return toPascalCase(targetModel);
      case "many":
        return `${toPascalCase(targetModel)}[]`;
      default:
        return "any";
    }
  }

  // Handle enum values
  if (typeDef.enum && Array.isArray(typeDef.enum)) {
    const literals = typeDef.enum.map((v) => JSON.stringify(v)).join(" | ");
    return `${literals} | (string & {})`;
  }

  // Handle basic types
  switch (type) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
    case "datetime":
      return "string";
    case "array":
      return "any[]";
    case "object":
      return "Record<string, any>";
    case "function":
      return "(...args: any[]) => any";
    default:
      return "any";
  }
}

function toPascalCase(name) {
  const singular = name.endsWith("s") ? name.slice(0, -1) : name;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

/**
 * Extracts component metadata from a component definition
 */
function extractComponentMetadata(componentDef, fallbackTag) {
  if (!componentDef || typeof componentDef !== "object") {
    return null;
  }

  const tag = componentDef.tag || fallbackTag;
  if (!tag) {
    return null;
  }

  return {
    tag,
    properties: componentDef.properties || {},
    extendsTag: componentDef.extends || undefined,
  };
}

/**
 * Generates TypeScript interface for a component
 */
function generateComponentInterface(tag, properties, options = {}) {
  const interfaceName = tagToPascalCase(tag);
  const { extendsTag } = options;

  let extendsClause = "HTMLElement";
  if (extendsTag) {
    extendsClause = tagToPascalCase(extendsTag);
  }

  const lines = [`  interface ${interfaceName} extends ${extendsClause} {`];

  if (properties && typeof properties === "object") {
    for (const [propName, propDef] of Object.entries(properties)) {
      if (propName.startsWith("$")) continue;
      if (typeof propDef !== "object" || propDef === null) continue;

      const tsType = extractType(propDef);
      lines.push(`    ${propName}?: ${tsType};`);
    }
  }

  lines.push("  }");
  return lines.join("\n");
}

/**
 * Generates complete html.d.ts content
 */
function generateHtmlTypes(components) {
  const lines = [
    "/**",
    " * Generated component types for lit-html autocomplete",
    " * Provides tag name and attribute autocomplete in html`` templates",
    " * @generated - browser-based generation",
    " */",
    "",
    "declare global {",
    "  // Component interfaces",
  ];

  for (const comp of components) {
    const { tag, properties, extendsTag } = comp;
    const interfaceCode = generateComponentInterface(tag, properties, {
      extendsTag,
    });
    lines.push(interfaceCode);
    lines.push("");
  }

  lines.push("  // Tag name to element mapping");
  lines.push("  interface HTMLElementTagNameMap {");

  for (const comp of components) {
    const { tag } = comp;
    const interfaceName = tagToPascalCase(tag);
    lines.push(`    "${tag}": ${interfaceName};`);
  }

  lines.push("  }");
  lines.push("}");
  lines.push("");
  lines.push("export {};");
  lines.push("");

  return {
    content: lines.join("\n"),
    componentCount: components.length,
  };
}

/**
 * Fetches component mappings from package.json files
 */
async function getComponentMappings() {
  const mappings = [];

  // Fetch project package.json
  try {
    const response = await fetch("/package.json");
    if (response.ok) {
      const pkg = await response.json();
      if (pkg.bootstrapp?.components) {
        mappings.push({
          base: "/",
          components: pkg.bootstrapp.components,
          source: "project",
        });
      }
    }
  } catch (e) {
    console.warn("Failed to load project package.json:", e);
  }

  // Fetch @bootstrapp/uix package.json
  try {
    const response = await fetch("/node_modules/@bootstrapp/uix/package.json");
    if (response.ok) {
      const pkg = await response.json();
      if (pkg.bootstrapp?.components) {
        mappings.push({
          base: "/node_modules/@bootstrapp/uix/",
          components: pkg.bootstrapp.components,
          source: "@bootstrapp/uix",
        });
      }
    }
  } catch (e) {
    console.warn("Failed to load @bootstrapp/uix package.json:", e);
  }

  return mappings;
}

/**
 * Loads a single component and extracts its metadata
 */
async function loadComponent(path, prefix, componentName) {
  try {
    const module = await import(path);
    const componentDef = module.default;
    if (!componentDef || typeof componentDef !== "object") {
      return null;
    }

    const fallbackTag = `${prefix}-${componentName}`;
    return extractComponentMetadata(componentDef, fallbackTag);
  } catch (e) {
    // Component failed to load - this is expected for some files
    console.debug(`Failed to load component ${prefix}-${componentName}:`, e.message);
    return null;
  }
}

/**
 * Main function to generate types in the browser
 */
export async function generateTypes() {
  console.log("[TypeGen] Starting browser-based type generation...");

  const mappings = await getComponentMappings();
  const allComponents = [];
  let loadedCount = 0;
  let failedCount = 0;

  for (const mapping of mappings) {
    console.log(`[TypeGen] Processing ${mapping.source}...`);

    for (const [prefix, config] of Object.entries(mapping.components)) {
      // Handle object format: { "button": "display/button", ... }
      if (typeof config === "object" && !Array.isArray(config)) {
        for (const [componentName, relativePath] of Object.entries(config)) {
          const path = `${mapping.base}${relativePath}.js`;
          const metadata = await loadComponent(path, prefix, componentName);
          if (metadata) {
            allComponents.push(metadata);
            loadedCount++;
          } else {
            failedCount++;
          }
        }
      } else {
        // Handle array format: ["views/", "components/", ...]
        const folders = Array.isArray(config) ? config : [config];
        console.log(`[TypeGen] Legacy array format not fully supported in browser`);
      }
    }
  }

  console.log(
    `[TypeGen] Loaded ${loadedCount} components, ${failedCount} failed`
  );

  if (allComponents.length === 0) {
    console.warn("[TypeGen] No components found");
    return { success: false, error: "No components found" };
  }

  // Generate TypeScript declarations
  const { content, componentCount } = generateHtmlTypes(allComponents);

  // Post to dev server
  try {
    const response = await fetch("/types/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, componentCount }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(
        `[TypeGen] Successfully generated ${result.componentCount} component types`
      );
      return { success: true, componentCount: result.componentCount };
    } else {
      const error = await response.text();
      console.error("[TypeGen] Server error:", error);
      return { success: false, error };
    }
  } catch (e) {
    console.error("[TypeGen] Failed to post types:", e);
    return { success: false, error: e.message };
  }
}

/**
 * Expose globally for manual triggering
 */
if (typeof globalThis !== "undefined") {
  globalThis.generateComponentTypes = generateTypes;
}

export default generateTypes;
