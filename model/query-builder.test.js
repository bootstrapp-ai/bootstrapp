import Testing from "../base/test/index.js";
import {
  parseOrder,
  matchesWhere,
  applyOrder,
  applyPagination,
  buildQueryResult,
  validateQueryOptions,
} from "./query-builder.js";

const { describe, it, assert } = Testing;

Testing.suite("Query Builder", () => {
  describe("parseOrder", () => {
    it("should return empty array for falsy input", () => {
      assert.deepEqual(parseOrder(null), []);
      assert.deepEqual(parseOrder(undefined), []);
      assert.deepEqual(parseOrder(""), []);
    });

    it("should return array as-is", () => {
      const order = [{ field: "name", direction: "ASC" }];
      assert.deepEqual(parseOrder(order), order);
    });

    it("should parse single field with direction", () => {
      assert.deepEqual(parseOrder("name ASC"), [
        { field: "name", direction: "ASC" },
      ]);
      assert.deepEqual(parseOrder("age DESC"), [
        { field: "age", direction: "DESC" },
      ]);
    });

    it("should default to ASC direction", () => {
      assert.deepEqual(parseOrder("name"), [
        { field: "name", direction: "ASC" },
      ]);
    });

    it("should parse multiple fields", () => {
      assert.deepEqual(parseOrder("age DESC, name ASC"), [
        { field: "age", direction: "DESC" },
        { field: "name", direction: "ASC" },
      ]);
    });

    it("should handle lowercase direction", () => {
      assert.deepEqual(parseOrder("name asc"), [
        { field: "name", direction: "ASC" },
      ]);
    });
  });

  describe("matchesWhere", () => {
    it("should return true for empty where clause", () => {
      assert.isTrue(matchesWhere({ name: "test" }, null));
      assert.isTrue(matchesWhere({ name: "test" }, undefined));
      assert.isTrue(matchesWhere({ name: "test" }, {}));
    });

    it("should match direct equality", () => {
      assert.isTrue(matchesWhere({ name: "John" }, { name: "John" }));
      assert.isFalse(matchesWhere({ name: "John" }, { name: "Jane" }));
    });

    it("should match multiple conditions (AND)", () => {
      const record = { name: "John", age: 30 };
      assert.isTrue(matchesWhere(record, { name: "John", age: 30 }));
      assert.isFalse(matchesWhere(record, { name: "John", age: 25 }));
    });

    it("should handle id field with string coercion", () => {
      assert.isTrue(matchesWhere({ id: "123" }, { id: 123 }));
      assert.isTrue(matchesWhere({ id: 123 }, { id: "123" }));
    });

    it("should handle > operator", () => {
      assert.isTrue(matchesWhere({ age: 30 }, { age: { ">": 25 } }));
      assert.isFalse(matchesWhere({ age: 20 }, { age: { ">": 25 } }));
    });

    it("should handle >= operator", () => {
      assert.isTrue(matchesWhere({ age: 25 }, { age: { ">=": 25 } }));
      assert.isTrue(matchesWhere({ age: 30 }, { age: { ">=": 25 } }));
      assert.isFalse(matchesWhere({ age: 20 }, { age: { ">=": 25 } }));
    });

    it("should handle < operator", () => {
      assert.isTrue(matchesWhere({ age: 20 }, { age: { "<": 25 } }));
      assert.isFalse(matchesWhere({ age: 30 }, { age: { "<": 25 } }));
    });

    it("should handle <= operator", () => {
      assert.isTrue(matchesWhere({ age: 25 }, { age: { "<=": 25 } }));
      assert.isTrue(matchesWhere({ age: 20 }, { age: { "<=": 25 } }));
      assert.isFalse(matchesWhere({ age: 30 }, { age: { "<=": 25 } }));
    });

    it("should handle != operator", () => {
      assert.isTrue(matchesWhere({ status: "active" }, { status: { "!=": "deleted" } }));
      assert.isFalse(matchesWhere({ status: "deleted" }, { status: { "!=": "deleted" } }));
    });

    it("should handle <> operator", () => {
      assert.isTrue(matchesWhere({ status: "active" }, { status: { "<>": "deleted" } }));
    });

    it("should handle 'in' operator", () => {
      assert.isTrue(matchesWhere({ status: "active" }, { status: { in: ["active", "pending"] } }));
      assert.isFalse(matchesWhere({ status: "deleted" }, { status: { in: ["active", "pending"] } }));
    });

    it("should handle 'not in' operator", () => {
      assert.isTrue(matchesWhere({ status: "active" }, { status: { "not in": ["deleted", "archived"] } }));
      assert.isFalse(matchesWhere({ status: "deleted" }, { status: { "not in": ["deleted", "archived"] } }));
    });

    it("should handle 'like' operator", () => {
      assert.isTrue(matchesWhere({ name: "John Doe" }, { name: { like: "John" } }));
      assert.isFalse(matchesWhere({ name: "Jane Doe" }, { name: { like: "John" } }));
    });

    it("should handle 'ilike' operator (case insensitive)", () => {
      assert.isTrue(matchesWhere({ name: "JOHN DOE" }, { name: { ilike: "john" } }));
      assert.isTrue(matchesWhere({ name: "john doe" }, { name: { ilike: "JOHN" } }));
    });

    it("should handle 'is null' operator", () => {
      assert.isTrue(matchesWhere({ field: null }, { field: { "is null": true } }));
      assert.isTrue(matchesWhere({ field: undefined }, { field: { "is null": true } }));
      assert.isFalse(matchesWhere({ field: "value" }, { field: { "is null": true } }));
    });

    it("should handle 'is not null' operator", () => {
      assert.isTrue(matchesWhere({ field: "value" }, { field: { "is not null": true } }));
      assert.isFalse(matchesWhere({ field: null }, { field: { "is not null": true } }));
    });
  });

  describe("applyOrder", () => {
    it("should return records unchanged for empty order", () => {
      const records = [{ name: "B" }, { name: "A" }];
      assert.deepEqual(applyOrder(records, null), records);
      assert.deepEqual(applyOrder(records, ""), records);
    });

    it("should return empty for falsy records", () => {
      assert.deepEqual(applyOrder(null, "name ASC"), null);
      assert.deepEqual(applyOrder([], "name ASC"), []);
    });

    it("should sort by single field ASC", () => {
      const records = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const sorted = applyOrder(records, "name ASC");
      assert.equal(sorted[0].name, "Alice");
      assert.equal(sorted[1].name, "Bob");
      assert.equal(sorted[2].name, "Charlie");
    });

    it("should sort by single field DESC", () => {
      const records = [{ name: "Alice" }, { name: "Charlie" }, { name: "Bob" }];
      const sorted = applyOrder(records, "name DESC");
      assert.equal(sorted[0].name, "Charlie");
      assert.equal(sorted[1].name, "Bob");
      assert.equal(sorted[2].name, "Alice");
    });

    it("should sort by multiple fields", () => {
      const records = [
        { lastName: "Smith", firstName: "Bob" },
        { lastName: "Smith", firstName: "Alice" },
        { lastName: "Jones", firstName: "Charlie" },
      ];
      const sorted = applyOrder(records, "lastName ASC, firstName ASC");
      assert.equal(sorted[0].lastName, "Jones");
      assert.equal(sorted[1].firstName, "Alice");
      assert.equal(sorted[2].firstName, "Bob");
    });

    it("should not mutate original array", () => {
      const records = [{ name: "B" }, { name: "A" }];
      const sorted = applyOrder(records, "name ASC");
      assert.equal(records[0].name, "B");
      assert.equal(sorted[0].name, "A");
    });
  });

  describe("applyPagination", () => {
    it("should return empty array for falsy records", () => {
      assert.deepEqual(applyPagination(null), []);
      assert.deepEqual(applyPagination(undefined), []);
    });

    it("should return records unchanged when no limit or offset", () => {
      const records = [{ id: 1 }, { id: 2 }];
      assert.deepEqual(applyPagination(records), records);
    });

    it("should apply limit", () => {
      const records = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = applyPagination(records, 2);
      assert.equal(result.length, 2);
      assert.equal(result[0].id, 1);
      assert.equal(result[1].id, 2);
    });

    it("should apply offset", () => {
      const records = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = applyPagination(records, undefined, 1);
      assert.equal(result.length, 2);
      assert.equal(result[0].id, 2);
    });

    it("should apply limit and offset together", () => {
      const records = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const result = applyPagination(records, 2, 1);
      assert.equal(result.length, 2);
      assert.equal(result[0].id, 2);
      assert.equal(result[1].id, 3);
    });
  });

  describe("buildQueryResult", () => {
    const records = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "Diana", age: 28 },
    ];

    it("should return all records with empty options", () => {
      const result = buildQueryResult(records, {});
      assert.equal(result.items.length, 4);
      assert.equal(result.count, 4);
      assert.equal(result.total, 4);
    });

    it("should filter by where clause", () => {
      const result = buildQueryResult(records, { where: { age: { ">": 28 } } });
      assert.equal(result.items.length, 2);
      assert.equal(result.count, 2);
    });

    it("should sort results", () => {
      const result = buildQueryResult(records, { order: "name ASC" });
      assert.equal(result.items[0].name, "Alice");
      assert.equal(result.items[3].name, "Diana");
    });

    it("should paginate results", () => {
      const result = buildQueryResult(records, { limit: 2, offset: 1 });
      assert.equal(result.items.length, 2);
      assert.equal(result.limit, 2);
      assert.equal(result.offset, 1);
      assert.equal(result.total, 4);
    });

    it("should combine filter, sort, and pagination", () => {
      const result = buildQueryResult(records, {
        where: { age: { ">=": 25 } },
        order: "age DESC",
        limit: 2,
      });
      assert.equal(result.items.length, 2);
      assert.equal(result.items[0].name, "Charlie");
      assert.equal(result.items[1].name, "Alice");
      assert.equal(result.total, 4);
    });
  });

  describe("validateQueryOptions", () => {
    it("should pass for empty options", () => {
      assert.isTrue(validateQueryOptions({}));
      assert.isTrue(validateQueryOptions());
    });

    it("should pass for valid options", () => {
      assert.isTrue(validateQueryOptions({
        limit: 10,
        offset: 0,
        where: { name: "test" },
      }));
    });

    it("should throw for negative limit", () => {
      assert.throws(() => validateQueryOptions({ limit: -1 }), /limit must be a positive number/);
    });

    it("should throw for non-number limit", () => {
      assert.throws(() => validateQueryOptions({ limit: "10" }), /limit must be a positive number/);
    });

    it("should throw for negative offset", () => {
      assert.throws(() => validateQueryOptions({ offset: -1 }), /offset must be a non-negative number/);
    });

    it("should throw for non-object where", () => {
      assert.throws(() => validateQueryOptions({ where: "invalid" }), /where must be an object/);
    });

    it("should throw for null where", () => {
      assert.throws(() => validateQueryOptions({ where: null }), /where must be an object/);
    });
  });
});
