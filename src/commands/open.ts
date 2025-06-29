import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync } from 'fs';
import path from 'path';
import { GitOperations } from '../lib/git';
import { GitHubOperations } from '../lib/github';
import { TmuxOperations } from '../lib/tmux';
import { ConfigManager } from '../lib/config';
import { generateClaudeMd, ensureGitignore } from '../templates/claude.md';
import { generateCoordinationMd, generateWorkerPrompt } from '../templates/coordination.md';

interface OpenOptions {
  workers?: string;
}

export async function openCommand(issueNumber: string, description?: string, options?: OpenOptions): Promise<void> {
  const spinner = ora();
  const workerCount = parseInt(options?.workers || '1', 10);
  
  if (workerCount < 1 || workerCount > 5) {
    console.error(chalk.red('Error: Workers must be between 1 and 5'));
    process.exit(1);
  }
  
  try {
    // Initialize operations
    const git = new GitOperations();
    const github = new GitHubOperations();
    const config = new ConfigManager(git.repoRoot);
    const tmux = new TmuxOperations(config.getSessionName());
    
    // Check if worktree already exists
    const worktreePath = git.getWorktreePath(issueNumber, description);
    const windowName = `issue-${issueNumber}`;
    
    if (git.worktreeExists(worktreePath)) {
      console.log(chalk.yellow(`⚠️  Worktree already exists at: ${worktreePath}`));
      
      // Check if tmux window exists
      if (tmux.hasWindow(windowName)) {
        console.log(chalk.yellow(`⚠️  Window '${windowName}' already exists in session '${config.getSessionName()}'`));
        console.log(chalk.blue('→ Switching to existing window...'));
        
        const windows = tmux.listWindows();
        const window = windows.find(w => w.name === windowName);
        if (window) {
          tmux.openITerm(window.index);
          tmux.switchToWindow(windowName);
        }
        
        console.log(chalk.gray('\n💡 Tip: To open another Claude instance for this issue:'));
        console.log(chalk.gray(`   wt split ${issueNumber}         # Split current pane`));
        console.log(chalk.gray(`   wt split ${issueNumber} -v      # Split vertically`));
        
        return;
      }
    } else {
      // Create worktree
      spinner.start(`Creating worktree for issue #${issueNumber}...`);
      git.createWorktree(issueNumber, description);
      spinner.succeed(`Created worktree at: ${worktreePath}`);
    }
    
    // Fetch GitHub issue details
    spinner.start('Fetching issue details from GitHub...');
    const issue = await github.fetchIssue(issueNumber);
    if (issue) {
      spinner.succeed('Fetched issue details from GitHub');
    } else {
      spinner.fail(`GitHub issue #${issueNumber} not found`);
      console.error(chalk.red('\n❌ Error: Issue must exist on GitHub before creating a worktree'));
      console.log(chalk.gray('Create the issue first with: gh issue create'));
      process.exit(1);
    }
    
    // Generate CLAUDE.md
    const claudeContent = generateClaudeMd({
      issueNumber,
      branchName: git.createBranchName(issueNumber, description),
      issue: issue || undefined,
      projectName: config.getProjectName(),
      customContext: config.getClaudeContext(),
      commands: config.getCommands()
    });
    
    const claudePath = path.join(worktreePath, 'CLAUDE.md');
    writeFileSync(claudePath, claudeContent);
    console.log(chalk.green('✓ Created CLAUDE.md with issue context'));
    
    // Create WORKTREE_COORDINATION.md if multiple workers
    if (workerCount > 1) {
      const coordinationContent = generateCoordinationMd({
        issueNumber,
        issueTitle: issue.title,
        issueBody: issue.body,
        workerCount,
        timestamp: new Date().toISOString()
      });
      
      const coordinationPath = path.join(worktreePath, 'WORKTREE_COORDINATION.md');
      writeFileSync(coordinationPath, coordinationContent);
      console.log(chalk.green('✓ Created WORKTREE_COORDINATION.md for worker coordination'));
    }
    
    // Ensure CLAUDE.md and WORKTREE_COORDINATION.md are in .gitignore
    ensureGitignore(worktreePath);
    console.log(chalk.green('✓ Added CLAUDE.md to .gitignore'));
    
    // Run setup commands if any
    const setupCommands = config.getSetupCommands();
    if (setupCommands.length > 0) {
      console.log(chalk.blue('\nRunning setup commands...'));
      for (const command of setupCommands) {
        spinner.start(`Running: ${command}`);
        try {
          const { execSync } = require('child_process');
          execSync(command, { cwd: worktreePath, stdio: 'ignore' });
          spinner.succeed(`Completed: ${command}`);
        } catch (error) {
          spinner.fail(`Failed: ${command}`);
        }
      }
    }
    
    // Launch Claude workers
    if (workerCount === 1) {
      console.log(chalk.blue('\nOpening Claude Code...'));
      tmux.launchClaude(windowName, worktreePath, issueNumber);
    } else {
      console.log(chalk.blue(`\nOpening ${workerCount} Claude workers...`));
      
      // Launch first worker in main window
      tmux.launchClaudeWithPrompt(
        windowName, 
        worktreePath, 
        generateWorkerPrompt(1, workerCount, issueNumber)
      );
      
      // Launch additional workers in split panes
      for (let i = 2; i <= workerCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between splits
        const vertical = i % 2 === 0; // Alternate between horizontal and vertical splits
        tmux.launchClaudeInPaneWithPrompt(
          windowName,
          worktreePath,
          generateWorkerPrompt(i, workerCount, issueNumber),
          vertical,
          i
        );
      }
    }
    
    // Open iTerm
    const windows = tmux.listWindows();
    const window = windows.find(w => w.name === windowName);
    if (window) {
      tmux.openITerm(window.index);
    }
    
    console.log(chalk.green('\n✓ Claude Code launched successfully'));
    console.log(chalk.gray(`\nSession: ${config.getSessionName()}`));
    console.log(chalk.gray(`Window: ${windowName}`));
    console.log(chalk.gray(`Worktree: ${worktreePath}`));
    
  } catch (error: any) {
    spinner.fail();
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}