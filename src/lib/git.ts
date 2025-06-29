import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

export interface Worktree {
  path: string;
  branch: string;
  commit: string;
  isLocked: boolean;
}

export class GitOperations {
  public readonly repoRoot: string;

  constructor() {
    this.repoRoot = this.getRepoRoot();
  }

  private getRepoRoot(): string {
    try {
      const root = execSync('git rev-parse --show-toplevel', { 
        encoding: 'utf8' 
      }).trim();
      return root;
    } catch (error) {
      throw new Error('Not in a git repository');
    }
  }

  private exec(command: string): string {
    try {
      return execSync(command, { 
        encoding: 'utf8',
        cwd: this.repoRoot 
      }).trim();
    } catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  createBranchName(issueNumber: string, description?: string): string {
    if (description) {
      const safeDesc = description
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
      return `issue-${issueNumber}-${safeDesc}`;
    }
    return `issue-${issueNumber}`;
  }

  getWorktreePath(issueNumber: string, description?: string): string {
    const branchName = this.createBranchName(issueNumber, description);
    return path.join(path.dirname(this.repoRoot), branchName);
  }

  worktreeExists(worktreePath: string): boolean {
    return existsSync(worktreePath);
  }

  listWorktrees(): Worktree[] {
    const output = this.exec('git worktree list --porcelain');
    const worktrees: Worktree[] = [];
    const lines = output.split('\n');

    let current: Partial<Worktree> = {};
    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        current.path = line.substring(9);
      } else if (line.startsWith('HEAD ')) {
        current.commit = line.substring(5);
      } else if (line.startsWith('branch ')) {
        current.branch = line.substring(7);
      } else if (line.startsWith('locked')) {
        current.isLocked = true;
      } else if (line === '') {
        if (current.path && current.commit) {
          worktrees.push({
            path: current.path,
            branch: current.branch || '',
            commit: current.commit,
            isLocked: current.isLocked || false
          });
        }
        current = {};
      }
    }

    return worktrees;
  }

  createWorktree(issueNumber: string, description?: string): string {
    const branchName = this.createBranchName(issueNumber, description);
    const worktreePath = this.getWorktreePath(issueNumber, description);

    if (this.worktreeExists(worktreePath)) {
      return worktreePath;
    }

    try {
      // Try to create with new branch
      this.exec(`git worktree add "${worktreePath}" -b "${branchName}"`);
    } catch (error) {
      // If branch exists, just check it out
      this.exec(`git worktree add "${worktreePath}" "${branchName}"`);
    }

    return worktreePath;
  }

  removeWorktree(worktreePath: string): void {
    if (!existsSync(worktreePath)) {
      throw new Error(`Worktree not found: ${worktreePath}`);
    }

    this.exec(`git worktree remove "${worktreePath}" --force`);
  }

  getCurrentBranch(): string {
    return this.exec('git branch --show-current');
  }

  getRemoteUrl(): string {
    try {
      return this.exec('git remote get-url origin');
    } catch {
      return '';
    }
  }

  getRepoName(): string {
    const remoteUrl = this.getRemoteUrl();
    const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : path.basename(this.repoRoot);
  }
}