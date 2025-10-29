# gqlb -GraphQL Query Builder

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

const query = builder.query.GetUser(q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.posts({ first: 10 }, posts => [
      posts.title,
      posts.content
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
- 🎨 **Clean syntax** - Named query shorthand & variables proxy
- 🌲 **Deep variables** - Nested variable objects just work

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
    user.id,
    user.name,
    user.email,
    user.posts({ first: 10 }, posts => [
      posts.id,
      posts.title,
      posts.content
    ])
  ])
]);

// Execute with any GraphQL client
import { GraphQLClient } from 'graphql-request';
const client = new GraphQLClient('https://api.example.com/graphql');
const result = await client.request(query, { userId: '123' });
```

## Convenient Syntax

### Named Query Shorthand

Use the query name as a property for cleaner syntax:

```typescript
// Traditional syntax
const query = builder.query('GetUser', q => [...]);

// Shorthand syntax - same result!
const query = builder.query.GetUser(q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.email
  ])
]);
```

### Variables Proxy

Create a variables proxy once and use it like a regular object:

```typescript
import { createQueryBuilder, $args } from 'gqlb';

// Create variables proxy
const vars = $args({
  userId: String,
  limit: Number,
  filters: {
    status: String,
    priority: String
  }
});

// Use variables naturally in your query
const query = builder.query.GetUserPosts(q => [
  q.user({ id: vars.userId }, user => [
    user.id,
    user.name,
    user.posts({ 
      first: vars.limit,
      status: vars.filters.status,      // ✓ Deep variables supported!
      priority: vars.filters.priority
    }, posts => [
      posts.id,
      posts.title
    ])
  ])
]);

// Execute with variables
const result = await client.request(query, {
  userId: '123',
  limit: 10,
  filters: {
    status: 'OPEN',
    priority: 'HIGH'
  }
});
```

Both the traditional `$$<T>('name')` syntax and the `$args()` proxy are supported!

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

Getting full type safety with gqlb requires a few setup steps. Here's the complete flow:

### 1. Install Dependencies

```bash
npm install gqlb graphql
npm install --save-dev @graphql-codegen/cli @graphql-codegen/typescript
```

### 2. Configure Type Generation

Create a `codegen.ts` file:

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'your-schema.graphql',  // or URL to your API
  generates: {
    'src/generated/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'unknown'
        }
      }
    }
  }
};

export default config;
```

### 3. Generate Types

```bash
npx graphql-codegen
```

This creates TypeScript types from your GraphQL schema.

### 4. Create Your Typed Builder

Create a wrapper file (e.g., `src/builder.ts`):

```typescript
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';
import { createQueryBuilder as createGqlbBuilder } from 'gqlb';
import type { TypedQueryBuilder } from 'gqlb';
import type { Query, Mutation } from './generated/schema-types.js';

// Transform your generated types to gqlb's FieldFn format
// (This requires utility types - see atlassian-graphql package for reference)
import type { QueryFields, MutationFields } from './generated/types.js';

const schema = buildSchema(readFileSync('./schema.graphql', 'utf-8'));

export function createQueryBuilder(): TypedQueryBuilder<QueryFields, MutationFields> {
  return createGqlbBuilder(schema) as any;
}

export { $$, $args } from 'gqlb';
```

### 5. Build Queries with Full Type Safety!

```typescript
import { createQueryBuilder, $$ } from './builder.js';

const builder = createQueryBuilder();
const userId = $$<string>('userId');

// Now you have FULL autocomplete and type checking!
const query = builder.query('GetUser', q => [
  q.user({ id: userId }, user => [
    user.id,
    user.name,
    user.email
  ])
]);
```

### Quick Template

The easiest way to get started is to use the [`atlassian-graphql`](./packages/atlassian-graphql) package as a template:

1. Copy its structure (`codegen.ts`, `src/types.ts`, `src/index.ts`)
2. Replace the Atlassian schema with your schema
3. Update the codegen config with your schema URL/path
4. Run `npx graphql-codegen`
5. Start building queries!

See our [documentation](./docs) and the [atlassian-graphql package](./packages/atlassian-graphql) for complete examples.

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

## 📦 Releasing

This project uses [Nx Release](https://nx.dev/features/manage-releases) with **Conventional Commits** for automated versioning and publishing.

### Conventional Commits

Version bumps are determined automatically from commit messages:

- `feat:` → **minor** version bump (new feature)
- `fix:` → **patch** version bump (bug fix)  
- `BREAKING CHANGE:` or `!` → **major** version bump
- `docs:`, `chore:`, etc. → no version bump

**Examples:**
```bash
git commit -m "feat: add fragment support"        # 1.0.0 → 1.1.0
git commit -m "fix: handle null values"           # 1.0.0 → 1.0.1
git commit -m "feat!: change API signature"       # 1.0.0 → 2.0.0
```

### Local Release

```bash
# Preview what would be released
npm run release:dry-run

# Publish to npm (requires NPM_TOKEN)
npm run release
```

### CI/CD Release (Automated)

Releases are automated via GitHub Actions when changes are pushed to `main`:

1. Push commits with conventional commit messages to `main`
2. GitHub Actions runs quality gates (build, lint, typecheck)
3. Nx Release analyzes commits and determines version bumps
4. Packages are versioned and published to npm
5. Changelogs and GitHub releases are created automatically

**Required Secrets:**
- `NPM_TOKEN` - npm authentication token (configured in GitHub repo settings)

### Quality Gates

The release flow ensures quality by automatically running these checks before publishing:

- ✅ **Build** - All packages build successfully (including dependencies)
- ✅ **Lint** - Code passes ESLint checks
- ✅ **Typecheck** - TypeScript types are valid

These checks are configured as dependencies of the `nx-release-publish` target, so you don't need to run them manually.

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
