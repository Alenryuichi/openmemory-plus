# OpenMemory Plus - AI Agent 配置

本文件为 AI Agent 提供记忆管理能力配置。

## 快速启用

在对话开始时，Agent 应自动加载此配置以获取记忆管理能力。

## 命令入口

| 命令 | 说明 | 文件 |
|------|------|------|
| `/memory` | 统一入口 | `commands/memory.md` |
| `/mem status` | 记忆状态 | `commands/mem-status.md` |
| `/mem search {q}` | 搜索记忆 | `commands/mem-search.md` |
| `/mem sync` | 同步检查 | `commands/mem-sync.md` |
| `/mem clean` | ROT 清理 | `commands/mem-clean.md` |
| `/mem extract` | 手动提取 | `commands/mem-extract.md` |

**简化版（推荐）：只需一个命令 `/memory`，其余通过菜单选择或自然语言。**

## 自动行为

### 对话开始时

1. 搜索 `openmemory` 获取用户上下文
2. 加载 `.memory/project.yaml` 获取项目配置
3. 融合上下文提供个性化响应

### 对话结束时

1. 检测有价值信息
2. 按分类规则路由存储
3. 项目级 → `.memory/`
4. 用户级 → `openmemory`

## 分类规则

加载 `rules/classification.md` 获取详细分类逻辑。

### 快速参考

| 存储位置 | 信息类型 |
|----------|----------|
| `.memory/` | 项目配置、技术决策、部署信息 |
| `openmemory` | 用户偏好、技能、跨项目上下文 |

## Skill

### memory-extraction

**位置**: `skills/memory-extraction/SKILL.md`

**触发**: 
- 对话结束时自动执行
- `/mem extract` 手动触发

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

1. 用户级信息临时存入 `.memory/user-context.yaml`
2. 提示用户检查 MCP 服务状态
3. 下次可用时自动同步

## 相关文件

```
openmemory-plus/
├── AGENTS.md              # 本文件
├── README.md              # 项目说明
├── commands/              # 命令定义
├── rules/                 # 规则定义
│   └── classification.md  # 分类规则
└── skills/                # Skill 定义
    └── memory-extraction/ # 记忆提取
```

## 版本

- **版本**: v1.0
- **日期**: 2026-02-02
- **兼容**: Augment, Claude Code, Cursor

