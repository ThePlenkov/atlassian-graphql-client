# @atlassian-tools/gql

> 🎯 **Demo Application:** This package demonstrates how to use [`gqlb`](../gqlb) with a real-world, complex GraphQL schema (Atlassian API with 8000+ types). It serves as a reference implementation and will be moved to its own repository soon.

**Pre-configured gqlb instance for Atlassian's GraphQL API**

A fully typed TypeScript client for the Atlassian GraphQL API showcasing **dynamic field selection** powered by the [`gqlb`](../gqlb) runtime query builder.

## ✨ Features

- 🎯 **Dynamic Field Selection** - Select only the fields you need at runtime
- 🔒 **Full Type Safety** - Complete TypeScript autocomplete for 8000+ Atlassian types
- 🚀 **Proxy-Based API** - Intuitive, chainable query building via gqlb
- 📦 **Zero Manual Queries** - No GraphQL string writing needed
- 🔧 **Works with graphql-request** - Use your existing GraphQL client

## 📚 About This Package

This is a **demonstration of gqlb's capabilities** with a complex, real-world schema. It shows how gqlb can handle:

- 8000+ GraphQL types
- Deep nesting (10+ levels)
- Complex unions and interfaces
- Large schemas where traditional codegen fails

**Looking for the core library?** Check out [`gqlb`](../gqlb) which works with any GraphQL schema, not just Atlassian.

## 🚀 Quick Start

```typescript
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
import { GraphQLClient } from 'graphql-request';

// Create a GraphQL client
const client = new GraphQLClient('https://your-company.atlassian.net/gateway/api/graphql', {
  headers: {
    authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
  },
});

// Create query builder (pre-configured with Atlassian schema)
const builder = createQueryBuilder();

// Build queries with dynamic field selection
const cloudId = $$<string>('cloudId');
const jql = $$<string>('jql');

const query = builder.query('SearchIssues', q => [
  q.jira({ cloudId }, jira => [
    jira.issueSearch({ 
      issueSearchInput: { jql },
      first: 10 
    }, search => [
      search.edges(edge => [
        edge.node(node => [
          node.id(),
          node.key(),
          node.summaryField(s => [s.text()]),
          node.assigneeField(a => [
            a.user(u => [
              u.accountId(),
              u.name()
            ])
          ])
        ])
      ]),
      search.pageInfo(p => [
        p.hasNextPage(),
        p.endCursor()
      ])
    ])
  ])
]);

// Execute with variables
const result = await client.request(query, {
  cloudId: 'your-cloud-id',
  jql: 'project = DEMO'
});
```

## 🎯 How It Works

This package uses **gqlb** under the hood:

1. **Schema is pre-processed**: Atlassian's schema is pruned and optimized
2. **Types are generated**: Minimal type definitions for gqlb
3. **Queries are built at runtime**: Using gqlb's proxy-based builder
4. **Full type safety**: TypeScript knows all 8000+ types!

See the [`gqlb` documentation](../gqlb) for details on how the magic works.

## 🏗️ Package Structure

```
atlassian-graphql/
├── src/
│   ├── generated/          # Generated from Atlassian schema
│   │   ├── schema.graphql  # Pruned schema
│   │   ├── types.ts        # TypeScript types
│   │   └── args-map.json   # Field arguments map
│   └── index.ts            # Exports createQueryBuilder
├── scripts/
│   └── generate.ts         # Schema fetch + codegen
└── codegen.yml             # GraphQL codegen config
```

## 📚 Usage Examples

### Basic Issue Query

```typescript
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';

const builder = createQueryBuilder();
const issueId = $$<string>('issueId');

const query = builder.query('GetIssue', q => [
  q.jira(jira => [
    jira.issue({ id: issueId }, issue => [
      issue.id(),
      issue.key(),
      issue.summaryField(s => [s.text()]),
      issue.descriptionField(d => [d.text()])
    ])
  ])
]);
```

### Nested Field Selection

