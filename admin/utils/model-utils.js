import $APP from "/$app.js";

/**
 * Get schema fields for a model
 * @param {string} modelName - Name of the model
 * @returns {Array} Array of field definitions
 */
export const getModelSchema = (modelName) => {
  const schema = $APP.models[modelName];
  if (!schema) return [];

  return Object.entries(schema)
    .filter(([key]) => !key.startsWith("$") && !key.startsWith("_"))
    .map(([key, def]) => ({
      name: key,
      type: def.type?.name || "string",
      required: def.required || false,
      defaultValue: def.defaultValue,
      enum: def.enum,
      relationship: def.relationship,
      targetModel: def.targetModel,
      immutable: def.immutable,
      index: def.index,
      label: def.label || key,
      placeholder: def.placeholder,
      rows: def.rows,
      attribute: def.attribute,
    }));
};

/**
 * Convert plural model name to singular
 * @param {string} pluralName - Plural form (e.g., "users", "categories")
 * @returns {string} Singular form (e.g., "user", "category")
 */
export const getSingularName = (pluralName) => {
  if (!pluralName) return pluralName;
  if (pluralName.endsWith("ies")) return `${pluralName.slice(0, -3)}y`;
  if (pluralName.endsWith("ses")) return pluralName.slice(0, -2);
  if (pluralName.endsWith("es")) return pluralName.slice(0, -2);
  if (pluralName.endsWith("s")) return pluralName.slice(0, -1);
  return pluralName;
};

/**
 * Capitalize first letter
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get all model names from $APP.models
 * @returns {Array<string>} Array of model names
 */
export const getModelNames = () => {
  if (!$APP.models) return [];
  return Object.keys($APP.models).filter(
    (name) => !name.startsWith("$") && !name.startsWith("_"),
  );
};

/**
 * Get display columns for a model (prioritized for table view)
 * @param {string} modelName - Name of the model
 * @param {number} maxColumns - Maximum columns to return
 * @returns {Array<string>} Array of column names
 */
export const getDisplayColumns = (modelName, maxColumns = 6) => {
  const schema = getModelSchema(modelName);
  if (!schema.length) return ["id"];

  // Priority fields to show first
  const priority = [
    "id",
    "name",
    "title",
    "slug",
    "email",
    "username",
    "status",
    "category",
    "createdAt",
  ];

  const sorted = [...schema].sort((a, b) => {
    const aIndex = priority.indexOf(a.name);
    const bIndex = priority.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return sorted.slice(0, maxColumns).map((f) => f.name);
};

/**
 * Get field definition by name
 * @param {string} modelName - Name of the model
 * @param {string} fieldName - Name of the field
 * @returns {object|null} Field definition or null
 */
export const getFieldDef = (modelName, fieldName) => {
  const schema = $APP.models[modelName];
  if (!schema) return null;
  return schema[fieldName] || null;
};

/**
 * Check if a model has a specific field
 * @param {string} modelName - Name of the model
 * @param {string} fieldName - Name of the field
 * @returns {boolean}
 */
export const hasField = (modelName, fieldName) => {
  return getFieldDef(modelName, fieldName) !== null;
};

/**
 * Get relationship fields for a model
 * @param {string} modelName - Name of the model
 * @returns {Array} Array of relationship field definitions
 */
export const getRelationshipFields = (modelName) => {
  const schema = getModelSchema(modelName);
  return schema.filter(
    (field) =>
      field.relationship &&
      ["belongs", "many", "one", "belongs_many"].includes(field.relationship),
  );
};

/**
 * Get the primary display field for a model (for showing in selects, etc.)
 * @param {string} modelName - Name of the model
 * @returns {string} Field name to use for display
 */
export const getPrimaryDisplayField = (modelName) => {
  const schema = getModelSchema(modelName);
  const displayFields = ["name", "title", "username", "email", "label"];

  for (const field of displayFields) {
    if (schema.some((f) => f.name === field)) {
      return field;
    }
  }

  // Fallback to first string field that's not id
  const stringField = schema.find(
    (f) => f.name !== "id" && f.type === "string",
  );
  return stringField?.name || "id";
};
