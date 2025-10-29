# gqlb Architecture

## Overview

`gqlb` is a **runtime proxy-based GraphQL query builder** that generates type-safe GraphQL queries dynamically without any code generation (except TypeScript types for IDE autocomplete, which can be added later).

## Key Design Decisions

### 1. Runtime vs Compile-time

**Decision**: Use JavaScript Proxies to build queries at runtime instead of generating thousands of lines of TypeScript classes.

**Rationale**:
- **Small bundle size**: Only the runtime builder (~300 lines) + schema
- **Fast builds**: No code generation step
- **Flexibility**: Can work with any GraphQL schema loaded at runtime
- **Maintainability**: One small implementation vs 130k+ lines of generated code

### 2. Proxy-based Field Navigation

**How it works**:
1. Load GraphQL schema (from SDL, introspection, or object)
2. Create a Proxy for the root Query/Mutation/Subscription type
3. When you access a property (e.g., `q.jira`), the Proxy:
   - Looks up the field in the schema
   - Returns a function that accepts args and/or a selection function
   - Recursively creates nested Proxies for object types
4. As you navigate, it builds a `FieldSelection` tree
5. Finally, it converts the tree to a GraphQL query string

**Example flow**:
```typescript
builder.query(q =>              // Create Query proxy
  [q.jira(                      // Look up "jira" field → returns function
    jira => [jira.issue(        // Create JiraQuery proxy → look up "issue"
      { id: '123' },            // Args object
      issue => [                // Selection function for Issue type
        issue.id,               // Look up "id" → scalar field
        issue.key               // Look up "key" → scalar field
      ]
    )]
  )]
)
```

Becomes:
```graphql
query {
  jira {
    issue(id: "123") {
      id
      key
    }
  }
}
```

### 3. Variable Handling

Variables are special objects created with `$()` or `$$()`:

```typescript
const userId = $$<string>('userId')  // Required variable
const limit = $<number>('limit')     // Optional variable
```

When encountered in arguments:
1. Extract variable name and type from schema
2. Add to operation's variable declarations
3. Replace with `$variableName` in the query string

### 4. Schema Walking

The builder validates fields at runtime:
- Checks if field exists on type
- Validates arguments (future enhancement)
- Determines if field is scalar vs object (affects whether selection is needed)

This provides **runtime safety** while maintaining **flexibility**.

## Implementation Details

### Core Files

- **`builder.ts`**: Main implementation
  - `createQueryBuilder()`: Entry point
  - `createTypeProxy()`: Creates Proxy for GraphQL types
  - `createFieldSelection()`: Handles field access and argument parsing
  - `buildOperationString()`: Converts selection tree to GraphQL string

- **`variables.ts`**: Variable creation (`$`, `$$`) and detection

- **`types.ts`**: TypeScript interfaces for internal data structures

### Key Types

```typescript
interface FieldSelection {
  name: string;           // Field name
  alias?: string;         // Optional alias
  args?: Record<string, any>;  // Field arguments
  selection?: FieldSelection[];  // Nested selections
}

interface BuildContext {
  schema: GraphQLSchema;  // The GraphQL schema
  variables: Map<...>;    // Collected variables
  fragments: Map<...>;    // Future: fragment support
}
```

## Future Enhancements

### 1. Compiler (Optional)

If runtime overhead becomes an issue, create a compiler that:
- Pre-generates TypeScript types for autocomplete
- Optionally pre-generates optimized query builders
- Still uses the same API, but with compile-time optimizations

### 2. Enhanced Features

- **Fragments**: `fragment(typeName, selectionFn)`
- **Directives**: `@include`, `@skip`, custom directives
- **Unions/Interfaces**: `...on TypeName { fields }`
- **Aliases**: `.as('alias')`
- **Advanced validation**: Type checking for arguments

### 3. Type Safety Improvements

Currently, the builder is loosely typed. We can add:
- Generated TypeScript types that match the schema
- Type-safe field selection (only valid fields are accessible)
- Type-safe argument passing
- Inferred result types

This could be done via:
1. A separate codegen step that generates only types (minimal output)
2. TypeScript template literal types (experimental)
3. A lightweight visitor pattern over the schema

## Comparison

| Approach | Bundle Size | Build Time | Flexibility | Type Safety |
|----------|-------------|------------|-------------|-------------|
| **gqlb (runtime)** | ~300 lines + schema | Instant | High | Medium* |
| typed-graphql-builder | 132k lines | ~4s | Low | High |
| String templates | 0 lines | Instant | High | None |

\* Can be improved with type generation

## Usage Pattern

```typescript
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';
import { createQueryBuilder, $$, $ } from 'gqlb';

// Load schema
const schema = buildSchema(readFileSync('schema.graphql', 'utf-8'));

// Create builder
const builder = createQueryBuilder(schema);

// Build queries
const query = builder.query(q => [
  q.user({ id: $$<string>('userId') }, user => [
    user.id,
    user.name,
    user.posts({ first: $<number>('limit') }, post => [
      post.title
    ])
  ])
]);

// Execute with any GraphQL client
const result = await client.request(query, { userId: '123', limit: 10 });
```

## Conclusion

`gqlb` provides a **pragmatic balance** between developer experience, bundle size, and flexibility. It's perfect for:
- Projects that need dynamic field selection
- Monorepos where large generated files are problematic
- Rapid prototyping and exploration
- Cases where the schema might change frequently

The runtime overhead is minimal (JavaScript Proxies are fast), and if needed, a compiler can be added later without changing the API.

