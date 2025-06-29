import { GitHubIssue } from '../lib/github';

export interface ClaudeContext {
  issueNumber: string;
  branchName: string;
  issue?: GitHubIssue;
  projectName: string;
  customContext?: string;
  commands?: {
    dev?: string;
    test?: string;
    lint?: string;
    build?: string;
    [key: string]: string | undefined;
  };
}

export function generateClaudeMd(context: ClaudeContext): string {
  const { issueNumber, branchName, issue, projectName, customContext, commands } = context;
  
  let content = `# ${projectName} - Issue #${issueNumber}

## Context
This is a worktree for working on GitHub issue #${issueNumber}.
Branch: ${branchName}
Created: ${new Date().toISOString()}

`;

  // Add GitHub issue details if available
  if (issue) {
    content += `## GitHub Issue Details
**Title:** ${issue.title}
**State:** ${issue.state}
**URL:** ${issue.url}
`;

    if (issue.assignee) {
      content += `**Assignee:** ${issue.assignee}\n`;
    }

    if (issue.labels.length > 0) {
      content += `**Labels:** ${issue.labels.join(', ')}\n`;
    }

    if (issue.body) {
      content += `\n### Description\n${issue.body}\n`;
    }

    content += '\n';
  }

  // Add instructions
  content += `## Instructions
1. Focus only on implementing the requirements for issue #${issueNumber}
2. Test all changes before committing
3. Keep commits focused and well-documented
4. Update the GitHub issue with progress as needed

## Key Commands
- View issue: \`gh issue view ${issueNumber}\`
- Update issue: \`gh issue comment ${issueNumber} -b "Progress update..."\`
- Create PR: \`gh pr create --title "Fix #${issueNumber}: [description]" --body "Closes #${issueNumber}"\`

## Before Starting Work
Always ensure you have the latest main code:
\`\`\`bash
git fetch origin main
git rebase origin/main
\`\`\`

## Before Creating a PR
Update with latest main to avoid merge conflicts:
\`\`\`bash
git fetch origin main
git rebase origin/main
# Resolve any conflicts if they arise
# Run tests to ensure everything still works
\`\`\`
`;

  // Add project context if provided
  if (customContext) {
    content += `\n## Project Context\n${customContext}\n`;
  }

  // Add development commands if provided
  if (commands && Object.keys(commands).length > 0) {
    content += '\n## Development Commands\n';
    
    for (const [name, command] of Object.entries(commands)) {
      if (command) {
        content += `- ${name}: \`${command}\`\n`;
      }
    }
  }

  // Add notes
  content += `
## Notes
- Remember to run package installation if needed (npm install, yarn, etc.)
- Check the development server to test changes
- Run linting and type checking before committing
- This file (CLAUDE.md) is ignored by git and contains context for Claude Code
`;

  return content;
}

export function ensureGitignore(worktreePath: string): void {
  const gitignorePath = `${worktreePath}/.gitignore`;
  const fs = require('fs');
  
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  let updated = false;
  
  // Check if CLAUDE.md is already in .gitignore
  if (!gitignoreContent.includes('CLAUDE.md')) {
    if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
      gitignoreContent += '\n';
    }
    
    gitignoreContent += `
# claude code worktree context
CLAUDE.md
`;
    updated = true;
  }
  
  // Check if WORKTREE_COORDINATION.md is already in .gitignore
  if (!gitignoreContent.includes('WORKTREE_COORDINATION.md')) {
    if (!updated && gitignoreContent && !gitignoreContent.endsWith('\n')) {
      gitignoreContent += '\n';
    }
    
    if (!updated) {
      gitignoreContent += '\n# claude code worktree context\n';
    }
    
    gitignoreContent += 'WORKTREE_COORDINATION.md\n';
    updated = true;
  }
  
  // Check if OVERSEER.md is already in .gitignore
  if (!gitignoreContent.includes('OVERSEER.md')) {
    if (!updated && gitignoreContent && !gitignoreContent.endsWith('\n')) {
      gitignoreContent += '\n';
    }
    
    if (!updated) {
      gitignoreContent += '\n# claude code worktree context\n';
    }
    
    gitignoreContent += 'OVERSEER.md\n';
  }
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
}