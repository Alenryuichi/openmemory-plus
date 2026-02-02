---
description: '搜索记忆系统中的信息'
argument-hint: '{query} [--source=all|project|user] [--limit=10]'
---

# /mem search

搜索记忆系统中的信息。

> 💡 返回入口: `/memory`

## 触发

- `/mem search {query}`
- `/memory search {query}`
- `搜索记忆 {query}`

## 执行流程

1. **并行查询两个系统**

   ```
   ┌─────────────────┐     ┌─────────────────┐
   │   .memory/      │     │   openmemory    │
   │   (grep/关键词) │     │   (语义搜索)    │
   └────────┬────────┘     └────────┬────────┘
            │                       │
            └───────────┬───────────┘
                        ↓
                   结果融合
   ```

2. **搜索 .memory/**
   - 使用 grep 在 YAML 文件中搜索关键词
   - 返回匹配的文件和行

3. **搜索 openmemory**
   - 调用 `search_memory_openmemory`
   - 参数: `query = "{用户输入}"`

4. **结果融合**
   - 按相关性排序
   - 去重
   - 标注来源

## 输出格式

```
🔍 搜索结果: "{query}"

📁 项目记忆 (.memory/)
├── project.yaml:15 - deployment.vercel.url: https://...
└── decisions.yaml:23 - 选择 XYZ 公式作为简历格式

🧠 用户记忆 (openmemory)
├── [2026-02-01] 用户偏好使用中文
└── [2026-01-28] 用户熟悉 Python 和 TypeScript

共找到 4 条相关记忆
```

## 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| query | 搜索关键词 | 必填 |
| --source | 仅搜索指定来源 | all |
| --limit | 返回结果数量 | 10 |

## 示例

```bash
# 搜索所有记忆
/mem search 部署配置

# 仅搜索项目记忆
/mem search 部署配置 --source=project

# 仅搜索用户记忆
/mem search 偏好 --source=user
```

## 无结果处理

```
🔍 搜索结果: "xxx"

未找到相关记忆。

💡 建议:
- 尝试不同的关键词
- 使用 /mem status 查看记忆状态
```

## 降级策略

当 openmemory 不可用时:
- 仅返回 .memory/ 结果
- 提示 "openmemory 暂不可用，仅显示项目记忆"

---

**版本**: v1.1

