<p align="center">
  <img src="https://img.shields.io/badge/🧠_OpenMemory_Plus-Agent_Memory_Framework-blueviolet?style=for-the-badge" alt="OpenMemory Plus">
</p>

<p align="center">
  <strong>xMemory 四层记忆架构 · 智能分类 · 自动提取 · 多 IDE 支持</strong>
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

> **厌倦了每次切换 AI 工具都要重复自我介绍？**
>
> Cursor 不知道你在 Claude 里说过喜欢 TypeScript，Augment 不记得你昨天的技术决策...
>
> **OpenMemory Plus 让所有 AI Agent 共享同一份记忆。**

**OpenMemory Plus** 是一个为 AI Agent 设计的统一记忆管理框架，采用 **xMemory 四层记忆架构**：

- **L3 Theme** — 主题聚类层，自动归纳高层概念
- **L2 Semantic** — 语义记忆层，基于 BGE-M3 向量检索
- **L1 Episode** — 情节记忆层，保存对话上下文
- **L0 Message** — 原始消息层

```bash
# 5 分钟安装，终结 AI 失忆症
npx openmemory-plus install
```

### 📸 效果展示

<table>
  <tr>
    <td align="center" width="50%">
      <img src="images/auto_memory_execute.png" alt="自动记忆提取执行" width="100%"><br>
      <sub><b>自动记忆提取执行</b></sub>
    </td>
    <td align="center" width="50%">
      <img src="images/auto_memory_result.png" alt="记忆提取结果" width="100%"><br>
      <sub><b>记忆提取结果</b></sub>
    </td>
  </tr>
</table>

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
```markdown
<!-- _omp/memory/techContext.md (自动生成) -->
## 部署配置
- Vercel URL: https://my-app.vercel.app
- Project ID: prj_xxx

## 项目路径
- Root: /Users/me/projects/my-app
- Src: ./src
- Tests: ./tests
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
```markdown
<!-- _omp/memory/techContext.md (自动记录) -->
## 技术决策

### 数据库选型 (2026-02-01)
- **选择**: PostgreSQL
- **备选**: MongoDB, MySQL
- **原因**: 需要复杂查询和事务支持
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

1. ✅ 检测系统依赖 (Docker, Qdrant, Ollama, BGE-M3)
2. ✅ **Docker Compose 一键部署** (推荐) 或原生安装
3. ✅ 选择 IDE 类型
4. ✅ 初始化项目配置
5. ✅ 显示下一步指引

### 🐳 Docker Compose 一键部署 (推荐)

**只需安装 Docker，其他依赖自动处理！**

```bash
# 方式 1: 安装时自动检测并使用 Docker Compose
npx openmemory-plus install

# 方式 2: 显式使用 Docker Compose 模式
npx openmemory-plus install --compose

# 方式 3: 手动管理依赖服务
omp deps init      # 初始化配置
omp deps up        # 启动服务 (Qdrant + Ollama + BGE-M3)
omp deps status    # 查看状态
omp deps down      # 停止服务
```

**优势：**
- 🎯 只需安装 Docker 一个依赖
- ⚡ 一键启动所有服务
- 📦 BGE-M3 模型自动下载
- 💾 数据持久化，重启不丢失

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
| Docker | 最新版 | **唯一必需依赖** (Docker Compose 模式) |
| Ollama | 最新版 | 运行 BGE-M3 嵌入模型 (原生模式需要) |

---

## ✨ 特性

### 核心能力

- 🧠 **xMemory 四层架构** — L3 Theme → L2 Semantic → L1 Episode → L0 Message
- 🎯 **智能分类** — 自动判断信息应存储在项目还是用户记忆
- 🔍 **语义搜索** — 基于 BGE-M3 的多语言向量检索 + 主题层聚类
- ⚡ **事件驱动提取** — 对话结束时自动触发记忆提取 Skill
- 🔐 **敏感信息过滤** — 自动识别并阻止存储 API Key、密码等
- 🎯 **Top-down 检索** — 从主题层开始，自适应展开到语义层

### 🤖 多 LLM 支持 <sup>NEW</sup>

支持多种 LLM Provider 进行记忆分类：

