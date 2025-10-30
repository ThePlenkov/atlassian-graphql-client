# Atlassian GraphQL Architecture

> **Note:** This document describes the architecture of the **demo application** (`@atlassian-tools/gql` and `@atlassian-tools/cli`) that showcases `gqlb` with Atlassian's massive GraphQL API. For the core `gqlb` library architecture, see [gqlb/docs/ARCHITECTURE.md](../../gqlb/docs/ARCHITECTURE.md).

## Overview

This package demonstrates how to use **gqlb** with a complex, real-world GraphQL API (Atlassian's 8000+ types). It showcases the **multi-stage pipeline** approach that makes gqlb efficient with large schemas.

## Multi-Stage Pipeline

The package uses a **5-stage code generation pipeline** to create a fully-typed, tree-shakeable client:

```
1. Schema Filtering (SDK Config + Scripts)
   ↓ Reads sdk.config.ts
   ↓ Fetches full Atlassian schema
   ↓ Filters to only needed operations
   ↓ Outputs: schema.graphql (pruned) + schema.full.graphql (complete)

2. Base Type Generation (GraphQL Codegen + typescript plugin)
   ↓ Reads schema.graphql
   ↓ Generates standard TypeScript types
   ↓ Outputs: schema-types.ts (~200KB)

3. Full Schema Types (GraphQL Codegen + typescript plugin)
   ↓ Reads schema.full.graphql  
   ↓ Generates complete types for SDK config
   ↓ Outputs: schema-types.full.ts (for config autocomplete)

4. Field Types Generation (gqlb-codegen/field-types plugin)
   ↓ Reads schema.graphql
   ↓ Transforms types into gqlb FieldFn format
   ↓ Outputs: field-types.ts (gqlb-compatible types)

5. Runtime Builder (gqlb)
   ↓ Loads schema at runtime
   ↓ Uses Proxy-based query building
   ↓ Provides full type safety with minimal code
```

## Stage 1: Schema Filtering

**Purpose**: Reduce schema size by 90% by only keeping needed operations

**Implementation**: `scripts/filter-schema.ts`

```typescript
// sdk.config.ts - Declare what operations you need
export default {
  Query: {
    jira: {
      issueByKey: true,
      issueSearchStable: true,
      // 90% of other operations excluded
    }
  },
  Mutation: {
    jira: {
      createIssueLinks: true,
    }
  }
};
```

The filter script:
1. Loads `sdk.config.ts` configuration
2. Fetches Atlassian GraphQL schema via introspection
3. Uses `@graphql-tools/wrap` to filter schema
4. Outputs two files:
   - `schema.graphql` - Pruned schema (only configured operations)
   - `schema.full.graphql` - Complete schema (for config autocomplete)

**Result**: 1.2MB → 120KB (90% reduction)

## Stage 2 & 3: Base Type Generation

**Purpose**: Generate standard TypeScript types from GraphQL schema

**Implementation**: `codegen.ts` and `codegen.full.ts`

```typescript
// codegen.ts - For runtime types
const config: CodegenConfig = {
  schema: 'src/generated/schema.graphql',
  generates: {
    'src/generated/schema-types.ts': {
      plugins: ['typescript'],
      config: {
        skipTypename: true,
        scalars: {
          DateTime: 'string',
          ID: 'string'
        }
      }
    }
  }
};
```

Generates standard TypeScript interfaces:
- Query, Mutation, Subscription types
- Input types for arguments
- Scalar type definitions

## Stage 4: Field Types Generation

**Purpose**: Transform standard types into gqlb-compatible FieldFn format

**Implementation**: `gqlb-codegen/field-types` plugin

```typescript
// codegen.ts (continued)
generates: {
  'src/generated/field-types.ts': {
    plugins: ['gqlb-codegen/field-types'],
    config: {
      schemaTypesImportPath: './schema-types.js'
    }
  }
}
```

This custom plugin:
1. Reads GraphQL schema
2. For each field, determines:
   - If it has arguments → needs args parameter
   - If it returns an object → needs selection function
   - If it's a scalar → direct field access
3. Generates `FieldFn<TSelection, TArgs>` types
4. Imports Args types directly from schema-types.ts (enables tree-shaking!)

**Output**: `field-types.ts` with types like:

```typescript
export interface QueryFields {
  jira: (
    args: { cloudId: string },
    select: (jira: JiraQueryFields) => any
  ) => JiraQuery;
}

export interface JiraQueryFields {
  issueByKey: (
    args: JiraQueryissueByKeyArgs,
    select: (issue: JiraIssueFields) => any
  ) => JiraIssue;
}
```

## Stage 5: Runtime Builder

**Purpose**: Provide runtime query building with full type safety

**Implementation**: `src/index.ts`

```typescript
import { createQueryBuilder as createGqlbBuilder } from 'gqlb';
import type { QueryFields, MutationFields } from './generated/field-types.js';

// Load schema from bundled .graphql file
const schema = buildSchema(schemaSDL);

export function createQueryBuilder(): QueryBuilder<QueryFields, MutationFields> {
  return createGqlbBuilder<QueryFields, MutationFields>(schema);
}
```

The builder uses gqlb's proxy-based implementation to:
1. Walk the schema at runtime
2. Build GraphQL query strings dynamically
3. Provide full TypeScript autocomplete via `QueryFields` types
4. Enable tree-shaking (only bundle fields you use!)

## File Structure

```
packages/atlassian-graphql/
├── src/
│   ├── index.ts                      # Exports createQueryBuilder
│   └── generated/                    # All generated code
│       ├── schema.graphql            # Filtered schema (120KB)
│       ├── schema.full.graphql       # Complete schema (1.2MB)
│       ├── schema-types.ts           # TypeScript types from filtered schema
│       ├── schema-types.full.ts      # TypeScript types from full schema
│       └── field-types.ts            # gqlb-compatible field types
├── scripts/
│   ├── filter-schema.ts              # Schema filtering logic
│   ├── list-queries.ts               # Utility to list available queries
│   ├── list-modules.ts               # Utility to list SDK modules
│   └── analyze-structure.ts          # Schema analysis tool
├── sdk.config.ts                     # Declares which operations to include
├── codegen.ts                        # GraphQL Codegen config (pruned schema)
├── codegen.full.ts                   # GraphQL Codegen config (full schema)
└── tsdown.config.ts                  # Build configuration
```

## Nx Tasks

The package defines several Nx tasks for the pipeline:

```bash
# Generate filtered schemas from Atlassian API
nx run graphql:gen:schema

# Generate TypeScript types from filtered schema
nx run graphql:gen:codegen

# Generate TypeScript types from full schema (for SDK config)
nx run graphql:gen:codegen-full

# Run all generation steps
nx run graphql:gen

# Build the package
nx run graphql:build

# Utilities
nx run graphql:list:queries      # List available queries
nx run graphql:list:modules      # List SDK modules
nx run graphql:analyze           # Analyze schema structure
```

## Key Benefits

### 1. Minimal Generated Code

**Before (typed-graphql-builder)**: 3.5MB, 132,000 lines
**After (gqlb pipeline)**: 200KB, 8,000 lines

**94% reduction!**

### 2. Fast IDE Performance

- Standard TypeScript types load quickly
- No massive builder classes to parse
- Instant autocomplete (<100ms vs 3-5s)

### 3. Tree-Shaking Friendly

Direct imports from `schema-types.ts` enables tree-shaking:

```typescript
// Only imports what you use!
import type { JiraIssue, JiraQueryissueByKeyArgs } from './schema-types.js';
```

**Bundle size**: 120KB (vs 850KB with traditional approaches)

### 4. Maintainable

- Standard tools (GraphQL Codegen)
- Small custom plugin (field-types)
- Tiny runtime (gqlb)
- Clear separation of concerns

## SDK Configuration

The `sdk.config.ts` file is the **single source of truth** for which operations are available:

```typescript
import type { SDKConfig } from '@atlassian-tools/gql/codegen';

const config: SDKConfig = {
  Query: {
    jira: {
      issueByKey: true,        // ✓ Include
      issueSearchStable: true,
      // Other operations excluded by default
    }
  }
};

export default config;
```

**Benefits**:
- **Full autocomplete** - TypeScript knows all available operations
- **Explicit control** - Only include what you need
- **Clear documentation** - Config file documents the API surface
- **Smaller bundles** - Unused types are excluded

## Comparison with Previous Approach

### Old Approach (typed-graphql-builder)

```
Atlassian Schema
  ↓
typed-graphql-builder CLI
  ↓
3.5MB builder.ts with 132,000 lines
  ↓
Runtime usage with generated classes
```

**Problems**:
- ❌ Massive generated files
- ❌ Slow IDE performance
- ❌ Large bundles even with tree-shaking
- ❌ Slow build times

### New Approach (gqlb pipeline)

```
Atlassian Schema
  ↓ filter-schema.ts (90% reduction)
Filtered Schema (120KB)
  ↓ graphql-codegen (standard plugins)
schema-types.ts (200KB)
  ↓ gqlb-codegen/field-types (custom plugin)
field-types.ts (type transformations)
  ↓ gqlb runtime (proxy-based)
Full type safety + dynamic queries
```

**Benefits**:
- ✅ 94% smaller generated code
- ✅ 30x faster autocomplete
- ✅ 86% smaller bundles
- ✅ 2.3x faster builds

## Related Documentation

- [gqlb Core Architecture](../../gqlb/docs/ARCHITECTURE.md) - Runtime builder internals
- [Innovation Deep Dive](../../../docs/INNOVATION.md) - Complete technical explanation
- [Comparison Guide](../../../docs/COMPARISON.md) - vs other solutions
- [Development Guide](../../../docs/DEVELOPMENT.md) - Building and contributing

## References

- [gqlb Package](../../gqlb) - Core runtime builder
- [gqlb-codegen Package](../../gqlb-codegen) - Custom GraphQL Codegen plugins
- [@atlassian-tools/cli](../../atlassian-cli) - CLI demo using this package
