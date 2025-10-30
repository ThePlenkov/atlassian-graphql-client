# Changelog

All notable changes to **gqlb** and demo packages will be documented in this file.

## [Unreleased]

### Fixed

- Fixed ESLint errors across all packages by removing unused dependencies from package.json files
- Fixed empty function linter errors in SilentLogger by adding eslint-disable comments
- Fixed TypeScript linter errors for inferrable types and unsafe function types
- Fixed empty catch block linter error in atomic storage with appropriate comment
- Fixed TypeScript typecheck errors in link-issues.ts demo code with proper type assertions
- Removed unnecessary TypeScript project references and composite settings from configuration

### gqlb - Runtime Proxy-Based GraphQL Query Builder

**Core Innovation:**
- ✨ Runtime proxy-based query builder with full TypeScript type safety
- 🎯 Dynamic field selection (choose fields at runtime)
- 📦 Tiny bundles (86% smaller than traditional approaches)
- ⚡ Instant IDE autocomplete (30x faster)
- 🌳 Tree-shakeable with zero code generation

**Key Features:**
- Full TypeScript autocomplete for all GraphQL types
- Type-safe variables with `$$<T>(name)` and `$<T>(name)`
- Nested object selection with compile-time validation
- Works with any GraphQL schema
- Compatible with all GraphQL clients

### Demo Applications

**@atlassian-tools/gql**
- Pre-configured gqlb instance for Atlassian's GraphQL API
- Demonstrates gqlb with 8000+ types
- Schema pruning (90% size reduction)
- Custom codegen pipeline

**@atlassian-tools/cli**
- Interactive CLI powered by gqlb
- OAuth 2.0 and token authentication
- Dynamic field selection at runtime
- JSON output for scripting

**cli-oauth**
- Generic OAuth 2.0 library for CLI apps
- Automatic token refresh
- Secure credential storage
- Provider agnostic

### Documentation

Comprehensive documentation covering:
- [Innovation Deep Dive](./docs/INNOVATION.md) - Technical architecture
- [Comparison Guide](./docs/COMPARISON.md) - vs other solutions
- [Development Guide](./docs/DEVELOPMENT.md) - Setup and contributing

### Performance

Compared to typed-graphql-builder:
- 94% smaller generated code (3.5MB → 200KB)
- 30x faster autocomplete (3-5s → <100ms)
- 2.3x faster builds
- 86% smaller bundles (850KB → 120KB)

---

For detailed release notes, see [GitHub Releases](https://github.com/gqlb/gqlb/releases).
