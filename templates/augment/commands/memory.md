---
description: '记忆管理系统入口 - 查看状态、搜索、同步、清理'
argument-hint: 'status|search|sync|clean|help [args]'
---

# /memory

统一记忆管理系统入口。管理 `.memory/` (项目级) 和 `openmemory` (用户级) 双层记忆。

## 快速使用

| 命令 | 说明 |
|------|------|
| `/memory` | 显示快速状态 + 子命令列表 |
| `/mem status` | 详细记忆状态 |
| `/mem search {query}` | 搜索记忆 |
| `/mem sync` | 检测并解决冲突 |
| `/mem clean` | 清理 ROT (冗余/过时/琐碎) |
| `/mem extract` | 手动触发记忆提取 |
| `/memory help` | 完整帮助文档 |

## 路由逻辑

### 无参数时

执行快速状态检查并显示子命令：

```
📊 记忆系统快速状态
├── .memory/: {n} 个文件
├── openmemory: {n} 条记忆
└── 状态: ✅ 正常

💡 可用命令:
  /mem status    - 详细状态
  /mem search    - 搜索记忆
  /mem sync      - 同步检查
  /mem clean     - 清理 ROT
  /mem extract   - 提取记忆
```

### 有参数时

根据子命令路由到对应功能：

| 子命令 | 加载文件 |
|--------|----------|
| `status` | `mem-status.md` |
| `search` | `mem-search.md` |
| `sync` | `mem-sync.md` |
| `clean` | `mem-clean.md` |
| `extract` | `mem-extract.md` |
| `help` | 显示本文件完整内容 |

## 系统架构

```
Agent 记忆系统
├── .memory/ (项目级)
│   ├── project.yaml     # 项目配置、部署信息 (SSOT)
│   ├── decisions.yaml   # 技术决策记录
│   └── changelog.yaml   # 变更历史
└── openmemory (用户级)
    ├── 用户偏好          # 跨项目通用
    ├── 用户技能          # 个人能力
    └── 对话上下文        # 历史记忆
```

## 分类规则

| 信息类型 | 存储位置 | 示例 |
|----------|----------|------|
| 项目配置 | `.memory/` | 部署 URL、路径 |
| 技术决策 | `.memory/` | 框架选择、架构 |
| 用户偏好 | `openmemory` | 语言、风格 |
| 用户技能 | `openmemory` | 熟悉的技术栈 |

详细规则: `.rules/memory/classification.md`

## 相关文件

- **分类规则**: `.rules/memory/classification.md`
- **提取 Skill**: `.augment/skills/memory-extraction/SKILL.md`
- **配置中心**: `.memory/project.yaml`

---

**版本**: v1.0

