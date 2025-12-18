import Testing from "../base/test/index.js";
import T from "./index.js";

const { describe, it, assert } = Testing;

Testing.suite("Types", () => {
  describe("String Type", () => {
    it("should create a string type", () => {
      const stringType = T.string();

      assert.ok(stringType, "Should create string type");
      assert.equal(stringType.type, "string");
    });

    it("should validate string values", () => {
      const stringType = T.string();

      const validResult = stringType.validate("hello");
      assert.isTrue(validResult.valid, "Should validate string");
      assert.equal(validResult.value, "hello");
    });

    it("should coerce numbers to strings", () => {
      const stringType = T.string();

      const result = stringType.validate(123);
      assert.isTrue(result.valid, "Validation should be true");
      assert.equal(result.value, "123", "Value should be coerced to string");
    });

    it("should handle default values", () => {
      const stringType = T.string({ defaultValue: "default" });
      assert.equal(stringType.defaultValue, "default");

      const result = stringType.validate(undefined);
      assert.isTrue(result.valid, "Validation should be true for default");
      assert.equal(result.value, "default", "Value should be default");
    });

    it("should handle required validation", () => {
      const stringType = T.string({ required: true });

      const emptyResult = stringType.validate("");
      assert.isFalse(
        emptyResult.valid,
        "Empty string should fail required validation",
      );
      assert.equal(emptyResult.error, "required");

      const nullResult = stringType.validate(null);
      assert.isFalse(nullResult.valid, "Null should fail required validation");
      assert.equal(nullResult.error, "required");

      const undefinedResult = stringType.validate(undefined);
      assert.isFalse(
        undefinedResult.valid,
        "Undefined should fail required validation",
      );
      assert.equal(undefinedResult.error, "required");

      const validResult = stringType.validate("value");
      assert.isTrue(validResult.valid, "Non-empty string should pass");
    });
  });

  describe("Number Type", () => {
    it("should create a number type", () => {
      const numberType = T.number();

      assert.ok(numberType, "Should create number type");
      assert.equal(numberType.type, "number");
    });

    it("should validate number values", () => {
      const numberType = T.number();

      const validResult = numberType.validate(42);
      assert.isTrue(validResult.valid);
      assert.equal(validResult.value, 42);
    });

    it("should coerce string numbers", () => {
      const numberType = T.number();

      const result = numberType.validate("123");
      assert.isTrue(result.valid, "Validation should pass");
      assert.equal(result.value, 123, "Value should be coerced to number");
      assert.equal(typeof result.value, "number");
    });

    it("should handle decimal numbers", () => {
      const numberType = T.number();

      const result = numberType.validate(3.14);
      assert.isTrue(result.valid);
      assert.equal(result.value, 3.14);
    });

    it("should handle negative numbers", () => {
      const numberType = T.number();

      const result = numberType.validate(-42);
      assert.isTrue(result.valid);
      assert.equal(result.value, -42);
    });

    it("should reject non-numeric strings", () => {
      const numberType = T.number();

      const result = numberType.validate("not a number");
      assert.isFalse(result.valid, "Should reject non-numeric string");
      assert.equal(result.error, "NaN");
    });
  });

  describe("Boolean Type", () => {
    it("should create a boolean type", () => {
      const boolType = T.boolean();

      assert.ok(boolType, "Should create boolean type");
      assert.equal(boolType.type, "boolean");
    });

    it("should validate boolean values", () => {
      const boolType = T.boolean();

      const trueResult = boolType.validate(true);
      const falseResult = boolType.validate(false);

      assert.isTrue(trueResult.valid);
      assert.isTrue(falseResult.valid);
      assert.isTrue(trueResult.value);
      assert.isFalse(falseResult.value);
    });

    it("should coerce string booleans", () => {
      const boolType = T.boolean();

      const trueResult = boolType.validate("true");
      const falseResult = boolType.validate("false");

      assert.isTrue(trueResult.valid, "Validation for 'true' string failed");
      assert.isTrue(falseResult.valid, "Validation for 'false' string failed");
      assert.isTrue(trueResult.value, "'true' string should coerce to true");
      assert.isFalse(
        falseResult.value,
        "'false' string should coerce to false",
      );
    });

    it("should handle truthy/falsy coercion", () => {
      const boolType = T.boolean();

      const truthyResult = boolType.validate(1);
      const falsyResult = boolType.validate(0);

      assert.isTrue(truthyResult.valid, "Validation for 1 failed");
      assert.isTrue(falsyResult.valid, "Validation for 0 failed");
      assert.isTrue(truthyResult.value, "1 should coerce to true");
      assert.isFalse(falsyResult.value, "0 should coerce to false");
    });
  });

  describe("Array Type", () => {
    it("should create an array type", () => {
      const arrayType = T.array();

      assert.ok(arrayType, "Should create array type");
      assert.equal(arrayType.type, "array");
    });

    it("should validate arrays", () => {
      const arrayType = T.array();

      const result = arrayType.validate([1, 2, 3]);
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, [1, 2, 3]);
    });

    it("should handle empty arrays", () => {
      const arrayType = T.array();

      const result = arrayType.validate([]);
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, []);
    });

    it("should handle default array values", () => {
      const arrayType = T.array({ defaultValue: [1, 2, 3] });

      assert.deepEqual(arrayType.defaultValue, [1, 2, 3]);

      const result = arrayType.validate(undefined);
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, [1, 2, 3]);
    });

    it("should coerce JSON strings to arrays", () => {
      const arrayType = T.array();

      const result = arrayType.validate('[1, "b", 3]');
      assert.isTrue(result.valid, "JSON string array should be valid");
      assert.deepEqual(
        result.value,
        [1, "b", 3],
        "Should convert JSON string to array",
      );
    });

    it("should coerce to empty array for non-JSON strings", () => {
      const arrayType = T.array();
      const result = arrayType.validate("a,b,c");
      assert.isTrue(result.valid);
      assert.deepEqual(
        result.value,
        [],
        "Should coerce non-JSON string to empty array",
      );
    });

    it("should coerce to empty array for non-array primitives", () => {
      const arrayType = T.array();

      const result = arrayType.validate(123);
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, [], "Should coerce number to empty array");
    });
  });

  describe("Object Type", () => {
    it("should create an object type", () => {
      const objectType = T.object();

      assert.ok(objectType, "Should create object type");
      assert.equal(objectType.type, "object");
    });

    it("should validate objects", () => {
      const objectType = T.object();

      const result = objectType.validate({ key: "value" });
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, { key: "value" });
    });

    it("should handle nested objects", () => {
      const objectType = T.object();

      const nested = {
        level1: {
          level2: {
            value: "deep",
          },
        },
      };

      const result = objectType.validate(nested);
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, nested);
    });

    it("should handle empty objects", () => {
      const objectType = T.object();

      const result = objectType.validate({});
      assert.isTrue(result.valid);
      assert.deepEqual(result.value, {});
    });

    it("should define object properties schema", () => {
      const objectType = T.object({
        properties: {
          name: T.string(),
          age: T.number(),
        },
      });

      assert.ok(objectType.properties, "Should have properties schema");
    });

    it("should reject null as object", () => {
      const objectType = T.object();

      const result = objectType.validate(null);
      assert.isFalse(result.valid, "null should not be a valid object");
      assert.equal(result.error, "invalid");
    });

    it("should reject primitives as object", () => {
      const objectType = T.object();
      const result = objectType.validate(123);
      assert.isFalse(result.valid, "number should not be a valid object");
      assert.equal(result.error, "invalid");
    });
  });

  describe("Date Type", () => {
    it("should create a date type", () => {
      const dateType = T.date();

      assert.ok(dateType, "Should create date type");
      assert.equal(dateType.type, "date");
    });

    it("should validate Date objects", () => {
      const dateType = T.date();
      const now = new Date();

      const result = dateType.validate(now);
      assert.isTrue(result.valid);
      assert.equal(result.value, now);
    });

    it("should coerce ISO strings to dates", () => {
      const dateType = T.date();
      const isoString = "2023-01-01T00:00:00.000Z";
      const date = new Date(isoString);

      const result = dateType.validate(isoString);
      assert.isTrue(result.valid);
      assert.ok(result.value instanceof Date, "Should be a Date object");
      assert.equal(result.value.getTime(), date.getTime());
    });

    it("should coerce timestamps to dates", () => {
      const dateType = T.date();
      const timestamp = Date.now();
      const date = new Date(timestamp);

      const result = dateType.validate(timestamp);
      assert.isTrue(result.valid);
      assert.ok(result.value instanceof Date, "Should be a Date object");
      assert.equal(result.value.getTime(), date.getTime());
    });

    it("should reject invalid date strings", () => {
      const dateType = T.date();

      const result = dateType.validate("not a date");
      assert.isFalse(result.valid, "Invalid date string should fail");
      assert.equal(result.error, "invalid");
    });
  });

  describe("Datetime Type", () => {
    it("should create a datetime type", () => {
      const datetimeType = T.datetime();

      assert.ok(datetimeType, "Should create datetime type");
      assert.equal(datetimeType.type, "datetime");
    });

    it("should handle ISO datetime strings", () => {
      const datetimeType = T.datetime();
      const isoString = new Date().toISOString();

      const result = datetimeType.validate(isoString);
      assert.isTrue(result.valid);
      assert.ok(result.value instanceof Date);
    });

    it("should reject invalid datetime strings", () => {
      const datetimeType = T.datetime();
      const result = datetimeType.validate("not a datetime");
      assert.isFalse(result.valid);
      assert.equal(result.error, "invalid");
    });
  });

  describe("Relationship Types", () => {
    it("should create a belongs relationship", () => {
      const belongsType = T.belongs("user");

      assert.ok(belongsType, "Should create belongs type");
      assert.equal(belongsType.relationship, "belongs");
      assert.equal(belongsType.targetModel, "user");
      assert.equal(belongsType.type, "string"); // Belongs is a foreign key
    });

    it("should create a many relationship", () => {
      const manyType = T.many("post");

      assert.ok(manyType, "Should create many type");
      assert.equal(manyType.relationship, "many");
      assert.equal(manyType.targetModel, "post");
      assert.equal(manyType.type, "array"); // Many is an array of keys
    });

    it("should create a one relationship", () => {
      const oneType = T.one("profile");

      assert.ok(oneType, "Should create one type");
      assert.equal(oneType.relationship, "one");
      assert.equal(oneType.targetModel, "profile");
      assert.equal(oneType.type, "string"); // One is a foreign key
    });

    it("should handle relationship options", () => {
      const belongsType = T.belongs("user", "userId", { custom: true });
      assert.equal(belongsType.targetForeignKey, "userId");
      assert.equal(belongsType.custom, true);

      const belongsType2 = T.belongs("user", { custom: true });
      assert.equal(belongsType2.targetForeignKey, undefined);
      assert.equal(belongsType2.custom, true);
    });

    it("should validate relationships (coerce to ID)", () => {
      const belongsType = T.belongs("user");
      const user = { id: "user_123", name: "Test" };
      const result = belongsType.validate(user);

      assert.isTrue(result.valid);
      assert.equal(result.value, "user_123", "Should coerce object to its ID");

      const result2 = belongsType.validate("user_123");
      assert.isTrue(result2.valid);
      assert.equal(result2.value, "user_123", "Should accept a string ID");
    });
  });

  describe("Type Options", () => {
    it("should set default values", () => {
      const stringType = T.string({ defaultValue: "default" });
      const numberType = T.number({ defaultValue: 0 });
      const boolType = T.boolean({ defaultValue: false });

      assert.equal(stringType.defaultValue, "default");
      assert.equal(numberType.defaultValue, 0);
      assert.equal(boolType.defaultValue, false);
    });

    it("should set required flag", () => {
      const requiredType = T.string({ required: true });
      const optionalType = T.string({ required: false });

      assert.isTrue(requiredType.required);
      assert.isFalse(optionalType.required);
    });

    it("should set primary key flag", () => {
      const primaryType = T.number({ primary: true });

      assert.isTrue(primaryType.primary);
    });

    it("should set unique flag", () => {
      const uniqueType = T.string({ unique: true });

      assert.isTrue(uniqueType.unique);
    });

    it("should accept custom validators", () => {
      const customType = T.string({
        customValidator: (value) =>
          value.length > 5 ? null : ["too_short", null],
      });

      assert.equal(typeof customType.customValidator, "function");

      const goodResult = customType.validate("long enough");
      assert.isTrue(goodResult.valid);

      const badResult = customType.validate("short");
      assert.isFalse(badResult.valid);
      assert.equal(badResult.error, "too_short");
    });
  });

  describe("Validation", () => {
    it("should validate email format", () => {
      const emailType = T.string({ format: "email" });

      const validEmail = emailType.validate("test@example.com");
      const invalidEmail = emailType.validate("not-an-email");

      assert.isTrue(validEmail.valid, "Valid email should pass");
      assert.isFalse(invalidEmail.valid, "Invalid email should fail");
      assert.equal(invalidEmail.error, "invalid");
    });

    it("should run custom validators", () => {
      const ageType = T.number({
        customValidator: (value) =>
          value >= 18 && value <= 100 ? null : ["invalid_age", null],
      });

      const validAge = ageType.validate(25);
      const tooYoung = ageType.validate(15);
      const tooOld = ageType.validate(150);

      assert.isTrue(validAge.valid);
      assert.isFalse(tooYoung.valid);
      assert.equal(tooYoung.error, "invalid_age");
      assert.isFalse(tooOld.valid);
      assert.equal(tooOld.error, "invalid_age");
    });

    it("should provide validation errors", () => {
      const requiredType = T.string({ required: true });

      const result = requiredType.validate("");

      assert.isFalse(result.valid);
      assert.ok(result.error, "Should have error message");
      assert.equal(result.error, "required");
    });
  });

  describe("Type Coercion", () => {
    it("should coerce between compatible types", () => {
      const numberType = T.number();

      const fromString = numberType.validate("42");
      const fromBoolean = numberType.validate(true);

      assert.isTrue(fromString.valid);
      assert.equal(fromString.value, 42);
      assert.equal(typeof fromString.value, "number");

      assert.isTrue(fromBoolean.valid);
      assert.equal(fromBoolean.value, 1); // true coerces to 1
      assert.equal(typeof fromBoolean.value, "number");
    });

    it("should preserve null values when not required", () => {
      const optionalString = T.string({ required: false });

      const result = optionalString.validate(null);

      assert.isTrue(
        result.valid,
        "Validation should pass for null on optional",
      );
      assert.equal(result.value, null, "Value should be null");
    });

    it("should use default for undefined values", () => {
      const stringType = T.string({ defaultValue: "default" });

      const result = stringType.validate(undefined);

      assert.isTrue(
        result.valid,
        "Validation should pass for undefined on default",
      );
      assert.equal(result.value, "default", "Value should be default");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large numbers", () => {
      const numberType = T.number();

      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = numberType.validate(largeNumber);

      assert.isTrue(result.valid);
      assert.equal(result.value, largeNumber);
    });

    it("should handle very long strings", () => {
      const stringType = T.string();

      const longString = "a".repeat(10000);
      const result = stringType.validate(longString);

      assert.isTrue(result.valid);
      assert.equal(result.value.length, 10000);
    });

    it("should handle deeply nested objects", () => {
      const objectType = T.object();

      let deep = { value: 1 };
      for (let i = 0; i < 100; i++) {
        deep = { nested: deep };
      }

      const result = objectType.validate(deep);
      assert.isTrue(result.valid);
    });

    it("should handle circular references gracefully", () => {
      const objectType = T.object();

      const circular = { name: "test" };
      circular.self = circular;

      try {
        const result = objectType.validate(circular);
        assert.isTrue(result.valid, "Should handle circular reference");
      } catch (e) {
        // Acceptable to throw on circular references
        assert.ok(
          e,
          "Threw an error on circular reference, which is acceptable",
        );
      }
    });

    it("should handle special numeric values", () => {
      const numberType = T.number();

      const infinity = numberType.validate(Infinity);
      const negInfinity = numberType.validate(-Infinity);
      const nan = numberType.validate(NaN);

      assert.isTrue(infinity.valid);
      assert.equal(infinity.value, Infinity);

      assert.isTrue(negInfinity.valid);
      assert.equal(negInfinity.value, -Infinity);

      assert.isFalse(nan.valid, "NaN should be invalid");
      assert.equal(nan.error, "NaN");
    });
  });

  describe("Type Extensions", () => {
    it("should support function types", () => {
      const funcType = T.function();

      assert.equal(funcType.type, "function");

      const fn = () => {};
      const result = funcType.validate(fn);
      assert.isTrue(result.valid);
      assert.equal(result.value, fn);

      const badResult = funcType.validate("not a function");
      assert.isTrue(badResult.valid); // 'any' type behavior
      assert.equal(badResult.value, "not a function");
    });

    it("should create type with all options", () => {
      const complexType = T.string({
        defaultValue: "default",
        required: true,
        unique: true,
        customValidator: (v) => (v.length > 3 ? null : ["too_short", null]),
        format: "email",
      });

      assert.equal(complexType.defaultValue, "default");
      assert.isTrue(complexType.required);
      assert.isTrue(complexType.unique);
      assert.equal(typeof complexType.customValidator, "function");
      assert.equal(complexType.format, "email");
    });
  });
});
