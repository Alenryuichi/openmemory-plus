# OpenMemory Plus - Agent Instructions

This file provides complete instructions for AI agents to use the dual-layer memory system.

## Core Commands

- Memory command: `/memory` or read `_omp/commands/memory.md`
- View project memory: `cat _omp/memory/*.md`
- Check workflows: `ls _omp/workflows/memory/`

## Memory Architecture

```
├── _omp/memory/           ← Project-level memory (this repo)
│   ├── projectbrief.md    ← Project overview & goals
│   ├── productContext.md  ← Product requirements & features
│   ├── techContext.md     ← Technical stack & architecture
│   ├── activeContext.md   ← Current work session context
│   ├── systemPatterns.md  ← Patterns & conventions
│   ├── decisions.yaml     ← Architecture decisions log
│   └── progress.md        ← Task progress tracking
│
└── OpenMemory MCP         ← User-level memory (personal prefs)
```

## Trigger Signals for Auto-Extraction

Extract and save when you detect:

| Signal | Action | Target File |
|--------|--------|-------------|
| "Remember this..." | Save explicitly requested info | Appropriate memory file |
| Architecture decision | Log with rationale | `decisions.yaml` |
| New pattern discovered | Document the pattern | `systemPatterns.md` |
| Bug fix with root cause | Record for future reference | `progress.md` |
| Session ending keywords | Summarize key learnings | `activeContext.md` |
| User preference stated | Store for future sessions | OpenMemory MCP |

**Session-end keywords**:
- English: "done for today", "that's all", "wrap up", "bye"
- 中文: "结束了", "收工", "今天就到这"

## Memory Workflow

1. **Session Start** → Load `_omp/memory/*.md` for project context
2. **During Work** → Update `activeContext.md` with current focus
3. **Decisions Made** → Append to `decisions.yaml`
4. **Session End** → Run memory extraction workflow

## Boundaries

- ✅ **Always do:**
  - Read `_omp/memory/` at session start
  - Update memory files when relevant info emerges
  - Use `/memory` command for explicit saves

- ⚠️ **Ask first:**
  - Deleting existing memory entries
  - Changing memory file structure
  - Storing sensitive information

- 🚫 **Never do:**
  - Store API keys, passwords, or secrets
  - Overwrite memory without confirmation
  - Skip memory loading at session start

## Code Style for Memory Files

```yaml
# decisions.yaml format
- date: YYYY-MM-DD
  decision: Use TypeScript strict mode
  rationale: Catches more errors at compile time
  alternatives_considered:
    - JavaScript with JSDoc
  outcome: pending  # or: implemented, rejected
```

```markdown
# activeContext.md format
## Current Focus
- Working on: [feature/task name]
- Blockers: [any blockers]
- Next steps: [immediate next actions]

## Session Notes
- [timestamp]: [key observation or decision]
```

## Skills Integration

Memory extraction skill: `_omp/skills/memory-extraction/`
- Auto-triggers at conversation end
- Extracts key information from the session
- Updates appropriate memory files

## Verification

After any memory operation, verify:
1. Files exist: `ls _omp/memory/`
2. Content saved: `cat _omp/memory/[file].md | tail -10`
3. YAML valid: Check `decisions.yaml` syntax

---
*OpenMemory Plus - Dual-layer memory for AI agents*

