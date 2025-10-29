# Typed Usage Guide

This guide shows how to use `gqlb` with full TypeScript type safety for complete autocomplete and type checking.

## Overview

`gqlb` provides two ways to build queries:

1. **Runtime-only** (Basic) - Uses Proxies, validates at runtime, types are `any`
2. **Fully Typed** (Advanced) - Generates TypeScript types from schema for full autocomplete

## Step 1: Generate Types from Schema

First, generate TypeScript types from your GraphQL schema:

```bash
# Generate types from SDL file
npx gqlb-codegen --schema schema.graphql --output generated/types.ts

# Or from introspection JSON
npx gqlb-codegen --schema introspection.json --output generated/types.ts

# With custom scalars
npx gqlb-codegen --schema schema.graphql --output generated/types.ts --scalars '{"DateTime":"Date","JSON":"unknown"}'
```

This generates:
- TypeScript interfaces for all GraphQL types
- Enum types
- Input types
- Properly typed field functions

## Step 2: Use the Typed Builder

```typescript
import { createQueryBuilder } from 'gqlb';
import { buildSchema } from 'graphql';
import type { TypedQueryBuilder } from 'gqlb/typed';
import type { Query, User, Post } from './generated/types';

// Load your schema
const schema = buildSchema(schemaSDL);

// Create typed builder
const builder = createQueryBuilder(schema) as TypedQueryBuilder<Query>;

// Now you have FULL autocomplete! 🎉
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id(),           // ✓ Autocomplete suggests: id, name, email, posts
    user.name(),
    user.posts({ first: 10 }, post => [
      post.title(),      // ✓ Autocomplete suggests: id, title, content, author
      post.content()
    ])
  ])
]);

// The result type is fully inferred!
// TypeScript knows the shape of the result without manual typing
```

## Field Types

The generated types use `FieldFn<TSelection, TArgs, TRequired>` to represent fields:

### Scalar Fields (No Arguments)

```typescript
interface User {
  id: FieldFn<string, never, false>;
  name: FieldFn<string, never, false>;
}

// Usage
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id(),    // Just call the function
    user.name()
  ])
]);
```

### Scalar Fields (With Arguments)

```typescript
interface Query {
  user: FieldFn<User, { id: string }, true>;  // Required args
  search: FieldFn<User[], { query: string; limit?: number }, false>;  // Optional args
}

// Usage
const query = builder.query(q => [
  q.user({ id: '123' }, user => [...]),     // Required - must pass args
  q.search({ query: 'test' }, user => [...])  // Optional - can omit args
]);
```

### Object Fields (Nested Selections)

```typescript
interface User {
  posts: FieldFn<Post[], { first?: number }, false>;
}

// Usage
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    // Object fields require a selection function
    user.posts({ first: 10 }, post => [
      post.title(),
      post.content()
    ])
  ])
]);
```

## Type Inference

The builder infers the exact shape of your result based on the fields you select:

```typescript
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.id(),
    user.name(),
    user.posts(post => [
      post.title()
    ])
  ])
]);

// TypeScript infers the result type as:
type Result = {
  user: {
    id: string;
    name: string;
    posts: {
      title: string;
    }[];
  }
};

// You get full autocomplete when accessing the result!
const result = await client.request(query);
result.user.id;           // ✓ string
result.user.name;         // ✓ string
result.user.posts[0].title;  // ✓ string
result.user.email;        // ✗ Error: Property 'email' does not exist
```

## Variables

Use typed variables for parameter values:

```typescript
import { $$ } from 'gqlb';

const userId = $$<string>('userId');      // Required variable
const limit = $<number>('limit');         // Optional variable

const query = builder.query(q => [
  q.user({ id: userId }, user => [
    user.posts({ first: limit }, post => [
      post.title()
    ])
  ])
]);

// Execute with variables
const result = await client.request(query, {
  userId: '123',
  limit: 10
});
```

## Operation Names

Add operation names for better observability:

```typescript
const query = builder.query('GetUserWithPosts', q => [
  q.user({ id: '123' }, user => [
    user.name(),
    user.posts(post => [
      post.title()
    ])
  ])
]);

// Generates:
// query GetUserWithPosts {
//   user(id: "123") {
//     name
//     posts {
//       title
//     }
//   }
// }
```

## Multiple Root Fields

Select multiple root fields in one query:

```typescript
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.name()
  ]),
  q.users({ first: 10 }, user => [
    user.id(),
    user.name()
  ])
]);

// Result type:
// {
//   user: { name: string };
//   users: { id: string; name: string }[];
// }
```

## Custom Scalars

Map GraphQL scalars to TypeScript types:

```bash
npx gqlb-codegen --schema schema.graphql --output types.ts \
  --scalars '{"DateTime":"Date","JSON":"Record<string,unknown>","UUID":"string"}'
```

This generates:

```typescript
export type ScalarDateTime = Date;
export type ScalarJSON = Record<string, unknown>;
export type ScalarUUID = string;

interface Event {
  id: FieldFn<string, never, false>;
  createdAt: FieldFn<Date, never, false>;  // DateTime → Date
  metadata: FieldFn<Record<string, unknown>, never, false>;  // JSON → Record
}
```

## Unions and Interfaces

Full support for GraphQL unions and interfaces:

```typescript
// Generated types
interface Node {
  id: FieldFn<string, never, false>;
}

interface User extends Node {
  name: FieldFn<string, never, false>;
}

interface Post extends Node {
  title: FieldFn<string, never, false>;
}

type SearchResult = User | Post;

// Usage with type narrowing
const query = builder.query(q => [
  q.search({ query: 'test' }, result => [
    // Select common fields
    result.id(),
    // Type narrowing with __typename
    result.__typename?.()
  ])
]);
```

## Best Practices

1. **Generate types as part of your build**:
   ```json
   {
     "scripts": {
       "gen:types": "gqlb-codegen --schema schema.graphql --output src/generated/types.ts",
       "build": "npm run gen:types && tsc"
     }
   }
   ```

2. **Keep types in sync**: Regenerate types whenever your schema changes

3. **Use operation names**: Makes debugging and monitoring easier

4. **Leverage type inference**: Let TypeScript infer result types, don't manually type them

5. **Use variables for dynamic values**: Makes queries reusable and safer

## Comparison: Before vs After

### Before (Untyped)

```typescript
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.naem(),  // Typo! No error until runtime
    user.unknown()  // Non-existent field! No error until runtime
  ])
]);

const result = await client.request(query);
result.user.naem;  // No autocomplete, no error checking
```

### After (Fully Typed)

```typescript
const query = builder.query(q => [
  q.user({ id: '123' }, user => [
    user.naem(),  // ❌ TypeScript error: Property 'naem' does not exist
    user.unknown()  // ❌ TypeScript error: Property 'unknown' does not exist
    user.name()  // ✓ Autocomplete suggests this!
  ])
]);

const result = await client.request(query);
result.user.name;  // ✓ Full autocomplete, TypeScript knows it's a string
```

## Next Steps

- See [examples/typed-example.ts](../examples/typed-example.ts) for a working example
- Check out the [main README](../README.md) for general usage
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand how it works



