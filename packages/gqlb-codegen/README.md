# gqlb-codegen

GraphQL Code Generator plugins for [gqlb](../gqlb) - runtime proxy-based query builder.

## Plugins

### field-types

Generates fully typed field definitions for use with gqlb's typed builder.

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  generates: {
    'generated/field-types.ts': {
      plugins: ['gqlb-codegen/field-types'],
      config: {
        schemaTypesImportPath: './schema-types.js'
      }
    }
  }
};

export default config;
```

## Installation

This package is part of the gqlb monorepo. Install as a dev dependency:

```bash
npm install --save-dev gqlb-codegen
```

## License

MIT

