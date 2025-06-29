# worktree

> CLI tool for managing Git worktrees with GitHub issues and Claude Code integration.
> Creates isolated workspaces for each issue with automatic context loading and tmux session management.
> More information: <https://github.com/agenttools/worktree>.

- Initialize worktree configuration in current repository:

`worktree init`

- Create or switch to a worktree for a GitHub issue:

`worktree open {{issue_number}}`

- Create worktree with descriptive branch name:

`worktree open {{issue_number}} "{{description}}"`

- Create worktree with multiple Claude workers for collaboration:

`worktree open {{issue_number}} -w {{number_of_workers}}`

- Add another Claude instance to existing worktree:

`worktree split {{issue_number}}`

- List all worktrees and their status:

`worktree list`

- Remove a worktree and close its tmux window:

`worktree rm {{issue_number}}`

- Show quick examples and usage patterns:

`worktree tldr`