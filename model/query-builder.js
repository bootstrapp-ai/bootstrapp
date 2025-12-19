
export function parseOrder(order) {
  if (!order) return [];
  if (Array.isArray(order)) return order;

  return order.split(',').map(part => {
    const [field, direction = 'ASC'] = part.trim().split(/\s+/);
    return { field, direction: direction.toUpperCase() };
  });
}

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

export function applyPagination(records, limit, offset = 0) {
  if (!records) return [];
  if (!limit && !offset) return records;

  const start = offset || 0;
  const end = limit ? start + limit : undefined;

  return records.slice(start, end);
}

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
