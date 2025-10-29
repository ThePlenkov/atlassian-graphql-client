# gqlb/codegen - Type-Safe Schema Configuration

Utility types for creating type-safe GraphQL schema configurations with full autocomplete support.

## Installation

```bash
npm install gqlb
```

## Usage

### Basic Schema Configuration

Create a type-safe configuration file that specifies which GraphQL operations to include:

```typescript
// sdk.config.ts
import type { Query, Mutation } from './generated/schema-types.full.ts';
import type { SchemaConfig } from 'gqlb/codegen';

// Define your configuration type
export type SDKConfig = SchemaConfig<Query, Mutation>;

// Create fully typed configuration with autocomplete!
const config: SDKConfig = {
  Query: {
    users: {
      userById: true,        // ✅ Autocompleted from schema
      searchUsers: true,     // ✅ Autocompleted from schema
      // invalidOp: true,    // ❌ TypeScript error!
    },
    posts: {
      postById: true,
      listPosts: true,
    }
  },
  Mutation: {
    users: {
      createUser: true,
      updateUser: true,
      deleteUser: true,
    }
  }
} satisfies SDKConfig;

export default config;
```

### Available Types

#### `SchemaConfig<TQuery, TMutation, TSubscription>`

Main type for schema configuration. Generic over your Query, Mutation, and Subscription types.

```typescript
import type { SchemaConfig } from 'gqlb/codegen';
import type { Query, Mutation, Subscription } from './schema-types.full.ts';

type Config = SchemaConfig<Query, Mutation, Subscription>;
```

#### `ModuleConfig<TRoot>`

Configuration for a single root type (Query, Mutation, or Subscription).

```typescript
import type { ModuleConfig } from 'gqlb/codegen';
import type { Query } from './schema-types.full.ts';

type QueryConfig = ModuleConfig<Query>;
```

#### `ModuleOperations<TModule>`

Configuration for a specific module's operations.

```typescript
import type { ModuleOperations } from 'gqlb/codegen';
import type { UsersQuery } from './schema-types.full.ts';

const usersConfig: ModuleOperations<UsersQuery> = {
  userById: true,
  searchUsers: true,
  listUsers: true,
};
```

#### `UnwrapMaybe<T>`

Utility to unwrap `Maybe<T>` types (T | null).

```typescript
import type { UnwrapMaybe } from 'gqlb/codegen';

type User = UnwrapMaybe<Maybe<UserType>>;  // UserType
```

### Runtime Utilities

#### `isValidSchemaConfig(config)`

Runtime validation for dynamically loaded configurations:

```typescript
import { isValidSchemaConfig } from 'gqlb/codegen';

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

if (isValidSchemaConfig(config)) {
  // TypeScript now knows config has the right shape
  processConfig(config);
}
```

#### `getEnabledOperations(moduleConfig)`

Extract enabled operation names from a module:

```typescript
import { getEnabledOperations } from 'gqlb/codegen';

const config = {
  userById: true,
  searchUsers: true,
  listUsers: undefined,  // Not enabled
};

const operations = getEnabledOperations(config);
// ['userById', 'searchUsers']
```

#### `countOperations(config)`

Count total enabled operations:

```typescript
import { countOperations } from 'gqlb/codegen';

const stats = countOperations(config);
// { Query: 5, Mutation: 3, Subscription: 0, total: 8 }

console.log(`Total operations enabled: ${stats.total}`);
```

## Complete Example

### 1. Generate Full Schema Types

First, generate types from your complete GraphQL schema:

```typescript
// codegen.full.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.full.graphql',
  generates: {
    'generated/schema-types.full.ts': {
      plugins: ['typescript'],
      config: {
        scalars: { DateTime: 'string', JSON: 'Record<string, unknown>' },
      }
    }
  }
};

export default config;
```

### 2. Create Type-Safe Configuration

```typescript
// sdk.config.ts
import type { Query, Mutation } from './generated/schema-types.full.ts';
import type { SchemaConfig } from 'gqlb/codegen';

export type SDKConfig = SchemaConfig<Query, Mutation>;

const config: SDKConfig = {
  Query: {
    users: {
      userById: true,
      searchUsers: true,
    },
    posts: {
      postById: true,
      listPosts: true,
    }
  },
  Mutation: {
    users: {
      createUser: true,
      updateUser: true,
    }
  }
} satisfies SDKConfig;

export default config;
```

### 3. Use Configuration

```typescript
// filter-schema.ts
import config from './sdk.config.ts';
import { countOperations } from 'gqlb/codegen';

const stats = countOperations(config);
console.log(`Enabled ${stats.total} operations`);
console.log(`  Query: ${stats.Query}`);
console.log(`  Mutation: ${stats.Mutation}`);

// Filter your schema based on the config
// ... your schema filtering logic ...
```

## Benefits

✅ **Full autocomplete** - See all available operations in your IDE  
✅ **Type safety** - Catch typos and invalid operations at compile time  
✅ **Discoverable** - IntelliSense shows all available modules and operations  
✅ **Runtime validation** - Optional runtime checks for dynamic configs  
✅ **Reusable** - Generic types work with any GraphQL schema

## TypeScript Configuration

Add to your `tsconfig.json` paths for better imports:

```json
{
  "compilerOptions": {
    "paths": {
      "gqlb/codegen": ["./node_modules/gqlb/dist/codegen-utils.d.mts"]
    }
  }
}
```

## License

MIT

