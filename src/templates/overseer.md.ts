export interface OverseerContext {
  issueNumber: string;
  issueTitle: string;
  timestamp: string;
}

export function generateOverseerMd(context: OverseerContext): string {
  const { issueNumber, issueTitle, timestamp } = context;
  
  return `# Overseer Report - Issue #${issueNumber}

## Overview
This document tracks the progress and provides recommendations for issue #${issueNumber}.
Created: ${timestamp}

## Issue Details
**Issue #${issueNumber}:** ${issueTitle}

## Monitoring Schedule
- Check progress every 60 seconds
- Update this document with observations
- Monitor until the GitHub issue is closed

## Progress Tracking

### ${new Date().toLocaleTimeString()} - Initial Status
- Workers spawned, coordination beginning
- Monitoring git diff and WORKTREE_COORDINATION.md

## Observations
*Updated automatically during monitoring*

## Recommendations
*Based on observed progress and potential issues*

## Git Activity
*Track significant changes*

## Worker Coordination Status
*Monitor task assignments and completion*

## Potential Issues
*Flag any blockers or concerns*

## Quality Metrics
- Code changes aligned with issue requirements: TBD
- Test coverage: TBD
- Coordination effectiveness: TBD

---
*This document is automatically updated by the Overseer worker*
`;
}

export function generateOverseerPrompt(issueNumber: string): string {
  return `You are the Overseer for issue #${issueNumber}. Monitor progress by checking git diff, WORKTREE_COORDINATION.md, and the original issue every 60 seconds. Update OVERSEER.md with observations, recommendations, and potential issues. Continue monitoring until the GitHub issue is closed. Focus on: progress tracking, quality assurance, coordination effectiveness, and identifying blockers.`;
}