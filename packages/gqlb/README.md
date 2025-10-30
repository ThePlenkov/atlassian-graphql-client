# gqlb

**Runtime proxy-based GraphQL query builder with full type safety**

Dynamic GraphQL queries with full TypeScript autocomplete, optimized for large schemas.

[![npm version](https://img.shields.io/npm/v/gqlb.svg?style=flat-square)](https://www.npmjs.com/package/gqlb)
[![npm downloads](https://img.shields.io/npm/dm/gqlb.svg?style=flat-square)](https://www.npmjs.com/package/gqlb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square)](https://nodejs.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/gqlb?style=flat-square)](https://bundlephobia.com/package/gqlb)

## Why gqlb?

When working with **large, complex GraphQL schemas** and dynamic query requirements, traditional approaches have trade-offs. **gqlb aims to give you both type safety AND dynamic queries.**

### The Problem

```typescript
// ❌ Option 1: Fully typed, but static queries
const QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;
// Can't choose fields at runtime!

// ❌ Option 2: Dynamic, but no types
const query = buildQuery(selectedFields);
// No autocomplete, runtime errors!
```

### The gqlb Solution

```typescript
// ✅ Both dynamic AND fully typed!
const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.id,             // ← Perfect autocomplete
    user.name,           // ← TypeScript knows all fields
    user.email,          // ← Catches typos at compile time
    ...conditionalFields // ← Dynamic selection!
  ])
]);
```

## Features

- ✨ **Minimal code generation** - Small type files instead of massive builders
- 🎯 **Full type safety** - Complete TypeScript autocomplete
- 🚀 **Dynamic queries** - Build queries at runtime
- 🌟 **Auto-expand fields** - Select all scalars with `...user['*']` or `user.profile`
- 📦 **Optimized bundles** - Especially beneficial for large schemas
- ⚡ **Fast IDE** - Smooth performance even with complex schemas
- 🔄 **Any schema** - Works with any GraphQL API
- 🌳 **Tree-shakeable** - Only bundle what you use

## Installation

```bash
npm install gqlb
```

## Quick Start

```typescript
import { createQueryBuilder, $$ } from 'gqlb';
import schema from './schema.graphql';

// 1. Create a query builder with your schema
const builder = createQueryBuilder(schema);

// 2. Define variables
const userId = $$<string>('userId');
const limit = $$<number>('limit');

// 3. Build queries with full autocomplete
const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.email,
    user.posts({ first: limit }, posts => [
      posts.id,
      posts.title,
      posts.content,
      posts.author(author => [
        author.name
      ])
    ])
  ])
]);

// 4. Execute with any GraphQL client
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://api.example.com/graphql');
const result = await client.request(query, { 
  userId: '123',
  limit: 10 
});

// 5. Fully typed result!
console.log(result.user.name); // ← TypeScript knows this exists
```

## API Reference

### `createQueryBuilder(schema)`

Creates a query builder instance from a GraphQL schema.

**Parameters:**
- `schema` - GraphQL schema (introspection JSON or DocumentNode)

**Returns:** Query builder with type-safe methods

```typescript
import { createQueryBuilder } from 'gqlb';
import schema from './schema.graphql';

const builder = createQueryBuilder(schema);
```

### `builder.query(name?, callback)`

Builds a GraphQL query.

**Parameters:**
- `name` (optional) - Operation name
- `callback` - Function that builds the query

**Returns:** `TypedDocumentNode` ready for execution

```typescript
const query = builder.query('GetUser', q => [
  q.user({ id: '123' }, user => [
    user.id,
    user.name
  ])
]);
```

### `builder.mutation(name?, callback)`

Builds a GraphQL mutation.

```typescript
const mutation = builder.mutation('CreatePost', m => [
  m.createPost({ 
    input: { title: 'Hello', content: 'World' } 
  }, post => [
    post.id,
    post.title
  ])
]);
```

### `$$(variableName)`

Creates a GraphQL variable reference.

**Parameters:**
- `variableName` - Name of the variable

**Returns:** Variable reference for use in queries

```typescript
import { $$ } from 'gqlb';

const userId = $$<string>('userId');
const query = builder.query(q => [
  q.user({ id: userId }, user => [
    user.name
  ])
]);
```

### Codegen Utilities

`gqlb` exports type utilities and helpers for creating type-safe schema configurations.

#### Type-Safe Schema Configuration

Create fully typed configuration files that specify which GraphQL operations to include:

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

#### Available Types

**`SchemaConfig<TQuery, TMutation, TSubscription>`** - Main type for schema configuration:

```typescript
import type { SchemaConfig } from 'gqlb/codegen';
import type { Query, Mutation, Subscription } from './schema-types.full.ts';

type Config = SchemaConfig<Query, Mutation, Subscription>;
```

**`ModuleConfig<TRoot>`** - Configuration for a single root type:

```typescript
import type { ModuleConfig } from 'gqlb/codegen';
import type { Query } from './schema-types.full.ts';

type QueryConfig = ModuleConfig<Query>;
```

**`ModuleOperations<TModule>`** - Configuration for a module's operations:

```typescript
import type { ModuleOperations } from 'gqlb/codegen';
import type { UsersQuery } from './schema-types.full.ts';

const usersConfig: ModuleOperations<UsersQuery> = {
  userById: true,
  searchUsers: true,
};
```

**`UnwrapMaybe<T>`** - Utility to unwrap `Maybe<T>` types (T | null):

```typescript
import type { UnwrapMaybe } from 'gqlb/codegen';

type User = UnwrapMaybe<Maybe<UserType>>;  // UserType
```

#### Runtime Utilities

**`isValidSchemaConfig(config)`** - Runtime validation for dynamically loaded configurations:

```typescript
import { isValidSchemaConfig } from 'gqlb/codegen';

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
if (isValidSchemaConfig(config)) {
  processConfig(config);
}
```

**`getEnabledOperations(moduleConfig)`** - Extract enabled operation names:

```typescript
import { getEnabledOperations } from 'gqlb/codegen';

const operations = getEnabledOperations({
  userById: true,
  searchUsers: true,
  listUsers: undefined,  // Not enabled
});
// ['userById', 'searchUsers']
```

**`countOperations(config)`** - Count total enabled operations:

```typescript
import { countOperations } from 'gqlb/codegen';

const stats = countOperations(config);
// { Query: 5, Mutation: 3, Subscription: 0, total: 8 }
```

## Advanced Usage

### Wildcard Field Selection

**NEW!** Select all scalar fields without listing them:

```typescript
// Quick prototyping - get everything!
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    ...user['*'],  // All user scalars (id, name, email, age, etc.)
    user.profile   // All profile scalars + nested location scalars
  ])
]);

// CLI tools - let users control what they want
function buildQuery(includeProfile: boolean) {
  return builder.query(q => [
    q.user({ id: userId }, user => [
      ...user['*'],
      ...(includeProfile ? [user.profile] : [])
    ])
  ]);
}
```

**This feature is unique to gqlb!** Other query builders force you to list every field explicitly.

### Dynamic Field Selection

Choose fields at runtime based on user input or configuration:

```typescript
function buildUserQuery(includeEmail: boolean, includePosts: boolean) {
  return builder.query('GetUser', q => [
    q.user({ id: userId }, user => [
      user.id,
      user.name,
      ...(includeEmail ? [user.email] : []),
      ...(includePosts ? [
        user.posts(posts => [
          posts.title
        ])
      ] : [])
    ])
  ]);
}

// User controls what data is fetched!
const query = buildUserQuery(
  userWantsEmail, 
  userWantsPosts
);
```

### Conditional Fields

Build different queries for different scenarios:

```typescript
const query = builder.query('GetData', q => [
  isAdmin 
    ? q.adminData(data => [
        data.sensitiveField(),
        data.internalMetrics()
      ])
    : q.publicData(data => [
        data.publicField()
      ])
]);
```

### Nested Objects

Navigate deeply nested structures with full type safety:

```typescript
const query = builder.query(q => [
  q.user({ id: userId }, user => [
    user.id,
    user.profile(profile => [
      profile.bio,
      profile.avatar(avatar => [
        avatar.url,
        avatar.thumbnails(thumb => [
          thumb.small,
          thumb.large
        ])
      ])
    ])
  ])
]);
```

### Fragments (Coming Soon)

```typescript
const userFields = builder.fragment('UserFields', 'User', u => [
  u.id,
  u.name,
  u.email
]);

const query = builder.query(q => [
  q.user({ id: userId }, user => [
    ...userFields
  ])
]);
```

## How It Works

`gqlb` uses a novel 5-stage approach:

1. **Schema Pruning** - Remove unused types for smaller output
2. **Custom Codegen** - Generate minimal type definitions
3. **Type Transformation** - TypeScript template literals for type magic
4. **Runtime Proxies** - Walk schema dynamically with tiny runtime
5. **Tree-Shaking** - Bundle only what you use

**Result:** Small runtime core plus minimal type definitions!

**Impact on large schemas:** When working with schemas like Atlassian's (8000+ types), this approach can significantly reduce bundle sizes and maintain fast IDE performance compared to traditional builder generation.

See [Innovation Deep Dive](../../docs/INNOVATION.md) for technical details.

## Comparison

### When to Use gqlb

**gqlb is ideal for:**
- 🎯 Large schemas (1000+ types) where other builders struggle
- 🎯 Dynamic field selection requirements
- 🎯 Bundle size constraints
- 🎯 GraphQL tools, explorers, or admin panels

**Other tools may be simpler for:**
- Small to medium schemas (<1000 types)
- Fixed queries known at build time
- Simple applications with few query variants

### Feature Comparison

| Feature | gqlb | graphql-code-generator | typed-graphql-builder |
|---------|------|----------------------|---------------------|
| **Dynamic queries** | ✅ Yes | ⚠️ Limited | ✅ Yes |
| **Type safety** | ✅ Full | ✅ Full | ✅ Full |
| **Large schema support** | ✅ Excellent | ✅ Good | ⚠️ Struggles |
| **Setup complexity** | ⚠️ Medium | ✅ Low | ✅ Low |
| **Runtime flexibility** | ✅ High | ⚠️ Low | ✅ High |
| **Tree-shakeable** | ✅ Yes | ⚠️ Partial | ⚠️ Partial |

**Note:** Performance characteristics vary significantly based on schema size. The table above reflects behavior with large schemas (1000+ types).

See [Detailed Comparison](../../docs/COMPARISON.md) for in-depth analysis and specific metrics.

## Use Cases

### CLI Tools

Build interactive CLIs where users select fields:

```typescript
const fields = await promptUserForFields();
const query = buildQuery(fields); // Dynamic!
```

### GraphQL Explorers

Create GraphQL exploration tools with full type safety:

```typescript
function explorer(path: string[]) {
  // Navigate schema dynamically with autocomplete
}
```

### API Clients

Optimize bandwidth by fetching only needed fields:

```typescript
// Mobile: minimal data
const mobileQuery = buildQuery(['id', 'name']);

// Desktop: full data  
const desktopQuery = buildQuery(['id', 'name', 'email', 'posts']);
```

### Code Generation Tools

Generate GraphQL queries programmatically:

```typescript
function generateQueryFromConfig(config: FieldConfig) {
  return builder.query(q => buildFromConfig(q, config));
}
```

## Requirements

- **Node.js 18+** - For native `fetch` support
- **TypeScript 4.5+** - For advanced type features
- **GraphQL Schema** - Introspection JSON or SDL

## TypeScript Configuration

For best results, use these TypeScript compiler options:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## Examples

See the `/packages/atlassian-graphql` and `/packages/atlassian-cli` directories for real-world examples of `gqlb` usage with Atlassian's 8000+ type schema.

## Contributing

We welcome contributions! See [DEVELOPMENT.md](../../docs/DEVELOPMENT.md) for setup instructions.

Areas of interest:
- Fragment support
- Directive support
- Schema validation improvements
- Performance optimizations
- Additional GraphQL client integrations

## Roadmap

- [ ] Fragment support
- [ ] Directive support (@include, @skip, custom)
- [ ] Subscription support
- [ ] Schema stitching
- [ ] GraphQL validation at build time
- [ ] VS Code extension

## FAQ

### Q: Do I need to generate code?
**A:** You generate minimal type definitions (much smaller than traditional approaches), then use the runtime query builder.

### Q: Does it work with my GraphQL API?
**A:** Yes! It works with any GraphQL schema.

### Q: What about performance?
**A:** Runtime overhead is negligible. Proxy operations are highly optimized. The main benefits are smaller bundles and faster IDE performance, especially noticeable with large schemas.

### Q: Can I use it with [insert GraphQL client]?
**A:** Yes! `gqlb` generates standard `TypedDocumentNode` objects that work with any client.

### Q: How big is the bundle?
**A:** Base runtime + minimal types. Exact size depends on your schema and tree-shaking, but significantly smaller than traditional builder approaches for large schemas.

### Q: Is this overkill for small schemas?
**A:** Possibly! For schemas with <1000 types, traditional codegen tools like graphql-code-generator may be simpler and work just fine.

### Q: Do I lose any GraphQL features?
**A:** Currently fragments and directives are in development. Everything else works!

## License

MIT

## Links

- [GitHub Repository](https://github.com/gqlb/gqlb)
- [Issue Tracker](https://github.com/gqlb/gqlb/issues)
- [Documentation](../../docs)
- [Innovation Deep Dive](../../docs/INNOVATION.md)
- [Blog Post](../../docs/media/BLOG_POST.md)

---

**Built with ❤️ for the GraphQL developer community**
