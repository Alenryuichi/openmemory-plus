---
name: memory-extraction
description: Agent-only workflow for extracting key information from conversations, code changes, and deployments into structured memory files. Automatically updates `_omp/memory/` directory and notifies other agents. Triggered automatically at conversation end or when valuable information is detected.
metadata:
  author: Wendy (Workflow Builder)
  version: "2.1"
  language: zh-CN
  audience: agent-only
---

# Memory Extraction Skill (Agent-Only)

## 目的

**自动提取对话中的关键信息**，智能路由到正确的存储系统：
- **项目级信息** → `_omp/memory/` 目录 (Git 版本控制)
- **用户级信息** → `openmemory` MCP (跨项目共享)

> **Agent-Only 原则**:
> - **自动触发**：对话结束时或检测到有价值信息时自动运行
> - **智能分类**：根据信息类型自动选择存储位置
> - **零人工干预**：无需用户确认，静默执行
> - **双系统同步**：同时管理 `_omp/memory/` 和 `openmemory`

## 核心目录结构

```
_omp/                           # OpenMemory Plus 核心目录
├── commands/
│   ├── memory.md               # 主命令入口
│   └── memory-actions/         # 7 个子动作
├── skills/
│   └── memory-extraction/      # 本 Skill
│       ├── SKILL.md
│       ├── scripts/validate.sh
│       └── templates/*.tmpl
└── memory/                    # 项目级记忆
    ├── project.yaml            # 项目配置 (SSOT)
    ├── decisions.yaml          # 技术决策记录
    ├── changelog.yaml          # 变更历史
    └── sessions/               # 会话记录
```

## 双层记忆架构

| 系统 | 存储位置 | 用途 |
|------|----------|------|
| 项目级 | `_omp/memory/` | 项目配置、技术决策、变更记录 |
| 用户级 | `openmemory` MCP | 用户偏好、技能、跨项目上下文 |

## 分类规则

### 存储位置决策表

| 信息类型 | 存储位置 | 识别关键词 |
|----------|----------|------------|
| 项目配置 | `_omp/memory/project.yaml` | url, domain, deploy, vercel, config, path |
| 技术决策 | `_omp/memory/decisions.yaml` | 决定, 选择, 采用, 架构, decision, choose |
| 变更记录 | `_omp/memory/changelog.yaml` | 更新, 修改, 发布, update, change, release |
| 用户偏好 | `openmemory` | 偏好, 喜欢, 习惯, prefer, style, always |
| 用户技能 | `openmemory` | 会, 熟悉, 经验, skill, experience, know |
| 对话上下文 | `openmemory` | 之前, 上次, 记得, remember, last time |

### 分类优先级

1. **项目相关** → `_omp/memory/` (Git 版本控制)
2. **用户相关** → `openmemory` (跨项目共享)
3. **混合信息** → 拆分存储到两个系统

### 敏感信息过滤

**禁止存储**（检测后阻止）:

| 类型 | 检测模式 |
|------|----------|
| API Key | `sk-`, `api_key`, `token=`, `bearer` |
| 密码 | `password`, `secret`, `credential` |
| 私钥 | `-----BEGIN`, `PRIVATE KEY` |
| 个人信息 | 身份证号, 银行卡号, 手机号 |

### ROT 过滤规则

**不存储的信息**:

| 类型 | 示例 |
|------|------|
| 琐碎确认 | "好的", "OK", "明白了" |
| 临时状态 | "正在处理...", "稍等" |
| 重复信息 | 已存在的相同内容 |
| 过期信息 | 被明确否定或更新的旧信息 |

## 触发条件

### 自动触发（推荐）
- 对话结束时自动检查是否有新信息
- 检测到以下关键事件时立即触发：
  - 部署状态变更（成功/失败）
  - 新服务配置
  - 重要技术决策
  - 项目里程碑

### 手动触发
- 用户说 `/extract-memory` 或 "保存到记忆"
- 用户说 "记住这个" 或 "更新配置"

---

## 🔄 自动化流程

```
对话/操作 → 信息检测 → 分类 → 提取 → 存储 → 通知
     ↓           ↓        ↓       ↓       ↓       ↓
  输入源      触发判断   类型识别  结构化  写入YAML  更新Agent
```

### Phase 1: 信息检测

**检测规则**（按优先级）：

