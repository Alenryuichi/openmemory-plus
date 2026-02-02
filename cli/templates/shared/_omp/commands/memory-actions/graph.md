# 知识图谱

查看记忆中的实体关系图谱。

## 执行步骤

1. 读取 `.memory/graph.yaml` (如果存在)
2. 从项目信息和记忆中提取实体
3. 分析实体之间的关系
4. 可视化展示

## 实体类型

| 类型 | 示例 |
|------|------|
| project | openmemory-plus |
| service | API, CLI, Web |
| database | Qdrant, PostgreSQL |
| api | REST API, GraphQL |
| config | tsconfig.json, package.json |
| person | 用户名, 团队成员 |
| technology | TypeScript, React |
| decision | 技术选型, 架构决策 |
| preference | 用户偏好 |

## 关系类型

| 关系 | 含义 |
|------|------|
| uses | A 使用 B |
| depends_on | A 依赖 B |
| configured_by | A 由 B 配置 |
| created_by | A 由 B 创建 |
| related_to | A 与 B 相关 |
| stores_in | A 存储在 B |
| prefers | 用户偏好 A |

## 输出格式

```
🔗 知识图谱

项目: openmemory-plus

实体关系:
┌─────────────────────────────────────────┐
│                                         │
│  [CLI] ──uses──> [TypeScript]           │
│    │                                    │
│    ├──depends_on──> [Commander.js]      │
│    │                                    │
│    └──configured_by──> [tsconfig.json]  │
│                                         │
│  [openmemory] ──uses──> [Qdrant]        │
│       │                                 │
│       └──uses──> [BGE-M3]               │
│                                         │
│  [User] ──prefers──> [中文]             │
│       │                                 │
│       └──prefers──> [TypeScript]        │
│                                         │
└─────────────────────────────────────────┘

统计: 8 个实体, 7 个关系
```

## 后续操作

- "添加关系" → 手动添加实体关系
- "查看 [实体名]" → 展示该实体的所有关系
- "导出" → 导出为 Mermaid/DOT 格式

## 返回菜单

完成后提示: "还需要其他操作吗？输入 `/memory` 返回菜单"
