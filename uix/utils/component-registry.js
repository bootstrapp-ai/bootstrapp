/**
 * UIX Component Registry
 * Provides component list and lazy-loads component modules on-demand
 */

import UIX from "@bootstrapp/uix";
import {
  extractDescription,
  extractExamplesFromComments,
  extractMetadataTags,
  extractParts,
  extractSlots,
} from "./example-parser.js";

// Cache for loaded component modules
const componentCache = new Map();

/**
 * Get lightweight component list from uix module
 * Returns component names organized by category
 */
export function getComponentList() {
  if (!UIX?.components) {
    console.warn("UIX module not loaded or no components found");
    return {};
  }

  return UIX.components;
}

/**
 * Lazy load a specific component module
 * @param {string} category - Component category (display, form, overlay, etc.)
 * @param {string} name - Component name (button, input, modal, etc.)
 * @returns {Promise<Object>} Component metadata
 */
export async function loadComponent(category, name) {
  const cacheKey = `${category}:${name}`;

  // Return cached component if already loaded
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey);
  }

  try {
    // Dynamically import the component module
    const module = await import(
      `/node_modules/@bootstrapp/uix/${category}/${name}.js`
    );

    // Fetch source code for parsing comments
    const sourceUrl = `/node_modules/@bootstrapp/uix/${category}/${name}.js`;
    const response = await fetch(sourceUrl);
    const sourceCode = await response.text();

    // Extract metadata from component definition
    const metadata = extractMetadata(module.default, name);

    // Parse examples and description from JSDoc comments
    const examples = extractExamplesFromComments(sourceCode);
    const description = extractDescription(sourceCode);
    const docMetadata = extractMetadataTags(sourceCode);
    const parts = extractParts(sourceCode);
    const slots = extractSlots(sourceCode);

    // Combine all metadata
    const result = {
      ...metadata,
      examples,
      description,
      parts,
      slots,
      ...docMetadata,
    };

    // Cache the result
    componentCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error(`Failed to load component ${category}/${name}:`, error);
    throw new Error(`Component not found or failed to load: ${name}`);
  }
}

/**
 * Extract metadata from component definition
 * @param {Object} componentDef - Component definition object
 * @param {string} name - Component name
 * @returns {Object} Extracted metadata
 */
function extractMetadata(componentDef, name) {
  if (!componentDef) {
    throw new Error("Invalid component definition");
  }

  const properties = {};

  // Extract property definitions
  if (componentDef.properties) {
    for (const [key, typeDef] of Object.entries(componentDef.properties)) {
      properties[key] = extractPropertyMetadata(typeDef);
    }
  }

  return {
    tag: componentDef.tag || `uix-${name}`,
    properties,
    hasStyle: componentDef.style === true,
    hasShadow: componentDef.shadow === true,
    i18n: componentDef.i18n || {},
    module: componentDef,
  };
}

/**
 * Extract metadata from a property type definition
 * @param {Object} typeDef - Type definition from T.*
 * @returns {Object} Property metadata
 */
function extractPropertyMetadata(typeDef) {
  // Handle simple default values (T.string("default"))
  if (
    typeof typeDef === "string" ||
    typeof typeDef === "number" ||
    typeof typeDef === "boolean"
  ) {
    return {
      type: typeof typeDef,
      defaultValue: typeDef,
    };
  }

  // Handle object-based type definitions
  if (typeDef && typeof typeDef === "object") {
    return {
      type: typeDef._type || "unknown",
      defaultValue: typeDef._defaultValue ?? typeDef.defaultValue,
      enum: typeDef._enum || typeDef.enum,
      required: typeDef._required || typeDef.required || false,
      attribute: typeDef._attribute ?? typeDef.attribute ?? true,
    };
  }

  return {
    type: "unknown",
    defaultValue: undefined,
  };
}

/**
 * Get default values for all properties
 * @param {Object} properties - Properties metadata
 * @returns {Object} Default values
 */
export function getDefaultValues(properties) {
  const defaults = {};

  for (const [key, metadata] of Object.entries(properties)) {
    if (metadata.defaultValue !== undefined) {
      defaults[key] = metadata.defaultValue;
    }
  }

  return defaults;
}

/**
 * Clear the component cache
 */
export function clearCache() {
  componentCache.clear();
}
