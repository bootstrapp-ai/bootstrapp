/**
 * @bootstrapp/types - Code Generation Module
 * Converts T.* schema definitions to TypeScript declarations
 *
 * @example
 * import { generateTypesFromSchema, generateAppDts } from "@bootstrapp/types/codegen";
 *
 * const globalDts = generateTypesFromSchema(schema);
 * const appDts = generateAppDts();
 */

// =============================================================================
// Utilities
// =============================================================================

/**
 * Converts a model name to PascalCase for TypeScript interface names
 * @param {string} name - Model name (e.g., "users", "user")
 * @returns {string} PascalCase name (e.g., "User")
 */
export function toPascalCase(name) {
  // Remove trailing 's' for plurals (users -> User)
  const singular = name.endsWith("s") ? name.slice(0, -1) : name;
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

// =============================================================================
// Type Extraction - T.* to TypeScript string
// =============================================================================

/**
 * Extracts TypeScript type string from a T.* type definition object
 * @param {Object} typeDef - Type definition from T.string(), T.number(), etc.
 * @param {Object} [options={}] - Extraction options
 * @param {Function} [options.resolveModel] - Function to resolve model references
 * @returns {string} TypeScript type string
 */
export function extractType(typeDef, options = {}) {
  if (!typeDef || typeof typeDef !== "object") {
    return "any";
  }

  const { type, relationship } = typeDef;

  // Handle relationship types first
  if (relationship) {
    return extractRelationType(typeDef, options);
  }

  // Handle enum values
  if (typeDef.enum && Array.isArray(typeDef.enum)) {
    return typeDef.enum.map((v) => JSON.stringify(v)).join(" | ");
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
      return "string"; // ISO date strings in JSON

    case "array":
      return extractArrayType(typeDef, options);

    case "object":
      return extractObjectType(typeDef, options);

    case "function":
      return "(...args: any[]) => any";

    case "any":
    default:
      return "any";
  }
}

/**
 * Extracts TypeScript type for relationship fields
 * @param {Object} typeDef - Relationship type definition
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript type string
 */
export function extractRelationType(typeDef, options = {}) {
  const { relationship, targetModel, many } = typeDef;

  // Handle polymorphic relationships
  if (targetModel === "*") {
    return many ? "any[]" : "any";
  }

  // Handle array of target models (polymorphic)
  if (Array.isArray(targetModel)) {
    const types = targetModel.map((m) => toPascalCase(m)).join(" | ");
    return many ? `(${types})[]` : types;
  }

  // Standard relationship
  switch (relationship) {
    case "belongs":
      // Foreign key - just the ID string
      return "string";

    case "belongs_many":
      // Many-to-many - array of IDs
      return "string[]";

    case "one":
      // One-to-one - reference to model (not persisted, fetched)
      return toPascalCase(targetModel);

    case "many":
      // One-to-many - array of models (not persisted, fetched)
      return `${toPascalCase(targetModel)}[]`;

    default:
      return "any";
  }
}

/**
 * Extracts TypeScript type for array fields
 * @param {Object} typeDef - Array type definition
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript type string
 */
export function extractArrayType(typeDef, options = {}) {
  const { itemType } = typeDef;

  if (!itemType) {
    return "any[]";
  }

  // itemType can be a T.* definition or an object schema
  if (typeof itemType === "object" && itemType.type) {
    // Simple item type like T.string()
    return `${extractType(itemType, options)}[]`;
  }

  // Object schema for items
  if (typeof itemType === "object") {
    const fields = extractObjectFields(itemType, options);
    return `{ ${fields} }[]`;
  }

  return "any[]";
}

/**
 * Extracts TypeScript type for object fields
 * @param {Object} typeDef - Object type definition
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript type string
 */
export function extractObjectType(typeDef, options = {}) {
  const { properties } = typeDef;

  if (!properties) {
    return "Record<string, any>";
  }

  const fields = extractObjectFields(properties, options);
  return `{ ${fields} }`;
}

/**
 * Extracts field definitions from an object schema
 * @param {Object} schema - Object with field definitions
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript field definitions
 */
export function extractObjectFields(schema, options = {}) {
  return Object.entries(schema)
    .map(([key, fieldDef]) => {
      const tsType = extractType(fieldDef, options);
      const optional = !fieldDef.required ? "?" : "";
      return `${key}${optional}: ${tsType}`;
    })
    .join("; ");
}

// =============================================================================
// Interface Generation
// =============================================================================

/**
 * Generates a complete TypeScript interface from a schema
 * @param {string} name - Interface name
 * @param {Object} schema - Schema with T.* field definitions
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.description] - JSDoc description
 * @param {boolean} [options.exported=true] - Whether to export the interface
 * @returns {string} Complete TypeScript interface
 */
export function generateInterface(name, schema, options = {}) {
  const { description, exported = true } = options;

  const lines = [];

  // Add JSDoc if description provided
  if (description) {
    lines.push(`/** ${description} */`);
  }

  const exportKeyword = exported ? "export " : "";
  lines.push(`${exportKeyword}interface ${name} {`);

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    // Skip internal fields
    if (fieldName.startsWith("$")) continue;
    if (typeof fieldDef !== "object" || fieldDef === null) continue;

    const tsType = extractType(fieldDef, options);
    const optional = !fieldDef.required ? "?" : "";
    const fieldComment = fieldDef.description
      ? `  /** ${fieldDef.description} */\n`
      : "";

    lines.push(`${fieldComment}  ${fieldName}${optional}: ${tsType};`);
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Generates TypeScript type alias for a function signature
 * @param {string} name - Type alias name
 * @param {Object} schema - Function schema with args and returns
 * @param {Object} [options={}] - Generation options
 * @returns {string} TypeScript type alias
 */
export function generateFunctionType(name, schema, options = {}) {
  const { description, exported = true } = options;
  const { args = [], returns } = schema;

  const lines = [];

  if (description) {
    lines.push(`/** ${description} */`);
  }

  // Generate argument list
  const argTypes = args
    .map((arg, i) => {
      const argType = extractType(arg, options);
      return `arg${i}: ${argType}`;
    })
    .join(", ");

  // Generate return type
  const returnType = returns ? extractType(returns, options) : "void";

  const exportKeyword = exported ? "export " : "";
  lines.push(`${exportKeyword}type ${name} = (${argTypes}) => ${returnType};`);

  return lines.join("\n");
}

/**
 * Generates TypeScript props interface for a component
 * @param {string} name - Component name
 * @param {Object} schema - Props schema with T.* definitions
 * @param {Object} [options={}] - Generation options
 * @returns {string} TypeScript interface
 */
export function generateComponentProps(name, schema, options = {}) {
  return generateInterface(`${name}Props`, schema, options);
}

// =============================================================================
// Schema-to-DTS Generation
// =============================================================================

/**
 * Generates complete global.d.ts content from a schema object
 * @param {Object} models - Schema models object (from schema.js default export)
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.schemaName="schema.js"] - Name for the header comment
 * @returns {{ content: string, modelCount: number, modelNames: Array<{name: string, typeName: string}> }}
 */
export function generateTypesFromSchema(models, options = {}) {
  const { schemaName = "schema.js" } = options;

  const lines = [
    "/**",
    ` * Generated from ${schemaName}`,
    " * Ambient types for $APP - no imports needed",
    " * @generated",
    " */",
    "",
  ];

  // Collect model names for AppModel interface
  const modelNames = [];

  // Generate model interfaces (ambient - no export)
  let modelCount = 0;
  for (const [name, schema] of Object.entries(models)) {
    // Skip internal fields like $hooks
    if (name.startsWith("$")) continue;
    if (typeof schema !== "object" || schema === null) continue;

    const typeName = toPascalCase(name);
    modelNames.push({ name, typeName });
    const interfaceLines = [`/** ${name} model */`, `interface ${typeName} {`];

    for (const [fieldName, fieldDef] of Object.entries(schema)) {
      // Skip hook definitions and other internal fields
      if (fieldName.startsWith("$")) continue;
      if (typeof fieldDef !== "object" || fieldDef === null) continue;

      const tsType = extractType(fieldDef);
      const optional = !fieldDef.required ? "?" : "";

      interfaceLines.push(`  ${fieldName}${optional}: ${tsType};`);
    }

    interfaceLines.push("}");
    lines.push(interfaceLines.join("\n"));
    lines.push("");
    modelCount++;
  }

  // Add ModelApi interface
  lines.push("/** Model API methods */");
  lines.push("interface ModelApi<T> {");
  lines.push("  get(id: string): Promise<T | null>;");
  lines.push("  get(opts: { where: Partial<T> }): Promise<T | null>;");
  lines.push(
    "  getAll(opts?: { where?: Partial<T>; limit?: number; offset?: number; order?: string }): Promise<T[]>;"
  );
  lines.push("  add(data: Partial<T>): Promise<T>;");
  lines.push("  addMany(data: Partial<T>[]): Promise<T[]>;");
  lines.push("  edit(data: Partial<T> & { id: string }): Promise<T>;");
  lines.push("  remove(id: string): Promise<void>;");
  lines.push("  subscribe(callback: (data: T[]) => void): () => void;");
  lines.push("}");
  lines.push("");

  // Add AppModel interface
  lines.push("/** Typed Model API */");
  lines.push("interface AppModel {");
  for (const { name, typeName } of modelNames) {
    lines.push(`  ${name}: ModelApi<${typeName}>;`);
  }
  lines.push("}");
  lines.push("");

  // Define the $APP type as a reusable interface
  lines.push("/** $APP type definition */");
  lines.push("interface $APPType {");
  lines.push("  Model: AppModel;");
  lines.push("  models: Record<string, any>;");
  lines.push("  data: Record<string, any[]>;");
  lines.push("  settings: Record<string, any>;");
  lines.push("  events: { on: Function; emit: Function; off: Function };");
  lines.push("  Router: { go: Function; current: any };");
  lines.push(
    "  Auth: { user: any; isAuthenticated: boolean; login: Function; logout: Function };"
  );
  lines.push("  log: (...args: any[]) => void;");
  lines.push("  error: (...args: any[]) => void;");
  lines.push("}");
  lines.push("");

  // Declare global $APP for direct access
  lines.push("/** Global $APP declaration */");
  lines.push("declare var $APP: $APPType;");
  lines.push("");

  return {
    content: lines.join("\n"),
    modelCount,
    modelNames,
  };
}

/**
 * Generates $app.d.ts content for the /$app.js virtual import
 * @returns {string} TypeScript declaration content
 */
export function generateAppDts() {
  return `/**
 * Type declaration for /$app.js virtual import
 * Maps to @bootstrapp/base/app.js at runtime
 * @generated - regenerate with: bootstrapp contracts:from-schema
 */

/// <reference path="./global.d.ts" />

declare const $APP: $APPType;
export default $APP;
`;
}

/**
 * Generates jsconfig.json content for IDE support
 * @param {Object} [options={}] - Generation options
 * @param {boolean} [options.pretty=true] - Pretty print JSON
 * @returns {string} JSON content
 */
export function generateJsConfig(options = {}) {
  const { pretty = true } = options;

  const config = {
    compilerOptions: {
      checkJs: true,
      moduleResolution: "bundler",
      target: "ES2022",
      module: "ES2022",
      baseUrl: ".",
      paths: {
        "/$app.js": ["./types/$app.d.ts"],
        "/$app/*": ["./node_modules/@bootstrapp/*"],
        "/npm/*": ["./node_modules/*"],
      },
    },
    include: ["**/*.js", "types/*.d.ts"],
    exclude: ["node_modules"],
  };

  return pretty ? JSON.stringify(config, null, 2) : JSON.stringify(config);
}
