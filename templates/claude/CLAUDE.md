# OpenMemory Plus 配置

## 记忆管理系统

本项目已启用 OpenMemory Plus 双层记忆管理。

### 命令入口

| 命令 | 说明 |
|------|------|
| `/memory` | 统一入口 (快速状态 + 帮助) |
| `/mem status` | 详细记忆状态 |
| `/mem search {query}` | 搜索记忆 |
| `/mem sync` | 同步检查 |
| `/mem clean` | 清理 ROT |
| `/mem extract` | 手动提取 |

### 存储架构

| 系统 | 存储位置 | 用途 |
|------|----------|------|
| 项目级 | `.memory/*.yaml` | 项目配置、技术决策、变更记录 |
| 用户级 | `openmemory` MCP | 用户偏好、技能、跨项目上下文 |

### 自动提取 (Memory Extraction)

对话结束时自动执行：
1. 检测有价值信息
2. 智能分类路由
3. 项目级 → `.memory/`
4. 用户级 → `openmemory`

### MCP 工具

| 工具 | 用途 |
|------|------|
| `add_memories_openmemory` | 添加用户级记忆 |
| `search_memory_openmemory` | 语义搜索记忆 |
| `list_memories_openmemory` | 列出所有记忆 |
| `delete_memories_openmemory` | 删除指定记忆 |

---
*由 OpenMemory Plus CLI 生成*

