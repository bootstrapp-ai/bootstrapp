
export const BOOLEAN_TO_STORAGE = { true: 1, false: 0 };
export const STORAGE_TO_BOOLEAN = { 1: true, 0: false, true: true, false: false };

export function prepareRow(models, modelName, row, options = {}) {
  const { currentRow = {}, reverse = false } = options;
  const modelSchema = models[modelName];

  if (!modelSchema) {
    throw new Error(`Model "${modelName}" not found in schema`);
  }

  const prepared = { ...row };
  const booleanMap = reverse ? STORAGE_TO_BOOLEAN : BOOLEAN_TO_STORAGE;

  for (const [field, fieldDef] of Object.entries(modelSchema)) {
    // Skip relationship fields that don't belong (many, one)
    if (fieldDef.relationship && !fieldDef.belongs) {
      continue;
    }

    const value = row[field];

    // Preserve current value if new value is undefined
    if (value === undefined && currentRow[field] !== undefined) {
      prepared[field] = currentRow[field];
      continue;
    }

    // Convert booleans for storage
    if (fieldDef.type === "boolean" && value !== undefined && value !== null) {
      prepared[field] = reverse
        ? (booleanMap[value] ?? value)
        : (booleanMap[value] ?? value);
    }

    // Handle timestamps
    if ((fieldDef.type === "date" || fieldDef.type === "datetime") && value) {
      if (reverse) {
        // Convert from storage (timestamp) to Date
        prepared[field] = typeof value === "number" ? new Date(value) : value;
      } else {
        // Convert to timestamp for storage
        prepared[field] = value instanceof Date ? value.getTime() : value;
      }
    }

    // Apply default values for new records
    if (
      !reverse &&
      value === undefined &&
      fieldDef.defaultValue !== undefined
    ) {
      prepared[field] =
        typeof fieldDef.defaultValue === "function"
          ? fieldDef.defaultValue()
          : fieldDef.defaultValue;
    }
  }

  return prepared;
}

export function validateRow(models, modelName, row, options = {}) {
  const modelSchema = models[modelName];

  if (!modelSchema) {
    return {
      valid: false,
      errors: { _model: `Model "${modelName}" not found` },
      data: null,
    };
  }

  const errors = {};
  const validated = { ...row };

  for (const [field, fieldDef] of Object.entries(modelSchema)) {
    const value = row[field];

    // Check required fields
    if (
      fieldDef.required &&
      (value === undefined || value === null || value === "")
    ) {
      if (options.operation !== "edit") {
        // Required only for add, not partial updates
        errors[field] = `${field} is required`;
        continue;
      }
    }

    // Type validation
    if (value !== undefined && value !== null && fieldDef.type) {
      const expectedType = fieldDef.type;
      const actualType = Array.isArray(value) ? "array" : typeof value;

      const validTypes = {
        string: ["string", "number"], // Allow coercion
        number: ["number", "string"], // Allow coercion
        boolean: ["boolean", "number", "string"], // Allow coercion
        object: ["object"],
        array: ["array"],
        date: ["object", "number", "string"], // Date objects or timestamps
        datetime: ["object", "number", "string"],
      };

      if (
        validTypes[expectedType] &&
        !validTypes[expectedType].includes(actualType)
      ) {
        errors[field] = `${field} must be of type ${expectedType}`;
      }
    }

    // Custom validators
    if (fieldDef.validator && value !== undefined) {
      try {
        const isValid = fieldDef.validator(value, row);
        if (!isValid) {
          errors[field] = `${field} failed custom validation`;
        }
      } catch (e) {
        errors[field] = e.message || `${field} validation error`;
      }
    }

    // Format validation (e.g., email)
    if (fieldDef.format && value) {
      const formats = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^https?:\/\/.+/,
      };

      if (formats[fieldDef.format] && !formats[fieldDef.format].test(value)) {
        errors[field] = `${field} must be a valid ${fieldDef.format}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: validated,
  };
}

export function extractRelationships(modelSchema, row) {
  const belongs = {}; // Foreign keys (belongs relationships)
  const references = {}; // Data for many/one relationships

  for (const [field, fieldDef] of Object.entries(modelSchema)) {
    if (!fieldDef.relationship) continue;

    if (fieldDef.belongs && row[field] !== undefined) {
      belongs[field] = row[field];
    } else if (!fieldDef.belongs && row[field] !== undefined) {
      references[field] = row[field];
    }
  }

  return { belongs, references };
}

export function generateId(useStringId = false) {
  const id = `${Date.now()}${Math.random().toString(10).substr(2, 2)}`;
  return useStringId ? id : Number(id);
}

export function cloneRow(row) {
  if (!row || typeof row !== "object") return row;

  try {
    return JSON.parse(JSON.stringify(row));
  } catch (e) {
    // Fallback for objects with circular references
    return { ...row };
  }
}

export function mergeRowUpdates(currentRow, updates) {
  return {
    ...currentRow,
    ...updates,
  };
}

export default {
  prepareRow,
  validateRow,
  extractRelationships,
  generateId,
  cloneRow,
  mergeRowUpdates,
  BOOLEAN_TO_STORAGE,
  STORAGE_TO_BOOLEAN,
};
