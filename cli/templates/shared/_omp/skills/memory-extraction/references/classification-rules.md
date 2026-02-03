# Memory Classification Rules

## 多维度分类体系

### Dimension 1: Scope (范围)

| Scope | 定义 | 存储位置 | 示例 |
|-------|------|----------|------|
| PERSONAL | 与用户个人相关 | openmemory | "我喜欢用 Vim" |
| PROJECT | 与当前项目相关 | _omp/memory/ | "项目使用 React" |
| UNIVERSAL | 跨项目通用知识 | openmemory | "TypeScript 比 JS 更安全" |
| EPHEMERAL | 仅当前会话有效 | 不存储 | "先试试这个方案" |

### Dimension 2: Confidence (置信度)

| Level | 范围 | 定义 | 处理方式 |
|------|------|------|----------|
| EXPLICIT | >= 0.9 | 用户明确陈述 | 直接存储 |
| INFERRED | 0.7 - 0.9 | 从行为推断 | 存储但标记 |
| UNCERTAIN | 0.4 - 0.7 | 需要确认 | 询问用户后存储 |
| NOISE | < 0.4 | 噪音信息 | 丢弃 |

> ⚠️ **阈值说明**:
> - **存储阈值**: confidence >= 0.4 (UNCERTAIN 及以上)
> - **自动存储**: confidence >= 0.7 (INFERRED 及以上)
> - **需确认**: 0.4 <= confidence < 0.7 (UNCERTAIN 区间)

### Dimension 3: Temporality (时效性)

| Type | TTL | 示例 |
|------|-----|------|
| PERMANENT | 无限 | 用户偏好、项目架构 |
| CONTEXTUAL | 30d | 当前迭代目标 |
| EPHEMERAL | 会话 | 临时讨论 |

## 分类决策树

```
信息输入
    ↓
是否敏感信息? → YES → 丢弃
    ↓ NO
是否 ROT? → YES → 丢弃
    ↓ NO
置信度 < 0.4? → YES → 丢弃 (NOISE)
    ↓ NO
Scope = EPHEMERAL? → YES → 不存储
    ↓ NO
Scope = PERSONAL/UNIVERSAL? → YES → openmemory
    ↓ NO
Scope = PROJECT → _omp/memory/
```

