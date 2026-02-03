# Memory Health Score

## 健康度计算公式

```python
def calculate_health_score(memories):
    """
    计算记忆系统整体健康度 (0-100)
    
    Args:
        memories: 所有记忆列表
    
    Returns:
        int: 健康度分数 (0-100)
    """
    total = len(memories)
    if total == 0:
        return 100  # 无记忆时返回满分

    # 1. 活跃率 (30% 权重)
    active_count = count_by_status(memories, 'active')
    active_ratio = active_count / total

    # 2. ROT 比例 (20% 权重) - 越低越好
    rot_count = count_by_status(memories, 'stale') + count_by_status(memories, 'cleanup')
    rot_ratio = rot_count / total

    # 3. 平均置信度 (30% 权重)
    avg_confidence = mean([m.confidence for m in memories])

    # 4. 冲突率 (20% 权重) - 越低越好
    conflict_count = count_conflicts(memories)
    conflict_ratio = conflict_count / total

    # 加权计算
    score = (
        active_ratio * 0.3 +
        (1 - rot_ratio) * 0.2 +
        avg_confidence * 0.3 +
        (1 - conflict_ratio) * 0.2
    )
    return int(score * 100)
```

## 健康度等级

| 分数 | 等级 | Emoji | 说明 |
|------|------|-------|------|
| >= 80 | Excellent | ✅ | 系统健康 |
| 60-79 | Good | ⚠️ | 需要关注 |
| < 60 | Needs Attention | ❌ | 需要处理 |

## 各指标健康阈值

| 指标 | 健康阈值 | 说明 |
|------|----------|------|
| 活跃率 | > 60% | Active 状态记忆占比 |
| ROT 比例 | < 20% | Stale + Cleanup 占比 |
| 平均置信度 | > 0.7 | 所有记忆的平均置信度 |
| 冲突率 | < 5% | 存在冲突的记忆占比 |

## 使用方式

此公式被以下 workflow steps 引用：
- `workflows/memory/steps/status.md` - 状态显示
- `workflows/memory/steps/metrics.md` - 质量指标面板

