import chalk from 'chalk';
import { GitOperations } from '../lib/git';
import { TmuxOperations } from '../lib/tmux';
import { ConfigManager } from '../lib/config';
import { existsSync, statSync } from 'fs';
import path from 'path';

export async function listCommand(): Promise<void> {
  try {
    const git = new GitOperations();
    const config = new ConfigManager(git.repoRoot);
    const tmux = new TmuxOperations(config.getSessionName());
    
    const worktrees = git.listWorktrees();
    const tmuxWindows = tmux.listWindows();
    
    if (worktrees.length === 0) {
      console.log(chalk.yellow('No worktrees found'));
      return;
    }
    
    console.log(chalk.bold('\nWorktrees:\n'));
    
    for (const worktree of worktrees) {
      // Skip the main worktree
      if (worktree.path === git.repoRoot) continue;
      
      // Extract issue number from branch name
      const issueMatch = worktree.branch.match(/issue-(\d+)/);
      const issueNumber = issueMatch ? issueMatch[1] : null;
      
      // Check if has tmux window
      const windowName = issueNumber ? `issue-${issueNumber}` : null;
      const hasWindow = windowName ? tmuxWindows.some(w => w.name === windowName) : false;
      const window = hasWindow ? tmuxWindows.find(w => w.name === windowName) : null;
      
      // Get last modified time
      let lastModified = 'Unknown';
      const claudePath = path.join(worktree.path, 'CLAUDE.md');
      if (existsSync(claudePath)) {
        const stats = statSync(claudePath);
        const now = new Date();
        const diff = now.getTime() - stats.mtime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
          lastModified = `${days}d ago`;
        } else if (hours > 0) {
          lastModified = `${hours}h ago`;
        } else {
          lastModified = 'Recently';
        }
      }
      
      // Format output
      let status = chalk.gray(worktree.branch);
      if (issueNumber) {
        status = chalk.cyan(`Issue #${issueNumber}`);
      }
      
      let tmuxStatus = chalk.gray('No window');
      if (hasWindow && window) {
        tmuxStatus = chalk.green(`Window ${window.index}`);
        if (window.active) {
          tmuxStatus += chalk.yellow(' (active)');
        }
        if (window.panes > 1) {
          tmuxStatus += chalk.gray(` [${window.panes} panes]`);
        }
      }
      
      console.log(`${status} - ${chalk.gray(path.basename(worktree.path))}`);
      console.log(`  Path: ${chalk.gray(worktree.path)}`);
      console.log(`  Tmux: ${tmuxStatus}`);
      console.log(`  Modified: ${chalk.gray(lastModified)}`);
      console.log('');
    }
    
    // Show tmux session info
    if (tmux.hasSession()) {
      console.log(chalk.gray(`\nTmux session: ${config.getSessionName()}`));
      console.log(chalk.gray(`Active windows: ${tmuxWindows.length}`));
    }
    
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}