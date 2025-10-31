# Fully Typed Query Builder Implementation

## Overview

This document describes the **code generation approach** for achieving 100% type safety in `gqlb` without using `any` or `unknown` in user code. This approach generates TypeScript interfaces directly from the GraphQL schema, enabling full IDE autocomplete and compile-time validation.

## What Was Built

### Core Innovation: Code Generation Over Type Transformation

**Previous Approach (Abandoned):**
- Attempted to transform GraphQL Codegen types at the TypeScript level
- Used complex mapped types like `ToFields<T, TArgsMap>` and `FieldFn<T, TArgs, TRequired>`
- Hit TypeScript inference limits with nested/nullable/array types
- Required `any` in callback parameters

**Current Approach (Implemented):**
- **Generates** TypeScript interfaces directly from the GraphQL schema
- Uses simple marker types (`FieldSelection<T>`) for type inference
- TypeScript can easily infer types without complex transformations
- **Zero `any` or `unknown` in user code**

## Architecture

### 1. Helper Types (`src_typed/field-types-helpers.ts`)

Three core types power the entire system:

```typescript
/**
 * Marker type for field selections
 * The generic T represents the inferred result type
 */
export type FieldSelection<T = unknown> = {
  readonly __brand: "FieldSelection";
  readonly __type?: T;
};

/**
 * Variable reference type (for $ and $$ syntax)
 */
export type TypedVariable<T> = {
  readonly __brand: "Variable";
  readonly name: string;
  readonly required: boolean;
  readonly type?: T;
};

/**
 * Make arguments accept TypedVariable
 * Allows both direct values and variable references
 */
export type WithVariables<T> = T extends object
  ? { [K in keyof T]: T[K] | TypedVariable<unknown> | (T[K] extends object ? WithVariables<T[K]> : never) }
  : T | TypedVariable<unknown>;
```

**Key Insight:** `FieldSelection<T>` is a **marker type**. It goes in the selection array, not the actual value. This decouples the selection mechanism from the result type, allowing TypeScript to correctly infer types.

### 2. Code Generator (`src_typed/generate-field-types.ts`)

Generates field interfaces directly from a GraphQL schema:

```typescript
export function generateFieldTypes(options: GenerateFieldTypesOptions): string {
  // Analyzes GraphQL schema
  // Generates interfaces like QueryFields, MutationFields, UserFields
  // Returns TypeScript code as a string
}
```

**Input:** GraphQL schema + GraphQL Codegen types
**Output:** Fully typed field interfaces

**Example Generated Code:**

```typescript
// From this GraphQL:
type User {
  id: ID!
  name: String!
  email: String
  posts(limit: Int): [Post!]!
}

// Generates this TypeScript:
export interface UserFields {
  id: FieldSelection<string>;
  name: FieldSelection<string>;
  email: FieldSelection<string | null>;
  posts: {
    (select: (obj: PostFields) => ReadonlyArray<FieldSelection<unknown>>): FieldSelection<PostFields[]>;
    (args: WithVariables<UserPostsArgs>, select: (obj: PostFields) => ReadonlyArray<FieldSelection<unknown>>): FieldSelection<PostFields[]>;
  };
}
```

**Key Features:**
- Scalar fields → `FieldSelection<T>` properties
- Object fields → Functions that take a selector callback
- Optional arguments → Overloaded signatures
- Required arguments → Single signature with required parameter
- Arrays, nullability, enums all handled correctly

### 3. Typed Builder Wrapper (`src_typed/create-typed-builder.ts`)

Wraps the runtime builder with generated types:

```typescript
export function createTypedBuilder<TQueryFields, TMutationFields = never>(
  schema: GraphQLSchema
): TypedQueryBuilder<TQueryFields, TMutationFields> {
  const runtimeBuilder = createQueryBuilder(schema);
  
  // Cast runtime builder to typed interface
  return runtimeBuilder as unknown as TypedQueryBuilder<TQueryFields, TMutationFields>;
}
```

### 4. Test Infrastructure

**Comprehensive Test Suite:**
- ✅ 11 scenarios from simple to complex
- ✅ 100% type-safe (no `any` or `unknown`)
- ✅ Tests ARE the type-checking (strict TypeScript)
- ✅ Runtime validation against fixtures

**Test Scenarios:**
1. Simple query (scalar field)
2. Query with inline arguments
3. Query with variables ($ and $$)
4. Query with arrays
5. Deeply nested selections
6. Nullable fields
7. Nested filter arguments
8. Named operations
9. Multiple root fields
10. Simple mutation
11. Mutation with complex input

