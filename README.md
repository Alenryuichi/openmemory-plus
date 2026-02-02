<p align="center">
  <img src="https://img.shields.io/badge/🧠_OpenMemory_Plus-Agent_Memory_Framework-blueviolet?style=for-the-badge" alt="OpenMemory Plus">
</p>

<p align="center">
  <strong>双层记忆架构 · 智能分类 · 自动提取 · 多 IDE 支持</strong>
</p>

<p align="center">
  <a href="README.md">🇨🇳 中文</a> | <a href="README_EN.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openmemory-plus">
    <img src="https://img.shields.io/npm/v/openmemory-plus?color=%2334D058&label=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/openmemory-plus">
    <img src="https://img.shields.io/npm/dm/openmemory-plus" alt="npm downloads">
  </a>
  <a href="https://github.com/Alenryuichi/openmemory-plus">
    <img src="https://img.shields.io/github/license/Alenryuichi/openmemory-plus" alt="License">
  </a>
  <a href="https://github.com/Alenryuichi/openmemory-plus">
    <img src="https://img.shields.io/github/stars/Alenryuichi/openmemory-plus?style=social" alt="GitHub stars">
  </a>
</p>

<p align="center">
  <a href="#-快速开始">快速开始</a> •
  <a href="#-特性">特性</a> •
  <a href="#-架构">架构</a> •
  <a href="#️-支持的-ide">支持的 IDE</a> •
  <a href="./docs/architecture.md">文档</a>
</p>

---

## 🎯 简介

**OpenMemory Plus** 是一个为 AI Agent 设计的统一记忆管理框架，整合项目级 (`.memory/`) 和用户级 (`openmemory` MCP) 双层记忆系统。

> **让任何 AI Agent 在 5 分钟内获得持久记忆能力。**

---

## 💡 为什么需要 OpenMemory Plus？

### 痛点场景

你是否遇到过这些问题？

| 😤 痛点 | 📖 场景描述 |
|--------|------------|
| **多 CLI 记忆割裂** | 同时用 Gemini、Augment、Claude、Cursor，每个都是独立记忆，互不相通 |
| **Agent 失忆症** | 每次新对话，Agent 都忘记你是谁、项目在哪、上次做了什么 |
| **重复自我介绍** | 切换 CLI 后又要告诉 Agent：我喜欢 TypeScript、用 pnpm、偏好函数式... |
| **配置碎片化** | 部署 URL 在 Slack，API Key 在笔记，路径在脑子里 |
| **上下文丢失** | 昨天在 Claude 讨论的技术决策，今天在 Augment 完全不记得 |

### OpenMemory Plus 如何解决？

**🔗 多 CLI 统一记忆层**

```
┌─────────────────────────────────────────────────────────────┐
│                    没有 OpenMemory Plus                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │ Gemini  │   │ Augment │   │ Claude  │   │ Cursor  │     │
│  │ CLI     │   │ Agent   │   │ Code    │   │ Agent   │     │
│  ├─────────┤   ├─────────┤   ├─────────┤   ├─────────┤     │
│  │ 记忆 A  │   │ 记忆 B  │   │ 记忆 C  │   │ 记忆 D  │     │
│  │ (独立)  │   │ (独立)  │   │ (独立)  │   │ (独立)  │     │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
│       ❌ 互不相通，每个都要重复告知偏好和上下文              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 使用 OpenMemory Plus                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │ Gemini  │   │ Augment │   │ Claude  │   │ Cursor  │     │
│  │ CLI     │   │ Agent   │   │ Code    │   │ Agent   │     │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘     │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │  OpenMemory   │                        │
│                    │  Plus 统一层  │                        │
│                    ├───────────────┤                        │
│                    │ • 用户偏好    │                        │
│                    │ • 技术栈      │                        │
│                    │ • 项目配置    │                        │
│                    │ • 历史决策    │                        │
│                    └───────────────┘                        │
│       ✅ 一处记忆，处处可用。切换 CLI 无缝衔接              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**💬 实际对话对比**

```
┌─────────────────────────────────────────────────────────────┐
│  [Gemini CLI] 早上                                          │
│  用户: 我喜欢用 TypeScript 和 pnpm                          │
│  Gemini: 好的，已记住你的偏好 ✅                            │
├─────────────────────────────────────────────────────────────┤
│  [Augment] 下午 - 切换 CLI                                  │
│  用户: 帮我初始化一个新项目                                 │
│  Augment: 好的！根据你的偏好，我用 TypeScript + pnpm 初始化 │
│           (自动读取了 Gemini 存储的偏好) ✅                 │
├─────────────────────────────────────────────────────────────┤
│  [Claude Code] 晚上 - 再次切换                              │
│  用户: 检查一下代码风格                                     │
│  Claude: 我看到你偏好函数式风格，检查中...                  │
│          (所有 CLI 共享同一份记忆) ✅                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 适用场景

