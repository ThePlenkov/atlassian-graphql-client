# The GraphQL TypeScript Client Problem

> **Canonical reference for "The Problem" - link here instead of duplicating**

Traditional GraphQL TypeScript clients force you to choose your poison:

## Option 1: Static Queries (typescript-generic-sdk, Apollo Codegen)

```typescript
// ❌ Query structure is predefined
import { GetUserDocument } from './generated';
const result = await client.request(GetUserDocument);
```

**Problems:**
- ❌ No runtime field selection
- ❌ Need 100 .graphql files for 100 different UIs
- ❌ Can't compose queries dynamically

## Option 2: Full Type Builders (typed-graphql-builder, genql)

```typescript
// ❌ Generates 130,000+ lines of code
import { Query } from './generated'; // 3.5MB file!
```

**Problems:**
- ❌ Massive generated files (3.5MB for large schemas)
- ❌ IDE struggles (3-5s autocomplete delay)
- ❌ Slow builds
- ❌ Large bundle sizes

## Option 3: String Templates (No codegen)

```typescript
// ❌ No type safety
const query = gql`
  query GetUser {
    user(id: "123") {
      name
      emial  # typo won't be caught!
    }
  }
`;
```

**Problems:**
- ❌ No compile-time safety
- ❌ Typos cause runtime errors
- ❌ No autocomplete

## The "Impossible" Requirements

We needed:
1. ✅ **Dynamic field selection** (choose at runtime)
2. ✅ **Full TypeScript safety** (catch errors at compile time)
3. ✅ **Small bundles** (tree-shakeable, minimal code)
4. ✅ **Great IDE performance** (instant autocomplete)

**Conventional wisdom:** "Pick two, you can't have all four."

**gqlb proves them wrong.** 🎉

---

See [COMPARISON.md](../COMPARISON.md) for detailed comparison.
See [INNOVATION.md](../INNOVATION.md) for our solution.

