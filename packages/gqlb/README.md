# gqlb

**Runtime proxy-based GraphQL query builder with full type safety**

## Features

- ✨ **Zero code generation** - Just load your schema and go
- 🎯 **Full type safety** - TypeScript autocomplete for all fields
- 🚀 **Dynamic field selection** - Choose exactly what you need
- 🔄 **Runtime schema walking** - Proxy-based navigation
- 📦 **Tiny bundle size** - No massive generated files

## Usage

```typescript
import { createQueryBuilder } from 'gqlb'
import schema from './schema.graphql'

const builder = createQueryBuilder(schema)

// Build queries with full autocomplete
const query = builder.query(q => 
  q.user({ id: '123' }, user => [
    user.id,
    user.name,
    user.posts({ first: 10 }, posts => [
      posts.title,
      posts.content
    ])
  ])
)

// Execute with any GraphQL client
const result = await graphqlClient.request(query, variables)
```

## How it works

Instead of generating thousands of lines of TypeScript classes, `gqlb` uses JavaScript Proxies to:

1. Walk your GraphQL schema at runtime
2. Build queries dynamically as you navigate
3. Validate field names and arguments
4. Generate typed `TypedDocumentNode` for execution

The result is a tiny, fast, and maintainable query builder.

