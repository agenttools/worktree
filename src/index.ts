#!/usr/bin/env node

import { Command } from 'commander';
import { openCommand } from './commands/open';
import { splitCommand } from './commands/split';
import { listCommand } from './commands/list';
import { removeCommand } from './commands/remove';
import { initCommand } from './commands/init';
import { tldrCommand } from './commands/tldr';

const program = new Command();

program
  .name('worktree')
  .description('CLI tool for managing Git worktrees with GitHub issues and Claude Code integration')
  .version('0.3.1');

program
  .command('open <issue-number> [description]')
  .description('Create or switch to a worktree for a GitHub issue')
  .option('-w, --workers <number>', 'Number of Claude workers to spawn (default: 1)', '1')
  .option('--watcher', 'Spawn an additional overseer worker to monitor progress')
  .action(openCommand);

program
  .command('split <issue-number>')
  .description('Split current tmux pane with new Claude instance')
  .option('-v, --vertical', 'Split vertically instead of horizontally')
  .option('-f, --focus', 'Focus the new pane after creation')
  .action(splitCommand);

program
  .command('list')
  .description('List all worktrees and their status')
  .action(listCommand);

program
  .command('remove <issue-number>')
  .alias('rm')
  .description('Remove a worktree and close its tmux window')
  .action(removeCommand);

program
  .command('init')
  .description('Initialize worktree configuration for current repository')
  .action(initCommand);

program
  .command('tldr')
  .description('Show quick examples and common usage patterns')
  .action(tldrCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}