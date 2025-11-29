# Type System API Documentation

This document outlines the API and primary use cases for the type validation and coercion library.

The library is primarily used in two ways:

1.  **Defining Component Properties:** To create a stable, public API for UI components, handling default values and coercion from attributes.
2.  **Defining Data Models:** To describe the schema for data models, including relationships, for validation and data integrity.

---

## Use Case 1: Component Properties

When defining a UI component, the `Types` library is used to define the `properties` object. This provides automatic type coercion (e.g., from a string attribute to a number), default values, and a clear API definition.

**Example: `simple-counter` Component**

```javascript
import { html } from "lit";
import T from "/node_modules/@bootstrapp/base/types/index.js";

export default {
  tag: "simple-counter",
  properties: {
    // T.number handles coercion from "5" to 5
    count: T.number({ defaultValue: 0 }),
    // T.function allows passing in callbacks
    onIncrement: T.function(),
  },
  render() {
    // ...
  },
};
````

For this use case, you will primarily use:

  * **Basic Types:** `T.string()`, `T.number()`, `T.boolean()`, `T.array()`, `T.object()`.
  * **`T.function()`:** For event handlers and callbacks.
  * **Options:** `defaultValue` is the most important option for component properties.

When a value is passed to the component, you can validate it individually using the `validate` method.

```javascript
const countProp = T.number({ defaultValue: 0 });

// An attribute setter might do this:
const result = countProp.validate("5");
// result = { valid: true, value: 5, ... }

this.count = result.value;
```

-----

## Use Case 2: Data Models

When defining data models, the `Types` library describes the schema, enforces validation rules, and defines relationships between models.

**Example: Blog Models**

```javascript
import T from "/node_modules/@bootstrapp/base/types/index.js";

const models = {
  Author: {
    name: T.string({ required: true }),
    email: T.string({ format: "email" }),
    // Defines a one-to-many relationship
    posts: T.many("Post", "author"),
  },
  Post: {
    title: T.string({ required: true }),
    content: T.string(),
    // Defines a one-to-one relationship
    author: T.belongs("Author", "posts"),
    publishedAt: T.datetime(),
  },
};
```

For this use case, you will use:

  * **Relationship Types:** `T.belongs()`, `T.many()`, `T.one()`, `T.belongs_many()`.
  * **Validation Options:** `required`, `min`, `max`, `format`, `customValidator`.
  * **Schema Validation:** The `T.validateType()` function to validate an entire object at once (e.g., before saving to a database).

<!-- end list -->

```javascript
const newPost = {
  // 'title' is missing, but it's required
  content: "This is a new post.",
  author: { id: "author_123" }, // Will be coerced to "author_123"
};

const [errors, validatedPost] = T.validateType(newPost, {
  schema: models.Post,
});

/*
errors = {
  title: "required"
}
validatedPost = null
*/
```

-----

## API Reference

### `typeDefinition.validate(value)`

*Best for: Component property setters*

This method is available on every type definition. It validates a single value against that type's rules.

**Returns:** `Object`

| Property | Type | Description |
| :--- | :--- | :--- |
| `valid` | `boolean` | `true` if validation passed. |
| `value` | `*` | The coerced and validated value. |
| `error` | `string` | A short error code (e.g., "required", "invalid") if validation failed. |
| `details` | `*` | Any additional error details. |

**Example:**

```javascript
const ageType = T.number({ min: 18 });
const invalidResult = ageType.validate(10);
// { valid: false, value: 10, error: "minimum", details: null }
```

### `Types.validateType(object, options)`

*Best for: Validating entire model objects*

This function validates an entire object against a schema.

**Parameters:**

  * `object` (`Object`): The data to validate.
  * `options` (`Object`):
      * `schema` (`Object`): **Required.** The model schema (e.g., `models.Post`).
      * `row` (`Object`): Optional. The original object state, for context.
      * `operation` (`string`): Optional. A string (e.g., "add", "edit") passed to validators.

**Returns:** `Array`

An array tuple `[errors, validatedObject]`:

  * `errors`: `null` on success, or an object of errors (e.g., `{ title: "required" }`).
  * `validatedObject`: The coerced object on success, or `null` on failure.

-----

## Type Reference

### Basic Types

  * `T.string(options)`
  * `T.number(options)`
  * `T.boolean(options)`
  * `T.array(options)`
  * `T.object(options)`
  * `T.date(options)`
  * `T.datetime(options)`
  * `T.any(options)`
  * `T.function(options)`

### Relationship Types

Used for data models. When validated, these types coerce object values to their `id` (e.g., `{ id: "user_123" }` becomes `"user_123"`).

  * `T.belongs(targetModel, [foreignKey], [options])`
      * Creates a `string` type (stores a single foreign key).
  * `T.belongs_many(targetModel, [foreignKey], [options])`
      * Creates an `array` type (stores an array of foreign keys).
  * `T.one(targetModel, [foreignKey], [options])`
      * Creates a `string` type.
  * `T.many(targetModel, [foreignKey], [options])`
      * Creates an `array` type.

### Common Type Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `defaultValue` | `*` | The value to use if the input is `undefined`, `null`, OF `""`. (Useful for components). |
| `required` | `boolean` | If `true`, the value cannot be `undefined`, `null`, or `""`. (Useful for models). |
| `customValidator` | `Function` | A function that returns `null` on success or `[errorCode, details]` on failure. |

### Type-Specific Options

#### `string`

  * `format` (`string`): A key for a pre-defined regex. Currently supports:
      * `"email"`: Validates against the email regex.

#### `number`

  * `min` (`number`): The minimum allowed value.
  * `max` (`number`): The maximum allowed value.

#### `date` & `datetime`

  * `min` (`string` | `Date`): The minimum allowed date.
  * `max` (`string` | `Date`): The maximum allowed date.

#### `object`

  * `properties` (`Object`): A schema object to validate the properties of the object itself.

#### `array`

  * `itemType` (`Object`): A schema object used to coerce objects within the array.

-----

## Extensibility

### `Types.registerExtension(extension)`

You can add your own types (like `T.timestamp()`) by registering an extension.

**Example:**

```javascript
// A simple 'timestamp' extension
const timestampExt = {
  types: {
    // This adds T.timestamp()
    timestamp: (options) => {
      // It's just a pre-configured T.number()
      return T.number({
        ...options,
        customValidator: (val) => (val > 0 ? null : ["invalid_timestamp"]),
      });
    },
  },
};

T.registerExtension(timestampExt);

const timeType = T.timestamp({ required: true });
timeType.validate(Date.now()); // { valid: true, ... }
