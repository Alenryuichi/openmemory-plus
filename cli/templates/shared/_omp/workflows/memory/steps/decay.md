---
name: decay
description: 使用 Ebbinghaus 衰减模型分析记忆的时间衰减状态
---

# Step: 衰减分析 (Ebbinghaus 模型)

## 参考文档

详见: `_omp/skills/memory-extraction/references/decay-model.md`

## EXECUTION RULES

- ✅ Calculate retention scores using Ebbinghaus formula
- ✅ Compute strength factor (S) based on access history
- ✅ Apply importance boosts
- ✅ Classify memories by decay status
- ✅ Provide actionable recommendations

---

## EXECUTION

### 1. Get All Memories

Call `list_memories_openmemory` to get all user memories with:
- Creation timestamp
- Last access timestamp
- Access count
- Importance flags
- Confidence scores

### 2. Calculate Strength Factor (S)

For each memory, calculate:
```
S = 30 + (access_count × 10) + (explicit_mark × 50)

Where:
- 30 = base_strength (default)
- access_count = number of times accessed
- explicit_mark = 1 if user marked important, 0 otherwise
```

### 3. Calculate Importance Boost

Determine boost based on:
```
importance_boost = 0
if user_marked_important: importance_boost += 0.5
if confidence > 0.9: importance_boost += 0.2
if access_count > 5: importance_boost += 0.1
if is_core_config: importance_boost += 0.3

# Apply cap to ensure boost never exceeds 0.5
importance_boost = min(importance_boost, 0.5)
```

### 4. Calculate Retention Score

For each memory:
```
days_since_access = today - last_access_date
base_retention = e^(-days_since_access/S)
Retention(t) = base_retention + importance_boost × (1 - base_retention)

# Result is guaranteed to be in [0, 1] by formula design
```

### 5. Classify by Status

| Status | Retention | Meaning | Action |
|--------|-----------|---------|--------|
| 🟢 Active | >= 0.7 | 活跃，保持 | 保持 |
| 🟡 Aging | 0.3-0.7 | 老化，需关注 | 关注 |
| 🔴 Stale | 0.1-0.3 | 陈旧，考虑清理 | 清理 |
| ⚫ Cleanup | < 0.1 | 待清理 | 自动清理 |

### 6. Display Analysis

```
⏰ 记忆衰减分析 (Ebbinghaus 模型)

📊 总览: {total} 条记忆

🟢 Active ({n}条) {progress_bar} {percent}%
{foreach top_5}
├── {content}
│   └─ Retention: {retention:.2%} | S={strength} | 访问: {access_count}次
{/foreach}
└── ... (输入 "展开 active" 查看全部)

🟡 Aging ({n}条) {progress_bar} {percent}%
{foreach all}
├── {content}
│   └─ Retention: {retention:.2%} | S={strength} | 最后访问: {days_ago}天前
{/foreach}

🔴 Stale ({n}条) {progress_bar} {percent}%
{foreach all}
├── {content}
│   └─ Retention: {retention:.2%} | S={strength} | 最后访问: {days_ago}天前
{/foreach}

⚫ Cleanup ({n}条) {progress_bar} {percent}%
{foreach all}
└── {content}
    └─ Retention: {retention:.2%} | 建议自动清理

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 建议:
{recommendations}

📋 遗忘策略:
- 自动遗忘: Retention < 0.1 且 90天未访问
- 确认遗忘: Retention 0.1-0.3 且 60天未访问
- 永不遗忘: 用户标记重要 / 安全合规 / 核心配置
```

### 7. Follow-up Actions

- `"清理 stale"` → Delete all Stale memories (with confirmation)
- `"自动清理"` → Auto-delete Cleanup status memories
- `"刷新 N"` → Update memory (re-add to refresh S factor)
- `"展开 {status}"` → Show all in category
- `"标记重要 N"` → Mark memory as important (increase boost)
- `"详情 N"` → Show detailed decay calculation

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
