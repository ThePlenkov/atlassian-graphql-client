# Cursor Commands

Custom slash commands for this project.

## Available Commands

### `/release`

Automated release workflow that adapts to your current branch.

**On `main` branch:**
- Runs `nx release` directly
- Publishes packages to npm
- Pushes changes and tags

**On feature branches:**
- Creates or updates a Pull Request to `main`
- Generates detailed PR description with changed packages and commits
- Enables auto-merge (squash)
- CI runs automatically (build, typecheck, lint, test)
- PR auto-merges when all checks pass
- Main branch then auto-publishes packages

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Run `gh auth login` if not authenticated

**Usage:**
Just type `/release` in Cursor and the AI will handle the rest!

---

## How Cursor Commands Work

- Commands are defined in `.cursor/commands/<command>.md`
- The AI reads these files and executes the instructions
- Commands can run terminal commands, make decisions, and interact with the user
- This provides a natural, conversational way to automate complex workflows

## Adding New Commands

Create a new markdown file in this directory:

```
.cursor/commands/my-command.md
```

Then you can invoke it with `/my-command`

