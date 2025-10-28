# Development Guide

This guide is for contributors who want to work on the monorepo codebase.

## Prerequisites

- Node.js 18+ (with native `fetch` support)
- npm (workspace support)

## Setup

```bash
# Clone the repository
git clone <repository-url>
cd atlassian-graphql-client

# Install dependencies (uses npm workspaces)
npm install
```

## Project Structure

```
atlassian-graphql-client/
├── packages/
│   ├── gqlb/                      # Runtime Proxy-based GraphQL query builder
│   ├── atlassian-graphql/         # Atlassian GraphQL client (uses gqlb)
│   ├── atlassian-cli/             # Atlassian CLI (uses atlassian-graphql)
│   └── cli-oauth/                 # Shared OAuth utilities for CLIs
├── docs/                          # Development & architecture docs
│   ├── DEVELOPMENT.md             # This file
│   ├── GQLB-ARCHITECTURE.md       # gqlb internals
│   ├── ATLASSIAN-GRAPHQL-ARCHITECTURE.md
│   └── DEMO.md                    # Demo walkthrough
└── AGENTS.md                      # Agent rules & guidelines
```

## Building Packages

### Build All Packages

```bash
# Build all packages in dependency order
npx nx run-many --target=build --all
```

### Build Specific Package

```bash
# Build gqlb
npx nx build gqlb

# Build atlassian-graphql
npx nx build graphql

# Build atlassian-cli
npx nx build atlassian-cli
```

### Watch Mode (Development)

```bash
# Build and watch for changes
npx nx build gqlb --watch
```

## Testing Locally

### Using npm link (Not Recommended)

We use npm workspaces, so avoid `npm link`. Instead:

### Using npx from Workspace

```bash
# Run CLI from workspace
npx jira get ISSUE-123

# Or with explicit path
npx -w @atlassian-tools/cli jira get ISSUE-123
```

### Testing in External Project

```bash
# In external project
npm install /path/to/atlassian-graphql-client/packages/gqlb
npm install /path/to/atlassian-graphql-client/packages/atlassian-graphql
npm install /path/to/atlassian-graphql-client/packages/atlassian-cli
```

## Development Workflow

### 1. Schema Updates (atlassian-graphql)

When Atlassian's GraphQL schema changes:

```bash
# Introspect and save the schema
cd packages/atlassian-graphql
node scripts/introspect-schema.js

# Or run the nx task
npx nx gen:schema graphql
```

This updates `packages/atlassian-graphql/src/generated/schema.graphql`.

### 2. Making Changes to gqlb

```bash
# Make changes to packages/gqlb/src/

# Build
npx nx build gqlb

# Test with atlassian-graphql
npx nx build graphql

# Test with CLI
npx jira get ISSUE-123 --verbose
```

### 3. Making Changes to atlassian-cli

```bash
# Make changes to packages/atlassian-cli/src/

# Build
npx nx build atlassian-cli

# Test
npx jira --help
npx jira auth login
npx jira get ISSUE-123
```

## Code Style

### TypeScript

- **Modern Node.js APIs**: Use native `fetch`, `fs/promises`, not legacy libraries
- **Async First**: Prefer `async/await` over callbacks
- **ESM Imports**: Use `.js` extensions for local imports (for ESM compatibility)
  ```typescript
  import { foo } from './utils.js';  // ✓ Correct
  import { foo } from './utils';     // ✗ Wrong
  ```
- **No Unnecessary Dependencies**: Leverage native capabilities
  - Use `fetch` instead of `axios`
  - Use `fs/promises` instead of `fs-extra`
  - Use built-in `crypto` instead of external libs

### Dependencies

- **Latest Versions**: Always use the newest stable version when adding packages
- **Check Before Adding**: Can we use native Node.js instead?
- **Workspace References**: Use `"dependency": "*"` for internal packages

## Package Management

### Adding Dependencies

```bash
# Add to specific package
npm install --workspace=packages/gqlb graphql

# Add dev dependency
npm install --save-dev --workspace=packages/atlassian-cli @types/node
```

### Publishing (TODO)

Packages are published to npm:
- `gqlb` → independent, general-purpose
- `@atlassian-tools/gql` → Atlassian-specific
- `@atlassian-tools/cli` → Atlassian CLI

## Nx Tasks

### Available Tasks

```bash
# List all tasks
npx nx show projects

# Show task graph
npx nx graph

# Run task for all packages
npx nx run-many --target=build --all
```

### Custom Tasks (atlassian-graphql)

```bash
# Generate schema
npx nx gen:schema graphql

# List available queries
npx nx list:queries graphql

# Analyze schema structure
npx nx analyze graphql
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Clean and rebuild
rm -rf packages/*/dist packages/*/node_modules node_modules
npm install
npx nx run-many --target=build --all
```

### "Permission denied" when running CLI

```bash
# Make executables
chmod +x packages/atlassian-cli/dist/*.js
```

### Lock file conflicts

We ignore lock files (`package-lock.json`, `pnpm-lock.yaml`, etc.) to avoid conflicts. Just run `npm install` to regenerate.

## Architecture Docs

For deep dives into specific packages:
- [gqlb Architecture](./GQLB-ARCHITECTURE.md) - Proxy-based query builder internals
- [Atlassian GraphQL Architecture](./ATLASSIAN-GRAPHQL-ARCHITECTURE.md) - Schema handling
- [Demo Walkthrough](./DEMO.md) - Step-by-step feature demo

## Contributing

### Before Submitting

1. **Build all packages**: `npx nx run-many --target=build --all`
2. **Test CLI**: Run real commands with `--verbose` flag
3. **Check docs**: Follow documentation rules in `AGENTS.md`
4. **No hardcoded values**: No company-specific defaults

### Documentation Rules

- Package READMEs → End-user focused (installation, usage)
- Root `docs/` → Development, architecture, contributing
- No build instructions in package docs
- See `.cursorrules` for full guidelines

## Getting Help

- Check existing documentation in `docs/`
- Review package READMEs for usage examples
- Look at `packages/*/examples/` for working code samples