```typescript
const query = builder.query('DetailedSearch', q => [
  q.jira({ cloudId }, jira => [
    jira.issueSearch({ issueSearchInput: { jql } }, search => [
      search.edges(edge => [
        edge.node(node => [
          node.key(),
          node.summaryField(s => [s.text()]),
          node.assigneeField(a => [
            a.user(u => [
              u.name(),
              u.emailAddress()
            ])
          ]),
          node.statusField(status => [
            status.name(),
            status.statusCategory(cat => [
              cat.key(),
              cat.name()
            ])
          ])
        ])
      ])
    ])
  ])
]);
```

### Confluence Queries

```typescript
const spacesQuery = builder.query('GetSpaces', q => [
  q.confluence({ cloudId }, c => [
    c.spaces({ keys: spaceKeys, first: 10 }, spaces => [
      spaces.edges(edge => [
        edge.node(node => [
          node.id(),
          node.key(),
          node.name(),
          node.description()
        ])
      ])
    ])
  ])
]);
```

### Dynamic Field Selection

```typescript
// Choose fields at runtime based on user input!
function buildIssueQuery(fields: string[]) {
  return builder.query('DynamicQuery', q => [
    q.jira(jira => [
      jira.issue({ id: issueId }, issue => 
        fields.map(field => {
          switch(field) {
            case 'id': return issue.id();
            case 'key': return issue.key();
            case 'summary': return issue.summaryField(s => [s.text()]);
            // ... etc
          }
        })
      )
    ])
  ]);
}
```

## 🚀 Scripts

- **`npm run gen`** - Fetch Atlassian schema + run codegen
- **`npm run build`** - Build the package

## 🛠️ Technical Details

This package demonstrates gqlb's **5-stage pipeline**:

1. **Schema Pruning** - Removes unused Atlassian types (90% reduction)
2. **Custom Codegen Plugin** - Generates args-map for tree-shaking  
3. **Type Generation** - Creates minimal TypeScript types
4. **Type Transformation** - Template literals for type magic
5. **Runtime Builder** - gqlb's proxy-based query builder

**Result:**
- 120KB bundle (vs 850KB with traditional codegen)
- Instant autocomplete (vs 3-5s delay)
- Full type safety for all 8000+ types
- Dynamic field selection

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## 📦 Dependencies

- `gqlb` - The core runtime query builder
- `graphql` - GraphQL implementation
- `graphql-request` - Lightweight GraphQL client (peer dependency)
- `@graphql-typed-document-node/core` - TypedDocumentNode types

## 🔄 Regenerating Types

To update types after Atlassian schema changes:

```bash
npm run gen
```

This will:
1. Fetch the latest Atlassian GraphQL schema
2. Prune unused types
3. Generate TypeScript types and args-map
4. Update the gqlb builder configuration

## 💡 Use This as a Template

Want to use gqlb with your own GraphQL API? This package is a great starting point:

1. Copy the structure
2. Replace Atlassian schema with your schema
3. Update the codegen config
4. Run `npm run gen`
5. Start building queries!

See the [gqlb documentation](../gqlb) for more details.

## 🎯 Why This Demo?

Atlassian's GraphQL schema is **massive** (8000+ types) and **complex** (deep nesting, unions, interfaces). It's a perfect stress test for gqlb:

- Traditional codegen → 850KB+ bundles, slow IDE
- typed-graphql-builder → 130,000 lines of code, IDE crashes
- **gqlb → 120KB bundle, instant autocomplete, full type safety** ✨

This demonstrates that gqlb can handle **any** GraphQL schema, no matter how complex.

## 🔗 Related

- **[gqlb](../gqlb)** - The core library (works with any GraphQL API)
- **[@atlassian-tools/cli](../atlassian-cli)** - CLI demo using this package
- **[Innovation Deep Dive](../../docs/INNOVATION.md)** - How gqlb works
- **[Architecture Details](./docs/ARCHITECTURE.md)** - This package's structure

## 📄 License

MIT

---

**This is a demo/reference implementation. For the core library, see [`gqlb`](../gqlb).**