### 👤 适合谁用？

| 用户类型 | 使用场景 |
|----------|----------|
| **独立开发者** | 多项目开发，希望 Agent 记住每个项目的配置和上下文 |
| **全栈工程师** | 频繁切换前后端项目，需要 Agent 记住技术栈偏好 |
| **AI 工具重度用户** | 同时使用 Cursor、Claude、Augment，希望记忆互通 |
| **团队 Tech Lead** | 希望项目配置版本化，新成员 Agent 自动获取上下文 |

### 📋 典型用例

<details>
<summary><b>🔧 用例 1: 项目配置管理</b></summary>

**场景**: 你有 5 个项目，每个都有不同的部署配置

**没有 OpenMemory Plus**:
- 每次都要告诉 Agent 项目路径
- 每次都要提供部署 URL
- 每次都要解释项目结构

**使用 OpenMemory Plus**:
```yaml
# _omp/.memory/project.yaml (自动生成)
deployment:
  vercel:
    url: https://my-app.vercel.app
    project_id: prj_xxx
paths:
  root: /Users/me/projects/my-app
  src: ./src
  tests: ./tests
```
Agent 自动读取，无需重复说明。

</details>

<details>
<summary><b>🎨 用例 2: 跨项目偏好同步</b></summary>

**场景**: 你喜欢用 TypeScript、Tailwind、pnpm

**没有 OpenMemory Plus**:
- 每个新项目都要告诉 Agent 你的偏好
- 切换 IDE 后偏好丢失

**使用 OpenMemory Plus**:
```
openmemory (用户级，跨项目共享):
├── "用户偏好: 使用 TypeScript 而非 JavaScript"
├── "用户偏好: 使用 pnpm 而非 npm"
├── "用户偏好: 使用 Tailwind CSS"
└── "用户技能: 熟悉 React, Next.js, Node.js"
```
任何项目、任何 IDE，Agent 都知道你的偏好。

</details>

<details>
<summary><b>📝 用例 3: 技术决策追踪</b></summary>

**场景**: 团队讨论后决定使用 PostgreSQL 而非 MongoDB

**没有 OpenMemory Plus**:
- 决策记录在 Slack/Notion，Agent 不知道
- 下次 Agent 可能建议用 MongoDB

**使用 OpenMemory Plus**:
```yaml
# _omp/.memory/decisions.yaml (自动记录)
decisions:
  - id: dec-2026-02-01
    title: "数据库选型"
    choice: "PostgreSQL"
    alternatives: ["MongoDB", "MySQL"]
    rationale: "需要复杂查询和事务支持"
```
Agent 记住决策，不会重复建议已否决的方案。

</details>

<details>
<summary><b>🔄 用例 4: 多 CLI 记忆共享 (核心场景)</b></summary>

**场景**: 你同时使用 Gemini CLI、Augment、Claude Code、Cursor

**没有 OpenMemory Plus**:
```
😤 每天的痛苦循环：

[早上 - Gemini CLI]
用户: 我喜欢 TypeScript，用 pnpm
Gemini: 好的！

[中午 - 切换到 Augment]
用户: 帮我创建组件
Augment: 请问你用 JavaScript 还是 TypeScript？  ← 又要说一遍
用户: TypeScript...
Augment: 用 npm 还是 yarn？  ← 又又要说一遍
用户: pnpm...  😤

[下午 - 切换到 Claude Code]
Claude: 你好！请问你的技术栈偏好是？  ← 又又又要说一遍
用户: ...... 😭
```

**使用 OpenMemory Plus**:
```
✅ 一次告知，处处生效：

[早上 - Gemini CLI]
用户: 我喜欢 TypeScript，用 pnpm
Gemini: 好的，已记住！ → 存入 openmemory

[中午 - 切换到 Augment]
用户: 帮我创建组件
Augment: 好的！用 TypeScript + pnpm 创建中... ← 自动读取
         (我知道你的偏好 😊)

[下午 - 切换到 Claude Code]
用户: 检查代码风格
Claude: 根据你的 TypeScript 偏好检查中... ← 自动读取
        发现 3 处可优化 ✅

[晚上 - 切换到 Cursor]
Cursor: 我看到你今天在其他 CLI 创建了新组件，
        需要我帮你写测试吗？ ← 甚至知道你今天做了什么
```

