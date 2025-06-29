import { execSync } from 'child_process';
import chalk from 'chalk';

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  state: string;
  assignee?: string;
  url: string;
}

export class GitHubOperations {
  private hasGhCli(): boolean {
    try {
      execSync('which gh', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  private exec(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error: any) {
      throw new Error(`GitHub CLI command failed: ${error.message}`);
    }
  }

  async fetchIssue(issueNumber: string): Promise<GitHubIssue | null> {
    if (!this.hasGhCli()) {
      console.log(chalk.yellow('⚠️  GitHub CLI not found. Install with: brew install gh'));
      return null;
    }

    try {
      const jsonOutput = this.exec(
        `gh issue view ${issueNumber} --json number,title,body,labels,state,assignees,url`
      );
      
      const data = JSON.parse(jsonOutput);
      
      return {
        number: data.number,
        title: data.title,
        body: data.body || '',
        labels: data.labels?.map((l: any) => l.name) || [],
        state: data.state,
        assignee: data.assignees?.[0]?.login,
        url: data.url
      };
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not fetch issue #${issueNumber}`));
      return null;
    }
  }

  createIssue(title: string, body: string, labels?: string[]): string {
    if (!this.hasGhCli()) {
      throw new Error('GitHub CLI is required to create issues');
    }

    let command = `gh issue create --title "${title}"`;
    
    if (body) {
      command += ` --body "${body}"`;
    }
    
    if (labels && labels.length > 0) {
      command += ` --label ${labels.join(',')}`;
    }

    const output = this.exec(command);
    const match = output.match(/issues\/(\d+)/);
    
    if (match) {
      return match[1];
    }
    
    throw new Error('Failed to create issue');
  }

  listIssues(options?: { assignee?: string; label?: string; state?: string }): GitHubIssue[] {
    if (!this.hasGhCli()) {
      console.log(chalk.yellow('⚠️  GitHub CLI not found'));
      return [];
    }

    let command = 'gh issue list --json number,title,labels,state,assignees';
    
    if (options?.assignee) {
      command += ` --assignee ${options.assignee}`;
    }
    
    if (options?.label) {
      command += ` --label ${options.label}`;
    }
    
    if (options?.state) {
      command += ` --state ${options.state}`;
    }

    try {
      const jsonOutput = this.exec(command);
      const issues = JSON.parse(jsonOutput);
      
      return issues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: '',
        labels: issue.labels?.map((l: any) => l.name) || [],
        state: issue.state,
        assignee: issue.assignees?.[0]?.login,
        url: `https://github.com/issues/${issue.number}`
      }));
    } catch {
      return [];
    }
  }

  commentOnIssue(issueNumber: string, comment: string): void {
    if (!this.hasGhCli()) {
      throw new Error('GitHub CLI is required to comment on issues');
    }

    this.exec(`gh issue comment ${issueNumber} -b "${comment}"`);
  }

  createPullRequest(title: string, body: string, issueNumber?: string): string {
    if (!this.hasGhCli()) {
      throw new Error('GitHub CLI is required to create pull requests');
    }

    let prBody = body;
    if (issueNumber) {
      prBody += `\n\nCloses #${issueNumber}`;
    }

    const output = this.exec(`gh pr create --title "${title}" --body "${prBody}"`);
    return output;
  }
}