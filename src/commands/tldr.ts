import chalk from 'chalk';

export async function tldrCommand(): Promise<void> {
  console.log(chalk.bold('\n📚 Worktree CLI - Quick Examples\n'));
  
  console.log(chalk.yellow('Prerequisites:'));
  console.log('  • GitHub CLI (gh) installed and authenticated');
  console.log('  • tmux and iTerm2 (macOS)');
  console.log('  • Claude CLI installed\n');

  console.log(chalk.yellow('Common Usage:'));
  
  console.log(chalk.gray('\n# First time setup in a repo'));
  console.log('  worktree init');
  
  console.log(chalk.gray('\n# Start working on issue #42'));
  console.log('  worktree open 42');
  console.log(chalk.dim('  → Creates worktree, fetches issue, launches Claude'));
  
  console.log(chalk.gray('\n# Better branch name'));
  console.log('  worktree open 42 "fix-login-bug"');
  console.log(chalk.dim('  → Branch: issue-42-fix-login-bug'));
  
  console.log(chalk.gray('\n# Multiple workers for complex issue'));
  console.log('  worktree open 78 -w 3');
  console.log(chalk.dim('  → 3 Claude instances with coordination'));
  
  console.log(chalk.gray('\n# Add overseer to monitor progress'));
  console.log('  worktree open 78 -w 3 --watcher');
  console.log(chalk.dim('  → 3 workers + 1 overseer tracking progress'));
  
  console.log(chalk.gray('\n# Add another Claude to existing issue'));
  console.log('  worktree split 42');
  
  console.log(chalk.gray('\n# See all worktrees'));
  console.log('  worktree list');
  
  console.log(chalk.gray('\n# Clean up when done'));
  console.log('  worktree rm 42');
  
  console.log(chalk.yellow('\n💡 Pro Tips:'));
  console.log('  • Use -w flag for complex issues needing multiple workers');
  console.log('  • Workers coordinate through WORKTREE_COORDINATION.md');
  console.log('  • Add --watcher for an overseer that monitors progress');
  console.log('  • Both "worktree" and "wt" commands work');
  console.log('  • Customize .worktree.yml for project-specific settings');
  
  console.log(chalk.gray('\nFor full help: worktree --help'));
  console.log(chalk.gray('GitHub: https://github.com/agenttools/worktree\n'));
}