# ROT Filter Rules

## Redundant (冗余) 检测

### 语义相似度检测

使用 Qdrant 向量搜索检测相似记忆:

```yaml
redundancy:
  similarity_threshold: 0.85
  actions:
    - score >= 0.95: skip (完全重复)
    - score >= 0.85: merge (合并到已有)
    - score < 0.85: store (正常存储)
```

### 合并策略

当检测到相似记忆时:
1. 比较信息完整度
2. 保留更完整的版本
3. 合并补充信息
4. 更新时间戳

## Obsolete (过时) 检测

### 时间衰减

```yaml
obsolescence:
  default_ttl: 90d
  check_triggers:
    - on_access
    - daily_scan
  actions:
    - age > 180d && access_count == 0: auto_delete
    - age > 90d && access_count < 3: mark_stale
    - age > 30d: calculate_decay
```

### 显式过时

检测信号:
- "不再使用 X"
- "改用 Y 替代 X"
- "X 已废弃"

## Trivial (琐碎) 检测

### 信息密度阈值

```yaml
triviality:
  min_length: 10  # 字符
  min_info_density: 0.3
  blocked_patterns:
    - "^(好的|OK|明白|收到)$"
    - "^(稍等|正在处理).*"
    - "^(是的|对|嗯)$"
```

### 可操作性检测

低可操作性信息不存储:
- 纯情感表达
- 无具体内容的确认
- 临时状态描述

