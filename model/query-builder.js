/**
 * @file Query Builder Utilities
 * @description Common query building and filtering logic shared across adapters
 */

/**
 * Parse order string into structured format
 * @param {string|Array} order - Order specification
 * @returns {Array<{field: string, direction: 'ASC'|'DESC'}>}
 * @example
 * parseOrder('name ASC') => [{field: 'name', direction: 'ASC'}]
 * parseOrder('age DESC, name ASC') => [{field: 'age', direction: 'DESC'}, {field: 'name', direction: 'ASC'}]
 */
export function parseOrder(order) {
  if (!order) return [];
  if (Array.isArray(order)) return order;

  return order.split(',').map(part => {
    const [field, direction = 'ASC'] = part.trim().split(/\s+/);
    return { field, direction: direction.toUpperCase() };
  });
}

/**
 * Apply where filter to a record
 * @param {Object} record - Record to test
 * @param {Object} where - Filter conditions
 * @returns {boolean} True if record matches filter
 * @example
 * matchesWhere({age: 25}, {age: 25}) => true
 * matchesWhere({age: 30}, {age: {'>': 25}}) => true
 */
export function matchesWhere(record, where) {
  if (!where || Object.keys(where).length === 0) return true;

  return Object.entries(where).every(([field, condition]) => {
    const value = record[field];

    // Direct equality
    if (typeof condition !== 'object' || condition === null) {
      // Use string coercion for 'id' field to handle string/number mismatch
      // (PocketBase returns string IDs, but queries may use numbers)
      if (field === 'id') {
        return String(value) === String(condition);
      }
      return value === condition;
    }

    // Operator-based conditions
    return Object.entries(condition).every(([operator, expected]) => {
      switch (operator) {
        case '>':
          return value > expected;
        case '>=':
          return value >= expected;
        case '<':
          return value < expected;
        case '<=':
          return value <= expected;
        case '!=':
        case '<>':
          return value !== expected;
        case 'in':
          return Array.isArray(expected) && expected.includes(value);
        case 'not in':
          return Array.isArray(expected) && !expected.includes(value);
        case 'like':
          return typeof value === 'string' && value.includes(expected);
        case 'ilike':
          return typeof value === 'string' &&
                 value.toLowerCase().includes(expected.toLowerCase());
        case 'is null':
          return value === null || value === undefined;
        case 'is not null':
          return value !== null && value !== undefined;
        default:
          return value === expected;
      }
    });
  });
}

/**
 * Apply sorting to an array of records
 * @param {Array<Object>} records - Records to sort
 * @param {string|Array} order - Sort specification
 * @returns {Array<Object>} Sorted records
 */
export function applyOrder(records, order) {
  if (!order || !records || records.length === 0) return records;

  const orderArray = parseOrder(order);
  if (orderArray.length === 0) return records;

  return [...records].sort((a, b) => {
    for (const { field, direction } of orderArray) {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === bVal) continue;

      const comparison = aVal < bVal ? -1 : 1;
      return direction === 'DESC' ? -comparison : comparison;
    }
    return 0;
  });
}

/**
 * Apply limit and offset to an array of records
 * @param {Array<Object>} records - Records to paginate
 * @param {number} [limit] - Maximum records to return
 * @param {number} [offset=0] - Records to skip
 * @returns {Array<Object>} Paginated records
 */
export function applyPagination(records, limit, offset = 0) {
  if (!records) return [];
  if (!limit && !offset) return records;

  const start = offset || 0;
  const end = limit ? start + limit : undefined;

  return records.slice(start, end);
}

/**
 * Build a complete query result from options
 * @param {Array<Object>} allRecords - All available records
 * @param {Object} options - Query options
 * @param {Object} [options.where] - Filter conditions
 * @param {string|Array} [options.order] - Sort specification
 * @param {number} [options.limit] - Maximum records
 * @param {number} [options.offset] - Records to skip
 * @returns {Object} {items: Array, count: number, total: number}
 */
export function buildQueryResult(allRecords, options = {}) {
  const { where, order, limit, offset } = options;

  // Filter
  let filtered = where ? allRecords.filter(r => matchesWhere(r, where)) : allRecords;
  const total = filtered.length;

  // Sort
  if (order) {
    filtered = applyOrder(filtered, order);
  }

  // Paginate
  const items = applyPagination(filtered, limit, offset);

  return {
    items,
    count: total,
    total,
    limit,
    offset: offset || 0,
  };
}

/**
 * Validate query options
 * @param {Object} options - Query options to validate
 * @throws {Error} If options are invalid
 */
export function validateQueryOptions(options = {}) {
  const { limit, offset, where } = options;

  if (limit !== undefined) {
    if (typeof limit !== 'number' || limit < 0) {
      throw new Error('limit must be a positive number');
    }
  }

  if (offset !== undefined) {
    if (typeof offset !== 'number' || offset < 0) {
      throw new Error('offset must be a non-negative number');
    }
  }

  if (where !== undefined && (typeof where !== 'object' || where === null)) {
    throw new Error('where must be an object');
  }

  return true;
}

export default {
  parseOrder,
  matchesWhere,
  applyOrder,
  applyPagination,
  buildQueryResult,
  validateQueryOptions,
};
