# Worktree CLI

A powerful CLI tool for managing Git worktrees with GitHub issues and Claude Code integration. Create isolated workspaces for each issue with automatic context loading, tmux session management, and support for multiple Claude workers collaborating on the same issue.

## Features

- 🌳 **Git Worktree Management** - Create isolated branches and directories per issue
- 🐙 **GitHub Integration** - Fetch issue details automatically
- 🤖 **Claude Code Integration** - Auto-launch Claude with issue context
- 🖥️ **tmux Session Management** - Organized windows and panes per issue
- 📝 **Contextual Documentation** - Auto-generated CLAUDE.md with project info
- ⚡ **Smart Commands** - Quick access to development commands

## Prerequisites

- Git
- tmux
- iTerm2 (macOS)
- GitHub CLI (`gh`) - Install with `brew install gh`
- Claude Code CLI (`claude`)

## Installation

```bash
npm install -g @agenttools/worktree
```

Or clone and link locally:

```bash
git clone https://github.com/agenttools/worktree
cd worktree-cli
npm install
npm run build
npm link
```

## Usage

### Initialize Configuration

In your Git repository:

```bash
worktree init
```

This creates `.worktree.yml` with auto-detected project settings.

### Create/Open Worktree

```bash
# Create worktree for issue #123
worktree open 123

# With description for better branch naming
worktree open 123 "add-authentication"
# Creates branch: issue-123-add-authentication

# With multiple Claude workers (2-5)
worktree open 123 -w 3
# Spawns 3 Claude instances with coordination
```

### Split Pane

When you need additional Claude instances for the same issue:

```bash
# Split horizontally (default)
worktree split 123

# Split vertically
worktree split 123 -v
```

**Note:** Consider using `worktree open -w <number>` for coordinated multi-worker setups.

### List Worktrees

```bash
worktree list
```

Shows all worktrees with:
- Issue number and branch name
- tmux window status
- Last modified time
- Number of panes

### Remove Worktree

```bash
worktree remove 123
# or
worktree rm 123
```

Closes tmux window and removes Git worktree.

## Configuration

Edit `.worktree.yml` in your repository:

```yaml
name: "My Project"
session: "myproject_workers"
claude_context: |
  This is a Next.js app with TypeScript.
  Key areas:
  - src/app - App router pages
  - src/lib - Utilities and actions
  
commands:
  dev: npm run dev
  test: npm test
  lint: npm run lint
  typecheck: npm run typecheck
  
setup_commands:
  - npm install
```

## How It Works

1. **Validates GitHub issue** - Ensures issue exists before creating worktree
2. **Creates Git worktree** - Isolated directory with new branch
3. **Fetches GitHub issue** - Gets title, body, labels via `gh` CLI
4. **Generates context files**:
   - **CLAUDE.md** - Issue details and project context for all workers
   - **WORKTREE_COORDINATION.md** - Task coordination for multi-worker setups
5. **Launches Claude Code** - In tmux window/pane with working directory set
6. **Auto-sends prompts**:
   - Single worker: "Solve the issue described in CLAUDE.md"
   - Multiple workers: Role-specific prompts for coordination

## tmux Commands

- **List windows**: `Ctrl+B, w`
- **Switch window**: `Ctrl+B, [0-9]`
- **Detach session**: `Ctrl+B, d`
- **Reattach**: `tmux attach -t <session-name>`

## Example Workflows

### Single Worker
```bash
# Start working on issue #42
worktree open 42 "fix-login-bug"

# Claude opens and starts working...
# Need to check something else? Split the pane
worktree split 42

# See all your worktrees
worktree list

# Done with the issue?
worktree rm 42
```

### Multiple Workers
```bash
# Complex issue requiring collaboration
worktree open 78 "refactor-api" -w 3

# Creates 3 Claude instances:
# - Worker 1: Coordinator, creates task breakdown
# - Worker 2: Implementation support
# - Worker 3: Testing and optimization

# Workers coordinate through WORKTREE_COORDINATION.md
```

## Tips

- Run `worktree init` in each repository to customize settings
- Use descriptive names with `worktree open` for better branch names
- For complex issues, use `-w` flag to spawn coordinated workers
- Multiple Claude instances can work on different aspects of the same issue
- Both CLAUDE.md and WORKTREE_COORDINATION.md are automatically added to .gitignore
- Workers communicate through the coordination document to avoid conflicts

## License

MIT