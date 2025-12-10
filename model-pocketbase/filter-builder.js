/**
 * @file PocketBase Filter Builder
 * @description Translates Model API where clauses to PocketBase filter syntax
 */

/**
 * Escape a value for use in PocketBase filter string
 * @private
 */
function escapeValue(value) {
  if (typeof value === 'string') {
    // Escape single quotes in strings
    return `'${value.replace(/'/g, "\\'")}'`;
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(escapeValue).join(', ')}]`;
  }
  return String(value);
}

/**
 * Build a filter condition for a single field
 * @private
 */
function buildFieldCondition(field, condition) {
  // Simple equality
  if (typeof condition !== 'object' || condition === null) {
    return `${field} = ${escapeValue(condition)}`;
  }

  // Operator-based conditions
  const conditions = [];
  for (const [operator, value] of Object.entries(condition)) {
    switch (operator) {
      case '>':
        conditions.push(`${field} > ${escapeValue(value)}`);
        break;
      case '>=':
        conditions.push(`${field} >= ${escapeValue(value)}`);
        break;
      case '<':
        conditions.push(`${field} < ${escapeValue(value)}`);
        break;
      case '<=':
        conditions.push(`${field} <= ${escapeValue(value)}`);
        break;
      case '!=':
      case '<>':
        conditions.push(`${field} != ${escapeValue(value)}`);
        break;
      case 'in':
        if (Array.isArray(value)) {
          conditions.push(`${field} IN ${escapeValue(value)}`);
        } else {
          throw new Error(`'in' operator requires an array value`);
        }
        break;
      case 'not in':
        if (Array.isArray(value)) {
          conditions.push(`${field} NOT IN ${escapeValue(value)}`);
        } else {
          throw new Error(`'not in' operator requires an array value`);
        }
        break;
      case 'like':
        conditions.push(`${field} ~ ${escapeValue(value)}`);
        break;
      case 'ilike':
        // PocketBase uses ~ for case-insensitive matching by default
        conditions.push(`${field} ~ ${escapeValue(value)}`);
        break;
      case 'is null':
        conditions.push(`${field} = null`);
        break;
      case 'is not null':
        conditions.push(`${field} != null`);
        break;
      default:
        // Fallback to equality
        conditions.push(`${field} = ${escapeValue(value)}`);
    }
  }

  // Combine multiple conditions for same field with AND
  return conditions.length > 1
    ? `(${conditions.join(' && ')})`
    : conditions[0];
}

/**
 * Build a PocketBase filter string from Model API where clause
 * @param {Object} where - Where clause object
 * @returns {string} PocketBase filter string
 *
 * @example
 * buildFilterString({ status: 'active' })
 * // Returns: "status = 'active'"
 *
 * @example
 * buildFilterString({ status: 'active', age: { '>': 18 } })
 * // Returns: "status = 'active' && age > 18"
 *
 * @example
 * buildFilterString({ role: { in: ['admin', 'moderator'] } })
 * // Returns: "role IN ['admin', 'moderator']"
 */
export function buildFilterString(where) {
  if (!where || typeof where !== 'object') {
    return '';
  }

  const conditions = [];

  for (const [field, condition] of Object.entries(where)) {
    conditions.push(buildFieldCondition(field, condition));
  }

  // Combine all field conditions with AND
  return conditions.join(' && ');
}

/**
 * Validate where clause structure
 * @param {Object} where - Where clause to validate
 * @returns {boolean}
 * @throws {Error} If where clause is invalid
 */
export function validateWhereClause(where) {
  if (!where || typeof where !== 'object') {
    throw new Error('Where clause must be an object');
  }

  for (const [field, condition] of Object.entries(where)) {
    if (typeof field !== 'string') {
      throw new Error(`Field name must be a string, got ${typeof field}`);
    }

    if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
      const validOperators = ['>', '>=', '<', '<=', '!=', '<>', 'in', 'not in', 'like', 'ilike', 'is null', 'is not null'];
      for (const operator of Object.keys(condition)) {
        if (!validOperators.includes(operator)) {
          console.warn(`Unknown operator "${operator}" for field "${field}"`);
        }
      }
    }
  }

  return true;
}

export default {
  buildFilterString,
  validateWhereClause,
};
