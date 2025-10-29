# Project Rules

## 🚨 MOST IMPORTANT RULE 🚨

**DO NOT CREATE NEW DOCUMENTATION (.md) FILES**

We have 14 documentation files in `docs/` - that's enough. When working on docs:
- ✅ UPDATE existing files
- ✅ DELETE outdated content  
- ❌ NEVER create new .md files (unless user explicitly asks)

## Repository Focus

**Main Package:** `gqlb` - Runtime proxy-based GraphQL query builder
**Demo Packages:** `@atlassian-tools/gql` and `@atlassian-tools/cli` - Example usage with Atlassian's GraphQL API (8000+ types)

The Atlassian packages are reference implementations showing gqlb's capabilities with a complex, real-world schema. They will be moved to a separate repository soon.

## Documentation

### 🚨 CRITICAL POLICY: CHALLENGE BEFORE CREATING 🚨

**Before adding ANY new documentation:**

1. ❓ **Does this duplicate existing content?** → Update the existing doc instead
2. ❓ **Does this conflict with existing content?** → Resolve the conflict first
3. ❓ **Is this really needed?** → Most new docs are unnecessary
4. ❓ **Could this be part of an existing doc?** → Add a section instead

**Default answer: NO new markdown files. Update existing ones.**

### Documentation System

**Root Level:**
- `README.md` - Main project entry point
- `CHANGELOG.md` - Version history only
- `AGENTS.md` - This file

**docs/** - General documentation
- Core technical docs (innovation, comparison, guides)
- `examples/` - Canonical code samples (single source of truth)
- `media/` - External marketing materials (blog posts, social, presentations)

**packages/[name]/docs/** - Package-specific technical documentation
- Package internals, architecture, advanced usage
- Keep package READMEs user-facing (like npmjs.com)

### Documentation Principles

1. **Single Source of Truth** - One canonical place for each piece of information
2. **No Duplication** - Link to existing content instead of copying
3. **Update Over Create** - Always prefer updating existing docs
4. **Package-Specific = Package Docs** - Technical details belong with the package
5. **Marketing Separate** - Keep external materials in `docs/media/`

### When Adding Content

**Always ask:**
- Where does this logically belong?
- Does something like this already exist?
- Can I add this to an existing document?
- Will this create maintenance burden?

**If creating a new file is truly needed:**
- Get explicit user approval first
- Explain why existing docs can't be updated
- Ensure it has a clear, unique purpose

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

### Package Configuration
- All packages must use `"type": "module"` in their `package.json`
- Enables ESM by default for all packages

### Workspace References
```json
{
  "dependencies": {
    "internal-package": "*"
  }
}
```

### Build Order
Main: `gqlb` (core library)
Demos: `atlassian-graphql` → `atlassian-cli` (example applications)

### Dev Dependencies
- **All devDependencies at root level only**
- Individual packages must NOT have their own devDependencies
- Shared build tools (TypeScript, GraphQL Codegen, etc.) are installed once at root

### No Lock Files
We ignore lock files to avoid conflicts. Run `npm install` after pulling.

