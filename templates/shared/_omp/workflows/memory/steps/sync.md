---
name: sync
description: 检测项目级和用户级记忆之间的冲突
---

# Step: 同步检查

## EXECUTION RULES

- ✅ Compare project and user memories
- ✅ Identify conflicts and duplicates
- ✅ Guide user through resolution

---

## EXECUTION

### 1. Read Project Memory

Read all files in `_omp/.memory/`:
- Extract key-value pairs from YAML files
- Extract topics from markdown files

### 2. Search User Memory

Call `search_memory_openmemory` with project topics:
- Find related user memories
- Compare values

### 3. Detect Conflicts

| Conflict Type | Example | Detection |
|---------------|---------|-----------|
| 值不一致 | Project: "npm" vs User: "pnpm" | Same topic, different value |
| 重复记录 | Both have deploy URL | Same info in both |
| 过期信息 | Project updated, user not | Timestamp comparison |

### 4. Display Conflicts

```
🔄 同步检查结果

{if no_conflicts}
✅ 无冲突，项目级和用户级记忆同步正常
{else}
发现 {n} 个冲突:

{foreach conflict}
⚠️ 冲突 {n}: {description}
├── 📁 项目级: {project_value}
└── 👤 用户级: {user_value}

建议: {recommendation}
操作: [A] {option_a} [B] {option_b} [S] 跳过
{/foreach}
{/if}
```

### 5. Resolution Options

- `"全部自动"` - Apply all recommendations
- `"逐个处理"` - Handle one by one
- `"A/B/S"` - Per-conflict decision

### 6. Execute Resolution

Based on user selection:
- Update or delete memories as needed
- Display summary of changes

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
