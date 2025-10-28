# graphql-codegen-args-map

GraphQL Code Generator plugin that creates an optimized Args type map for tree-shaking.

## Why Use This Plugin?

When working with large GraphQL schemas, importing all argument types can bloat your bundle. This plugin:

- ✅ **Analyzes your schema** to find only the Args types actually used
- ✅ **Generates a TypeScript interface** mapping type names to types
- ✅ **Enables tree-shaking** - only bundle what you use
- ✅ **Handles circular references** automatically

## Installation

```bash
npm install graphql-codegen-args-map
# or
yarn add graphql-codegen-args-map
# or
pnpm add graphql-codegen-args-map
```

## Usage

### Basic Setup

In your `codegen.ts` or `codegen.yml`:

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  generates: {
    // Generate base types first
    'generated/schema-types.ts': {
      plugins: ['typescript']
    },
    // Then generate the args map
    'generated/args-map.ts': {
      plugins: ['graphql-codegen-args-map']
    }
  }
};

export default config;
```

### With Custom Options

```typescript
{
  'generated/args-map.ts': {
    plugins: [
      {
        'graphql-codegen-args-map': {
          schemaTypesImportPath: './schema-types.js',
          interfaceName: 'ArgsTypeMap'
        }
      }
    ]
  }
}
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schemaTypesImportPath` | `string` | `'./schema-types.js'` | Import path for generated schema types |
| `interfaceName` | `string` | `'ArgsTypeMap'` | Name of the generated interface |

## Example Output

Given a schema with `issueByKey(cloudId: String!, key: String!)` and `issueSearch(cloudId: String!, jql: String!)`:

```typescript
/**
 * Auto-generated Args type map from GraphQL Codegen
 * Only includes Args types present in the schema
 * 
 * Generated: 2025-10-28T21:48:28.295Z
 * Args types: 2
 */

import type {
  QueryissueByKeyArgs,
  QueryissueSearchArgs
} from './schema-types.js';

/**
 * Maps Args type names to their types
 */
export interface ArgsTypeMap {
  'QueryissueByKeyArgs': QueryissueByKeyArgs;
  'QueryissueSearchArgs': QueryissueSearchArgs;
}
```

## Use Case: Dynamic Args Detection

This plugin is particularly useful for runtime GraphQL query builders that need to detect argument types dynamically:

```typescript
import type { ArgsTypeMap } from './generated/args-map.js';

type GetArgsType<TParent extends string, TField extends string> = 
  `${TParent}${TField}Args` extends keyof ArgsTypeMap
    ? ArgsTypeMap[`${TParent}${TField}Args`]
    : never;

// Now you can dynamically look up args!
type IssueByKeyArgs = GetArgsType<'Query', 'issueByKey'>;
// Result: { cloudId: string; key: string }
```

## How It Works

1. **Traverses the schema** starting from Query, Mutation, and Subscription roots
2. **Collects Args types** for all fields with arguments
3. **Handles circular references** to prevent infinite recursion
4. **Generates a minimal map** with only the types present in your schema

## Benefits

### Before (without this plugin)
```typescript
// Must manually maintain or import all 426 Args types
import type {
  QueryArg1, QueryArg2, QueryArg3, /* ... 423 more ... */
} from './schema-types';
```

### After (with this plugin)
```typescript
// Automatically generates map with only 194 used types
import type { ArgsTypeMap } from './args-map';
// Tree-shaking eliminates unused 232 types!
```

## Peer Dependencies

- `@graphql-codegen/plugin-helpers` ^5.0.0
- `graphql` ^16.0.0

## License

MIT

