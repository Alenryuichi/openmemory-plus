# 技术研究报告：优化 AI Agent Skill 以增强 Memory 能力

**研究日期**: 2026-02-03  
**研究类型**: Technical Research  
**研究者**: Ryuichialen (AI Research Partner)

---

## Executive Summary

本研究调查了如何优化 AI Agent 的 Skill 系统以增强记忆能力。基于对 Anthropic Agent Skills 架构、Mem0 记忆系统理论、以及 openmemory-plus 项目现有实现的深入分析，我们提出了一套系统性的优化方案。

### 核心发现

1. **Skill = Prompt Template + Context Injection + Execution Modification + Resources**
2. **Memory 三大支柱**: State（当前状态）、Persistence（跨会话持久化）、Selection（选择性记忆）
3. **记忆类型**: Working Memory（短期）、Factual/Episodic/Semantic Memory（长期）
4. **优化关键**: ROT 过滤、冲突检测、衰减管理、语义搜索

### 主要建议

| 优先级 | 优化方向 | 预期效果 |
|--------|----------|----------|
| P0 | 增强 memory-extraction skill 的分类精度 | 减少噪音，提升记忆质量 |
| P1 | 实现记忆整合与去重 | 避免碎片化，降低存储成本 |
| P2 | 添加动态遗忘机制 | 自动清理过时信息 |
| P3 | 优化双层记忆协同 | 减少冲突，提升一致性 |

---

## 目录

