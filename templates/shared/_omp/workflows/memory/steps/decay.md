---
name: decay
description: 分析记忆的时间衰减状态
---

# Step: 衰减分析

## EXECUTION RULES

- ✅ Calculate decay scores for all memories
- ✅ Group by decay status
- ✅ Provide actionable recommendations

---

## EXECUTION

### 1. Get All Memories

Call `list_memories_openmemory` to get all user memories with timestamps.

### 2. Calculate Decay Scores

For each memory, calculate decay score based on:
- Days since creation
- Content importance (keywords)

**Simplified formula:**
```
score = max(0, 1 - (daysSinceCreation / 180))
```

### 3. Classify by Status

| Status | Score Range | Meaning |
|--------|-------------|---------|
| 🟢 Active | 0.7 - 1.0 | 活跃，近期创建 |
| 🟡 Aging | 0.3 - 0.7 | 老化，需要关注 |
| 🔴 Stale | 0.1 - 0.3 | 陈旧，考虑清理 |
| ⚫ Cleanup | 0 - 0.1 | 待清理 |

### 4. Display Analysis

```
⏰ 记忆衰减分析

📊 总览: {total} 条记忆

🟢 Active ({n}条) {progress_bar} {percent}%
{foreach top_3}
├── {content} [{score}]
{/foreach}
└── ... (输入 "展开 active" 查看全部)

🟡 Aging ({n}条) {progress_bar} {percent}%
{foreach all}
├── {content} [{score}]
{/foreach}

🔴 Stale ({n}条) {progress_bar} {percent}%
{foreach all}
└── {content} [{score}]
{/foreach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 建议:
{recommendations}
```

### 5. Follow-up Actions

- `"清理 stale"` → Delete all Stale memories
- `"刷新 N"` → Update memory (re-add to refresh)
- `"展开 {status}"` → Show all in category

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
