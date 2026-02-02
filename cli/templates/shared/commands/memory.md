---
description: '记忆管理入口 - 统一管理项目级和用户级记忆'
---

# /memory

OpenMemory Plus 记忆管理统一入口。

## 行为

当用户输入 `/memory` 时：

1. **快速状态检测**
   - 读取 `.memory/` 目录状态
   - 调用 `list_memories_openmemory` 获取用户记忆数量

2. **显示菜单**

```
📊 记忆管理系统

当前状态快览:
├── 项目级 (.memory/): {n} 个文件
└── 用户级 (openmemory): {n} 条记忆

选择操作:

1. 📋 查看状态 - 详细记忆状态
2. 🔍 搜索记忆 - 语义搜索
3. 💾 存储记忆 - 手动添加
4. 🧹 清理记忆 - 清理 ROT
5. 🔄 同步检查 - 冲突检测
6. ⏰ 衰减分析 - 时间衰减
7. 🔗 知识图谱 - 实体关系

输入数字，或直接描述你的需求:
```

3. **等待用户输入**

## 路由逻辑

根据用户输入路由到对应子文件：

| 输入 | 意图关键词 | 加载文件 |
|------|-----------|----------|
| `1` | 状态、概览、overview | `./memory-actions/status.md` |
| `2` | 搜索、找、查、search | `./memory-actions/search.md` |
| `3` | 存储、记住、保存、store | `./memory-actions/store.md` |
| `4` | 清理、删除、过期、clean | `./memory-actions/clean.md` |
| `5` | 同步、冲突、检查、sync | `./memory-actions/sync.md` |
| `6` | 衰减、aging、decay | `./memory-actions/decay.md` |
| `7` | 图谱、关系、依赖、graph | `./memory-actions/graph.md` |

## 自然语言兼容

用户也可以直接描述需求，Agent 根据意图关键词路由：

- "搜索一下部署配置" → 加载 search.md
- "清理过期的记忆" → 加载 clean.md
- "这个项目用 React" → 加载 store.md
- "查看记忆衰减状态" → 加载 decay.md

## MCP 工具

Agent 可使用以下工具：

| 工具 | 用途 |
|------|------|
| `add_memories_openmemory` | 添加用户级记忆 |
| `search_memory_openmemory` | 语义搜索记忆 |
| `list_memories_openmemory` | 列出所有记忆 |
| `delete_memories_openmemory` | 删除指定记忆 |

## 项目级记忆

直接读写 `.memory/` 目录下的 YAML 文件：

- `project.yaml` - 项目配置
- `decisions.yaml` - 技术决策
- `changelog.yaml` - 变更历史

## 返回菜单

每个子动作完成后，提示用户：
> "还需要其他操作吗？输入 `/memory` 返回菜单"
