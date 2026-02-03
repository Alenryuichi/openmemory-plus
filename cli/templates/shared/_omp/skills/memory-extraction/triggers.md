# Memory Extraction Triggers

Defines when to automatically dispatch memory-extraction subagent.

---

## Trigger Priority Levels

| Priority | Response Time | Description |
|----------|---------------|-------------|
| P0 | Immediate | Critical information, extract now |
| P1 | Soon | Important, extract within 2-3 exchanges |
| P2 | Deferred | Can wait for checkpoint |
| P3 | Checkpoint | Batch with periodic extraction |

---

## Trigger Definitions

### P0: Immediate Triggers

#### Task Completion
```yaml
trigger: task_complete
signals:
  - Task marked complete in task management
  - "✓" or "[x]" in task list
  - EN: "done/finished/completed" + task reference
  - ZH: "完成/搞定/做好了" + task reference
action: Extract progress update
target: _omp/memory/progress.md
```

#### Technical Decision
```yaml
trigger: tech_decision
signals:
  - EN: "decide/choose/use X instead of Y"
  - ZH: "决定/选择/采用/使用 X 而不是 Y"
  - EN: "we'll use/going with"
  - Explicit choice between alternatives
action: Record decision with context
target: _omp/memory/decisions.yaml
```

### P1: Soon Triggers

#### Configuration Change
```yaml
trigger: config_change
signals:
  - .env file modified
  - config.* file modified
  - Environment variable set/changed
  - EN: "configure/set/update" + value
  - ZH: "配置/设置" + value
action: Update project config
target: _omp/memory/project.yaml
```

#### Deployment Status
```yaml
trigger: deployment
signals:
  - "deploy/vercel/wrangler" command output
  - URL change detected
  - EN: "deployed/live/published"
  - ZH: "上线/发布/部署完成"
action: Update deployment info
target: _omp/memory/project.yaml (deployment section)
```

### P2: Deferred Triggers

#### User Preference
```yaml
trigger: user_preference
signals:
  - EN: "I prefer/like/always use/my habit"
  - ZH: "我喜欢/偏好/习惯/总是用"
  - Repeated behavior pattern (3+ times)
action: Store user preference
target: openmemory MCP
```

#### Architecture Pattern
```yaml
trigger: architecture
signals:
  - EN: "pattern/architecture/design/structure"
  - ZH: "模式/架构/设计/结构"
  - Design decision discussion
action: Document pattern
target: _omp/memory/systemPatterns.md
```

### P3: Checkpoint Triggers

#### Periodic Checkpoint
```yaml
trigger: checkpoint
signals:
  - Every 10 conversation exchanges
  - Session duration > 30 minutes
  - Before long operation (build, deploy)
action: Summarize recent context
target: _omp/memory/activeContext.md
```

#### Session End
```yaml
trigger: session_end
signals:
  - EN: "bye/exit/done for now/thanks"
  - ZH: "结束/退出/谢谢/再见"
  - User closes conversation
  - Inactivity > 5 minutes
action: Full extraction sweep
target: Multiple files + session record
```

---

## Detection Patterns

### Chinese Signals (ZH)
```regex
决定|选择|采用|使用|配置|部署|上线
我喜欢|偏好|习惯|总是用
完成|搞定|做好了|OK了
```

### English Signals (EN)
```regex
decide|choose|adopt|use|configure|deploy|live
I prefer|like|always use|my habit
done|finished|completed|ready
```

### Code Signals (Universal)
```regex
\.env|config\.|settings\.|\.yaml|\.json
deploy|vercel|wrangler|npm run|pnpm
\[x\]|✓|✅|DONE|COMPLETE
```

---

## Trigger Response Flow

```
Event Detected
    ↓
Match Trigger Pattern (EN or ZH)
    ↓
Determine Priority
    ↓
P0/P1: Dispatch subagent immediately
P2: Queue for next checkpoint
P3: Batch with checkpoint
    ↓
Subagent extracts & stores
    ↓
Report back to main agent
```

---

## Skip Conditions

Do NOT trigger extraction for:
- Read-only operations (viewing files)
- Temporary/exploratory discussions
- Questions without decisions
- Trivial acknowledgments (EN: "OK/got it", ZH: "好的/明白了")
- Already extracted information