**共享的记忆内容**:
```yaml
# openmemory (所有 CLI 共享)
用户偏好:
  - 语言: TypeScript
  - 包管理器: pnpm
  - 框架: React, Next.js
  - 风格: 函数式编程

用户技能:
  - 熟悉: Node.js, Python
  - 学习中: Rust

今日上下文:
  - 在 Gemini 设置了偏好
  - 在 Augment 创建了 Button 组件
  - 在 Claude 优化了代码风格
```

</details>

---

## 🚀 快速开始

### 一键安装

```bash
npx openmemory-plus install
```

安装向导会自动引导你：

1. ✅ 检测系统依赖 (Docker, Ollama, Qdrant, BGE-M3)
2. ✅ 安装缺失的依赖
3. ✅ 选择 IDE 类型
4. ✅ 初始化项目配置
5. ✅ 显示下一步指引

### 基本用法

安装完成后，在你的 AI Agent 对话中使用：

```
/memory              # 显示记忆状态 + 快速菜单
/mem search <query>  # 搜索记忆
/mem sync            # 同步并检测冲突
/mem clean           # 清理过时记忆
```

### 系统要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18.0.0 | 运行 CLI |
| Docker | 最新版 | 运行 Qdrant 向量数据库 |
| Ollama | 最新版 | 运行 BGE-M3 嵌入模型 |

---

## ✨ 特性

### 核心能力

- 🔄 **双层记忆架构** — 项目级 + 用户级分离存储，各司其职
- 🎯 **智能分类** — 自动判断信息应存储在项目还是用户记忆
- 🔍 **语义搜索** — 基于 BGE-M3 的多语言向量检索
- ⚡ **自动提取** — 对话结束时自动保存有价值信息
- 🔐 **敏感信息过滤** — 自动识别并阻止存储 API Key、密码等

### 进阶功能

- 🔀 **冲突检测** — 自动发现两层数据矛盾并提示解决
- 🧹 **ROT 清理** — 清理冗余 (Redundant)、过时 (Obsolete)、琐碎 (Trivial) 记忆
- 📊 **降级策略** — MCP 不可用时自动降级到本地存储

---

## 🏗️ 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenMemory Plus                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   /memory   │    │  /mem xxx   │    │  自动提取   │     │
│  │   (入口)    │    │  (子命令)   │    │  (Skill)    │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         └──────────────────┼──────────────────┘             │
│                            ↓                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Memory Router (智能分类)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│         ┌──────────────────┼──────────────────┐            │
│         ↓                                     ↓            │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │ _omp/.memory/   │              │   openmemory    │      │
│  │   (项目级)      │              │   (用户级)      │      │
│  ├─────────────────┤              ├─────────────────┤      │
│  │ • project.yaml  │              │ • 向量数据库    │      │
│  │ • decisions.yaml│              │ • 语义搜索      │      │
│  │ • Git 版本控制  │              │ • MCP 协议      │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 分类规则

| 信息类型 | 存储位置 | 示例 |
|----------|----------|------|
| 项目配置 | `_omp/.memory/project.yaml` | 部署 URL、环境变量、路径 |
| 技术决策 | `_omp/.memory/decisions.yaml` | 框架选择、架构设计 |
| 用户偏好 | `openmemory` (MCP) | 语言偏好、代码风格 |
| 用户技能 | `openmemory` (MCP) | 熟悉的技术栈、经验 |

> 💡 **注意**: 安装后，项目级记忆存储在 `_omp/.memory/` 目录下，该目录会被添加到 Git 版本控制。

---

## 🖥️ 支持的 IDE

<table>
  <tr>
    <td align="center" width="25%">
      <img src="https://augmentcode.com/favicon.ico" width="40" height="40" alt="Augment"><br>
      <b>Augment</b><br>
      <code>✅ 完整支持</code>
    </td>
    <td align="center" width="25%">
      <img src="https://claude.ai/favicon.ico" width="40" height="40" alt="Claude"><br>
      <b>Claude Code</b><br>
      <code>✅ 完整支持</code>
    </td>
    <td align="center" width="25%">
      <img src="https://cursor.sh/favicon.ico" width="40" height="40" alt="Cursor"><br>
      <b>Cursor</b><br>
      <code>✅ 完整支持</code>
    </td>
    <td align="center" width="25%">
      <img src="https://gemini.google.com/favicon.ico" width="40" height="40" alt="Gemini"><br>
      <b>Gemini CLI</b><br>
      <code>✅ 完整支持</code>
    </td>
  </tr>
</table>

---

## 📦 CLI 命令

### 安装命令

