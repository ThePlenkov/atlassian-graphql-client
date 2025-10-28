# Atlassian GraphQL SDK

A fully typed TypeScript SDK for the Atlassian GraphQL API with **dynamic field selection** using `typed-graphql-builder`.

## ✨ Features

- 🎯 **Dynamic Field Selection** - Select only the fields you need at runtime
- 🔒 **Full Type Safety** - Complete TypeScript autocomplete and type checking  
- 🚀 **Proxy-Based API** - Intuitive, chainable query building
- 📦 **Zero Query Strings** - No manual GraphQL string writing needed
- 🔧 **Works with graphql-request** - Use your existing GraphQL client

## 🚀 Quick Start

```typescript
import { GraphQLClient } from 'graphql-request';
import { Query, $ } from '@your-org/atlassian-graphql';

// Create a GraphQL client
const client = new GraphQLClient('https://api.atlassian.com/graphql', {
  headers: {
    authorization: `Bearer ${process.env.ATLASSIAN_TOKEN}`,
  },
});

// Build a query with dynamic field selection
const query = new Query();
const issueSearchQuery = query.jira(j => [
  j.issueSearch({
    cloudId: $('cloudId'),
    issueSearchInput: $('input'),
    first: 10
  }, search => [
    search.edges(edge => [
      edge.node(node => [
        node.id,
        node.key,
        node.summary,
        node.assignee(a => [
          a.accountId,
          a.displayName
        ])
      ])
    ]),
    search.pageInfo(p => [p.hasNextPage, p.endCursor])
  ])
]);

// Execute with variables
const result = await client.request(issueSearchQuery, {
  cloudId: 'your-cloud-id',
  input: { jql: 'project = DEMO' }
});
```

## 🎯 How It Works

1. **Generate builder from schema**:
   ```bash
   npm run gen
   ```

2. **Build queries with proxy-based field selection** - TypeScript will autocomplete all available fields!

3. **Execute with any GraphQL client** that supports `TypedDocumentNode`

## 🏗️ Architecture

### typed-graphql-builder
This SDK uses `typed-graphql-builder` to generate a fully-typed query builder from the Atlassian GraphQL schema:

1. **Schema Fetch**: Downloads the complete Atlassian GraphQL schema
2. **Builder Generation**: Generates TypeScript proxy-based builders with `typed-graphql-builder` CLI
3. **Type Safety**: Every field, argument, and return type is fully typed

The generated builder provides:
- **Query class**: Build GraphQL queries with method chaining
- **$() function**: Create typed variables for your queries
- **Full autocomplete**: IntelliSense for all fields and nested selections

## 📚 Usage Examples

### Basic Issue Query

```typescript
import { Query, $ } from '@your-org/atlassian-graphql';

const query = new Query();
const singleIssueQuery = query.jira(j => [
  j.issue({ id: $('issueId') }, issue => [
    issue.id,
    issue.key,
    issue.summary,
    issue.description
  ])
]);

// Execute with graphql-request
const result = await client.request(singleIssueQuery, {
  issueId: 'issue-123'
});
```

### Nested Field Selection

```typescript
const detailedQuery = query.jira(j => [
  j.issueSearch({
    cloudId: $('cloudId'),
    issueSearchInput: $('input')
  }, search => [
    search.edges(edge => [
      edge.node(node => [
        node.key,
        node.summary,
        node.assignee(a => [
          a.displayName,
          a.emailAddress
        ]),
        node.status(s => [
          s.name,
          s.statusCategory(cat => [
            cat.key,
            cat.name
          ])
        ])
      ])
    ])
  ])
]);
```

### Confluence Queries

```typescript
const spacesQuery = query.confluence({
  cloudId: $('cloudId')
}, c => [
  c.spaces({ keys: $('keys'), first: 10 }, spaces => [
    spaces.edges(edge => [
      edge.node(node => [
        node.id,
        node.key,
        node.name,
        node.description
      ])
    ])
  ])
]);
```

See `examples/builder-usage.ts` for more examples!

## 🚀 Scripts

- **`npm run gen`** - Generate builder from Atlassian GraphQL schema
- **`npm run build`** - Compile TypeScript to dist/

## 🛠️ Technical Details

- **Builder Library**: Uses `typed-graphql-builder` for proxy-based query construction
- **Type Safety**: Full TypeScript support with inference for queries, variables, and results
- **GraphQL Client**: Compatible with `graphql-request`, Apollo Client, urql, and any client supporting `TypedDocumentNode`
- **Modular Architecture**: Atlassian API uses namespaced modules (jira, confluence, bitbucket, etc.)

## 📦 Dependencies

- `graphql` - GraphQL implementation
- `graphql-request` - Lightweight GraphQL client  
- `typed-graphql-builder` - Proxy-based query builder with full TypeScript support
- `graphql-tag` - Parse GraphQL query strings
- `@graphql-typed-document-node/core` - TypedDocumentNode type definitions

## 🔄 Regenerating the Builder

To update the builder after Atlassian schema changes:

```bash
npm run gen
```

This will:
1. Fetch the latest Atlassian GraphQL schema
2. Generate a new `src/generated/builder.ts` with updated types
3. You can now use new fields and operations immediately

## 💡 Tips

- **IntelliSense is your friend**: Let your IDE autocomplete field names - no need to memorize the schema!
- **Select only what you need**: Unlike REST, you explicitly choose fields, optimizing payload size
- **Nested selections**: Use callback functions for nested objects like `node.assignee(a => [a.displayName])`
- **Variables for reusability**: Use `$('varName')` to create reusable queries with different inputs

---

**Status**: ✅ Fully working with dynamic field selection!
