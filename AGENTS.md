# OpenMemory Plus - AI Agent 配置

本文件为 AI Agent 提供记忆管理能力配置。

## 快速启用

在对话开始时，Agent 应自动加载此配置以获取记忆管理能力。

## 命令入口

| 命令 | 说明 | 文件 |
|------|------|------|
| `/memory` | 统一入口 | `commands/memory.md` |

**只需一个命令 `/memory`，其余通过菜单选择或自然语言描述。**

## 核心目录

```
_omp/                           # OpenMemory Plus 核心目录
├── commands/
│   └── memory.md               # 轻量入口 (跳转到 workflow)
├── workflows/
│   └── memory/
│       ├── workflow.md         # 主工作流 (含菜单)
│       └── steps/              # 7 个步骤文件
│           ├── status.md
│           ├── search.md
│           ├── store.md
│           ├── clean.md
│           ├── sync.md
│           ├── decay.md
│           └── graph.md
├── skills/
│   └── memory-extraction/      # 自动提取 Skill (含分类规则)
└── .memory/                    # 项目级记忆
    ├── project.yaml            # 项目配置 (SSOT)
    └── *.md                    # 上下文文件
```

## 自动行为

### 对话开始时

1. 搜索 `openmemory` 获取用户上下文
2. 加载 `_omp/.memory/project.yaml` 获取项目配置
3. 融合上下文提供个性化响应

### 对话结束时

1. 检测有价值信息
2. 按分类规则路由存储
3. 项目级 → `_omp/.memory/`
4. 用户级 → `openmemory`

## 分类规则

分类规则已内嵌在 `_omp/skills/memory-extraction/SKILL.md` 中。

### 快速参考

| 存储位置 | 信息类型 |
|----------|----------|
| `_omp/.memory/` | 项目配置、技术决策、部署信息 |
| `openmemory` | 用户偏好、技能、跨项目上下文 |

## Skill

### memory-extraction

**位置**: `_omp/skills/memory-extraction/SKILL.md`

**触发**:
- 对话结束时自动执行
- `/memory` → 选择 3 (存储记忆)

**功能**:
- 检测有价值信息
- 智能分类路由
- 双层存储
- 冲突检测

## MCP 工具

Agent 可使用以下 OpenMemory MCP 工具:

| 工具 | 用途 |
|------|------|
| `add_memories_openmemory` | 添加用户级记忆 |
| `search_memory_openmemory` | 语义搜索记忆 |
| `list_memories_openmemory` | 列出所有记忆 |
| `delete_memories_openmemory` | 删除指定记忆 |

## 降级策略

当 `openmemory` MCP 不可用时:

1. 用户级信息临时存入 `_omp/.memory/user-context.yaml`
2. 提示用户检查 MCP 服务状态
3. 下次可用时自动同步

## 版本

- **版本**: v2.0
- **日期**: 2026-02-02
- **兼容**: Augment, Claude Code, Cursor, Gemini

