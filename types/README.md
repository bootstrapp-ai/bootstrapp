# @bootstrapp/types

Type validation and coercion library for model fields and component properties.

## Installation

```bash
npm install @bootstrapp/types
```

## Overview

The `@bootstrapp/types` library provides a runtime type system for JavaScript applications with two primary use cases:

1. **Component Properties** - Define stable APIs for UI components with automatic type coercion from attributes
2. **Data Models** - Describe schemas for data models with validation rules and relationships

## Quick Start

### Component Properties

```javascript
import T from '@bootstrapp/types';

const properties = {
  count: T.number({ defaultValue: 0 }),
  label: T.string({ required: true }),
  enabled: T.boolean({ defaultValue: true })
};

// Validate a single property
const result = properties.count.validate("42");
// { valid: true, value: 42, error: null, details: null }
```

### Data Models

```javascript
import T from '@bootstrapp/types';

const UserSchema = {
  name: T.string({ required: true }),
  email: T.string({ format: 'email' }),
  age: T.number({ min: 18 }),
  posts: T.many('Post', 'author')
};

const [errors, validatedUser] = T.validateType(userData, {
  schema: UserSchema
});

if (!errors) {
  // User data is valid
  console.log(validatedUser);
}
```

## Available Types

- **Primitives**: `string`, `number`, `boolean`, `array`, `object`, `date`, `datetime`, `any`, `function`
- **Relationships**: `belongs`, `belongs_many`, `one`, `many`

## Common Options

- `defaultValue` - Default value if input is undefined/null
- `required` - Value cannot be undefined/null
- `min/max` - Min/max values for numbers and dates
- `format` - Format validation (e.g., 'email')
- `customValidator` - Custom validation function

## Documentation

For complete API documentation and advanced usage, see [types.md](./types.md).

## Links

- [GitHub Repository](https://github.com/bootstrapp-ai/bootstrapp)
- [Report Issues](https://github.com/bootstrapp-ai/bootstrapp/issues)
- [Bootstrapp Framework](https://github.com/bootstrapp-ai/bootstrapp#readme)

## License

AGPL-3.0