| Provider | 模型 | 特点 |
|----------|------|------|
| **DeepSeek** | deepseek-chat | 🔥 推荐，性价比高 |
| **MiniMax** | abab6.5s-chat | 中文优化 |
| **ZhiPu** | glm-4-flash | 国产大模型 |
| **Qwen** | qwen-turbo | 阿里云 |
| **OpenAI** | gpt-4o-mini | 国际标准 |
| **Ollama** | 本地模型 | 离线可用 |

### 🧠 智能记忆管理

- 📊 **多维度分类** — 三维度分类体系 (Scope/Confidence/Temporality)，精准路由每条记忆
- 🧹 **ROT 智能过滤** — 自动识别冗余、过时、琐碎信息，保持记忆库精简
- ⏰ **Ebbinghaus 衰减** — 基于遗忘曲线的记忆生命周期管理，自动清理陈旧记忆
- 🔀 **冲突检测** — 自动发现双层数据矛盾，智能提示解决方案
- 📈 **健康度监控** — 四维度加权评分，实时掌握记忆系统状态

> 📖 **技术详情**: 参见 [记忆系统架构文档](docs/memory-system.md)

### 进阶功能

- 📊 **降级策略** — MCP 不可用时自动降级到本地存储
- 🔗 **记忆整合** — 语义聚类合并碎片化记忆
- 📉 **质量指标** — 可视化面板展示记忆健康状态
- 🔧 **渐进式配置** — 已有配置文件时追加而非覆盖

---

## 🏗️ 架构

### xMemory 四层记忆架构