```bash
# 交互式安装 (推荐)
npx openmemory-plus install

# 静默安装
npx openmemory-plus install -y

# 指定 IDE
npx openmemory-plus install --ide augment

# 仅配置项目，跳过依赖检测
npx openmemory-plus install --skip-deps

# 显示 MCP 配置
npx openmemory-plus install --show-mcp
```

### 诊断命令

```bash
# 检查系统状态
npx openmemory-plus status

# 诊断问题
npx openmemory-plus doctor

# 自动修复
npx openmemory-plus doctor --fix
```

### Agent 内置命令

| 命令 | 说明 |
|------|------|
| `/memory` | 显示快速状态 + 子命令菜单 |
| `/mem status` | 详细记忆状态 |
| `/mem search {query}` | 语义搜索记忆 |
| `/mem sync` | 检测并解决冲突 |
| `/mem clean` | 清理 ROT 记忆 |
| `/mem extract` | 手动触发记忆提取 |

---

## 📁 项目结构

```
openmemory-plus/
├── cli/                   # CLI 工具源码
│   ├── src/
│   │   ├── commands/      # install, status, doctor
│   │   └── lib/           # 核心库
│   └── templates/         # IDE 模板
├── templates/             # Agent 配置模板
│   ├── augment/           # Augment AGENTS.md
│   ├── claude/            # Claude CLAUDE.md
│   ├── cursor/            # Cursor 规则
│   └── gemini/            # Gemini 配置
├── skills/                # Skill 定义
│   └── memory-extraction/ # 记忆提取 Skill
├── docs/                  # 文档
│   └── architecture.md    # 架构设计
├── AGENTS.md              # AI Agent 配置入口
└── README.md              # 本文件

# 安装后在你的项目中生成:
your-project/
└── _omp/                  # OpenMemory Plus 核心目录
    ├── .memory/           # 项目级记忆存储
    │   ├── project.yaml   # 项目配置
    │   └── decisions.yaml # 技术决策
    ├── commands/          # Agent 命令
    └── skills/            # Agent Skills
```

---

## 🔧 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| CLI | TypeScript + Commander | 命令行工具 |
| 向量数据库 | Qdrant | 存储用户记忆向量 |
| Embedding | BGE-M3 (via Ollama) | 多语言文本嵌入 |
| 协议 | MCP (Model Context Protocol) | Agent 通信协议 |
| 项目存储 | YAML + Git | 版本控制的配置文件 |

---

## ⚙️ 工作原理

### 记忆提取流程

```
对话/操作 → 信息检测 → 智能分类 → 结构化提取 → 双层存储
     │           │           │            │            │
     ▼           ▼           ▼            ▼            ▼
  用户输入    关键词匹配   项目 or 用户?   YAML 格式    .memory/
  Agent 输出  模式识别    自动判断        去重去噪     openmemory
```

### 分类决策树

```
检测到有价值信息
        │
        ▼
   ┌─────────────┐
   │ 包含项目特定 │──是──▶ _omp/.memory/ (项目级)
   │ 信息？      │        ├── project.yaml
   └─────────────┘        ├── decisions.yaml
        │ 否              └── changelog.yaml
        ▼
   ┌─────────────┐
   │ 包含用户偏好 │──是──▶ openmemory (用户级)
   │ 或技能？    │        ├── 偏好设置
   └─────────────┘        ├── 技能经验
        │ 否              └── 对话上下文
        ▼
   ┌─────────────┐
   │ ROT 信息？  │──是──▶ 丢弃 (不存储)
   │ 冗余/过时/  │        ├── "好的"
   │ 琐碎       │        ├── "明白了"
   └─────────────┘        └── 临时状态
```

### 敏感信息过滤

自动检测并**阻止存储**以下内容：

| 类型 | 检测模式 | 示例 |
|------|----------|------|
| API Key | `sk-`, `api_key`, `token=` | `sk-xxx...` |
| 密码 | `password`, `secret` | `password: 123456` |
| 私钥 | `-----BEGIN`, `PRIVATE KEY` | SSH/GPG 密钥 |
| 个人信息 | 身份证、银行卡、手机号 | `13800138000` |

---

## 🔄 与其他方案对比

| 特性 | OpenMemory Plus | 原生 mem0 | 手动 .env | Notion/文档 |
|------|-----------------|-----------|-----------|-------------|
| 自动提取 | ✅ | ❌ 需手动调用 | ❌ | ❌ |
| 双层架构 | ✅ 项目+用户 | ❌ 仅用户级 | ❌ 仅项目级 | ❌ |
| 多 IDE 共享 | ✅ | ✅ | ❌ | ❌ |
| Git 版本控制 | ✅ 项目级 | ❌ | ✅ | ❌ |
| 语义搜索 | ✅ | ✅ | ❌ | ❌ |
| 智能分类 | ✅ | ❌ | ❌ | ❌ |
| 敏感信息过滤 | ✅ | ❌ | ❌ | ❌ |
| 一键安装 | ✅ | ❌ | ❌ | ❌ |