| 优先级 | 信息类型 | 检测信号 | 示例 |
|--------|----------|----------|------|
| P0 | 部署变更 | `deploy`, `vercel`, `wrangler`, URL 变化 | 新域名上线 |
| P0 | 服务配置 | `config`, `secret`, `token`, API 密钥 | 更新 VERCEL_TOKEN |
| P1 | 技术决策 | `决定`, `选择`, `采用`, 架构变更 | 选择 YAML 格式 |
| P1 | 项目里程碑 | `完成`, `上线`, `发布`, 版本号 | v1.0 发布 |
| P2 | 路径变更 | 目录创建/移动, 文件重组 | 创建 _omp/memory/ |
| P2 | 工具配置 | CLI 安装, 依赖更新 | 安装 resumes-cli |

### Phase 2: 信息分类与路由

根据检测结果，**智能路由**到正确的存储系统：

#### 项目级 → `_omp/memory/`

| 分类 | 目标文件 | 内容类型 |
|------|----------|----------|
| `project` | `_omp/memory/project.yaml` | 项目常量、部署信息、路径 |
| `decisions` | `_omp/memory/decisions.yaml` | 重要技术决策记录 |
| `changelog` | `_omp/memory/changelog.yaml` | 变更历史 |

#### 用户级 → `openmemory`

| 分类 | MCP 工具 | 内容类型 |
|------|----------|----------|
| `preference` | `add_memories_openmemory` | 用户偏好、习惯 |
| `skill` | `add_memories_openmemory` | 用户技能、经验 |
| `context` | `add_memories_openmemory` | 对话上下文、历史 |

#### openmemory MCP 调用

**写入用户记忆**:
```
Tool: add_memories_openmemory
Parameter: text = "用户偏好: {提取的偏好信息}"
```

**搜索用户记忆**:
```
Tool: search_memory_openmemory
Parameter: query = "{搜索关键词}"
```

### Phase 3: 结构化提取

**提取模板**：

```yaml
# 部署变更
deployment:
  {service_name}:
    url: {new_url}
    status: {active|pending|failed}
    updated_at: {timestamp}
    updated_by: {agent|user}

# 技术决策
decisions:
  - id: {uuid}
    date: {date}
    title: {decision_title}
    context: {why_this_decision}
    choice: {what_was_chosen}
    alternatives: [{other_options}]
    impact: {affected_areas}

# 路径变更
paths:
  {path_key}: {new_path}
```

### Phase 4: 存储

**写入规则**：
1. 读取现有文件（如存在）
2. 合并新信息（不覆盖，追加/更新）
3. 保留注释和格式
4. 添加 `last_updated` 时间戳

**示例写入**：
```yaml
# _omp/memory/project.yaml
deployment:
  vercel:
    url: https://web-zeta-six-79.vercel.app
    status: active
    updated_at: 2026-02-02T10:30:00Z  # ← 自动更新
```

### Phase 5: 通知其他 Agent

更新完成后，在以下位置添加通知标记：

```yaml
# _omp/memory/project.yaml (底部)
_meta:
  last_updated: 2026-02-02T10:30:00Z
  updated_by: memory-extraction-skill
  changes:
    - "deployment.vercel.status: pending → active"
```

---

## 输出格式

### `_omp/memory/project.yaml` (主配置)
见现有文件结构，本 Skill 负责自动更新。

### `_omp/memory/sessions/{date}.yaml` (会话记录)
```yaml
date: 2026-02-02
sessions:
  - id: session-001
    start: "10:00"
    end: "11:30"
    summary: "部署 Vercel 并配置 Cloudflare Worker"
    key_actions:
      - "更新 VERCEL_TOKEN GitHub Secret"
      - "创建 _omp/memory/ 目录结构"
    decisions:
      - "采用 YAML 格式作为 memory 存储格式"
```

### `_omp/memory/decisions.yaml` (决策记录)
```yaml
decisions:
  - id: dec-2026-02-02-001
    date: 2026-02-02
    title: "Memory 存储格式选择"
    context: "需要跨 Agent 共享配置，支持多 IDE"
    choice: "YAML 格式"
    alternatives: ["JSON", "Markdown", "TOML"]
    rationale: "人类可读 + 机器可解析 + 支持注释"
```

---

## 与其他 Agent 的集成

### 读取方（其他 Agent）

其他 Agent 应在启动时读取 `_omp/memory/project.yaml`：

```markdown
<!-- 在 CLAUDE.md 或 Agent 配置中 -->
> 📌 **配置中心**: 项目常量统一存储在 `_omp/memory/project.yaml`
```

### 写入方（本 Skill）

本 Skill 是 `_omp/memory/` 的唯一写入者，确保：
- 格式一致性
- 无冲突写入
- 变更可追溯

---

## 错误处理

### 写入失败场景