```
┌─────────────────────────────────────────────────────────────┐
│                 xMemory 4-Layer Architecture                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L3 Theme (主题层)                                   │   │
│  │  ├── 自动聚类相似语义记忆                            │   │
│  │  ├── 主题吸附 (attachThreshold: 0.62)               │   │
│  │  ├── 主题分裂 (maxThemeSize: 12)                    │   │
│  │  └── 主题合并 (mergeThreshold: 0.78)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↑                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L2 Semantic (语义层) - Qdrant 向量数据库           │   │
│  │  └── BGE-M3 多语言 Embedding                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↑                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L1 Episode (情节层) - 对话上下文                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↑                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  L0 Message (消息层) - 原始对话                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 存储分层

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
│  │ _omp/memory/   │              │   openmemory    │      │
│  │   (项目级)      │              │   (用户级)      │      │
│  ├─────────────────┤              ├─────────────────┤      │
│  │ • project.yaml  │              │ • L3 主题层     │      │
│  │ • decisions.yaml│              │ • L2 语义层     │      │
│  │ • themes/       │              │ • L1 情节层     │      │
│  │ • Git 版本控制  │              │ • MCP 协议      │      │
│  └─────────────────┘              └─────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 分类规则

| 信息类型 | 存储位置 | 层级 | 示例 |
|----------|----------|------|------|
| 项目配置 | `_omp/memory/*.md` | - | 部署 URL、环境变量、路径 |
| 技术决策 | `_omp/memory/techContext.md` | - | 框架选择、架构设计 |
| 主题聚类 | `_omp/memory/themes/` | L3 | 自动生成的主题索引 |
| 用户偏好 | `openmemory` (MCP) | L2 | 语言偏好、代码风格 |
| 用户技能 | `openmemory` (MCP) | L2 | 熟悉的技术栈、经验 |

### xMemory 检索流程

```
查询输入 → L3 主题层匹配 → 分数 > 0.75? → 展开到 L2 语义层 → 返回结果
                ↓                   ↓
           KNN 邻居搜索        直接返回主题
```

> 💡 **注意**: 安装后，项目级记忆存储在 `_omp/memory/` 目录下，该目录会被添加到 Git 版本控制。

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

# 使用 Docker Compose 一键部署 (推荐)
npx openmemory-plus install --compose

# 静默安装
npx openmemory-plus install -y

# 指定 IDE
npx openmemory-plus install --ide augment

# 指定 LLM Provider (用于记忆分类)
npx openmemory-plus install --llm deepseek

# 仅配置项目，跳过依赖检测
npx openmemory-plus install --skip-deps

# 显示 MCP 配置
npx openmemory-plus install --show-mcp
```

### 支持的 LLM Provider

| Provider | 命令 | 环境变量 |
|----------|------|----------|
| DeepSeek | `--llm deepseek` | `DEEPSEEK_API_KEY` |
| MiniMax | `--llm minimax` | `MINIMAX_API_KEY` |
| ZhiPu | `--llm zhipu` | `ZHIPU_API_KEY` |
| Qwen | `--llm qwen` | `DASHSCOPE_API_KEY` |
| OpenAI | `--llm openai` | `OPENAI_API_KEY` |
| Ollama | `--llm ollama` | (本地，无需 API Key) |

### 🐳 依赖服务管理 (Docker Compose)

```bash
# 初始化 Docker Compose 配置
omp deps init

# 启动所有依赖服务 (Qdrant + Ollama + BGE-M3)
omp deps up

# 启动前拉取最新镜像
omp deps up --pull

# 停止所有服务
omp deps down

# 查看服务状态
omp deps status

# 查看服务日志
omp deps logs              # 所有服务
omp deps logs ollama       # 指定服务
omp deps logs -f           # 持续输出

# 手动下载 BGE-M3 模型
omp deps pull-model
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
| `/mem search {query}` | 语义搜索记忆 (默认 L2 语义层) |
| `/mem search {query} --level theme` | 🆕 主题层搜索 (L3) |
| `/mem search {query} --level theme --no-expand` | 🆕 仅主题层，不展开 |
| `/mem store` | 手动存储记忆 |
| `/mem sync` | 检测并解决冲突 |
| `/mem clean` | 清理 ROT 记忆 |
| `/mem decay` | 时间衰减分析 |
| `/mem graph` | 知识图谱可视化 |
| `/mem themes` | 🆕 查看主题聚类状态 |

---

## 📁 项目结构

```
openmemory-plus/
├── cli/                   # CLI 工具源码
│   ├── src/
│   │   ├── commands/      # install, status, doctor
│   │   └── lib/           # 核心库
│   └── templates/         # 模板文件
│       └── shared/        # 共享模板
│           └── _omp/      # 核心目录模板
├── docs/                  # 文档
│   └── architecture.md    # 架构设计
├── AGENTS.md              # AI Agent 配置入口
└── README.md              # 本文件

# 安装后在你的项目中生成 (以 Augment 为例):
your-project/
├── _omp/                      # OpenMemory Plus 核心目录 (所有 IDE 共享)
│   ├── AGENTS.md              # 完整 Agent 规则文件
│   ├── memory/                # 项目级记忆存储
│   │   ├── projectbrief.md    # 项目概述
│   │   ├── productContext.md  # 产品需求
│   │   ├── techContext.md     # 技术栈
│   │   ├── activeContext.md   # 当前会话上下文
│   │   ├── systemPatterns.md  # 模式与规范
│   │   ├── decisions.yaml     # 架构决策日志
│   │   └── progress.md        # 任务进度
│   ├── commands/              # Agent 命令
│   │   └── memory.md          # 主命令入口
│   ├── workflows/             # 工作流
│   │   └── memory/            # 记忆管理工作流 (7 步骤)
│   └── skills/                # Agent Skills
│       └── memory-extraction/ # 记忆提取 Skill (自动触发)
│
├── AGENTS.md                  # 入口文件 (引用 _omp/AGENTS.md)
└── .augment/                  # IDE 特定目录
    ├── commands/              # 命令入口 (链接到 _omp)
    └── skills/                # Skills (链接到 _omp)
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
  用户输入    关键词匹配   项目 or 用户?   YAML 格式    _omp/memory/
  Agent 输出  模式识别    自动判断        去重去噪     openmemory
```

### 分类决策树

```
检测到有价值信息
        │
        ▼
   ┌─────────────┐
   │ 包含项目特定 │──是──▶ _omp/memory/ (项目级)
   │ 信息？      │        ├── techContext.md
   └─────────────┘        ├── productContext.md
        │ 否              └── activeContext.md
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

| 特性 | OpenMemory Plus | 纯 openmemory MCP | 原生 mem0 SDK | 手动 .env | Notion/文档 |
|------|-----------------|-------------------|---------------|-----------|-------------|
| 自动提取 | ✅ 对话结束自动触发 | ⚠️ 需 Agent 主动调用 | ⚠️ 需代码调用 add() | ❌ | ❌ |
| 双层架构 | ✅ 项目+用户 | ❌ 仅用户级 | ❌ 仅用户级 | ❌ 仅项目级 | ❌ |
| 多 IDE 共享 | ✅ | ✅ | ✅ | ❌ | ❌ |
| Git 版本控制 | ✅ 项目级可追溯 | ❌ | ❌ | ✅ | ❌ |
| 语义搜索 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 智能分类 | ✅ 自动 7 类型分类 | ❌ 需手动 metadata | ❌ 需手动 metadata | ❌ | ❌ |
| 敏感信息过滤 | ✅ 自动阻止存储 | ⚠️ 有 PII 检测 | ⚠️ 有 PII 检测 | ❌ | ❌ |
| 一键安装 | ✅ `npx omp install` | ⚠️ 需手动配置 MCP | ❌ 需代码集成 | ❌ | ❌ |
| ROT 记忆清理 | ✅ 自动识别冗余/过时 | ❌ | ❌ | ❌ | ❌ |
| Ebbinghaus 衰减 | ✅ 遗忘曲线模型 | ❌ | ❌ | ❌ | ❌ |

> **图例**: ✅ 完整支持 | ⚠️ 部分支持 | ❌ 不支持

### 关键差异说明

| 对比项 | OpenMemory Plus | 纯 openmemory MCP |
|--------|-----------------|-------------------|
| **记忆触发** | 对话结束自动提取，无需用户干预 | Agent 需主动调用 `add_memories` 工具 |
| **项目上下文** | `_omp/memory/` 存储项目决策和架构 | 无项目级记忆，所有记忆混在用户级 |
| **记忆分类** | 自动分类为 preferences/decisions/patterns 等 | 需手动传入 metadata 参数 |
| **记忆健康** | ROT 检测 + 健康度评分 + 衰减模型 | 无，记忆只增不减 |
| **IDE 配置** | 自动生成 AGENTS.md/CLAUDE.md 等 | 需手动配置每个 IDE |

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
| `_omp/memory/` (本地) | 项目配置、技术决策 | ✅ 本地文件，Git 版本控制 |
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
2. 创建 `_omp/memory/` 目录
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

> 采用 **Now / Next / Later** 模式，专注当前方向，灵活调整优先级。

### 🔥 Now (进行中)

**增长与社区建设**
- [ ] 内容营销 — 痛点文章、对比视频、使用案例
- [ ] 社区建设 — Discord/微信群、用户故事征集
- [ ] 文档完善 — 故障排查指南、最佳实践

**产品体验优化**
- [ ] 安装成功率提升 — 更好的错误提示和自动修复
- [ ] 首次体验优化 — 5 分钟内感受到价值

### 📅 Next (下一阶段)

- [ ] 记忆搜索增强 — 语义搜索、模糊匹配
- [ ] 批量记忆管理 — CLI 命令支持批量操作
- [ ] 更多 IDE 支持 — Windsurf, Cline
- [ ] 记忆导入/导出 — 数据可移植性

### 💡 Later (未来考虑)

- [ ] Web UI 管理界面
- [ ] 团队记忆共享 (可选)
- [ ] 云端同步选项
- [ ] 记忆分析和洞察

👉 **[查看完整 Roadmap Issues](https://github.com/Alenryuichi/openmemory-plus/issues?q=is%3Aissue+is%3Aopen+label%3A%22roadmap%3A+now%22%2C%22roadmap%3A+next%22%2C%22roadmap%3A+later%22)**

### ✅ Done (v1.6)

<details>
<summary>已完成功能</summary>

**v1.6 - xMemory 四层架构**
- [x] 🧠 xMemory 四层架构 (L3 Theme → L2 Semantic → L1 Episode → L0 Message)
- [x] 🎯 L3 主题层自动聚类 (吸附/分裂/合并算法)
- [x] 🔍 Top-down 自适应检索 (`--level theme`)
- [x] ⚡ 主题搜索 CLI 选项 (`--no-expand`)
- [x] 📊 连通分量聚类算法 (xMemory 论文实现)

**v1.5 - 基础功能**
- [x] 双层记忆架构 (项目级 + 用户级)
- [x] 智能分类路由
- [x] 多 IDE 支持 (Augment, Claude, Cursor, Gemini)
- [x] CLI 安装工具 (`npx openmemory-plus install`)
- [x] 敏感信息过滤
- [x] 多 LLM Provider 支持 (DeepSeek, MiniMax, ZhiPu, Qwen, OpenAI, Ollama)
- [x] Docker Compose 一键部署
- [x] 渐进式配置 (已有文件追加而非覆盖)
- [x] MCP 自动配置与验证

</details>

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