## How It Works: Step by Step

### Setup Phase (One-Time)

1. **Define GraphQL Schema** (`schema.graphql`)
2. **Run GraphQL Codegen** → generates `schema-types.ts` (standard types)
3. **Run Field Generator** → generates `field-types.ts` (builder-specific interfaces)

### Usage (Developer Experience)

```typescript
import { createTypedBuilder } from 'gqlb/typed';
import { schema } from './schema';
import type { QueryFields, MutationFields } from './generated/field-types';

// Create typed builder with generated interfaces
const builder = createTypedBuilder<QueryFields, MutationFields>(schema);

// Fully typed queries - NO any, NO unknown, FULL autocomplete!
const query = builder.query(q => [
  q.user({ id: '123' }, user => [  // ← 'user' is fully typed!
    user.id,      // ← Autocomplete works
    user.name,    // ← Type-checked
    user.email,   // ← Knows it's nullable
    user.posts(post => [  // ← Nested autocomplete
      post.title,
      post.content
    ])
  ])
]);
```

**What TypeScript Sees:**

1. `q` is `QueryFields` → knows all query fields
2. `q.user` requires args and a selector → enforces both
3. `user` callback parameter is inferred as `UserFields` → full autocomplete
4. `user.id` returns `FieldSelection<string>` → goes in the array
5. Return type is `TypedDocumentNode` → can be executed

## Comparison: Old vs New

| Aspect | Old Approach | New Approach |
|--------|-------------|--------------|
| **Type Safety** | Required `any` in callbacks | 100% type-safe |
| **Autocomplete** | Limited/broken | Full autocomplete everywhere |
| **Setup** | Manual args mapping | Automated code generation |
| **Complexity** | Complex mapped types | Simple generated interfaces |
| **TypeScript Limits** | Hit inference limits | No issues |
| **Maintainability** | Type gymnastics | Readable generated code |
| **Scalability** | Struggled with deep nesting | Handles any schema size |

## Key Innovations

### 1. FieldSelection Marker Type

**Problem:** How to put selections in an array while preserving their types?

**Solution:** 
```typescript
// Each field returns a marker with the inferred type
q.user(...)  // Returns FieldSelection<UserFields | null>
q.hello      // Returns FieldSelection<string>

// Array accepts any FieldSelection
[q.user(...), q.hello]  // ✓ Type-safe!
```

The marker type acts as a "type carrier" - it doesn't affect runtime but carries type information through the selection chain.

### 2. WithVariables Utility

**Problem:** Arguments need to accept both values and variable references (`$` and `$$`).

**Solution:**
```typescript
// Transforms { id: string } to { id: string | TypedVariable<unknown> }
type WithVariables<T> = { [K in keyof T]: T[K] | TypedVariable<unknown> | ... }

// Now both work:
q.user({ id: '123' })        // Direct value
q.user({ id: $$('userId') }) // Variable reference
```

### 3. Overloaded Signatures for Optional Args

**Problem:** Some fields can be called with or without arguments.

**Solution:** Generate overloaded function types:
```typescript
posts: {
  (select: ...): FieldSelection<PostFields[]>;                    // No args
  (args: WithVariables<UserPostsArgs>, select: ...): FieldSelection<PostFields[]>; // With args
};
```

TypeScript picks the right overload based on how you call it.

## File Structure

```
packages/gqlb/
├── src/                              # Runtime implementation
│   ├── builder.ts                    # Proxy-based query builder (runtime)
│   └── typed-builder.ts              # Type definitions
├── src_typed/                        # Typed builder implementation
│   ├── field-types-helpers.ts        # Core helper types (FieldSelection, etc.)
│   ├── generate-field-types.ts       # Code generator (schema → interfaces)
│   └── create-typed-builder.ts       # Typed builder wrapper
└── tests/                            # Test suite (100% typed!)
    ├── schema/
    │   ├── schema.graphql            # Test GraphQL schema
    │   ├── codegen.ts                # GraphQL Codegen config
    │   ├── generate-field-types.ts   # Script to run generator
    │   ├── index.ts                  # Schema loader
    │   └── generated/
    │       ├── schema-types.ts       # Generated by GraphQL Codegen
    │       └── field-types.ts        # Generated by our generator
    ├── scenarios/                    # 11 test scenarios (all fully typed!)
    │   ├── 01-query-simple.ts
    │   ├── 02-query-with-args.ts
    │   └── ...
    ├── fixtures/                     # Expected GraphQL output
    │   ├── 01-query-simple.graphql
    │   └── ...
    ├── index.test.ts                 # Test runner (Node.js --test)
    └── tsconfig.json                 # Strict TypeScript config
```