---

## ❓ FAQ

<details>
<summary><b>Q: OpenMemory Plus 和 mem0 是什么关系？</b></summary>

**A:** OpenMemory Plus 是 mem0 的**增强层**，不是替代品。

- **mem0** 提供底层的向量存储和语义搜索能力
- **OpenMemory Plus** 在此基础上增加：
  - 双层记忆架构（项目级 + 用户级）
  - 智能分类和自动提取
  - 多 IDE 统一配置
  - 敏感信息过滤

你需要先安装 mem0/openmemory MCP，然后使用 OpenMemory Plus 增强它。

</details>

<details>
<summary><b>Q: 我的数据存储在哪里？安全吗？</b></summary>

**A:** 数据存储在两个地方：

| 存储位置 | 数据类型 | 安全性 |
|----------|----------|--------|
| `_omp/.memory/` (本地) | 项目配置、技术决策 | ✅ 本地文件，Git 版本控制 |
| `openmemory` (Qdrant) | 用户偏好、技能 | ✅ 本地 Docker 容器 |

- 所有数据都在**你的本地机器**上
- 敏感信息（API Key、密码）会被**自动过滤**，不会存储
- 项目级数据可以通过 `.gitignore` 排除

</details>

<details>
<summary><b>Q: 支持哪些 IDE/Agent？</b></summary>

**A:** 目前完整支持：

| IDE | 配置文件 | 状态 |
|-----|----------|------|
| Augment | `AGENTS.md` | ✅ 完整支持 |
| Claude Code | `CLAUDE.md` | ✅ 完整支持 |
| Cursor | `.cursorrules` | ✅ 完整支持 |
| Gemini CLI | `gemini.md` | ✅ 完整支持 |

其他支持 MCP 协议的 Agent 也可以使用，只需手动配置。

</details>

<details>
<summary><b>Q: 如何迁移现有项目？</b></summary>

**A:** 只需运行安装命令：

```bash
cd your-existing-project
npx openmemory-plus install
```

安装向导会：
1. 检测现有配置
2. 创建 `_omp/.memory/` 目录
3. 生成 IDE 配置文件
4. 不会覆盖你的现有文件

</details>

<details>
<summary><b>Q: 如何清理过时的记忆？</b></summary>

**A:** 使用内置的 ROT 清理命令：

```
/mem clean
```

这会识别并清理：
- **R**edundant (冗余): 重复的信息
- **O**bsolete (过时): 已被更新的旧信息
- **T**rivial (琐碎): 无价值的确认语

</details>

---

## 🗺️ Roadmap

### v1.x (当前)
- [x] 双层记忆架构
- [x] 智能分类路由
- [x] 多 IDE 支持 (Augment, Claude, Cursor, Gemini)
- [x] CLI 安装工具
- [x] 敏感信息过滤

### v2.0 (计划中)
- [ ] Web UI 管理界面
- [ ] 团队记忆共享
- [ ] 记忆导入/导出
- [ ] 自定义分类规则
- [ ] 更多 IDE 支持 (Windsurf, Cline)

### v3.0 (远期)
- [ ] 云端同步选项
- [ ] 记忆分析和洞察
- [ ] AI 驱动的记忆整理
- [ ] 企业版功能

---

## 🤝 贡献

欢迎贡献！请阅读 [贡献指南](CONTRIBUTING.md) 了解如何参与。

```bash
# 克隆仓库
git clone https://github.com/Alenryuichi/openmemory-plus.git
cd openmemory-plus

# 安装依赖
cd cli && npm install

# 运行测试
npm test

# 本地开发
npm run dev
```

---

## 📄 许可证

[MIT License](LICENSE) © 2026 TreeRen Chou

---

## 🔗 相关链接

- [OpenMemory (mem0)](https://github.com/mem0ai/mem0) — 底层记忆服务
- [Qdrant](https://qdrant.tech/) — 向量数据库
- [BGE-M3](https://huggingface.co/BAAI/bge-m3) — 多语言 Embedding 模型
- [MCP 协议](https://modelcontextprotocol.io/) — Model Context Protocol

---

<p align="center">
  <sub>Made with ❤️ for AI Agent developers</sub>
</p>

