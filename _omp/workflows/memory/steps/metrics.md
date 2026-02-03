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

> 📖 **公式详情**: 参见 `_omp/skills/memory-extraction/references/health-score.md`

健康度计算使用标准公式，综合以下四个指标：
- **活跃率** (30% 权重): Active 状态记忆占比
- **ROT 比例** (20% 权重): Stale + Cleanup 占比，越低越好
- **平均置信度** (30% 权重): 所有记忆的平均置信度
- **冲突率** (20% 权重): 存在冲突的记忆占比，越低越好

最终分数 = 加权求和 × 100，范围 0-100

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

