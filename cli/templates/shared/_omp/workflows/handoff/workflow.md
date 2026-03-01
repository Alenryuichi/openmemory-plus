# Agent Handoff Workflow

> Multi-agent work transfer protocol for seamless context handoff

## Overview

This workflow enables structured handoff of work between agents in a team. 
It ensures context is preserved and work continuity is maintained.

## Handoff Process

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Create    │────▶│   Accept/   │────▶│  Complete   │
│   Handoff   │     │   Reject    │     │   Handoff   │
└─────────────┘     └─────────────┘     └─────────────┘
    Agent A             Agent B             Agent B
```

## Step 1: Create Handoff

**Source Agent** creates handoff when:
- Work needs to be passed to another specialist
- Blocked on something outside their domain
- Session ending with incomplete work

**Required Information:**

| Field | Description | Example |
|-------|-------------|---------|
| `fromAgent` | Source agent ID | `tech-lead` |
| `toAgent` | Target agent ID | `dev-bot` |
| `context` | What was accomplished | "Designed auth flow..." |
| `progress` | Completion percentage | `60` |
| `artifacts` | Related files | `["src/auth/flow.ts"]` |

**Handoff File Template:**

```yaml
# _omp/memory/handoffs/handoff-{timestamp}.yaml
handoffId: handoff-1709312400-abc123
fromAgent: tech-lead
toAgent: dev-bot
timestamp: 2026-03-01T15:40:00Z
status: pending

context: |
  Designed authentication flow with OAuth2.
  Created interface definitions in src/auth/types.ts.
  Next: Implement the login handler.

progress: 60

artifacts:
  - src/auth/types.ts
  - docs/auth-flow.md

notes: null
```

## Step 2: Accept or Reject

**Target Agent** reviews the handoff and decides:

### Accept

- Change status to `accepted`
- Add `acceptedAt` timestamp
- Begin work continuation

### Reject

- Change status to `rejected`
- Add rejection reason to `notes`
- Handoff returns to source agent

## Step 3: Complete Handoff

**Target Agent** marks handoff complete when:
- Work is finished
- Passed to another agent
- Blocked and needs escalation

**Update Fields:**

```yaml
status: completed
notes: |
  Implemented login handler in src/auth/handler.ts.
  Added unit tests in tests/auth.test.ts.
  All tests passing.
```

## Handoff Commands

| Command | Description |
|---------|-------------|
| `/handoff create <to-agent>` | Create a new handoff |
| `/handoff list` | List pending handoffs |
| `/handoff accept <id>` | Accept a handoff |
| `/handoff complete <id>` | Mark handoff complete |

## Best Practices

1. **Be Specific** - Include exact file paths and line numbers
2. **Document Blockers** - Note any issues preventing progress
3. **List Dependencies** - Mention required services or tools
4. **Set Clear Expectations** - Define what "done" looks like
5. **Preserve Context** - Don't assume the other agent knows everything

## Example Scenarios

### Scenario 1: Architecture to Development

```yaml
fromAgent: tech-lead
toAgent: dev-bot
context: |
  Architecture decision: Use Redis for session storage.
  See decisions.yaml entry 2026-03-01.
  Schema defined in src/session/schema.ts.
  Ready for implementation.
progress: 30
artifacts:
  - src/session/schema.ts
  - _omp/memory/decisions.yaml
```

### Scenario 2: Development to Operations

```yaml
fromAgent: dev-bot
toAgent: devops-bot
context: |
  Feature complete and tested locally.
  Needs deployment pipeline setup.
  Docker image: app:v1.2.0
progress: 90
artifacts:
  - Dockerfile
  - docker-compose.yml
```

---
*OpenMemory Plus - Multi-Agent Team Handoff Protocol*