1. [当前状态分析](#1-当前状态分析)
2. [Skill 架构深度解析](#2-skill-架构深度解析)
3. [Memory 系统基础](#3-memory-系统基础)
4. [优化建议](#4-优化建议)
5. [实现模式](#5-实现模式)
6. [最佳实践](#6-最佳实践)
7. [行动计划](#7-行动计划)

---

## 1. 当前状态分析

### 1.1 现有架构

openmemory-plus 项目采用**双层记忆架构**:

```
┌─────────────────────────────────────────────────┐
│                 AI Agent                         │
├─────────────────────────────────────────────────┤
│  memory-extraction skill                         │
│  ┌───────────────┐    ┌───────────────┐         │
│  │ Project-Level │    │  User-Level   │         │
│  │ (_omp/memory/)│◄──►│ (openmemory)  │         │
│  └───────────────┘    └───────────────┘         │
│         │                    │                   │
│         ▼                    ▼                   │
│  Local YAML Files      MCP Server               │
│  (Qdrant + BGE-M3)     (Vector DB)              │
└─────────────────────────────────────────────────┘
```

### 1.2 memory-extraction skill 现状

**优点**:
- 支持双层路由（项目级 vs 用户级）
- 关键词分类规则
- 敏感信息过滤
- MCP 降级策略

**待优化点**:
- 分类规则基于关键词匹配，缺乏语义理解
- ROT 过滤规则较简单
- 缺少记忆整合机制
- 无衰减/遗忘策略
- 冲突检测仅限告警，缺乏自动解决

### 1.3 Memory Workflow 现状

提供 7 个操作入口：
1. `status` - 查看状态
2. `search` - 语义搜索
3. `store` - 手动存储
4. `clean` - 清理 ROT
5. `sync` - 同步检查
6. `decay` - 衰减分析
7. `graph` - 知识图谱

**待优化**: 大部分功能为占位实现，需要完善。

---

## 2. Skill 架构深度解析

### 2.1 Skill 的本质（基于 Han Lee 分析）

```
Skill = Prompt Template 
      + Conversation Context Injection 
      + Execution Context Modification 
      + Optional Resources (scripts, references, assets)
```

### 2.2 SKILL.md 结构

```yaml
---
name: skill-name
description: 触发条件描述
allowed-tools: [tool1, tool2]  # 可选
model: claude-sonnet-4-20250514       # 可选
version: "1.0"                 # 可选
---

# Skill 内容（Markdown）
- 使用祈使语气
- 控制在 5000 词以内（~800 行）
- 引用外部文件而非内嵌
```

### 2.3 Skill 选择机制

**关键洞察**: Skill 选择不是通过算法路由，而是通过 LLM 语言理解。

```
User Message → Claude 读取所有 Skill 描述 → 基于描述选择 → 加载 SKILL.md
```

**优化启示**: 
- 描述必须精确反映触发场景
- 描述越具体，误触发越少
- 可以使用负面示例（"不要用于..."）

### 2.4 Progressive Disclosure 设计

```
Layer 1: Skill 元数据（description）→ 用于选择
Layer 2: SKILL.md 主体 → 执行指令
Layer 3: Bundled Resources → 详细内容
         ├── scripts/    (可执行脚本)
         ├── references/ (加载到上下文的文档)
         └── assets/     (按路径引用的资源)

---

## 3. Memory 系统基础

### 3.1 Memory vs Context Window

| 维度 | Context Window | Memory |
|------|---------------|--------|
| 生命周期 | 单次会话 | 跨会话持久 |
| 容量 | 有限（~200K tokens） | 可扩展 |
| 选择性 | 全部包含 | 按需检索 |
| 成本 | 每次调用消耗 | 存储+检索成本 |

### 3.2 Memory vs RAG

| 维度 | RAG | Memory |
|------|-----|--------|
| 数据来源 | 外部知识库 | 交互历史 |
| 目的 | 知识增强 | 连续性+用户建模 |
| 更新频率 | 批量更新 | 实时更新 |
| 个性化 | 低 | 高 |

### 3.3 Memory 三大支柱（Mem0 理论）

```
┌─────────────────────────────────────────┐
│              MEMORY SYSTEM              │
├─────────────┬─────────────┬─────────────┤
│    STATE    │ PERSISTENCE │  SELECTION  │
│   当前状态   │  跨会话存储  │  选择性记忆  │
├─────────────┼─────────────┼─────────────┤
│ Working Mem │ Long-term   │ Attention   │
│ 短期工作记忆 │ 长期记忆存储 │ 注意力机制   │
└─────────────┴─────────────┴─────────────┘
```

### 3.4 Memory 类型

| 类型 | 描述 | 示例 |
|------|------|------|
| **Working Memory** | 短期、当前任务相关 | 当前对话上下文 |
| **Factual Memory** | 结构化事实 | 用户偏好、项目配置 |
| **Episodic Memory** | 事件序列 | "上周我们讨论了..." |
| **Semantic Memory** | 概念关系 | 技术栈关联图谱 |

---

## 4. 优化建议

### 4.1 增强 memory-extraction skill [P0]

#### 4.1.1 语义分类替代关键词匹配

**现状**: 基于关键词的硬编码规则

```markdown
# 当前实现
- 包含 "喜欢"/"偏好" → 用户级
- 包含 项目名称 → 项目级
```

**建议**: 引入多维度分类

```markdown
# 优化后
## 分类维度

### Scope（范围）
- PERSONAL: 个人偏好、习惯、风格
- PROJECT: 项目特定信息
- UNIVERSAL: 跨项目通用知识

### Temporality（时效性）
- PERMANENT: 长期有效
- CONTEXTUAL: 当前上下文有效
- EPHEMERAL: 仅当前会话有效

### Confidence（置信度）
- EXPLICIT: 用户明确陈述
- INFERRED: 从行为推断
- UNCERTAIN: 需要确认
```

#### 4.1.2 增强 ROT 过滤

**R**edundant（冗余）: 使用语义相似度检测
**O**bsolete（过时）: 添加时间戳和有效期
**T**rivial（琐碎）: 设置信息密度阈值

```yaml
# rot_filter 配置建议
redundancy:
  similarity_threshold: 0.85
  action: merge_or_skip

obsolescence:
  default_ttl: 90d
  check_on_access: true

triviality:
  min_info_density: 0.3
  min_actionability: 0.5
```

### 4.2 记忆整合机制 [P1]

#### 4.2.1 自动去重与合并

```markdown
## 记忆整合规则

WHEN 新记忆到达:
  1. 计算与现有记忆的语义相似度
  2. IF 相似度 > 0.85:
     - IF 新信息更完整: 替换旧记忆
     - IF 新信息是补充: 合并到旧记忆
     - ELSE: 跳过
  3. ELSE: 正常存储
```

#### 4.2.2 记忆压缩

定期将碎片化记忆压缩为结构化摘要：

```yaml
# 压缩前
- "用户喜欢用 TypeScript"
- "用户的项目用 TypeScript 写"
- "用户说 TypeScript 比 JavaScript 好"

# 压缩后
- type: preference
  subject: programming_language
  value: TypeScript
  confidence: high
  evidence_count: 3
  last_updated: 2026-02-03
```

### 4.3 动态遗忘机制 [P2]

#### 4.3.1 衰减模型

采用 **Ebbinghaus 遗忘曲线** 变体：

```
Retention(t) = e^(-t/S) × (1 + boost)

其中:
- t = 距离上次访问的时间
- S = 强度（初始1.0，每次访问增加）
- boost = 重要性加成
```

#### 4.3.2 主动遗忘触发

```markdown
## 遗忘策略

### 自动遗忘
- Retention < 0.3 且 30天未访问
- 被明确标记为过时

### 确认遗忘
- Retention 0.3-0.5 且 60天未访问
- 提示用户确认是否保留

### 永不遗忘
- 用户明确标记为重要
- 安全/合规相关信息
```

### 4.4 双层记忆协同优化 [P3]

#### 4.4.1 冲突检测与解决

```markdown
## 冲突类型

1. **值冲突**: 相同属性不同值
   - 项目级: "使用 Jest 测试"
   - 用户级: "偏好 Vitest"

2. **范围冲突**: 通用 vs 特定
   - 项目级: "Tab 缩进 4 空格"
   - 用户级: "偏好 2 空格缩进"

## 解决策略

| 冲突类型 | 策略 | 说明 |
|----------|------|------|
| 值冲突 | 项目优先 | 项目约束覆盖个人偏好 |
| 范围冲突 | 特定优先 | 项目特定 > 用户通用 |
| 时间冲突 | 最新优先 | 更新的信息胜出 |
```

#### 4.4.2 同步机制

```yaml
# 同步配置
sync:
  direction: bidirectional
  conflict_resolution: project_first
  sync_triggers:
    - on_project_open
    - on_explicit_command
    - every_24h

  # 不同步到用户级的项目信息
  project_only:
    - secrets
    - internal_urls
    - team_specific
```

---

## 5. 实现模式

### 5.1 Skill 设计模式

基于研究，推荐以下 Skill 模式用于 Memory 增强：

#### Pattern 1: Read-Process-Write（记忆提取）

```markdown
## Workflow
1. READ: 读取当前对话上下文
2. PROCESS: 识别可记忆信息，分类，过滤
3. WRITE: 存储到适当的记忆层
```

#### Pattern 2: Search-Analyze-Report（记忆检索）

```markdown
## Workflow
1. SEARCH: 语义搜索相关记忆
2. ANALYZE: 评估相关性和时效性
3. REPORT: 注入到当前上下文
```

#### Pattern 3: Iterative Refinement（记忆维护）

```markdown
## Workflow
1. SCAN: 扫描所有记忆
2. EVALUATE: 评估质量和时效
3. REFINE: 合并/更新/删除
4. REPEAT: 定期执行
```

### 5.2 memory-extraction skill 重构建议

```markdown
---
name: memory-extraction
description: |
  自动从对话中提取并存储关键信息。触发条件：
  - 用户分享偏好、习惯、决策
  - 项目配置、约定、决策被确定
  - 重要事件或里程碑
  不触发：临时讨论、探索性问题、已存在的信息
---

# Memory Extraction Skill

## 触发判断（5秒内完成）

```python
should_trigger = any([
    explicit_preference,      # "我喜欢..."
    explicit_decision,        # "我们决定..."
    explicit_constraint,      # "必须..."
    important_outcome,        # 任务完成时的关键产出
])

should_skip = any([
    is_question,              # 问题不是记忆
    is_exploration,           # 探索性讨论
    already_known,            # 已存在相同信息
    low_confidence,           # 推测性信息
])
```

## 分类流程

### Step 1: 范围判断
- PERSONAL: 与用户个人相关
- PROJECT: 与当前项目相关
- SKIP: 临时/琐碎信息

### Step 2: 存储位置
- PERSONAL → openmemory (MCP)
- PROJECT → _omp/memory/*.yaml

### Step 3: ROT 过滤
- 相似度检查 > 0.85 → 合并
- 已过期 → 跳过
- 信息密度 < 0.3 → 跳过

## 存储格式

```yaml
# 项目记忆
- key: tech-stack
  value: TypeScript + React + Vite
  source: explicit
  confidence: 1.0
  created: 2026-02-03
  updated: 2026-02-03
  access_count: 1

# 用户记忆（通过 MCP）
add_memories_openmemory:
  text: "用户偏好 2 空格缩进，喜欢函数式编程风格"
```
```

---

## 6. 最佳实践

### 6.1 Skill 设计最佳实践

| 原则 | 说明 | 应用 |
|------|------|------|
| **简洁优先** | SKILL.md < 800 行 | 将详细内容放入 references/ |
| **渐进披露** | 描述 → 指令 → 资源 | 避免一次性加载所有内容 |
| **祈使语气** | "分析..." 而非 "你应该分析..." | 更清晰的指令 |
| **使用 {baseDir}** | 不硬编码路径 | 保持可移植性 |
| **明确触发条件** | 描述何时使用/不使用 | 减少误触发 |

### 6.2 Memory 最佳实践

| 原则 | 说明 | 应用 |
|------|------|------|
| **选择性记忆** | 不是所有信息都值得记 | 严格的准入标准 |
| **结构化存储** | 使用 YAML/JSON 格式 | 便于检索和更新 |
| **及时清理** | 定期执行 ROT 过滤 | 保持记忆质量 |
| **冲突解决** | 项目约束优先于个人偏好 | 明确优先级 |
| **降级策略** | MCP 不可用时的备选方案 | 保证基本功能 |

### 6.3 反模式（Anti-patterns）

❌ **过度记忆**: 记录所有对话内容
❌ **忽略时效性**: 不检查信息是否过时
❌ **硬编码路径**: 使用绝对路径
❌ **忽略冲突**: 不处理双层记忆的冲突
❌ **复杂触发逻辑**: 触发判断 > 5秒

---

## 7. 行动计划

### Phase 1: 基础优化（1-2 周）

- [ ] 重构 memory-extraction skill 的分类逻辑
- [ ] 添加语义相似度检测（利用 Qdrant）
- [ ] 完善 ROT 过滤规则
- [ ] 增加置信度字段

### Phase 2: 高级功能（2-4 周）

- [ ] 实现记忆整合与压缩
- [ ] 添加衰减模型
- [ ] 完善双层同步机制
- [ ] 实现冲突自动解决

### Phase 3: 可观测性（1 周）

- [ ] 添加记忆质量指标
- [ ] 实现记忆访问追踪
- [ ] 创建记忆健康度仪表盘

---

## 参考资料

1. **Han Lee** - "Claude Agent Skills: A First Principles Deep Dive"
   - Skill 架构深度分析
   - Progressive Disclosure 设计模式

2. **Mem0** - "Memory in Agents: What, Why and How"
   - Memory 三大支柱理论
   - Memory 类型分类

3. **Anthropic** - "Equipping agents for the real world with Agent Skills"
   - 官方 Skill 设计指南
   - 最佳实践

4. **openmemory-plus 项目现有代码**
   - `cli/templates/shared/_omp/skills/memory-extraction/SKILL.md`
   - `cli/templates/shared/_omp/workflows/memory/workflow.md`

---

## 附录：现有 Skill 目录参考

当前 `.augment/skills/` 包含以下可参考的模式：

| Skill | 模式 | 可借鉴点 |
|-------|------|----------|
| skill-creator | 向导式多步骤 | 结构化创建流程 |
| using-superpowers | 规则优先 | 清晰的优先级规则 |
| systematic-debugging | 迭代式 | 假设-验证循环 |
| brainstorming | 探索式 | 发散收敛思维 |
| verification-before-completion | 检查点 | 完成前验证 |

---

*研究完成于 2026-02-03*
