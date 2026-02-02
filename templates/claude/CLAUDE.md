# OpenMemory Plus 配置

## 记忆管理系统

本项目已启用 OpenMemory Plus 双层记忆管理。

### 核心目录

```
_omp/                           # OpenMemory Plus 核心目录
├── commands/
│   ├── memory.md               # 主命令入口
│   └── memory-actions/         # 7 个子动作
├── skills/
│   └── memory-extraction/      # 自动提取 Skill
└── .memory/                    # 项目级记忆
    └── project.yaml            # 项目配置 (SSOT)
```

### 命令入口

**只需记住一个命令：**

```
/memory
```

输入后会显示菜单，选择数字或用自然语言描述需求：

| 选项 | 说明 |
|------|------|
| 1 | 📋 查看状态 - 详细记忆状态 |
| 2 | 🔍 搜索记忆 - 语义搜索 |
| 3 | 💾 存储记忆 - 手动添加 |
| 4 | 🧹 清理记忆 - 清理 ROT |
| 5 | 🔄 同步检查 - 冲突检测 |
| 6 | ⏰ 衰减分析 - 时间衰减 |
| 7 | 🔗 知识图谱 - 实体关系 |

### 存储架构

| 系统 | 存储位置 | 用途 |
|------|----------|------|
| 项目级 | `_omp/.memory/` | 项目配置、技术决策、变更记录 |
| 用户级 | `openmemory` MCP | 用户偏好、技能、跨项目上下文 |

### 自动提取 (Memory Extraction)

对话结束时自动执行：
1. 检测有价值信息
2. 智能分类路由
3. 项目级 → `_omp/.memory/`
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
