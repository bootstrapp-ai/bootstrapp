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

  // Handle enum values - use (string & {}) pattern for flexibility while keeping autocomplete
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
      return "string"; // ISO date strings in JSON

    case "array":
      return extractArrayType(typeDef, options);

    case "object":
      return extractObjectType(typeDef, options);

    case "function":
      return extractFunctionType(typeDef, options);

    case "union":
      return extractUnionType(typeDef, options);

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

/**
 * Extracts TypeScript type for union types
 * @param {Object} typeDef - Union type definition with types array
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript union type string
 */
export function extractUnionType(typeDef, options = {}) {
  const { types = [] } = typeDef;

  if (types.length === 0) {
    return "any";
  }

  return types.map((t) => extractType(t, options)).join(" | ");
}

/**
 * Extracts TypeScript type for function types with args/returns
 * @param {Object} typeDef - Function type definition
 * @param {Object} options - Extraction options
 * @returns {string} TypeScript function signature
 */
export function extractFunctionType(typeDef, options = {}) {
  const { args = [], returns } = typeDef;

  // Generate argument list with proper names
  const argTypes = args
    .map((arg, i) => {
      const argType = extractType(arg, options);
      const argName = arg.name || `arg${i}`;
      return `${argName}: ${argType}`;
    })
    .join(", ");

  // Generate return type
  const returnType = returns ? extractType(returns, options) : "void";

  return `(${argTypes}) => ${returnType}`;
}

/**
 * Converts arrow function syntax to method signature syntax
 * Handles nested parentheses in parameters (e.g., callback types)
 * @param {string} fnType - Arrow function type like "(a: string) => void"
 * @returns {string} Method signature like "(a: string): void"
 */
