import $APP from "/$app.js";
import { getModelSchema, getPrimaryDisplayField } from "./model-utils.js";

/**
 * Map field definition to input type
 * @param {object} fieldDef - Field definition from schema
 * @returns {string} Input type for uix-input
 */
export const typeToInputType = (fieldDef) => {
  // Enum fields become select
  if (fieldDef.enum) return "select";

  // Relationship fields become select
  if (fieldDef.relationship === "belongs") return "select";
  if (fieldDef.relationship === "belongs_many") return "multi-select";

  const typeName = fieldDef.type?.toLowerCase();

  switch (typeName) {
    case "boolean":
      return "switch";

    case "number":
      return "number";

    case "array":
    case "object":
      return "textarea"; // JSON editor

    case "string":
    default:
      // Infer from field name
      const name = fieldDef.name?.toLowerCase() || "";

      if (name.includes("password")) return "password";
      if (name.includes("email")) return "email";
      if (name.includes("url") || name.includes("link")) return "url";
      if (name.includes("phone") || name.includes("tel")) return "tel";

      // Date/time fields
      if (name === "date" || name.endsWith("date") || name.endsWith("_at"))
        return "date";
      if (name === "time" || name.endsWith("time")) return "time";
      if (name.includes("datetime")) return "datetime-local";

      // Long text fields
      if (
        name.includes("description") ||
        name.includes("content") ||
        name.includes("bio") ||
        name.includes("body") ||
        name.includes("text") ||
        fieldDef.rows > 1
      ) {
        return "textarea";
      }

      // Image/file fields
      if (
        name.includes("image") ||
        name.includes("avatar") ||
        name.includes("photo") ||
        name.includes("picture")
      ) {
        return "url"; // For now, just URL input. Could be file upload later.
      }

      return "text";
  }
};

/**
 * Get form fields configuration for a model
 * @param {string} modelName - Name of the model
 * @param {boolean} isEdit - Whether this is for editing (vs creating)
 * @returns {Array} Array of field configurations for the form
 */
export const getFormFields = (modelName, isEdit = false) => {
  const schema = getModelSchema(modelName);

  return schema
    .filter((field) => {
      // Skip internal fields
      if (field.name === "id") return false;
      if (field.name === "createdAt" && !isEdit) return false;
      if (field.name === "updatedAt") return false;

      // Skip immutable fields on edit
      if (isEdit && field.immutable) return false;

      // Skip fields marked as non-attribute (internal only)
      if (field.attribute === false) return false;

      return true;
    })
    .map((field) => ({
      name: field.name,
      label: field.label || formatLabel(field.name),
      type: typeToInputType(field),
      required: field.required || false,
      placeholder: field.placeholder || "",
      defaultValue: field.defaultValue,
      options: field.enum || null,
      relationship: field.relationship,
      targetModel: field.targetModel,
      rows: field.rows || (typeToInputType(field) === "textarea" ? 3 : undefined),
    }));
};

/**
 * Format field name to human-readable label
 * @param {string} fieldName - Field name (e.g., "createdAt", "user_name")
 * @returns {string} Human-readable label (e.g., "Created At", "User Name")
 */
export const formatLabel = (fieldName) => {
  if (!fieldName) return "";

  return fieldName
    // Split camelCase
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    // Split snake_case
    .replace(/_/g, " ")
    // Capitalize each word
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Load options for relationship select fields
 * @param {string} targetModel - The related model name
 * @returns {Promise<Array>} Array of {value, label} options
 */
export const loadRelationshipOptions = async (targetModel) => {
  try {
    const records = await $APP.Model[targetModel].getAll();
    const displayField = getPrimaryDisplayField(targetModel);

    return records.map((record) => ({
      value: record.id,
      label: record[displayField] || record.id,
    }));
  } catch (error) {
    console.error(`Failed to load options for ${targetModel}:`, error);
    return [];
  }
};

/**
 * Serialize form data, handling special types
 * @param {object} formData - Raw form data
 * @param {Array} fields - Field configurations
 * @returns {object} Serialized data ready for API
 */
export const serializeFormData = (formData, fields) => {
  const result = { ...formData };

  for (const field of fields) {
    const value = result[field.name];

    if (value === undefined || value === null) {
      continue;
    }

    // Parse JSON for array/object fields
    if (field.type === "textarea" && (field.name.includes("json") || typeof field.defaultValue === "object")) {
      try {
        result[field.name] = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    // Convert number strings
    if (field.type === "number" && typeof value === "string") {
      result[field.name] = parseFloat(value) || 0;
    }

    // Convert boolean strings
    if (field.type === "switch" && typeof value === "string") {
      result[field.name] = value === "true" || value === "1";
    }
  }

  return result;
};

/**
 * Deserialize record data for form display
 * @param {object} record - Record from database
 * @param {Array} fields - Field configurations
 * @returns {object} Data ready for form inputs
 */
export const deserializeForForm = (record, fields) => {
  const result = { ...record };

  for (const field of fields) {
    const value = result[field.name];

    // Stringify objects/arrays for textarea display
    if (
      field.type === "textarea" &&
      (Array.isArray(value) || (typeof value === "object" && value !== null))
    ) {
      result[field.name] = JSON.stringify(value, null, 2);
    }

    // Format dates for input
    if (field.type === "date" && value) {
      result[field.name] = new Date(value).toISOString().split("T")[0];
    }

    if (field.type === "datetime-local" && value) {
      result[field.name] = new Date(value).toISOString().slice(0, 16);
    }
  }

  return result;
};
