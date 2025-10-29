# Project Rules

## 🚨 MOST IMPORTANT RULE 🚨

**MAINTAIN CLEAN DOCUMENTATION STRUCTURE**

Follow the established structure (README.md + docs/). When working on docs:

- ✅ UPDATE existing files when content fits there
- ✅ DELETE outdated content
- ✅ CREATE new files in the RIGHT locations (following structure below)
- ❌ NEVER create duplicates or files in wrong locations

## Repository Focus

**Main Package:** `gqlb` - Runtime proxy-based GraphQL query builder
**Demo Packages:** `@atlassian-tools/gql` and `@atlassian-tools/cli` - Example usage with Atlassian's GraphQL API (8000+ types)

The Atlassian packages are reference implementations showing gqlb's capabilities with a complex, real-world schema. They will be moved to a separate repository soon.

## Documentation

### 🚨 CRITICAL POLICY: THINK BEFORE CREATING 🚨

**Before adding ANY new documentation file:**

1. ❓ **Does this duplicate existing content?** → Update the existing doc instead
2. ❓ **Does this fit within an existing file's scope?** → Add a section instead
3. ❓ **Is this in the right location per the structure below?** → Use correct directory
4. ❓ **Does this follow the naming conventions?** → Check existing patterns

**Default answer: Check existing files first, then create in the RIGHT location.**

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

**When creating a new documentation file:**

- Ensure it follows the structure below
- Check it doesn't duplicate existing content
- Use appropriate naming conventions
- Place it in the correct directory

### How to Maintain Quality

**For AI Agents:**

1. **Before creating a .md file** - Run this checklist:
   - [ ] Have I checked if this content fits in an existing file?
   - [ ] Am I following the directory structure (README.md + docs/)?
   - [ ] Does this duplicate content that already exists elsewhere?
   - [ ] Am I using the right naming convention?
   
2. **Preferred locations for common content:**
   - **User-facing API docs** → Package `README.md`
   - **Package internals/architecture** → Package `docs/ARCHITECTURE.md`
   - **Code examples** → `docs/examples/` (with descriptive names)
   - **Setup/development guides** → `docs/DEVELOPMENT.md`
   - **Comparisons with alternatives** → `docs/COMPARISON.md`
   - **Technical deep dives** → `docs/INNOVATION.md` or new file in `docs/`
   - **Changelog entries** → `CHANGELOG.md` (package or root)

3. **Acceptable new file locations:**
   - ✅ `docs/*.md` - New technical documentation
   - ✅ `docs/examples/*.md` - Example documentation
   - ✅ `packages/*/docs/*.md` - Package-specific technical docs
   - ✅ `CHANGELOG.md`, `packages/*/CHANGELOG.md` - Version history
   - ⚠️ `packages/*/README.md` - Must not duplicate (only one per package)
   - ❌ Random locations - Follow the structure

**For developers:**

1. **Manual verification:**
   ```bash
   # Check for duplicate content before committing
   grep -r "your new content topic" docs/ packages/*/README.md
   
   # Review documentation structure
   ls -R docs/ packages/*/docs/
   ```

2. **Documentation reviews:** All .md file changes should be reviewed for duplicates

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
  import { foo } from './utils.js'; // ✓
  import { foo } from './utils'; // ✗
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

**Not checking command help first:**

- ❌ BAD: Assuming you know how a command works without checking
- ❌ BAD: Guessing at configuration options
- ✅ GOOD: Run `command --help` to understand options and behavior
- ✅ GOOD: Use `--printConfig` or `--dry-run` flags to verify configuration before making changes

## Release Management

This project uses **Nx Release** with **Conventional Commits** for automated versioning and publishing.

### Configuration Overview

**Location:** `nx.json` → `release` section

**Key Settings:**

```json
{
  "release": {
    "projectsRelationship": "independent", // Each package versions independently
    "version": {
      "conventionalCommits": true // Automatic versioning from commit messages
    },
    "changelog": {
      "projectChangelogs": {
        "createRelease": "github" // Auto-create GitHub releases
      }
    }
  }
}
```

### Conventional Commits

Version bumps are determined automatically from commit messages:

- `feat:` → **minor** version bump (new feature)
- `fix:` → **patch** version bump (bug fix)
- `BREAKING CHANGE:` or `!` → **major** version bump
- `docs:`, `chore:`, `style:`, etc. → no version bump

