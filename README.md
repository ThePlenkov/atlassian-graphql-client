# Atlassian GraphQL Client

A modern, type-safe monorepo for working with Atlassian's GraphQL API, featuring a runtime proxy-based query builder and CLI tools.

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

## ✨ Features

- **🎯 Runtime Type Safety** - Full TypeScript types without code generation
- **🚀 Zero Config** - Works with any GraphQL schema
- **📦 Monorepo Architecture** - Independent packages, shared utilities
- **🔐 OAuth & Token Auth** - Multiple authentication methods
- **🎨 Dynamic Fields** - Select fields at runtime
- **📊 JSON Output** - Perfect for scripting with `jq`
- **🔍 Verbose Mode** - Debug with detailed logs

## 🛠️ Development

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for:
- Setup instructions
- Building packages
- Testing locally
- Contributing guidelines

## 📚 Documentation

- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, building, testing
- **[gqlb Architecture](./docs/GQLB-ARCHITECTURE.md)** - Proxy builder internals
- **[Atlassian GraphQL Architecture](./docs/ATLASSIAN-GRAPHQL-ARCHITECTURE.md)** - Schema handling
- **[Demo Walkthrough](./docs/DEMO.md)** - Step-by-step examples

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

