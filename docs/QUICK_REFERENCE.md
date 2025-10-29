# Quick Reference: Multi-Stage GraphQL Codegen Pipeline

> One-page reference for understanding and implementing our approach

## 📊 Comparison Table

| Feature | `typescript-generic-sdk` | `typed-graphql-builder` | **Our Approach** |
|---------|-------------------------|-------------------------|------------------|
| **Dynamic field selection** | ❌ | ✅ | ✅ |
| **Full type safety** | ✅ | ✅ | ✅ |
| **Generated code size** | ~50KB | ~3.5MB | ~200KB |
| **IDE autocomplete speed** | Instant | 3-5s | <100ms |
| **Tree-shaking** | Good | Limited | Excellent |
| **Bundle size** | Large | Very Large | Small |
| **Schema pruning** | No | No | **✅ Yes (90%)** |
| **Runtime overhead** | None | None | Minimal (proxies) |
| **Maintenance** | High | Low | Low |

## 🏗️ The 5 Stages

### Stage 1: Schema Filtering
```typescript
// sdk.config.ts
export default {
  Query: {
    jira: { issueByKey: true }
  }
};
```
- **Input:** Full GraphQL schema (1.2MB)
- **Output:** Pruned schema (120KB)
- **Reduction:** 90%

### Stage 2: Base Type Generation
```typescript
// codegen.ts
{
  plugins: ['typescript', 'typescript-operations']
}
```
- **Input:** Pruned schema
- **Output:** TypeScript interfaces + Args types
- **Size:** ~200KB

### Stage 3: Args Map
```typescript
// Custom plugin
export interface ArgsTypeMap {
  'QueryjiraArgs': QueryjiraArgs;
}
```
- **Input:** Schema
- **Output:** Type map for Args
- **Purpose:** Enable tree-shaking

### Stage 4: Type Transformation
```typescript
// types.ts
type GetArgsType<TParent, TField> = 
  `${TParent}${TField}Args` extends keyof ArgsTypeMap
    ? ArgsTypeMap[...] : never;
```
- **Input:** Generated types + Args map
- **Output:** Builder-compatible types
- **Method:** TypeScript utility types

### Stage 5: Runtime Proxy
```typescript
// gqlb
const proxy = new Proxy({}, {
  get(target, field) {
    return createFieldFunction(field);
  }
});
```
- **Input:** GraphQL schema
- **Output:** Query builder
- **Size:** ~300 lines

## 🎯 Usage Patterns

### Basic Query
```typescript
const query = builder.query('GetUser', q => [
  q.user({ id }, user => [
    user.name(),
    user.email()
  ])
]);
```

### With Variables
```typescript
const userId = $$<string>('userId');  // Required
const limit = $<number>('limit');     // Optional

const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.posts({ first: limit }, post => [
      post.title()
    ])
  ])
]);
```

### Nested Objects
```typescript
const query = builder.query('GetIssue', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key(),
      issue.summaryField(s => [
        s.text(),
        s.rendered()
      ]),
      issue.assigneeField(a => [
        a.user(user => [
          user.name()
        ])
      ])
    ])
  ])
]);
```

### Arrays
```typescript
const query = builder.query('SearchIssues', q => [
  q.jira({ cloudId }, jira => [
    jira.issueSearchStable({ jql }, search => [
      search.edges(edge => [
        edge.node(issue => [
          issue.key(),
          issue.summary()
        ])
      ])
    ])
  ])
]);
```

## 🔧 Setup Checklist

### 1. Dependencies
```bash
npm install --save-dev \
  @graphql-codegen/cli \
  @graphql-codegen/typescript \
  @graphql-codegen/typescript-operations \
  @graphql-tools/wrap \
  graphql
```

### 2. Config Files

**sdk.config.ts** - Declare operations
```typescript
export default {
  Query: { /* operations */ },
  Mutation: { /* operations */ }
};
```

**filter-schema.ts** - Schema pruning script
```typescript
const filtered = wrapSchema({
  schema: fullSchema,
  transforms: [
    new FilterRootFields(...),
    new PruneSchema(...)
  ]
});
```

