import { Archetype } from '../lib/archetypes';

export interface CoordinationContext {
  issueNumber: string;
  issueTitle: string;
  issueBody: string;
  workerCount: number;
  timestamp: string;
  workerArchetypes?: { [key: number]: Archetype };
}

export function generateCoordinationMd(context: CoordinationContext): string {
  const { issueNumber, issueTitle, issueBody, workerCount, timestamp, workerArchetypes } = context;
  
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

### Worker 2${workerArchetypes?.[2] ? ` (${workerArchetypes[2].emoji} ${workerArchetypes[2].name})` : ''}
- **Role:** ${workerArchetypes?.[2] ? workerArchetypes[2].shortDescription : 'Supporting implementation and testing'}
- **Focus:** ${workerArchetypes?.[2] ? workerArchetypes[2].focus : 'Secondary features and testing'}
- **Responsibilities:**
  - ${workerArchetypes?.[2] ? workerArchetypes[2].traits.slice(0, 4).join('\n  - ') : 'Implement secondary features\n  - Write tests\n  - Handle edge cases\n  - Review Worker 1\'s implementation'}

${workerCount > 2 ? `### Worker 3${workerArchetypes?.[3] ? ` (${workerArchetypes[3].emoji} ${workerArchetypes[3].name})` : ''}
- **Role:** ${workerArchetypes?.[3] ? workerArchetypes[3].shortDescription : 'Quality assurance and optimization'}
- **Focus:** ${workerArchetypes?.[3] ? workerArchetypes[3].focus : 'Code review and optimization'}
- **Responsibilities:**
  - ${workerArchetypes?.[3] ? workerArchetypes[3].traits.slice(0, 4).join('\n  - ') : 'Code review\n  - Performance optimization\n  - Documentation\n  - Integration testing'}
` : ''}

${workerCount > 3 ? `### Worker 4${workerArchetypes?.[4] ? ` (${workerArchetypes[4].emoji} ${workerArchetypes[4].name})` : ''}
- **Role:** ${workerArchetypes?.[4] ? workerArchetypes[4].shortDescription : 'Additional support and testing'}
- **Focus:** ${workerArchetypes?.[4] ? workerArchetypes[4].focus : 'Comprehensive testing and polish'}
- **Responsibilities:**
  - ${workerArchetypes?.[4] ? workerArchetypes[4].traits.slice(0, 4).join('\n  - ') : 'Integration testing\n  - User experience improvements\n  - Cross-browser/platform testing\n  - Final polish and cleanup'}
` : ''}

${workerCount > 4 ? `### Worker 5${workerArchetypes?.[5] ? ` (${workerArchetypes[5].emoji} ${workerArchetypes[5].name})` : ''}
- **Role:** ${workerArchetypes?.[5] ? workerArchetypes[5].shortDescription : 'Innovation and exploration'}
- **Focus:** ${workerArchetypes?.[5] ? workerArchetypes[5].focus : 'Alternative approaches and future improvements'}
- **Responsibilities:**
  - ${workerArchetypes?.[5] ? workerArchetypes[5].traits.slice(0, 4).join('\n  - ') : 'Research alternative solutions\n  - Propose future enhancements\n  - Explore optimization opportunities\n  - Document lessons learned'}
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
${workerCount > 3 ? '- Worker 4: [Waiting for task assignments...]' : ''}
${workerCount > 4 ? '- Worker 5: [Waiting for task assignments...]' : ''}

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
${workerCount > 3 ? `### Worker 4 Files:
- 
` : ''}
${workerCount > 4 ? `### Worker 5 Files:
- 
` : ''}

---
Remember: Coordinate through this document to avoid conflicts and ensure efficient collaboration!
`;
}

export function generateWorkerPrompt(workerNumber: number, totalWorkers: number, issueNumber: string, archetype?: Archetype): string {
  if (workerNumber === 1) {
    return `You are Worker 1 (Coordinator) of ${totalWorkers} Claude workers on issue #${issueNumber}. Read CLAUDE.md, create task breakdown in WORKTREE_COORDINATION.md, and begin implementation. Other workers are waiting for your task assignments.`;
  } else if (archetype) {
    return `You are Worker ${workerNumber} (${archetype.name}) of ${totalWorkers} Claude workers on issue #${issueNumber}. ${archetype.prompt} First, check if WORKTREE_COORDINATION.md exists - if not, wait and check again every 20 seconds until it's created by Worker 1. Once available, read it along with CLAUDE.md to understand your tasks and approach them from your unique perspective.`;
  } else {
    return `You are Worker ${workerNumber} of ${totalWorkers} Claude workers on issue #${issueNumber}. First, check if WORKTREE_COORDINATION.md exists - if not, wait and check again every 20 seconds until it's created by Worker 1. Once available, read it along with CLAUDE.md to understand your tasks.`;
  }
}