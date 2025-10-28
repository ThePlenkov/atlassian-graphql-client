# Project Rules

## Documentation

### Package READMEs (End-User Focused)
- Write as if published on npmjs.com
- Include: Installation, usage examples, API reference
- Exclude: Build instructions, development setup, architecture

### Root `docs/` (Contributor Focused)
- Development setup, architecture, contributing guidelines
- Examples: `docs/DEVELOPMENT.md`, `docs/ARCHITECTURE.md`

### Package `docs/` (Advanced User Guides)
- Detailed usage guides and examples for end users
- Location: `packages/[name]/docs/`

### ❌ Don't Create
- `ARCHITECTURE.md` in packages → use root `docs/`
- `BUILD.md` anywhere → use `docs/DEVELOPMENT.md`
- Development content in package READMEs

## Code Style

### Dependencies
- Use latest stable versions when adding packages
- Prefer native Node.js APIs over external dependencies:
  - Use `fetch` instead of `axios`
  - Use `fs/promises` instead of `fs-extra`
  - Use built-in modules when possible

### TypeScript
- Use modern async/await (not callbacks)
- ESM imports: include `.js` extension for local files
  ```typescript
  import { foo } from './utils.js';  // ✓
  import { foo } from './utils';     // ✗
  ```
- Avoid unnecessary type assertions

### Configuration
- Never hardcode company-specific URLs or defaults
- Require explicit user configuration
- Support environment variable overrides

## Monorepo Conventions

### Workspace References
```json
{
  "dependencies": {
    "internal-package": "*"
  }
}
```

### Build Order
Packages: `gqlb` → `atlassian-graphql` → `atlassian-cli`

### No Lock Files
We ignore lock files to avoid conflicts. Run `npm install` after pulling.

