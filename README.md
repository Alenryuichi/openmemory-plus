# OpenMemory Plus

> 🧠 Agent 记忆管理框架 - 双层记忆架构，智能分类，自动提取

OpenMemory Plus 是一个为 AI Agent 设计的统一记忆管理系统，整合项目级 (`.memory/`) 和用户级 (`openmemory` MCP) 双层记忆。

**让任何 AI Agent 在 5 分钟内获得持久记忆能力。**

## ✨ 特性

- **双层记忆架构**: 项目级 + 用户级分离存储
- **多 CLI 共享**: Augment, Claude, Cursor, Gemini 共享同一记忆层
- **智能分类**: 自动判断信息存储位置
- **语义搜索**: 基于 BGE-M3 的向量检索
- **冲突检测**: 自动发现两层数据矛盾
- **ROT 清理**: 清理冗余、过时、琐碎记忆
- **自动提取**: 对话结束时自动保存有价值信息

## 📦 项目结构

```
openmemory-plus/
├── README.md              # 本文件
├── AGENTS.md              # AI Agent 配置入口
├── commands/              # 命令定义
│   ├── memory.md          # 统一入口 /memory
│   ├── mem-status.md      # /mem status
│   ├── mem-search.md      # /mem search
│   ├── mem-sync.md        # /mem sync
│   ├── mem-clean.md       # /mem clean
│   └── mem-extract.md     # /mem extract
├── rules/                 # 规则定义
│   └── classification.md  # 分类规则
├── skills/                # Skill 定义
│   └── memory-extraction/ # 记忆提取 Skill
│       ├── SKILL.md
│       ├── scripts/
│       └── templates/
└── docs/                  # 文档
    └── architecture.md    # 架构设计
```

## 🚀 快速开始

### 命令

| 命令 | 说明 |
|------|------|
| `/memory` | 显示快速状态 + 子命令列表 |
| `/mem status` | 详细记忆状态 |
| `/mem search {query}` | 搜索记忆 |
| `/mem sync` | 检测并解决冲突 |
| `/mem clean` | 清理 ROT |
| `/mem extract` | 手动触发记忆提取 |

### 架构

```
Agent 记忆系统
├── .memory/ (项目级)
│   ├── project.yaml     # 项目配置 (SSOT)
│   ├── decisions.yaml   # 技术决策
│   └── changelog.yaml   # 变更历史
└── openmemory (用户级)
    ├── 用户偏好          # 跨项目通用
    ├── 用户技能          # 个人能力
    └── 对话上下文        # 历史记忆
```

## 🔧 依赖

| 组件 | 说明 | 状态 |
|------|------|------|
| OpenMemory MCP | Mem0 记忆层 | 必需 |
| Qdrant | 向量数据库 | 必需 |
| BGE-M3 | Embedding 模型 | 必需 |
| DeepSeek API | LLM 分类 | 可选 |

## 📋 分类规则

| 信息类型 | 存储位置 | 示例 |
|----------|----------|------|
| 项目配置 | `.memory/` | 部署 URL、路径 |
| 技术决策 | `.memory/` | 框架选择、架构 |
| 用户偏好 | `openmemory` | 语言、风格 |
| 用户技能 | `openmemory` | 熟悉的技术栈 |

详细规则见 `rules/classification.md`

## 🛠️ 安装

**只需一个命令：**

```bash
npx openmemory-plus install
```

安装向导会引导你完成：

1. ✅ 检测系统依赖 (Docker, Ollama, Qdrant, BGE-M3)
2. ✅ 安装缺失的依赖
3. ✅ 选择 IDE 类型 (Augment, Claude, Cursor, Gemini)
4. ✅ 初始化项目配置
5. ✅ 显示下一步指引

### 命令选项

```bash
npx openmemory-plus install              # 交互式安装 (推荐)
npx openmemory-plus install -y           # 跳过确认提示
npx openmemory-plus install --ide augment  # 指定 IDE 类型
npx openmemory-plus install --skip-deps  # 仅配置项目，跳过依赖
npx openmemory-plus install --show-mcp   # 显示 MCP 配置
```

### 其他命令

```bash
npx openmemory-plus status     # 检查系统状态
npx openmemory-plus doctor     # 诊断问题
npx openmemory-plus doctor --fix  # 自动修复
```

### 系统要求

- **Node.js**: >= 18.0.0
- **Docker**: 用于运行 Qdrant 向量数据库
- **Ollama**: 用于运行 BGE-M3 嵌入模型

## 📄 许可证

MIT

## 🔗 相关项目

- [OpenMemory](https://github.com/mem0ai/mem0) - Mem0 记忆层
- [Qdrant](https://qdrant.tech/) - 向量数据库
- [BGE-M3](https://huggingface.co/BAAI/bge-m3) - 多语言 Embedding

