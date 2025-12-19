/**
 * @file Type System - Type validation and coercion
 * @description Provides type definitions, validation, and conversion utilities
 * for model fields and component properties. Supports primitive types,
 * relationships, and custom validators.
 */

import timestampExt from "./timestamp.js";

/** @type {Object<string, RegExp>} Format validation patterns */
const formats = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };

/**
 * Safely parses JSON with fallback
 * @private
 * @param {string} value - String to parse
 * @returns {*} Parsed value or undefined
 */
const parseJSON = (value) => {
  try {
    return value in specialCases ? value : JSON.parse(value);
  } catch (_) {
    return undefined;
  }
};

/**
 * Special case values for type conversion
 * @private
 * @type {Object}
 */
const specialCases = {
  undefined: undefined,
  null: null,
  "": null,
};

/**
 * Type conversion handlers for each supported type
 * @private
 * @type {Object<string, Function>}
 */
const typeHandlers = {
  any: (value) => value,
  function: (value) => value,
  boolean: (value, { attribute = true } = {}) =>
    (attribute && value === "") || ["true", 1, "1", true].includes(value),
  string: (val) => (val in specialCases ? specialCases[val] : String(val)),
  array: (value, prop = {}) => {
    if (Array.isArray(value)) return value;
    const { itemType } = prop;
    try {
      if (!value) throw value;
      const parsedArray = parseJSON(value);
      if (!Array.isArray(parsedArray)) throw parsedArray;
      return !itemType
        ? parsedArray
        : parsedArray.map((item) =>
            typeof item !== "object"
              ? item
              : Object.entries(item).reduce((obj, [key, val]) => {
                  obj[key] = typeHandlers[itemType[key]?.type]
                    ? typeHandlers[itemType[key].type](val, prop)
                    : val;
                  return obj;
                }, {}),
          );
    } catch (_) {
      return [];
    }
  },
  number: (value) => {
    return value === null || value === undefined || value === ""
      ? value
      : Number(value);
  },
  date: (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    return new Date(value);
  },
  datetime: (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return date;
  },
  object: (v, prop = {}) => {
    if (v === null) return null;
    const value = typeof v === "string" ? parseJSON(v) : v;
    if (prop.properties && value && typeof value === "object") {
      Object.entries(prop.properties).map(([propKey, propProps]) => {
        if (
          propProps.defaultValue !== undefined &&
          value[propKey] === undefined
        ) {
          value[propKey] = propProps.defaultValue;
        }
      });
    }
    return value;
  },
};

const parse = (value, prop = {}) => {
  const { type } = prop;
  return (typeHandlers[type] || ((val) => val))(value, prop);
};

const validations = {
  datetime: (value, prop = {}) => {
    if (value === null) {
      return prop.required ? ["required", null] : null;
    }
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return ["invalid", "invalid datetime"];
    }
    if (prop.min && value < new Date(prop.min)) {
      return ["minimum", null];
    }
    if (prop.max && value > new Date(prop.max)) {
      return ["maximum", null];
    }
  },
  date: (value, prop = {}) => {
    if (value === null) {
      return prop.required ? ["required", null] : null;
    }
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return ["invalid", "invalid date"];
    }
    if (prop.min && value < new Date(prop.min)) {
      return ["minimum", null];
    }
    if (prop.max && value > new Date(prop.max)) {
      return ["maximum", null];
    }
  },
  object: (value, prop = {}) => {
    if (value === null) {
      return prop.required
        ? ["required", null]
        : ["invalid", "null is not an object"];
    }
    if (typeof value !== "object" || Array.isArray(value)) {
      return ["invalid", "not an object"];
    }
  },
  number: (value, prop = {}) => {
    if (Number.isNaN(Number(value))) {
      if (
        !prop.required &&
        (value === null || value === undefined || value === "")
      ) {
        return null;
      }
      return ["NaN", null];
    }
    if ("min" in prop && value < prop.min) {
      return ["minimum", null];
    }
    if ("max" in prop && value > prop.max) {
      return ["maximum", null];
    }
  },
};

