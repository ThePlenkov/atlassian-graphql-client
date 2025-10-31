# Release Command

When the user types `/release`, follow this workflow to prepare and execute a release.

## Step 1: Detect Current Branch

Run: `git branch --show-current`

Based on the branch:
- If `main` → Follow **Main Branch Release** workflow
- If any other branch → Follow **Feature Branch Release** workflow

---

## Main Branch Release Workflow

Execute a direct release on the main branch:

### Actions:

1. **Run the release**
   ```bash
   npx nx release
   ```
   This will:
   - Analyze conventional commits
   - Version affected packages
   - Update CHANGELOG.md files
   - Create git tags
   - Publish to npm (if NPM_TOKEN is configured)

2. **Push changes and tags**
   ```bash
   git push && git push --tags
   ```

3. **Confirm to user**
   - Report which packages were released
   - Show the new versions
   - Provide links to published packages

---

## Feature Branch Release Workflow

Create or update a Pull Request for review before releasing:

### Step 1: Check Prerequisites

Verify GitHub CLI is available and authenticated:
```bash
which gh && gh auth status
```

If not available, inform the user they need to:
- Install GitHub CLI: https://cli.github.com/
- Authenticate: `gh auth login`

### Step 2: Gather Release Information

Collect the following data:

**Current branch:**
```bash
git branch --show-current
```

**Changed packages (dry-run preview):**
```bash
npx nx release --dry-run
```

**Commits since main:**
```bash
git log main..HEAD --oneline
```

**Current user:**
```bash
git config user.name
```

**Current date:**
```bash
date +%Y-%m-%d
```

### Step 3: Check for Existing PR

Check if a PR already exists from this branch:
```bash
gh pr list --head <branch-name> --base main --json number,url,state,statusCheckRollup
```

**Important:** If PR exists, check its state:
- If `state` is `MERGED` or `CLOSED` → Inform user PR is already merged/closed, stop workflow
- If CI checks are failing → Report the failures, DO NOT proceed with auto-merge
- Only proceed if PR is `OPEN` and checks are passing or pending

### Step 4: Create or Update PR

**If NO existing PR:**

Create a new PR with this structure:

**Title:** `Release: <branch-name>`

**Body:**
```markdown
## Release Summary

This PR prepares changes for release from `<branch-name>`.

### Changed Packages

<list packages from dry-run, or "No package changes detected">

### Commits Included

<list commits from git log>

---

**Release triggered by:** @<username> using Cursor `/release` command on <date>
```

Run:
```bash
gh pr create --title "Release: <branch>" --body "<description>" --base main --head <branch>
```

**If existing PR found:**

Append an update notice to the existing PR description:
```bash
gh pr view <pr-number> --json body -q .body  # Get current description
gh pr edit <pr-number> --body "<original-description>

---
🔄 **Release re-triggered by:** @<username> on <date>"
```

### Step 5: Verify CI Status Before Auto-merge

**CRITICAL: Check CI status before enabling auto-merge:**

```bash
gh pr view <pr-number> --json statusCheckRollup
```

Parse the response and check:
- If any check has `conclusion: "FAILURE"` → **STOP** and report the failure
- If checks are `PENDING` or `SUCCESS` → Proceed with auto-merge
- If no checks have run yet → Wait or inform user checks need to run first

**Only if CI checks are passing or pending:**

Enable auto-merge:
```bash
gh pr merge <pr-number> --auto --squash
```

If this fails (e.g., branch protection requires reviews), inform the user that auto-merge couldn't be enabled and they may need to:
- Add required reviewers
- Enable auto-merge manually
- Adjust branch protection settings

**If CI checks are FAILING:**

```
❌ Cannot enable auto-merge: CI checks are failing

Failed checks:
- <list failed checks with links>

Please fix the failing checks before proceeding with the release.
```

### Step 6: Report Status to User

Provide a summary:
```
✅ PR #<number> created/updated
🔗 <pr-url>
✅ Auto-merge enabled (squash)
📊 CI checks are running

Next steps:
- CI will run: build, typecheck, lint, test
- PR will auto-merge when all checks pass ✅
- Main branch workflow will then auto-publish packages 🚀
```

---

## Error Handling

### GitHub CLI not installed
```
❌ GitHub CLI is required for feature branch releases.

Install: https://cli.github.com/

MacOS:   brew install gh
Linux:   sudo apt install gh
Windows: winget install GitHub.cli
```

### Not authenticated with GitHub
```
❌ Not authenticated with GitHub CLI.

Run: gh auth login
```

### PR creation failed
Show the error and suggest:
- Check if the branch is pushed to remote
- Verify repository permissions
- Check if branch protection rules conflict

### Release failed on main
Show the error and suggest:
- Check conventional commit format
- Verify NPM_TOKEN is configured
- Review the Nx release documentation

---

## Notes

- The AI should execute these steps using terminal commands
- Parse command outputs to make intelligent decisions
- Provide clear, actionable feedback to the user
- Handle errors gracefully with helpful suggestions
- The GitHub workflows (`.github/workflows/*.yml`) will handle CI and auto-publishing

