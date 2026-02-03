# 记忆系统架构文档

本文档详细介绍 OpenMemory Plus 的双层记忆系统架构、智能分类规则、ROT 过滤机制和记忆衰减模型。

## 目录

- [双层记忆架构](#双层记忆架构)
- [智能分类系统](#智能分类系统)
- [ROT 过滤机制](#rot-过滤机制)
- [Ebbinghaus 衰减模型](#ebbinghaus-衰减模型)
- [健康度监控](#健康度监控)
- [冲突检测](#冲突检测)

---

## 双层记忆架构

OpenMemory Plus 采用双层记忆架构，将信息按作用域分离存储：

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenMemory Plus                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Memory Router (智能分类)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         ↓                                     ↓            │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ _omp/memory/    │              │   openmemory    │      │
│  │  (项目级)       │              │   (用户级)      │      │
│  ├─────────────────┤              ├─────────────────┤      │
│  │ • Git 版本控制  │              │ • 向量数据库    │      │
│  │ • 项目配置      │              │ • 语义搜索      │      │
│  │ • 技术决策      │              │ • MCP 协议      │      │
│  │ • 变更记录      │              │ • 跨项目共享    │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 项目级记忆 (`_omp/memory/`)

| 文件 | 用途 | 示例内容 |
|------|------|----------|
| `projectbrief.md` | 项目概述 | 项目目标、范围、约束 |
| `productContext.md` | 产品需求 | 功能需求、用户故事 |
| `techContext.md` | 技术栈 | 框架、依赖、部署配置 |
| `activeContext.md` | 当前会话 | 正在进行的工作、阻塞项 |
| `systemPatterns.md` | 模式规范 | 代码风格、架构模式 |
| `decisions.yaml` | 决策日志 | 架构决策记录 (ADR) |
| `progress.md` | 任务进度 | 完成项、待办项 |

### 用户级记忆 (`openmemory` MCP)

- **用户偏好**: "我喜欢用 TypeScript"、"偏好 pnpm"
- **技能标签**: "熟悉 React"、"有 AI/ML 经验"
- **跨项目上下文**: 在任何项目中都可访问

---

## 智能分类系统

### 三维度分类体系

#### Dimension 1: Scope (范围)

| Scope | 定义 | 存储位置 | 示例 |
|-------|------|----------|------|
| `PERSONAL` | 与用户个人相关 | openmemory | "我喜欢用 Vim" |
| `PROJECT` | 与当前项目相关 | _omp/memory/ | "项目使用 React" |
| `UNIVERSAL` | 跨项目通用知识 | openmemory | "TypeScript 比 JS 更安全" |
| `EPHEMERAL` | 仅当前会话有效 | 不存储 | "先试试这个方案" |

#### Dimension 2: Confidence (置信度)

| Level | 范围 | 定义 | 处理方式 |
|-------|------|------|----------|
| `EXPLICIT` | >= 0.9 | 用户明确陈述 | 直接存储 |
| `INFERRED` | 0.7 - 0.9 | 从行为推断 | 存储但标记 |
| `UNCERTAIN` | 0.4 - 0.7 | 需要确认 | 询问用户后存储 |
| `NOISE` | < 0.4 | 噪音信息 | 丢弃 |

#### Dimension 3: Temporality (时效性)

| Type | 定义 | TTL | 示例 |
|------|------|-----|------|
| `PERMANENT` | 长期有效 | 无限 | 用户偏好 |
| `LONG_TERM` | 项目周期内有效 | 1年 | 技术决策 |
| `SHORT_TERM` | 短期有效 | 30天 | 当前任务 |
| `SESSION` | 仅当前会话 | 会话结束 | 临时尝试 |

### 快速分类指南

| 信号 | Scope | Confidence | 存储位置 |
|------|-------|------------|----------|
| "我喜欢/偏好/习惯" | PERSONAL | EXPLICIT | openmemory |
| "项目使用/配置为" | PROJECT | EXPLICIT | _omp/memory/ |
| "决定/选择/采用" | PROJECT | EXPLICIT | decisions.yaml |
| 用户反复使用某模式 | PERSONAL | INFERRED | openmemory |
| "试试/也许/可能" | EPHEMERAL | UNCERTAIN | 不存储 |

### 敏感信息过滤

**禁止存储** (自动检测并阻止):

```
❌ API Key / Token / Secret
❌ 密码 / Password
❌ 私钥 / Private Key
❌ 数据库连接字符串
❌ 个人身份信息 (PII)
```

---

## ROT 过滤机制



### Obsolete (过时) 检测

基于时间和访问频率判断：

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

### Trivial (琐碎) 检测

| 检测规则 | 示例 |
|----------|------|
| 内容 < 10 字符 | "ok"、"好的" |
| 过于泛化 | "这是一个项目" |
| 测试数据 | "测试记忆 - 时间戳 xxx" |
| 临时状态 | "验证通过"、"测试成功" |

### ROT 清理流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  分析记忆   │ ──▶ │  展示候选   │ ──▶ │  用户确认   │
│  识别 ROT   │     │  分类显示   │     │  批量删除   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**示例输出**:

```
🧹 清理候选记忆

⚠️ Outdated (过时):
1. "项目使用 Node.js 16" - 创建于 120 天前
   原因: 已升级到 Node.js 20

⚠️ Trivial (琐碎):
2. "测试记忆 - 时间戳 2026-01-15"
   原因: 测试数据，无实际价值

操作选项:
- "全部删除" - 删除所有候选
- "删除 1" - 只删除指定项
- "取消" - 不删除
```

---

## Ebbinghaus 衰减模型

基于艾宾浩斯遗忘曲线的记忆衰减模型，用于自动管理记忆生命周期。

### 核心公式

```
base_retention = e^(-t/S)
Retention(t) = base_retention + importance_boost × (1 - base_retention)

其中:
- t = 距离上次访问的天数
- S = 强度因子 (初始 30，每次访问 +10)
- importance_boost = 重要性加成 (0-0.5)
- 结果保证在 [0, 1] 范围内
```

### 强度因子 (S) 计算

```python
S = base_strength + (access_count * 10) + (explicit_mark * 50)

# base_strength = 30 (默认)
# access_count = 访问次数
# explicit_mark = 用户标记为重要 (0 或 1)
```

### 重要性加成

| 条件 | Boost |
|------|-------|
| 用户明确标记重要 | +0.5 |
| 高置信度 (>0.9) | +0.2 |
| 频繁访问 (>5次) | +0.1 |
| 项目核心配置 | +0.3 |

> ⚠️ **Cap 限制**: `importance_boost = min(累加值, 0.5)`

### 衰减状态分类

| Status | Retention | Emoji | 建议操作 |
|--------|-----------|-------|----------|
| Active | >= 0.7 | 🟢 | 保持 |
| Aging | 0.3-0.7 | 🟡 | 关注 |
| Stale | 0.1-0.3 | 🔴 | 考虑清理 |
| Cleanup | < 0.1 | ⚫ | 自动清理候选 |

### 遗忘策略

| 策略 | 条件 | 操作 |
|------|------|------|
| 自动遗忘 | Retention < 0.1 且 90天未访问 | 无需确认删除 |
| 确认遗忘 | Retention 0.1-0.3 且 60天未访问 | 询问用户后删除 |
| 永不遗忘 | 用户标记为重要 / 核心配置 | 永久保留 |

---

## 健康度监控

### 健康度计算公式

```python
def calculate_health_score(memories):
    total = len(memories)
    if total == 0:
        return 100

    # 1. 活跃率 (30% 权重)
    active_ratio = count_by_status(memories, 'active') / total

    # 2. ROT 比例 (20% 权重) - 越低越好
    rot_ratio = (count_stale + count_cleanup) / total

    # 3. 平均置信度 (30% 权重)
    avg_confidence = mean([m.confidence for m in memories])

    # 4. 冲突率 (20% 权重) - 越低越好
    conflict_ratio = count_conflicts(memories) / total

    # 加权计算
    score = (
        active_ratio * 0.3 +
        (1 - rot_ratio) * 0.2 +
        avg_confidence * 0.3 +
        (1 - conflict_ratio) * 0.2
    )
    return int(score * 100)
```

### 健康度等级

| 分数 | 等级 | Emoji | 说明 |
|------|------|-------|------|
| >= 80 | Excellent | ✅ | 系统健康 |
| 60-79 | Good | ⚠️ | 需要关注 |
| < 60 | Needs Attention | ❌ | 需要处理 |

### 各指标健康阈值

| 指标 | 健康阈值 | 说明 |
|------|----------|------|
| 活跃率 | > 60% | Active 状态记忆占比 |
| ROT 比例 | < 20% | Stale + Cleanup 占比 |
| 平均置信度 | > 0.7 | 所有记忆的平均置信度 |
| 冲突率 | < 5% | 存在冲突的记忆占比 |

---

## 冲突检测

当项目级和用户级记忆存在矛盾时，系统会自动检测并提示。

### 冲突类型

| 类型 | 示例 | 解决策略 |
|------|------|----------|
| 版本冲突 | 项目: Node 18 vs 用户: Node 20 | 以项目配置为准 |
| 偏好冲突 | 项目: npm vs 用户: pnpm | 询问用户 |
| 时间冲突 | 旧记忆 vs 新记忆 | 以新记忆为准 |

### 冲突解决流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  检测冲突   │ ──▶ │  展示差异   │ ──▶ │  用户选择   │
│             │     │             │     │  或自动解决 │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 相关命令

| 命令 | 功能 |
|------|------|
| `/memory` | 记忆管理入口 |
| `/mem status` | 查看记忆状态和健康度 |
| `/mem clean` | 清理 ROT 记忆 |
| `/mem search <query>` | 搜索记忆 |
| `/mem sync` | 同步双层记忆 |

---

*OpenMemory Plus - Dual-layer memory for AI agents*
