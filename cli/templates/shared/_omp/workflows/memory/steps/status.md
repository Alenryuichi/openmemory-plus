---
name: status
description: 查看项目级和用户级记忆的详细状态
---

# Step: 查看记忆状态

## EXECUTION RULES

- ✅ Execute all steps in order
- ✅ Display results clearly
- ✅ End with menu prompt

---

## EXECUTION

### 1. Read Project-Level Memory

Read `_omp/memory/` directory:
- List all files with last modified time
- Count total files

### 2. Get User-Level Memory

Call `list_memories_openmemory`:
- Get all user memories
- Count by decay status (Active/Aging/Stale/Cleanup)

### 3. Calculate Health Score

> 📖 **公式详情**: 参见 `_omp/skills/memory-extraction/references/health-score.md`

Calculate the overall health score using the standard formula:
- **活跃率** (30%): Active 状态记忆占比
- **ROT 比例** (20%): Stale + Cleanup 占比 (越低越好)
- **平均置信度** (30%): 所有记忆的平均置信度
- **冲突率** (20%): 存在冲突的记忆占比 (越低越好)

Health emoji mapping:
- >= 80: ✅ (Excellent)
- >= 60: ⚠️ (Good)
- < 60: ❌ (Needs attention)

### 4. Display Status

```
📋 记忆状态

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 健康度: {score}/100 {health_emoji}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 记忆系统详细状态

📁 项目级 (_omp/memory/)
├── project.yaml    ({last_modified})
├── decisions.yaml  ({last_modified})
└── ... 共 {n} 个文件

👤 用户级 (openmemory)
├── 总记忆数: {total} 条
├── 最近添加: "{latest_memory}" ({time_ago})
└── 衰减状态:
    ├── 🟢 Active:  {n} 条
    ├── 🟡 Aging:   {n} 条
    ├── 🔴 Stale:   {n} 条
    └── ⚫ Cleanup: {n} 条

{status_message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 快速操作:
{if has_issues}
- 输入 "清理" 处理 {rot_count} 条 ROT 记忆
- 输入 "同步" 解决 {conflict_count} 个冲突
{else}
✅ 记忆系统运行正常
{/if}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Status Message Logic

- If Cleanup > 0: `"⚠️ 有 {n} 条待清理记忆，建议执行清理"`
- If Stale > 3: `"💡 有较多陈旧记忆，建议检查是否仍需要"`
- Else: `"✅ 系统状态正常"`

### 6. Quick Actions Logic

Determine if there are issues to address:

```python
has_issues = (cleanup_count > 0) or (conflict_count > 0)
rot_count = stale_count + cleanup_count
```

Display quick action suggestions:
- If `has_issues` is true:
  - Show "清理" action if `rot_count > 0`
  - Show "同步" action if `conflict_count > 0`
- If `has_issues` is false:
  - Show "✅ 记忆系统运行正常"

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"

---

## IMPLEMENTATION NOTES

### Health Score Calculation Details

The health score combines four key metrics:

1. **Active Ratio (30% weight)**: Percentage of memories in "active" status
   - Higher active ratio = healthier memory system

2. **ROT Ratio (20% weight)**: Percentage of memories that are "stale" or "cleanup"
   - Lower ROT ratio = healthier memory system
   - ROT = Redundant, Obsolete, Trivial

3. **Average Confidence (30% weight)**: Mean confidence score across all memories
   - Higher confidence = more reliable memories

4. **Conflict Ratio (20% weight)**: Percentage of memories with conflicts
   - Lower conflict ratio = healthier memory system

### Display Format

The health snapshot appears at the top of the status output with:
- Clear visual separator (━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━)
- Health score out of 100
- Emoji indicator for quick visual assessment
- Quick action suggestions based on detected issues

This provides users with an at-a-glance view of memory system health before diving into detailed metrics.