## Testing Philosophy

**"Type-checking IS testing"**

The test suite enforces that:
1. ✅ All scenarios compile with strict TypeScript
2. ✅ No `any` or `unknown` in test code
3. ✅ Generated GraphQL matches expected fixtures
4. ✅ Runtime behavior is correct

This multi-layered validation ensures both type safety AND runtime correctness.

## Benefits for Users

### 1. Zero Configuration
Once set up, everything is automated:
```bash
npm run test:codegen  # Regenerates types from schema
```

### 2. Perfect IDE Experience
- **Autocomplete** on every field
- **Type errors** for invalid fields
- **Hover documentation** from GraphQL descriptions
- **Go to definition** works

### 3. Catch Errors Early
```typescript
// TypeScript error: Property 'invalidField' does not exist
q.user({ id: '123' }, user => [user.invalidField])

// TypeScript error: Argument required
q.user(user => [user.id])  // Missing { id: string }

// TypeScript error: Must provide selector for object fields
q.user({ id: '123' })  // Forgot the callback
```

### 4. Refactoring Safety
Change the GraphQL schema → regenerate types → TypeScript shows all places that need updates.

## Current Status

### ✅ Fully Working

- ✅ Code generation from GraphQL schemas
- ✅ Full type safety (zero `any`/`unknown` in user code)
- ✅ Perfect autocomplete and IDE support
- ✅ Variables (`$` and `$$`) fully typed
- ✅ Nested selections (unlimited depth)
- ✅ Arrays and nullable types
- ✅ Complex input types
- ✅ Enums and unions
- ✅ Named operations
- ✅ All 11 test scenarios passing
- ✅ Strict TypeScript compilation

### 🎯 For Library Consumers

Users can generate their own types:

```typescript
import { buildSchema } from 'graphql';
import { generateFieldTypes } from 'gqlb/typed';
import { writeFileSync } from 'fs';

const schema = buildSchema(`...`);

const code = generateFieldTypes({
  schema,
  schemaTypesImportPath: './schema-types.js'
  // helpersImportPath defaults to 'gqlb/typed'
});

writeFileSync('generated/field-types.ts', code);
```

## Comparison with Other Solutions

### vs. Traditional GraphQL Clients

**Apollo Client / urql:**
- ❌ Requires separate codegen for operations
- ❌ Need to write `.graphql` files manually
- ✅ Generated types for responses

**gqlb:**
- ✅ Build queries in TypeScript directly
- ✅ No separate `.graphql` files needed
- ✅ Full type safety at build time
- ✅ Autocomplete while writing queries

### vs. Other Query Builders

**Genql:**
- ✅ Similar code generation approach
- ❌ Custom CLI required
- ❌ Less flexible (no variable references)

**gqlb:**
- ✅ Uses standard GraphQL Codegen
- ✅ Full variable support (`$` and `$$`)
- ✅ Works with any GraphQL schema

## Future Enhancements

### 1. GraphQL Codegen Plugin
Create a plugin to automate the entire flow:
```typescript
{
  generates: {
    'generated/schema-types.ts': { plugins: ['typescript'] },
    'generated/field-types.ts': { plugins: ['typescript-gqlb'] }  // New plugin
  }
}
```

### 2. Directive Support
Generate docs from GraphQL directives:
```graphql
type User {
  email: String @deprecated(reason: "Use emails array instead")
}
```

### 3. Fragment Support
Generate reusable fragment helpers:
```typescript
const userFragment = fragment(u => [u.id, u.name, u.email]);
const query = builder.query(q => [q.user({ id: '123' }, userFragment)]);
```

## Conclusion

The code generation approach successfully achieves:

✅ **100% Type Safety** - No `any` or `unknown` in user code  
✅ **Perfect IDE Experience** - Full autocomplete everywhere  
✅ **Runtime Correctness** - All tests passing  
✅ **Scalability** - Handles schemas of any size  
✅ **Maintainability** - Generated code is readable and debuggable  
✅ **Developer Experience** - Feels natural, catches errors early  

This implementation proves that **full type safety is achievable** for runtime query builders without sacrificing ergonomics or performance.

The key insight was to **generate code** instead of **transforming types**, avoiding TypeScript's inference limitations and providing a superior developer experience.
