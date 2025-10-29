# Atlassian GraphQL Client

**A novel GraphQL code generation approach that achieves the impossible: dynamic queries + full type safety + tiny bundles**

Built with a multi-stage pipeline that combines schema pruning, standard codegen, custom plugins, and runtime proxies to deliver the best developer experience possible.

> 🚀 **[Read about our innovation →](./docs/INNOVATION.md)**  
> 📝 **[Read the blog post →](./docs/BLOG_POST.md)**

## Why This Is Different

```typescript
// ✅ Dynamic field selection (choose at runtime)
// ✅ Full TypeScript autocomplete (knows all 8000+ types)
// ✅ Tiny bundles (120KB vs 850KB)
// ✅ Fast IDE (instant autocomplete vs 3-5s delay)

const query = builder.query('GetIssue', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key(),              // Perfect autocomplete!
      issue.summaryField(s => [ // TypeScript knows everything!
        s.text()
      ])
    ])
  ])
]);
```

**vs traditional approaches that force you to choose between dynamic queries OR type safety, never both.**

## 📦 Packages

### [gqlb](./packages/gqlb)
**Runtime proxy-based GraphQL query builder with full type safety**

Zero code generation, runtime proxy magic for building type-safe GraphQL queries.

```typescript
import { createQueryBuilder, $$ } from 'gqlb';

const builder = createQueryBuilder(schema);
const issueId = $$<string>('issueId');

const query = builder.query(q => [
  q.jira(jira => [
    jira.issue({ id: issueId }, issue => [
      issue.id(),
      issue.key(),
      issue.summary()
    ])
  ])
]);
```

### [@atlassian-tools/gql](./packages/atlassian-graphql)
**Typed GraphQL client for Atlassian APIs**

Pre-configured client with Atlassian's GraphQL schema, built on top of `gqlb`.

```typescript
import { createQueryBuilder } from '@atlassian-tools/gql';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://your-company.atlassian.net/gateway/api/graphql', {
  headers: { authorization: `Bearer ${token}` }
});

const builder = createQueryBuilder();
// Build queries with full type safety...
```

### [@atlassian-tools/cli](./packages/atlassian-cli)
**Command-line interface for Atlassian APIs**

Interactive CLI with OAuth/token authentication and dynamic field selection.

```bash
# Install globally
npm install -g @atlassian-tools/cli

# Or use with npx
npx jira auth login
npx jira get ISSUE-123
npx jira get ISSUE-123 --fields "key,summary,status" --json | jq
```

### [cli-oauth](./packages/cli-oauth)
**Shared OAuth utilities for CLI applications**

Generic OAuth 2.0 authentication with async file I/O and atomic writes.

## 🚀 Quick Start

### Using the CLI

```bash
# Configure your Atlassian instance
cat > ~/.atlassian-tools/config.json << 'EOF'
{
  "baseUrl": "https://your-company.atlassian.net",
  "auth": {
    "type": "token",
    "token": {
      "email": "your.email@company.com"
    }
  }
}
EOF

# Login with API token
npx jira auth login

# Fetch an issue
npx jira get PROJ-123

# Fetch with specific fields
npx jira get PROJ-123 --fields "key,summary,assigneeField.user.name"

# JSON output for scripting
npx jira get PROJ-123 --json | jq '.jira.issueByKey.summary'
```

### Using as a Library

```bash
npm install gqlb @atlassian-tools/gql
```

```typescript
import { createQueryBuilder, $$ } from '@atlassian-tools/gql';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(apiUrl, { headers });
const builder = createQueryBuilder();

const cloudId = $$<string>('cloudId');
const issueKey = $$<string>('issueKey');

const query = builder.query('GetJiraIssue', q => [
  q.jira({ cloudId }, jira => [
    jira.issueByKey({ issueKey }, issue => [
      issue.key(),
      issue.summaryField(s => [s.text()]),
      issue.statusField(status => [status.name()])
    ])
  ])
]);

const result = await client.request(query, { 
  cloudId: 'your-cloud-id',
  issueKey: 'PROJ-123' 
});
```

## ✨ Key Innovations

- **🔬 Multi-Stage Pipeline** - Novel 5-stage codegen approach
- **📉 Schema Pruning** - 90% size reduction via config-driven filtering
- **🗺️ Args Map Plugin** - Custom codegen plugin for tree-shaking
- **✨ Type Transformation** - TypeScript magic (template literals + conditionals)
- **🎯 Runtime Proxy Builder** - 300 lines vs 130,000 lines
- **📦 Tiny Bundles** - 86% smaller than traditional approaches
- **⚡ Instant Autocomplete** - 30x faster than typed-graphql-builder
- **🔐 OAuth & Token Auth** - Production-ready CLI with multiple auth methods

## 🛠️ Development

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for:
- Setup instructions
- Building packages
- Testing locally
- Contributing guidelines

## 📚 Documentation

### 🌟 Learn About The Innovation
- **[🚀 Innovation Deep Dive](./docs/INNOVATION.md)** - Complete technical explanation of our approach
- **[📝 Blog Post](./docs/BLOG_POST.md)** - Shareable TL;DR for dev.to, Medium, HN
- **[📊 Comparison Guide](./docs/COMPARISON.md)** - Detailed comparison vs other solutions
- **[📖 Quick Reference](./docs/QUICK_REFERENCE.md)** - One-page cheatsheet

### 🎥 Getting Started
- **[Demo Walkthrough](./docs/DEMO.md)** - Step-by-step examples
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, building, testing, contributing

### 🔧 Technical Deep Dives
- **[gqlb Architecture](./docs/GQLB-ARCHITECTURE.md)** - Runtime proxy builder internals
- **[Atlassian GraphQL Architecture](./docs/ATLASSIAN-GRAPHQL-ARCHITECTURE.md)** - Multi-stage pipeline details

### 📣 Sharing & Promotion
- **[Social Media](./docs/SOCIAL_MEDIA.md)** - Ready-to-post announcements for Twitter, Reddit, etc.
- **[Presentation Guide](./docs/PRESENTATION.md)** - Complete slide deck + speaker notes for talks/workshops

## 🏗️ Architecture

```
┌─────────────────────┐
│   atlassian-cli     │  CLI with auth & commands
│ @atlassian-tools/cli│
└──────────┬──────────┘
           │ uses
           ▼
┌─────────────────────┐
│  atlassian-graphql  │  Atlassian GraphQL client
│ @atlassian-tools/gql│
└──────────┬──────────┘
           │ uses
           ▼
┌─────────────────────┐
│        gqlb         │  Runtime query builder
│   (core library)    │
└─────────────────────┘
```

## 📋 Requirements

- Node.js 18+ (native `fetch` support)
- npm (workspace support)

## 🤝 Contributing

1. Follow documentation structure in [AGENTS.md](./AGENTS.md)
2. Use native Node.js APIs (no unnecessary dependencies)
3. Never hardcode company-specific defaults
4. See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for details

## 📄 License

MIT (or your license)

## 🔗 Links

- [Atlassian GraphQL API](https://developer.atlassian.com/cloud/jira/platform/graphql/)
- [Create API Token](https://id.atlassian.com/manage-profile/security/api-tokens)

---

**Built with ❤️ for the Atlassian developer community**