**Examples:**

```bash
git commit -m "feat: add support for fragments"        # 1.0.0 → 1.1.0
git commit -m "fix: handle null values correctly"      # 1.0.0 → 1.0.1
git commit -m "feat!: change API signature"            # 1.0.0 → 2.0.0
git commit -m "chore: update dependencies"             # no version change
```

### Quality Gates

The `nx-release-publish` target has automatic dependencies to ensure quality:

```json
{
  "targetDefaults": {
    "nx-release-publish": {
      "dependsOn": [
        "^build", // Build dependencies first
        "build", // Build current package
        "lint", // Lint current package
        "typecheck" // Typecheck current package
      ]
    }
  }
}
```

**IMPORTANT:** These dependencies run automatically. You do NOT need to manually run build/lint/typecheck before publishing.

### Package Metadata Requirements

All publishable packages MUST have these fields in `package.json`:

```json
{
  "files": ["dist", "README.md", "LICENSE"], // What gets published
  "repository": {
    "type": "git",
    "url": "https://github.com/ThePlenkov/atlassian-graphql-client",
    "directory": "packages/package-name" // Monorepo path
  },
  "homepage": "https://github.com/ThePlenkov/atlassian-graphql-client#readme",
  "bugs": {
    "url": "https://github.com/ThePlenkov/atlassian-graphql-client/issues"
  },
  "license": "MIT"
}
```

**Note:** The `package.json` is at the package root (e.g., `packages/gqlb/package.json`), NOT in the dist folder. The built files reference `./dist/` paths.

### Release Workflows

**Local Release:**

```bash
# Dry run to preview what would happen
npm run release:dry-run

# Actual release (requires NPM_TOKEN env var)
npm run release
```

**What happens:**

1. Analyzes conventional commits since last release
2. Determines version bumps for affected packages
3. Updates package.json versions
4. Generates/updates CHANGELOG.md
5. Creates git tags
6. Publishes to npm (if not dry-run)
7. Creates GitHub releases

**CI/CD Release (Automated):**

- Triggered on push to `main` branch
- Runs via `.github/workflows/release.yml`
- Uses `NPM_TOKEN` secret from GitHub repo settings
- Automatically runs quality gates (build, lint, typecheck) before publishing
- No manual intervention needed - versions determined from commits

### Important Commands

```bash
# Preview what would be released (dry run)
npx nx release --dry-run

# Check the configuration
npx nx release --printConfig

# View help
npx nx release --help

# First release (when no previous tags exist)
npx nx release --first-release

# Skip confirmation prompts (for CI)
npx nx release --yes
```

### Common Patterns

**First release for a package:**

```bash
npx nx release --first-release
```

**Skip packages that shouldn't be published:**

- Add `"private": true` to their `package.json`
- Nx Release automatically skips private packages

**See what would be released without publishing:**

```bash
npm run release:dry-run
```

**Publishing fails?**

1. Check `NPM_TOKEN` is set correctly
2. Verify you're logged in: `npm whoami`
3. Check package name isn't taken on npm
4. Verify all quality gates passed (build, lint, typecheck)
5. Ensure commits follow conventional commit format

### Troubleshooting

**Problem:** No version bump happening
**Solution:** Ensure your commits follow conventional commit format:

- Use `feat:`, `fix:`, `BREAKING CHANGE:` prefixes
- Check commits since last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`

**Problem:** Package not being released
**Check:**

- Is it in `npx nx show projects` output?
- Is it marked `"private": true`?
- Does it have a `package.json` at the package root?
- Has it changed since last release?
- Do commits affecting it follow conventional format?

**Problem:** Quality gates failing
**Solution:** The failure is intentional - fix the failing task before releasing:

```bash
# See what failed
npx nx run-many -t build lint typecheck --all

# Fix the specific issue, then retry
npm run release
```

**Problem:** Need to manually set version (bypass conventional commits)
**Solution:** Use specifier argument:

```bash
npx nx release --specifier=1.2.3  # exact version
npx nx release --specifier=patch  # bump patch
npx nx release --specifier=minor  # bump minor
npx nx release --specifier=major  # bump major
```

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

# CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:

- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool

<!-- nx configuration end-->
