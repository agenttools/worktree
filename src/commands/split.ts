import chalk from 'chalk';
import { GitOperations } from '../lib/git';
import { TmuxOperations } from '../lib/tmux';
import { ConfigManager } from '../lib/config';

interface SplitOptions {
  vertical?: boolean;
  focus?: boolean;
}

export async function splitCommand(issueNumber: string, options: SplitOptions): Promise<void> {
  try {
    // Initialize operations
    const git = new GitOperations();
    const config = new ConfigManager(git.repoRoot);
    const tmux = new TmuxOperations(config.getSessionName());
    
    // Check if worktree exists
    const worktrees = git.listWorktrees();
    const worktree = worktrees.find(wt => 
      wt.branch.includes(`issue-${issueNumber}`) || 
      wt.path.includes(`issue-${issueNumber}`)
    );
    
    if (!worktree) {
      console.error(chalk.red(`Error: No worktree found for issue #${issueNumber}`));
      console.log(chalk.gray(`\nRun 'wt open ${issueNumber}' to create the worktree first`));
      process.exit(1);
    }
    
    const windowName = `issue-${issueNumber}`;
    
    // Check if window exists
    if (!tmux.hasWindow(windowName)) {
      console.error(chalk.red(`Error: No tmux window found for issue #${issueNumber}`));
      console.log(chalk.gray(`\nRun 'wt open ${issueNumber}' to create the window first`));
      process.exit(1);
    }
    
    console.log(chalk.blue(`✓ Found worktree: ${worktree.path}`));
    
    const splitType = options.vertical ? 'vertically' : 'horizontally';
    console.log(chalk.blue(`✓ Splitting current pane ${splitType}...`));
    
    // Launch Claude in new pane
    tmux.launchClaudeInPane(windowName, worktree.path, issueNumber, options.vertical || false);
    
    if (options.focus) {
      console.log(chalk.gray('(New pane has focus)'));
    }
    
    console.log(chalk.green('\n✓ Claude Code launched in new pane'));
    
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}