| 场景 | 处理策略 |
|------|----------|
| **YAML 语法错误** | 验证失败，不写入，通知用户修复 |
| **文件不存在** | 从模板创建新文件 |
| **权限拒绝** | 记录错误，跳过此次更新 |
| **Schema 验证失败** | 回滚到上一版本，输出差异 |

### 回退机制

1. **写入前备份**: 修改前复制到 `_omp/memory/.backup/`
2. **原子写入**: 写入临时文件，验证后重命名
3. **错误日志**: 记录到 `_omp/memory/sessions/{date}.yaml` 的 `errors` 字段

### 验证脚本

```bash
# 验证所有 YAML 文件
_omp/skills/memory-extraction/scripts/validate.sh
```

---

## 触发条件详解

### 自动触发时机

| 触发信号 | 说明 | 示例 |
|----------|------|------|
| 用户结束对话 | 用户说 "bye", "结束", "exit", "谢谢" | `用户: 好的，先这样` |
| 部署完成 | 检测到 deploy/vercel/wrangler 输出 | `vercel --prod` 成功 |
| 配置变更 | 修改了 env/secret/config 文件 | 更新 `.env` |
| 创建新目录 | 创建了项目级目录 | `mkdir _omp/memory/` |
| 重要决策 | 对话中明确了技术选型 | `决定使用 YAML 格式` |

### 不触发的场景

- 普通代码编辑（非配置文件）
- 读取操作（无写入）
- 临时文件操作

---

## 辅助资源

### 模板文件

- `templates/session.yaml.tmpl` - 新建会话模板
- `templates/decision.yaml.tmpl` - 新增决策模板

### Schema 验证

- `_omp/memory/schema/project.schema.json`
- `_omp/memory/schema/decisions.schema.json`
- `_omp/memory/schema/session.schema.json`

---

## 执行检查清单

Agent 在对话结束前执行：

- [ ] 是否有部署状态变更？→ 更新 `deployment`
- [ ] 是否有新路径/目录？→ 更新 `paths`
- [ ] 是否有重要决策？→ 记录到 `decisions.yaml`
- [ ] 是否有配置变更？→ 更新对应字段
- [ ] 是否有用户偏好/技能？→ 存入 `openmemory`
- [ ] 更新 `_meta.last_updated`（使用精确 ISO 8601 时间戳）
- [ ] 运行 `validate.sh` 验证格式

---

## 冲突检测

Agent 在查询记忆时应检测两系统数据一致性：

### 检测时机

- 用户询问配置/部署信息时
- 执行 `/memory sync` 命令时
- 发现两系统返回不同结果时

### 检测逻辑

```
查询结果
    ↓
提取关键实体 (URL, 配置值, 技术选型)
    ↓
比对 _omp/memory/ vs openmemory
    ↓
发现差异 → 提示用户确认
    ↓
用户选择 → 更新/删除过时记录
```

### 冲突处理

| 场景 | 处理方式 |
|------|----------|
| URL 不一致 | 提示用户，优先 `_omp/memory/` |
| 技术选型冲突 | 展示两边，请求决策 |
| 时间戳可判断 | 自动保留较新版本 |

---

## 对话启动时自动加载

Agent 在对话开始时应**并行查询**两个系统：

```
对话开始
    ↓
┌─────────────────┐     ┌─────────────────┐
│  _omp/memory/  │     │   openmemory    │
│   (读取 YAML)   │     │ (search_memory) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ↓
               上下文融合
```

**加载步骤**:
1. 读取 `_omp/memory/project.yaml` 获取项目配置
2. 调用 `search_memory_openmemory` 查询相关用户记忆
3. 融合两边信息作为对话上下文

## 降级策略

**当 openmemory MCP 不可用时**:

1. 检测 MCP 连接状态（调用失败或超时）
2. 降级到仅 `_omp/memory/` 存储
3. 用户级信息临时存入 `_omp/memory/user-context.yaml`
4. 服务恢复后提示用户同步

```yaml
# _omp/memory/user-context.yaml (降级时使用)
_degraded: true
_reason: "openmemory MCP unavailable"
pending_memories:
  - text: "用户偏好: 使用中文"
    created_at: 2026-02-02T10:30:00Z
```

## 版本历史

| 版本 | 变更 |
|------|------|
| v2.1 | 目录重构：_omp/ 统一目录，移除 rules/，分类规则内嵌 |
| v2.0 | 双层记忆架构：整合 openmemory MCP，智能分类路由 |
| v1.1 | 添加错误处理、Schema 验证、模板文件、触发条件详解 |
| v1.0 | 初始版本：自动提取、YAML 存储、多 Agent 通知 |