export function arrowToMethodSignature(fnType) {
  // Find the closing ) that matches the opening ( at depth 0
  let depth = 0;
  for (let i = 0; i < fnType.length; i++) {
    if (fnType[i] === "(") depth++;
    else if (fnType[i] === ")") depth--;

    // When depth returns to 0, we found the end of params
    if (depth === 0 && fnType.slice(i, i + 5) === ") => ") {
      const params = fnType.slice(0, i + 1); // includes the )
      const returnType = fnType.slice(i + 5); // after ") => "
      return `${params}: ${returnType}`;
    }
  }
  return fnType; // fallback if no match
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
  lines.push("  add(data: Partial<T>): Promise<[Error | null, T | null]>;");
  lines.push("  addMany(data: Partial<T>[]): Promise<T[]>;");
  lines.push("  edit(data: Partial<T> & { id: string }): Promise<[Error | null, T | null]>;");
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

  // Define Router interface
  lines.push("/** Router type */");
  lines.push("interface RouterType {");
  lines.push("  go(routeNameOrPath: string, params?: Record<string, any>): void;");
  lines.push("  navigate(routeName: string, params?: Record<string, any>): void;");
  lines.push("  replace(routeNameOrPath: string, params?: Record<string, any>): void;");
  lines.push("  back(): void;");
  lines.push("  forward(): void;");
  lines.push("  home(): void;");
  lines.push("  setTitle(title: string): void;");
  lines.push("  current: { route: any; params: Record<string, any>; path: string; name?: string };");
  lines.push("  stack: any[];");
  lines.push("  routes: any[];");
  lines.push("  isRoot(): boolean;");
  lines.push("}");
  lines.push("");

  // Define Auth interface
  lines.push("/** Auth type */");
  lines.push("interface AuthType {");
  lines.push("  user: any;");
  lines.push("  isAuthenticated: boolean;");
  lines.push("  isGuest: boolean;");
  lines.push("  currentUserId: string | null;");
  lines.push("  login(email: string, password: string): Promise<any>;");
  lines.push("  logout(): Promise<void>;");
  lines.push("  register(data: { name: string; email: string; password: string; passwordConfirm?: string; username?: string; [key: string]: any }): Promise<any>;");
  lines.push("  loginWithOAuth(provider: string): Promise<any>;");
  lines.push("  completeOAuth(params: Record<string, string>): Promise<any>;");
  lines.push("  restore(): Promise<boolean>;");
  lines.push("  on(event: string, callback: Function): () => void;");
  lines.push("  convertGuest(data: { email: string; password: string; name?: string }): Promise<any>;");
  lines.push("}");
  lines.push("");

  // Define i18n interface
  lines.push("/** i18n type */");
  lines.push("interface I18nType {");
  lines.push("  t(key: string, params?: Record<string, any>): string;");
  lines.push("  n(value: number, options?: Intl.NumberFormatOptions): string;");
  lines.push("  d(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string;");
  lines.push("  r(date: Date | string | number, options?: Intl.RelativeTimeFormatOptions): string;");
  lines.push("  setLanguage(locale: string): Promise<void>;");
  lines.push("  getLanguage(): string;");
  lines.push("  getAvailableLocales(): string[];");
  lines.push("  registerLocale(locale: string, loader: () => Promise<any>): void;");
  lines.push("  addTranslations(locale: string, translations: Record<string, any>): void;");
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
  lines.push("  Router: RouterType;");
  lines.push("  Auth: AuthType;");
  lines.push("  i18n: I18nType;");
  lines.push("  notifications: { getUnreadCount(userId: string): Promise<number>; markAsRead(id: string): Promise<void>; markAllAsRead(userId: string): Promise<void>; send(options: any): Promise<any[]>; broadcast(options: any): Promise<any[]>; remove(id: string): Promise<void>; removeAllForUser(userId: string): Promise<void> };");
  lines.push("  sw: { postMessage(type: string, payload?: any): void; request(type: string, payload?: any, timeout?: number): Promise<any> };");
  lines.push("  define(tag: string, component: Record<string, any>): void;");
  lines.push("  addModule(config: { name: string; base?: any; path?: string; alias?: string; events?: Function }): void;");
  lines.push("  routes: { set(routes: Record<string, any>): void; get(): Record<string, any> };");
  lines.push("  databaseConfig: Record<string, any>;");
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

// =============================================================================
// Component Type Generation (for lit-html autocomplete)
// =============================================================================

/**
 * Converts a kebab-case tag name to PascalCase interface name
 * @param {string} tag - Tag name (e.g., "uix-button", "view-place-detail")
 * @returns {string} PascalCase name (e.g., "UixButton", "ViewPlaceDetail")
 */
export function tagToPascalCase(tag) {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Generates TypeScript interface for a component's properties
 * @param {string} tag - Component tag name (e.g., "uix-button")
 * @param {Object} properties - T.* property definitions
 * @param {Object} [options={}] - Generation options
 * @param {string} [options.extendsTag] - Parent tag if component extends another
 * @returns {string} TypeScript interface declaration
 */
export function generateComponentInterface(tag, properties, options = {}) {
  const interfaceName = tagToPascalCase(tag);
  const { extendsTag } = options;

  // Determine what to extend
  let extendsClause = "HTMLElement";
  if (extendsTag) {
    extendsClause = tagToPascalCase(extendsTag);
  }

  const lines = [`  interface ${interfaceName} extends ${extendsClause} {`];

  if (properties && typeof properties === "object") {
    for (const [propName, propDef] of Object.entries(properties)) {
      // Skip internal properties
      if (propName.startsWith("$")) continue;
      if (typeof propDef !== "object" || propDef === null) continue;

      const tsType = extractType(propDef);
      // All component properties are optional (can be set or not)
      lines.push(`    ${propName}?: ${tsType};`);
    }
  }

  lines.push("  }");
  return lines.join("\n");
}

/**
 * Generates complete html.d.ts content for component autocomplete
 * @param {Array<{tag: string, properties: Object, extendsTag?: string}>} components - Component definitions
 * @param {Object} [options={}] - Generation options
 * @returns {{ content: string, componentCount: number }}
 */
export function generateHtmlTypes(components, options = {}) {
  const lines = [
    "/**",
    " * Generated component types for lit-html autocomplete",
    " * Provides tag name and attribute autocomplete in html`` templates",
    " * @generated",
    " */",
    "",
    "declare global {",
    "  // Component interfaces",
  ];

  // Generate interfaces for each component
  for (const comp of components) {
    const { tag, properties, extendsTag } = comp;
    const interfaceCode = generateComponentInterface(tag, properties, { extendsTag });
    lines.push(interfaceCode);
    lines.push("");
  }

  // Generate HTMLElementTagNameMap augmentation
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
 * Extracts component metadata from a component definition object
 * @param {Object} componentDef - Component definition (default export from component file)
 * @param {string} [fallbackTag] - Fallback tag name if not defined in component
 * @returns {{ tag: string, properties: Object, extendsTag?: string } | null}
 */
export function extractComponentMetadata(componentDef, fallbackTag) {
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

// =============================================================================
// Package Type Generation (for framework packages)
// =============================================================================

/**
 * Generates export declaration based on type definition
 * @param {string} name - Export name
 * @param {Object} typeDef - Type definition or object with $class/$interface
 * @param {Object} options - Generation options
 * @returns {string} TypeScript declaration
 */
function generateExportDeclaration(name, typeDef, options = {}) {
  const indent = options.indent || "  ";
  const isDefaultExport = name === "default";

  // Handle $class marker
  if (typeDef.$class) {
    return generateClassDeclaration(name, typeDef, { ...options, isDefaultExport });
  }

  // Handle $interface marker
  if (typeDef.$interface) {
    return generateInterfaceDeclaration(name, typeDef, { ...options, isDefaultExport });
  }

  // Handle function type
  if (typeDef.type === "function") {
    const fnType = extractFunctionType(typeDef, options);
    if (isDefaultExport) {
      return `${indent}declare const _default: ${fnType};\n${indent}export default _default;`;
    }
    return `${indent}export const ${name}: ${fnType};`;
  }

  // Handle object with properties (generate as interface)
  if (typeDef.type === "object" && typeDef.properties) {
    const iface = generateInterfaceDeclaration(name, typeDef.properties, {
      ...options,
      indent,
      isDefaultExport,
    });
    return iface;
  }

  // Handle plain object with T.* fields (likely an interface)
  if (typeof typeDef === "object" && !typeDef.type) {
    return generateInterfaceDeclaration(name, typeDef, { ...options, isDefaultExport });
  }

  // Simple type (constant)
  const tsType = extractType(typeDef, options);
  if (isDefaultExport) {
    return `${indent}declare const _default: ${tsType};\n${indent}export default _default;`;
  }
  return `${indent}export const ${name}: ${tsType};`;
}

/**
 * Generates a class declaration
 */
function generateClassDeclaration(name, schema, options = {}) {
  const indent = options.indent || "  ";
  const isDefaultExport = options.isDefaultExport || false;

  // For default export, use a named class then export default
  const className = isDefaultExport ? "_Default" : name;
  const lines = [`${indent}export class ${className} {`];

  for (const [key, fieldDef] of Object.entries(schema)) {
    if (key.startsWith("$")) continue;

    if (key === "constructor") {
      // Constructor
      const args = fieldDef.args || [];
      const argStr = args
        .map((arg, i) => `${arg.name || `arg${i}`}: ${extractType(arg, options)}`)
        .join(", ");
      lines.push(`${indent}  constructor(${argStr});`);
    } else if (fieldDef.type === "function") {
      // Method
      const fnType = extractFunctionType(fieldDef, options);
      // Convert arrow function to method signature (handles nested parens)
      const methodSig = arrowToMethodSignature(fnType);
      lines.push(`${indent}  ${key}${methodSig};`);
    } else {
      // Property
      const tsType = extractType(fieldDef, options);
      const optional = !fieldDef.required ? "?" : "";
      lines.push(`${indent}  ${key}${optional}: ${tsType};`);
    }
  }

  lines.push(`${indent}}`);

  // Add default export if needed
  if (isDefaultExport) {
    lines.push(`${indent}export default ${className};`);
  }

  return lines.join("\n");
}

/**
 * Generates an interface declaration
 */
function generateInterfaceDeclaration(name, schema, options = {}) {
  const indent = options.indent || "  ";
  const isDefaultExport = options.isDefaultExport || false;

  // For default export, use a named interface then export default
  const interfaceName = isDefaultExport ? "_DefaultExport" : name;
  const lines = [`${indent}export interface ${interfaceName} {`];

  for (const [key, fieldDef] of Object.entries(schema)) {
    if (key.startsWith("$")) continue;

    if (fieldDef.type === "function") {
      // Method signature (handles nested parens in callbacks)
      const fnType = extractFunctionType(fieldDef, options);
      const methodSig = arrowToMethodSignature(fnType);
      lines.push(`${indent}  ${key}${methodSig};`);
    } else {
      // Property
      const tsType = extractType(fieldDef, options);
      const optional = !fieldDef.required ? "?" : "";
      lines.push(`${indent}  ${key}${optional}: ${tsType};`);
    }
  }

  lines.push(`${indent}}`);

  // Add default export if needed
  if (isDefaultExport) {
    lines.push(`${indent}declare const _default: ${interfaceName};`);
    lines.push(`${indent}export default _default;`);
  }

  return lines.join("\n");
}

/**
 * Generates .d.ts content from a package schema defined in a test file
 * @param {Object} schema - Package schema
 * @param {string} schema.name - Package name (e.g., "@bootstrapp/types")
 * @param {Object} schema.exports - Export definitions
 * @param {Object} [options={}] - Generation options
 * @returns {{ content: string, exportCount: number }}
 */
export function generatePackageTypes(schema, options = {}) {
  const { name, exports: exportDefs } = schema;

  if (!name || !exportDefs) {
    throw new Error("Schema must have 'name' and 'exports' properties");
  }

  const lines = [
    "/**",
    ` * Generated from ${name}`,
    " * @generated",
    " */",
    "",
  ];

  let exportCount = 0;
  let hasDefaultExport = false;

  for (const [exportName, typeDef] of Object.entries(exportDefs)) {
    const isDefault = exportName === "default";
    if (isDefault) hasDefaultExport = true;

    const declaration = generateExportDeclaration(exportName, typeDef, {
      indent: "",
    });
    lines.push(declaration);
    lines.push("");
    exportCount++;
  }

  // Add default export if there's a main export matching package name
  if (!hasDefaultExport) {
    const baseName = name.split("/").pop();
    if (exportDefs[baseName]) {
      lines.push(`export default ${baseName};`);
      lines.push("");
    }
  }

  return {
    content: lines.join("\n"),
    exportCount,
  };
}
