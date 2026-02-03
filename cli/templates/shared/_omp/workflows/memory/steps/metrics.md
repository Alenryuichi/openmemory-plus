---
name: metrics
description: 显示记忆系统的质量指标和健康度
---

# Step: 质量指标

## EXECUTION RULES

- ✅ Calculate memory quality metrics
- ✅ Track trends over time
- ✅ Provide improvement suggestions

---

## METRICS DEFINITION

### Core Metrics

| 指标 | 计算方式 | 健康阈值 |
|------|----------|----------|
| **总量** | count(all) | - |
| **活跃率** | count(active) / total | > 60% |
| **ROT 比例** | count(rot) / total | < 20% |
| **平均置信度** | avg(confidence) | > 0.7 |
| **冲突率** | conflicts / total | < 5% |
| **访问频率** | accesses / day | > 0.1 |

### Quality Score

```python
def calculate_quality_score():
    active_ratio = count_active() / total()
    rot_ratio = count_rot() / total()
    avg_confidence = mean(all_confidence)
    conflict_ratio = count_conflicts() / total()
    
    score = (
        active_ratio * 0.3 +
        (1 - rot_ratio) * 0.2 +
        avg_confidence * 0.3 +
        (1 - conflict_ratio) * 0.2
    )
    return score * 100
```

---

## EXECUTION

### 1. Collect Memory Data

Call `list_memories_openmemory` to get:
- Total memory count
- Decay status distribution (Active/Aging/Stale/Cleanup)
- Confidence scores
- Access frequency data
- Conflict information

### 2. Calculate Metrics

- **活跃率**: count(Active) / total
- **ROT 比例**: (count(Stale) + count(Cleanup)) / total
- **平均置信度**: mean of all confidence scores
- **冲突率**: count(conflicts) / total
- **访问频率**: total accesses / days since creation

### 3. Calculate Quality Score

Apply the formula above to get overall health score (0-100)

### 4. Display Dashboard

```
📊 记忆质量指标

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              整体健康度: {score}/100
         {health_bar}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 核心指标

| 指标 | 当前 | 阈值 | 状态 |
|------|------|------|------|
| 记忆总量 | {total} | - | ℹ️ |
| 活跃率 | {active_pct}% | >60% | {status} |
| ROT 比例 | {rot_pct}% | <20% | {status} |
| 平均置信度 | {avg_conf} | >0.7 | {status} |
| 冲突率 | {conflict_pct}% | <5% | {status} |

📊 衰减状态分布

├── 🟢 Active:  {n} 条 ({pct}%)
├── 🟡 Aging:   {n} 条 ({pct}%)
├── 🔴 Stale:   {n} 条 ({pct}%)
└── ⚫ Cleanup: {n} 条 ({pct}%)

💡 改进建议

{suggestions}
```

### 5. Improvement Suggestions Logic

- If active_ratio < 60%: "建议清理陈旧记忆以提高活跃率"
- If rot_ratio > 20%: "ROT 比例过高，建议执行清理操作"
- If avg_confidence < 0.7: "置信度较低，建议验证和更新记忆"
- If conflict_ratio > 5%: "存在较多冲突，建议执行同步检查"
- If all metrics healthy: "✅ 系统状态良好，继续保持"

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"