**codegen.ts** - Standard codegen
```typescript
{
  schema: 'schema.graphql',
  generates: {
    'schema-types.ts': {
      plugins: ['typescript', 'typescript-operations']
    },
    'args-map.ts': {
      plugins: ['graphql-codegen-args-map']
    }
  }
}
```

**types.ts** - Type transformations
```typescript
type GetArgsType<...> = ...;
type BuildFieldSelector<...> = ...;
type ToFields<...> = ...;

export type QueryFields = ToFields<Query, 'Query'>;
```

**index.ts** - Builder export
```typescript
export function createQueryBuilder() {
  return createGqlbBuilder(schema) as TypedQueryBuilder<...>;
}
```

### 3. Build Tasks
```json
{
  "scripts": {
    "gen:schema": "node scripts/filter-schema.ts",
    "gen:codegen": "graphql-codegen",
    "gen": "npm run gen:schema && npm run gen:codegen"
  }
}
```

## 📈 Expected Results

### File Sizes
- **Full schema:** 1.2MB → **Pruned:** 120KB (90% ↓)
- **Generated types:** 200KB (vs 3.5MB)
- **Runtime code:** 300 lines (vs 132,000)

### Performance
- **Build time:** 4.2s → 1.8s (2.3x faster)
- **Autocomplete:** 3-5s → <100ms (30x faster)
- **Bundle size:** 850KB → 120KB (86% smaller)

### Developer Experience
- ✅ Instant autocomplete
- ✅ Compile-time errors
- ✅ Runtime flexibility
- ✅ Clean output

## 🚫 Common Pitfalls

### ❌ Don't: Import All Args Types
```typescript
// ❌ Bad - bundles everything
import * as Types from './schema-types';
```

### ✅ Do: Use Args Map
```typescript
// ✅ Good - tree-shakable
import type { ArgsTypeMap } from './args-map';
type GetArgsType<T> = T extends keyof ArgsTypeMap ? ArgsTypeMap[T] : never;
```

### ❌ Don't: Skip Schema Pruning
```typescript
// ❌ Bad - generates types for unused operations
schema: 'full-schema.graphql'
```

### ✅ Do: Prune First
```typescript
// ✅ Good - only generate what you need
schema: 'pruned-schema.graphql'
```

### ❌ Don't: Generate Implementations
```typescript
// ❌ Bad - massive files
plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
```

### ✅ Do: Generate Types Only
```typescript
// ✅ Good - small, focused output
plugins: ['typescript', 'typescript-operations']
// Runtime builder is separate!
```

## 🎓 Key Concepts

### Schema Pruning
**Remove unused operations before generation**
- Define what you need in config
- Use @graphql-tools/wrap
- Reduce schema by 90%+

### Args Map
**Enable tree-shaking with type mapping**
- Map type names to types
- TypeScript can now analyze dependencies
- Only bundle what's used

### Type Transformation
**Convert static types to functions**
- Template literal types for detection
- Conditional types for selection
- Recursive transformations

### Runtime Proxies
**Build queries dynamically**
- Walk schema at runtime
- Validate fields
- Generate query string
- ~300 lines of code

## 📚 Further Reading

- **[Innovation Deep Dive](./INNOVATION.md)** - Full technical explanation
- **[Blog Post](./BLOG_POST.md)** - Shareable summary
- **[gqlb Architecture](./GQLB-ARCHITECTURE.md)** - Runtime builder details
- **[Atlassian GraphQL Architecture](./ATLASSIAN-GRAPHQL-ARCHITECTURE.md)** - Multi-stage pipeline

## 🤝 Contributing

Areas of interest:
1. **Custom plugins** - Improve Args map, add features
2. **Type transformations** - Enhance utility types
3. **gqlb features** - Fragments, directives, unions
4. **Documentation** - Examples, tutorials
5. **Performance** - Benchmarks, optimizations

## 📄 License

MIT

---

**Questions?** Open an issue on [GitHub](https://github.com/ThePlenkov/atlassian-graphql-client/issues)

**Want to contribute?** Check out [DEVELOPMENT.md](./DEVELOPMENT.md)

