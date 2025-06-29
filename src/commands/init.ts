import chalk from 'chalk';
import { GitOperations } from '../lib/git';
import { ConfigManager } from '../lib/config';

export async function initCommand(): Promise<void> {
  try {
    const git = new GitOperations();
    const config = new ConfigManager(git.repoRoot);
    
    if (config.exists()) {
      console.log(chalk.yellow('⚠️  .worktree.yml already exists'));
      console.log(chalk.gray(`   Path: ${git.repoRoot}/.worktree.yml`));
      return;
    }
    
    console.log(chalk.blue('Initializing worktree configuration...'));
    
    // Create default config
    config.createDefaultConfig();
    
    // Show detected information
    console.log(chalk.green('\n✓ Configuration created successfully!'));
    console.log(chalk.gray('\nDetected project information:'));
    console.log(chalk.gray(`  Project: ${config.getProjectName()}`));
    console.log(chalk.gray(`  Session: ${config.getSessionName()}`));
    
    const commands = config.getCommands();
    if (commands && Object.keys(commands).length > 0) {
      console.log(chalk.gray('\nDetected commands:'));
      for (const [name, command] of Object.entries(commands)) {
        if (command) {
          console.log(chalk.gray(`  ${name}: ${command}`));
        }
      }
    }
    
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Edit .worktree.yml to add project-specific context'));
    console.log(chalk.gray('2. Run `wt open <issue-number>` to create your first worktree'));
    
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}