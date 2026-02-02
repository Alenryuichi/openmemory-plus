# OpenMemory Plus - Agent 记忆管理

本项目已启用 OpenMemory Plus 双层记忆管理系统。

## 快速使用

| 命令 | 说明 |
|------|------|
| `/memory` | 查看记忆状态 + 子命令列表 |
| `/mem status` | 详细记忆状态 |
| `/mem search {query}` | 搜索记忆 |
| `/mem sync` | 同步检查 |
| `/mem clean` | 清理 ROT 记忆 |
| `/mem extract` | 手动提取记忆 |

## 双层记忆架构

| 层级 | 存储 | 用途 |
|------|------|------|
| 项目级 | `.memory/*.yaml` | 项目配置、技术决策、变更记录 |
| 用户级 | `openmemory` MCP | 用户偏好、技能、跨项目上下文 |

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

## 配置文件

- `.memory/project.yaml` - 项目配置
- 命令和 Skill 文件 - 参考 IDE 对应目录

---
*由 OpenMemory Plus CLI 生成*