const validateField = (value, prop, context = {}) => {
  if (value === undefined && prop.defaultValue !== undefined) {
    value = prop.defaultValue;
  }

  if (
    prop.required === true &&
    (value === undefined || value === null || value === "")
  )
    return ["required", null];
  if (prop.customValidator) {
    const result = prop.customValidator(value, prop, context);
    if (result) return result;
  }
  if (prop.relationship) {
    if (prop.many) {
      return [
        null,
        Array.isArray(value)
          ? value.map((i) => (prop.mixed ? i : (i?.id ?? i)))
          : [],
      ];
    }
    return [null, value?.id ?? value];
  }
  const typeHandler = typeHandlers[prop.type];
  let typedValue = typeHandler ? typeHandler(value, prop) : value;
  if (
    (value === undefined || value === null || value === "") &&
    prop.defaultValue !== undefined
  )
    typedValue = prop.defaultValue;

  if (
    prop.required === true &&
    (typedValue === undefined || typedValue === null || typedValue === "")
  )
    return ["required", null];
  if (!prop.required && (typedValue === null || typedValue === undefined)) {
    if (prop.type === "object" && typedValue === null) {
    } else return [null, typedValue];
  }

  const validation = validations[prop.type];
  if (validation) {
    const errors = validation(typedValue, prop);
    if (errors) return errors;
  }

  if (prop.format) {
    const formatFn =
      formats[prop.format] ||
      (typeof prop.format === "function" ? prop.format : null);

    if (formatFn) {
      const format =
        typeof formatFn === "function"
          ? formatFn
          : (value) => formatFn.test(value);
      const isValid = format(typedValue);
      if (!isValid) return ["invalid", `invalid format: ${prop.format}`];
    }
  }

  return [null, typedValue];
};

/**
 * Prototype for methods to be attached to type definition objects.
 * @private
 */
const TypeDefinitionPrototype = {
  /**
   * Validates a value against this type definition.
   * @param {*} value - The value to validate.
   * @param {Object} [context={}] - Additional context for validation.
   * @returns {{valid: boolean, value: *, error: string|null, details: *|null}}
   */
  validate(value, context = {}) {
    const [error, result] = validateField(value, this, context);

    if (error) {
      return {
        valid: false,
        error: error,
        details: result,
        value: value,
      };
    }

    return {
      valid: true,
      value: result,
      error: null,
      details: null,
    };
  },
};

function interpolate(str, data) {
  return str.replace(/\${(.*?)}/g, (_, key) => {
    return data[key.trim()];
  });
}

/**
 * Validates an object against a type schema
 * @param {Object} object - Object to validate
 * @param {Object} options - Validation options
 * @param {Object} options.schema - Type schema to validate against
 * @param {Object} [options.row={}] - Original row data for context
 * @param {boolean} [options.undefinedProps=true] - Validate undefined props
 * @param {boolean} [options.validateVirtual=false] - Validate virtual properties
 * @param {string} [options.operation=null] - Operation context (add, edit, etc.)
 * @returns {Array} [errors, validatedObject] tuple
 */
const validateType = (
  object,
  {
    schema,
    row = {},
    undefinedProps = true,
    validateVirtual = false,
    operation = null,
  },
) => {
  if (!schema) return [null, object];
  const errors = {};
  let hasError = false;

  const context = { operation, row };

  const props = undefinedProps ? schema : object;
  for (const key in props) {
    const prop = { ...schema[key], key };
    if ("virtual" in prop || prop.persist === false) continue;
    const shouldValidate =
      prop.customValidator || object[key] !== undefined || prop.required;

    const [error, value] = shouldValidate
      ? validateField(object[key], prop, context)
      : [null, prop.defaultValue];

    if (error) {
      hasError = true;
      errors[key] = error;
    } else if (value !== undefined) object[key] = value;
  }
  const virtual = Object.fromEntries(
    Object.entries(schema).filter(([_, prop]) => "virtual" in prop),
  );
  for (const prop in virtual) {
    if (validateVirtual) {
      const [error, value] = validateField(
        interpolate(virtual[prop].virtual, { ...row, ...object }),
        virtual[prop],
        context,
      );
      if (error) {
        hasError = true;
        errors[prop] = error;
      } else if (value !== undefined) object[prop] = value;
    } else
      object[prop] = interpolate(virtual[prop].virtual, { ...row, ...object });
  }

  if (hasError) return [errors, null];
  return [null, object];
};

