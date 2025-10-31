# Cursor Workflows

This directory contains custom Cursor workflows for common development tasks.

## Available Workflows

### `/release` - Automated Release Workflow

Triggers the release process based on your current git branch.

**Usage:**
1. Type `/release` in Cursor
2. The workflow will automatically run the appropriate release process

**What happens:**

- **On `main` branch:**
  - Runs `nx release` to version and publish packages
  - Pushes changes and tags to GitHub
  - Packages are published to npm

- **On feature branches:**
  - Creates or updates a Pull Request to `main`
  - Generates a detailed PR description with:
    - List of changed packages
    - Commits included in the release
    - Timestamp and author
  - Enables auto-merge (squash)
  - CI checks run automatically
  - PR auto-merges when all checks pass
  - Main branch then auto-publishes packages

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- NPM authentication configured (for npm publishing)
- Git configured with user name and email

**Installation:**
```bash
# Install GitHub CLI
brew install gh  # macOS
# or
sudo apt install gh  # Linux

# Authenticate
gh auth login
```

## How It Works

When you invoke `/release`:
1. Cursor reads the workflow definition from `release.md`
2. The AI executes the workflow steps directly using terminal commands
3. The AI makes intelligent decisions based on branch, existing PRs, etc.
4. GitHub Actions workflows handle CI and publishing

## CI/CD Workflows

### `.github/workflows/ci.yml`
Runs on all PRs to ensure quality:
- ✅ Build all packages
- ✅ Type check
- ✅ Lint
- ✅ Run tests

### `.github/workflows/release.yml`
Runs on `main` branch after merge:
- 📦 Runs `nx release` to version and publish
- 🚀 Publishes to npm
- 📝 Creates GitHub releases

## Customization

To modify the workflow behavior, edit:
- `.cursor/workflows/release.md` - AI workflow instructions (what the AI should do)
- `.github/workflows/ci.yml` - CI checks that run on PRs
- `.github/workflows/release.yml` - Auto-publish workflow for main branch

