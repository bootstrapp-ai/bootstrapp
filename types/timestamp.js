// ============================================================================
// Timestamp Extension
// Adds T.timestamp() with auto-creation and auto-update support
// ============================================================================

/**
 * Timestamp validator with auto-creation and auto-update logic
 * - Auto-creates timestamp on create operation if value is empty
 * - Auto-updates timestamp on update operation if `update: true` option is set
 * - Stores as unix timestamp (milliseconds since epoch)
 */
const timestampValidator = (value, prop, context = {}) => {
  const { operation } = context;
  const currentTime = Date.now();

  if (prop.update === true) {
    return [null, currentTime];
  }

  // Auto-create logic: create on insert if no value provided
  if (
    operation === "create" &&
    prop.create !== false &&
    (!value || value === "")
  ) {
    return [null, currentTime];
  }

  // If value is provided, validate and convert it
  if (value) {
    let timestamp;

    // Convert Date objects to timestamp
    if (value instanceof Date) {
      timestamp = value.getTime();
    }
    // Convert string dates to timestamp
    else if (typeof value === "string") {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return ["invalid_timestamp", null];
      }
      timestamp = date.getTime();
    }
    // Keep numbers as-is
    else if (typeof value === "number") {
      timestamp = value;
    } else {
      return ["invalid_timestamp", null];
    }

    // Check min/max constraints
    if (prop.min && timestamp < prop.min) {
      return ["minimum", null];
    }
    if (prop.max && timestamp > prop.max) {
      return ["maximum", null];
    }

    return [null, timestamp];
  }

  // No value and no auto-create
  return [null, null];
};

/**
 * Timestamp type creator
 * Usage:
 *   T.timestamp()                 // Auto-creates on insert only
 *   T.timestamp({ update: true }) // Auto-creates on insert, auto-updates on every update
 *   T.timestamp({ index: true })  // With database index
 *
 * Stores timestamps as numbers (milliseconds since epoch)
 */
const createTimestamp = (options = {}) => {
  return {
    type: "number",
    timestamp: true,
    index: true,
    persist: true,
    attribute: true,
    customValidator: timestampValidator,
    ...options,
  };
};

export default {
  types: {
    timestamp: createTimestamp,
  },
};
