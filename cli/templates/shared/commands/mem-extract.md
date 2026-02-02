---
description: 'Agent-only: 自动提取对话中的关键信息到记忆系统'
argument-hint: ''
---

# /mem extract

Agent-only 工作流，自动提取对话中的关键信息到 `.memory/` 目录和 `openmemory`。

> 💡 返回入口: `/memory`

## 触发方式

### 自动触发（推荐）
Agent 在以下情况自动执行，无需用户干预：
- 对话结束时检测到有价值信息
- 部署状态变更（成功/失败）
- 重要技术决策
- 项目配置变更

### 手动触发
```
/mem extract
保存到记忆
记住这个
更新配置
```

## 存储结构

| 文件 | 用途 | 更新频率 |
|------|------|----------|
| `.memory/project.yaml` | 项目常量、部署信息 (SSOT) | 配置变更时 |
| `.memory/decisions.yaml` | 技术决策记录 | 决策时 |
| `.memory/changelog.yaml` | 变更历史 | 每次变更 |
| `openmemory` | 用户偏好、技能、上下文 | 每次对话 |

## 信息分类

| 存储位置 | 信息类型 | 检测信号 |
|----------|----------|----------|
| `.memory/` | 部署变更 | `deploy`, `vercel`, URL |
| `.memory/` | 服务配置 | `config`, `secret` |
| `.memory/` | 技术决策 | `决定`, `选择`, `采用` |
| `openmemory` | 用户偏好 | `喜欢`, `偏好`, `习惯` |
| `openmemory` | 用户技能 | `熟悉`, `擅长`, `会用` |

详细规则: `.rules/memory/classification.md`

## 验证工具

```bash
# 验证所有 YAML 文件语法
.augment/skills/memory-extraction/scripts/validate.sh

# 验证单个文件
.augment/skills/memory-extraction/scripts/validate.sh .memory/project.yaml
```

## 与其他系统的关系

```
.memory/           ← 项目级 (Git 版本控制)
openmemory         ← 用户级 (MCP 语义搜索)
_bmad/_memory/     ← Agent 专属 (BMAD Agent)
```

## 注意事项

1. **Agent-Only**: 此命令主要供 Agent 自动使用
2. **SSOT 原则**: 项目配置应引用 `.memory/project.yaml`
3. **分类规则**: 遵循 `.rules/memory/classification.md`
4. **降级策略**: openmemory 不可用时存入 `.memory/user-context.yaml`

## 相关文件

- **Skill**: `.augment/skills/memory-extraction/SKILL.md`
- **分类规则**: `.rules/memory/classification.md`
- **Schema**: `.memory/schema/*.json`

---

**版本**: v1.1