/**
 * Creates a type definition object
 * @param {string} type - Type name (string, number, boolean, etc.)
 * @param {*|Object} options - Default value or options object
 * @returns {Object} Type definition
 */
const createType = (type, options) => {
  const normalizedOptions =
    typeof options === "object" && !Array.isArray(options) && options !== null
      ? options
      : { defaultValue: options };

  const typeDef = {
    type,
    persist: true,
    attribute: !["array", "object", "function"].includes(type),
    ...normalizedOptions,
  };

  Object.setPrototypeOf(typeDef, TypeDefinitionPrototype);

  return typeDef;
};

/**
 * Type system helper functions
 * @type {Object}
 */
const typesHelpers = {
  createType,
  parse,
  validateType,
};

/** @type {Object} Extension registry for custom type creators */
const customTypeCreators = {};

/**
 * Registers a type system extension
 * @param {Object} extension - Extension object with types property
 * @param {Object} [extension.types] - Custom type creator functions
 */
const registerExtension = (extension) => {
  if (extension.types) {
    Object.assign(customTypeCreators, extension.types);
  }
};

typesHelpers.registerExtension = registerExtension;

/**
 * Creates a relationship type factory function
 * @private
 * @param {string} relationship - Relationship type (belongs, many, one, etc.)
 * @returns {Function} Type factory function
 */
const createRelationType =
  (relationship) =>
  (...args) => {
    const targetModel = args[0];
    let targetForeignKey;
    let options = args[2];
    if (typeof args[1] === "string") targetForeignKey = args[1];
    else options = args[1];
    const belongs = belongTypes.includes(relationship);

    const typeDef = {
      type: belongs
        ? relationship === "belongs_many"
          ? "array"
          : "string"
        : relationship === "one"
          ? "string"
          : "array",
      many: manyTypes.includes(relationship),
      belongs,
      persist: belongs,
      relationship,
      defaultValue: relationship === "belongs_many" ? [] : null,
      polymorphic: targetModel === "*" || Array.isArray(targetModel),
      targetModel,
      targetForeignKey,
      index: belongTypes.includes(relationship),
      ...options,
    };

    Object.setPrototypeOf(typeDef, TypeDefinitionPrototype);

    return typeDef;
  };

const relationshipTypes = ["one", "many", "belongs", "belongs_many"];
const manyTypes = ["many", "belongs_many"];
const belongTypes = ["belongs", "belongs_many"];
const proxyHandler = {
  get(target, prop) {
    if (target[prop]) return target[prop];
    if (customTypeCreators[prop]) return customTypeCreators[prop];

    const type = prop.toLowerCase();
    if (relationshipTypes.includes(prop)) return createRelationType(prop);

    // T.union({ types: [T.string(), T.number()] }) => "string | number"
    if (prop === "union") {
      return (options = {}) => {
        const typeDef = {
          type: "union",
          types: options.types || [], // Array of T.* type definitions
          persist: true,
          attribute: false,
          ...options,
        };
        Object.setPrototypeOf(typeDef, TypeDefinitionPrototype);
        return typeDef;
      };
    }

    // T.function({ args: [T.string()], returns: T.boolean() })
    if (prop === "function") {
      return (options = {}) => {
        const typeDef = {
          type: "function",
          args: options.args || [], // Array of T.* type definitions
          returns: options.returns || null, // Return type (T.*)
          persist: false,
          attribute: false,
          ...options,
        };
        Object.setPrototypeOf(typeDef, TypeDefinitionPrototype);
        return typeDef;
      };
    }

    return (options = {}) => {
      if (!typeHandlers[type]) throw new Error(`Unknown type: ${type}`);
      return createType(type, options);
    };
  },
};

const Types = new Proxy(typesHelpers, proxyHandler);

Types.registerExtension(timestampExt);
export default Types;
