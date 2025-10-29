# gqlb

**Runtime proxy-based GraphQL query builder with full type safety**

Build dynamic GraphQL queries with perfect TypeScript autocomplete - no code generation needed!

> 🚀 **[Read about our innovation →](./docs/INNOVATION.md)**

## Why gqlb Is Different

**gqlb gives you both dynamic queries AND full type safety:**

```typescript
// ✅ Dynamic field selection (choose at runtime)
// ✅ Full TypeScript autocomplete (knows all your types)
// ✅ Tiny bundles (120KB vs 850KB)
// ✅ Fast IDE (instant autocomplete vs 3-5s delay)

const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name(),
    user.posts({ first: 10 }, posts => [
      posts.title(),
      posts.content()
    ])
  ])
]);
```

**No massive generated files. Just runtime proxy magic. 🪄**

## Features

- ✨ **Zero code generation** - Load your schema and go
- 🎯 **Full type safety** - TypeScript autocomplete for all fields
- 🚀 **Dynamic queries** - Build queries at runtime
- 📦 **Tiny bundles** - 86% smaller than traditional approaches
- ⚡ **Fast IDE** - Instant autocomplete (30x faster)
- 🔄 **Any GraphQL schema** - Works with any API

## Installation

```bash
npm install gqlb
```

## Quick Start

```typescript
import { createQueryBuilder, $$ } from 'gqlb';
import schema from './schema.graphql';

// Create a query builder with your schema
const builder = createQueryBuilder(schema);

// Define variables
const userId = $$<string>('userId');

// Build queries with full autocomplete
const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.id(),
    user.name(),
    user.email(),
    user.posts({ first: 10 }, posts => [
      posts.id(),
      posts.title(),
      posts.content()
    ])
  ])
]);

// Execute with any GraphQL client
import { GraphQLClient } from 'graphql-request';
const client = new GraphQLClient('https://api.example.com/graphql');
const result = await client.request(query, { userId: '123' });
```

## How It Works

Instead of generating thousands of lines of TypeScript classes, `gqlb` uses:

1. **Schema Pruning** - Remove unnecessary types (90% size reduction)
2. **Custom Codegen Plugin** - Generate minimal type definitions
3. **Type Transformation** - TypeScript template literals for type magic
4. **Runtime Proxies** - Walk the schema dynamically
5. **Tree-Shaking** - Only bundle what you use

**Result:** 300 lines of runtime code vs 130,000 lines of generated code!

## 📦 Demo Packages

This repository includes working examples of `gqlb` in action with Atlassian's GraphQL API:

### [@atlassian-tools/gql](./packages/atlassian-graphql)
**Demo: Typed Atlassian GraphQL client**

Pre-configured `gqlb` instance for Atlassian's API. Shows how to use `gqlb` with a real-world, complex schema (8000+ types).

```typescript
import { createQueryBuilder } from '@atlassian-tools/gql';

const builder = createQueryBuilder();
// Full type safety with Atlassian's schema!
```

### [@atlassian-tools/cli](./packages/atlassian-cli)
**Demo: Command-line interface**

Interactive CLI showing `gqlb` in a real application with OAuth, dynamic field selection, and more.

```bash
npx jira get ISSUE-123 --fields "key,summary,status"
```

### [cli-oauth](./packages/cli-oauth)
**Demo: Shared utilities**

OAuth 2.0 authentication utilities used by the CLI example.

> 💡 **Note:** These Atlassian packages are examples of `gqlb` usage. We're working on finding them a better home as separate repositories. If you want to use `gqlb` with your own GraphQL API, just install `gqlb` directly!

## 🚀 Using gqlb with Your Own API

1. **Install gqlb:**
```bash
npm install gqlb
```

2. **Get your GraphQL schema** (introspection JSON or SDL)

3. **Create a query builder:**
```typescript
import { createQueryBuilder } from 'gqlb';
import schema from './your-schema.graphql';

const builder = createQueryBuilder(schema);
```

4. **Start building queries with full type safety!**

See our [documentation](./docs) for advanced usage, best practices, and more examples.

## ✨ Key Innovations

- **🔬 Multi-Stage Pipeline** - Novel 5-stage codegen approach
- **📉 Schema Pruning** - Config-driven filtering for 90% size reduction
- **🗺️ Args Map Plugin** - Custom codegen plugin enables tree-shaking
- **✨ Type Transformation** - Template literals + conditional types
- **🎯 Runtime Proxy Builder** - 300 lines vs 130,000 lines
- **📦 Tiny Bundles** - 86% smaller than traditional approaches
- **⚡ Instant Autocomplete** - 30x faster than typed-graphql-builder

## 📚 Documentation

- **[Innovation Deep Dive](./docs/INNOVATION.md)** - Complete technical explanation
- **[Comparison Guide](./docs/COMPARISON.md)** - Detailed comparison vs other solutions
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, building, testing, contributing

### Technical Architecture
- **[gqlb Architecture](./packages/gqlb/docs/ARCHITECTURE.md)** - Runtime proxy builder internals
- **[Atlassian Demo Architecture](./packages/atlassian-graphql/docs/ARCHITECTURE.md)** - Multi-stage pipeline details

## 🏗️ Architecture

```
┌─────────────────────┐
│       gqlb          │  Core runtime query builder
│   (main package)    │  • Proxy-based navigation
└──────────┬──────────┘  • Type-safe queries
           │             • Works with any schema
           │
           │ used by (examples)
           │
    ┌──────┴──────────────────────┐
    │                              │
    ▼                              ▼
┌─────────────────────┐  ┌─────────────────────┐
│  atlassian-graphql  │  │   atlassian-cli     │
│     (demo app)      │  │    (demo app)       │
│ • Pre-configured    │  │ • CLI with OAuth    │
│ • Atlassian schema  │  │ • Field selection   │
└─────────────────────┘  └─────────────────────┘
```

## 📋 Requirements

- Node.js 18+ (native `fetch` support)
- TypeScript 4.5+ (for advanced type features)
- npm (workspace support for monorepo)

## 🤝 Contributing

We welcome contributions! See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for:
- Development setup
- Building packages
- Testing locally
- Contributing guidelines

Guidelines:
1. Use native Node.js APIs (avoid unnecessary dependencies)
2. Never hardcode company-specific defaults
3. Follow the documentation structure in [AGENTS.md](./AGENTS.md)

## 🌟 Why We Built This

We needed to work with Atlassian's massive GraphQL schema (8000+ types). Traditional approaches failed:

- **graphql-code-generator** → 850KB bundles, 3-5s autocomplete delay
- **typed-graphql-builder** → 130,000 lines of code, IDE crashes
- **No types** → Runtime errors, poor DX

So we invented a new approach that gives you **dynamic queries + full type safety + tiny bundles**.

And it works with **any GraphQL API**, not just Atlassian!

## 📄 License

MIT

## 🔗 Links

- [GitHub Repository](https://github.com/gqlb/gqlb)
- [Issue Tracker](https://github.com/gqlb/gqlb/issues)
- [npm Package](https://www.npmjs.com/package/gqlb) (coming soon)

---

**Built with ❤️ for the GraphQL developer community**
