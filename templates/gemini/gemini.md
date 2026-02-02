# OpenMemory Plus - Agent 记忆管理

本项目已启用 OpenMemory Plus 双层记忆管理系统。

## 快速使用

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

**示例：**
- 输入 `2` 或 "搜索部署配置"
- 输入 `4` 或 "清理过期的记忆"

## 核心目录

```
_omp/                           # OpenMemory Plus 核心目录
├── commands/
│   ├── memory.md               # 主命令入口
│   └── memory-actions/         # 7 个子动作
├── skills/
│   └── memory-extraction/      # 自动提取 Skill
└── .memory/                    # 项目级记忆
    ├── project.yaml            # 项目配置 (SSOT)
    └── *.md                    # 上下文文件
```

## 双层记忆架构

| 系统 | 存储位置 | 用途 |
|------|----------|------|
| 项目级 | `_omp/.memory/` | 项目配置、技术决策、变更记录 |
| 用户级 | `openmemory` MCP | 用户偏好、技能、跨项目上下文 |

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

## MCP 工具

| 工具 | 用途 |
|------|------|
| `add_memories_openmemory` | 添加用户级记忆 |
| `search_memory_openmemory` | 语义搜索记忆 |
| `list_memories_openmemory` | 列出所有记忆 |
| `delete_memories_openmemory` | 删除指定记忆 |

## 分类规则

| 信息类型 | 存储位置 | 示例 |
|----------|----------|------|
| 项目配置 | `_omp/.memory/` | 部署 URL、路径 |
| 技术决策 | `_omp/.memory/` | 框架选择、架构 |
| 用户偏好 | `openmemory` | 语言、风格 |
| 用户技能 | `openmemory` | 熟悉的技术栈 |

详细规则见 `.gemini/skills/memory-extraction/SKILL.md`

---
*由 OpenMemory Plus CLI 生成 | https://github.com/Alenryuichi/openmemory-plus*
