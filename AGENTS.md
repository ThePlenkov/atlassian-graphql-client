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

## Troubleshooting & Error Fixing Protocol

**When fixing errors, NEVER claim success without verification. Always follow this protocol:**

### 1. Verify the Problem
- **Run the failing command** - Don't rely on static analysis alone
- Capture the actual error output
- Identify all affected packages/targets

### 2. Fix the Issue
- Make targeted, minimal changes
- Fix only what's broken, don't refactor unnecessarily
- Consider the root cause, not just symptoms

### 3. Verify the Fix
**MANDATORY: Run all checks to confirm the fix works**

Minimum verification scope:
```bash
# Run the originally failing command(s)
npx nx run <package>:lint
npx nx run <package>:typecheck
npx nx run <package>:build
npx nx run <package>:test  # if applicable
```

### 4. Regression Testing
**MANDATORY: Ensure you didn't break anything else**

After fixing, verify:
- Related packages still build
- Dependent packages still work
- All originally passing tests still pass

Example:
```bash
# If you fixed package A used by package B:
npx nx run A:build
npx nx run B:build  # verify B still works
```

### 5. Document Changes
**MANDATORY: Record what was fixed and why**

Choose appropriate documentation:
- **CHANGELOG.md** - For user-facing changes, bug fixes, breaking changes
- **Commit messages** - Detailed technical explanation of the fix
- **Code comments** - If the fix needs explanation for future maintainers
- **AGENTS.md** - If this reveals a new rule/pattern to follow

**Don't create new .md files** - use existing documentation.

### Summary Checklist

Before claiming "fixed":
- [ ] Ran the original failing command - it now passes
- [ ] Ran related build/test commands - they still pass  
- [ ] Verified no new errors introduced
- [ ] Documented the change appropriately
- [ ] Can explain what was broken and why the fix works

**If you can't check all boxes, you're not done.**

### Common Mistakes to Avoid

**Claiming success without verification:**
- ❌ BAD: Reading linter output and assuming you know what's wrong
- ❌ BAD: Making changes and saying "fixed!" without running the command
- ✅ GOOD: Run the actual failing command, observe the error, fix it, run it again to verify

**Adding configuration without understanding side effects:**
- ❌ BAD: Adding `composite: true` to all TypeScript projects because one needs it
- ❌ BAD: Adding project references without understanding the build system
- ✅ GOOD: Only add `composite: true` to packages that are actual project references
- ✅ GOOD: Consider how bundlers (tsdown, rollup, etc.) interact with TypeScript configs

**Not testing for regressions:**
- ❌ BAD: Only testing the one thing you fixed
- ✅ GOOD: Test all originally passing commands to ensure they still pass
- ✅ GOOD: Clean build artifacts when config changes could affect them

**Rationalizing partial fixes:**
- ❌ BAD: "Those are pre-existing code errors, not my problem"
- ❌ BAD: "The lint passes now, that typecheck failure is unrelated"
- ✅ GOOD: If the original status showed ✖ (failing), you must make it ✔ (passing)
- ✅ GOOD: Fix ALL originally failing tasks, not just the easy ones

**Inefficient test execution:**
- ❌ BAD: Running tasks sequentially with `nx run package:task && nx run ...`
- ❌ BAD: Running same dependencies multiple times
- ✅ GOOD: Use `nx run-many -t lint typecheck build --projects=pkg1,pkg2` for parallel execution
- ✅ GOOD: Nx builds the task graph and only runs each task once, even for shared dependencies

