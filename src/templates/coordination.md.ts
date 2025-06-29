export interface CoordinationContext {
  issueNumber: string;
  issueTitle: string;
  issueBody: string;
  workerCount: number;
  timestamp: string;
}

export function generateCoordinationMd(context: CoordinationContext): string {
  const { issueNumber, issueTitle, issueBody, workerCount, timestamp } = context;
  
  return `# Worktree Coordination - Issue #${issueNumber}

## Overview
This document coordinates ${workerCount} Claude workers collaborating on issue #${issueNumber}.
Created: ${timestamp}

## Issue Details
**Title:** ${issueTitle}
**Description:**
${issueBody}

## Worker Assignments

### Worker 1 (Coordinator)
- **Role:** Lead coordinator and initial implementation
- **Responsibilities:**
  - Create initial project structure
  - Define interfaces and contracts
  - Implement core functionality
  - Update this coordination document with task breakdown

### Worker 2
- **Role:** Supporting implementation and testing
- **Responsibilities:**
  - Implement secondary features
  - Write tests
  - Handle edge cases
  - Review Worker 1's implementation

${workerCount > 2 ? `### Worker 3
- **Role:** Quality assurance and optimization
- **Responsibilities:**
  - Code review
  - Performance optimization
  - Documentation
  - Integration testing
` : ''}

## Task Breakdown
*To be filled by Worker 1 after initial analysis*

### High Priority Tasks
1. [ ] TBD by Worker 1
2. [ ] TBD by Worker 1
3. [ ] TBD by Worker 1

### Medium Priority Tasks
1. [ ] TBD by Worker 1
2. [ ] TBD by Worker 1

### Low Priority Tasks
1. [ ] TBD by Worker 1

## Communication Protocol

1. **Before starting work:** Check this document for updates
2. **When claiming a task:** Update the task with your worker number
3. **When completing a task:** Mark as done and note any issues
4. **When blocked:** Add a comment in the Blockers section

## Active Tasks
*Update this section when starting/completing tasks*

- Worker 1: [Starting analysis...]
- Worker 2: [Waiting for task assignments...]
${workerCount > 2 ? '- Worker 3: [Waiting for task assignments...]' : ''}

## Completed Tasks
*Move tasks here when complete*

## Blockers & Issues
*Document any blocking issues here*

## Implementation Notes
*Share important discoveries or decisions*

## Files Modified
*Track which files each worker is modifying to avoid conflicts*

### Worker 1 Files:
- 

### Worker 2 Files:
- 

${workerCount > 2 ? `### Worker 3 Files:
- 
` : ''}

---
Remember: Coordinate through this document to avoid conflicts and ensure efficient collaboration!
`;
}

export function generateWorkerPrompt(workerNumber: number, totalWorkers: number, issueNumber: string): string {
  if (workerNumber === 1) {
    return `You are Worker 1 (Coordinator) of ${totalWorkers} Claude workers collaborating on issue #${issueNumber}.

Your primary responsibilities:
1. Read and understand the issue in CLAUDE.md
2. Create a task breakdown in WORKTREE_COORDINATION.md
3. Begin implementing the core functionality
4. Assign tasks to other workers via the coordination document

Start by:
1. Analyzing the issue requirements
2. Updating WORKTREE_COORDINATION.md with specific tasks
3. Beginning the implementation

The other workers are waiting for your task assignments.`;
  } else {
    return `You are Worker ${workerNumber} of ${totalWorkers} Claude workers collaborating on issue #${issueNumber}.

Your role: ${workerNumber === 2 ? 'Supporting implementation and testing' : 'Quality assurance and optimization'}

Start by:
1. Reading CLAUDE.md to understand the issue
2. Checking WORKTREE_COORDINATION.md for task assignments
3. Waiting briefly for Worker 1 to update the task list
4. Claiming and working on assigned tasks

Worker 1 is currently analyzing the issue and will assign specific tasks shortly. Begin building your understanding of the requirements while waiting.`;
  }
}