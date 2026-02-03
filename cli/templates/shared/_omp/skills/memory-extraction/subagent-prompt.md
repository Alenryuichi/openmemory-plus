# Memory Extraction Subagent Prompt

Use this template when dispatching a memory-extraction subagent.

## Dispatch Template

```
Task tool or sub-agent-explore:
  name: memory-extract-{timestamp}
  instruction: |
    You are a memory extraction specialist for this project.

    ## Recent Context

    [Paste recent conversation excerpt - last 5-10 exchanges]

    ## Your Job

    Extract valuable information from the conversation and store it appropriately.

    ### Step 1: Identify Extractable Information

    Look for:
    - **Technical decisions**: "decide/choose/use X instead of Y" or "决定/选择/采用/使用"
    - **Configuration changes**: env vars, config files, paths
    - **User preferences**: "I prefer/like/always use" or "我喜欢/偏好/习惯"
    - **Project milestones**: "completed/deployed/released" or "完成/上线/发布"
    - **Architecture patterns**: design decisions, patterns adopted
    - **Progress updates**: tasks completed, blockers resolved

    ### Step 2: Classify Each Item

    | Scope | Signal | Storage |
    |-------|--------|---------|
    | PROJECT | Project-specific config, decisions | `_omp/memory/` |
    | PERSONAL | User preferences, habits | `openmemory` MCP |
    | EPHEMERAL | Temporary, uncertain | Skip |

    ### Step 3: Validate (ROT Filter)

    Skip if:
    - ❌ **Trivial**: < 10 chars or simple acknowledgments ("OK/got it/好的/明白了")
    - ❌ **Redundant**: Already exists (similarity > 0.85)
    - ❌ **Obsolete**: Contradicted by newer info
    - ❌ **Sensitive**: API keys, passwords, tokens

    ### Step 4: Store

    **For PROJECT scope** - Update appropriate file:
    - Decisions → `_omp/memory/decisions.yaml`
    - Config → `_omp/memory/project.yaml`
    - Progress → `_omp/memory/progress.md`
    - Patterns → `_omp/memory/systemPatterns.md`
    - Context → `_omp/memory/activeContext.md`

    **For PERSONAL scope** - Use MCP:
    ```
    Tool: add_memories_openmemory
    Parameter: text = "[SCOPE:PERSONAL] {extracted info}"
    ```

    ### Step 5: Report

    Format your report as:
    ```
    ## Memory Extraction Report

    **Extracted**: N items
    **Stored**:
    - [PROJECT] decisions.yaml: "Tech decision: TypeScript"
    - [PERSONAL] openmemory: "User prefers 2-space indent"

    **Skipped**: M items (reason: trivial/redundant/sensitive)
    **Conflicts**: None / [list if any]
    ```
```

## Quick Reference

### Trigger → Storage Mapping

| Trigger | Target File | Format |
|---------|-------------|--------|
| Task complete | `progress.md` | Markdown list |
| Tech decision | `decisions.yaml` | YAML entry |
| Config change | `project.yaml` | YAML update |
| Deploy status | `project.yaml` | deployment section |
| User preference | `openmemory` | MCP call |
| Architecture | `systemPatterns.md` | Markdown section |
| Session checkpoint | `activeContext.md` | Markdown summary |

### YAML Entry Template

```yaml
# For decisions.yaml
- id: dec-{date}-{seq}
  date: {YYYY-MM-DD}
  title: "{decision title}"
  context: "{why this decision}"
  choice: "{what was chosen}"
  alternatives: ["{other options}"]
  impact: "{affected areas}"
```

### Validation Checklist

Before storing, verify:
- [ ] Not trivial (meaningful content > 10 chars)
- [ ] Not redundant (check existing memories)
- [ ] Not sensitive (no secrets/keys/passwords)
- [ ] Confidence >= 0.4
- [ ] Clear scope (PROJECT or PERSONAL)

## Example Extraction

**Input conversation**:
```
User: I decided to use pnpm instead of npm because it's faster
Agent: OK, updated package manager configuration
```

**Extraction**:
```yaml
# → _omp/memory/decisions.yaml
- id: dec-2026-02-03-001
  date: 2026-02-03
  title: "Package Manager Selection"
  context: "Performance optimization"
  choice: "pnpm"
  alternatives: ["npm", "yarn"]
  impact: "All npm commands → pnpm"
```

**Report**:
```
## Memory Extraction Report

**Extracted**: 1 item
**Stored**:
- [PROJECT] decisions.yaml: "Package Manager: pnpm over npm"

**Skipped**: 0 items
**Conflicts**: None
```

