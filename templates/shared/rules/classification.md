# Memory Classification Rules

记忆分类规则，定义信息存储位置决策逻辑。

## 存储位置决策表

| 信息类型 | 存储位置 | 识别关键词 |
|----------|----------|------------|
| 项目配置 | `.memory/project.yaml` | url, domain, deploy, vercel, config, path |
| 技术决策 | `.memory/decisions.yaml` | 决定, 选择, 采用, 架构, decision, choose |
| 变更记录 | `.memory/changelog.yaml` | 更新, 修改, 发布, update, change, release |
| 用户偏好 | `openmemory` | 偏好, 喜欢, 习惯, prefer, style, always |
| 用户技能 | `openmemory` | 会, 熟悉, 经验, skill, experience, know |
| 对话上下文 | `openmemory` | 之前, 上次, 记得, remember, last time |

## 分类优先级

1. **项目相关** → `.memory/` (Git 版本控制)
2. **用户相关** → `openmemory` (跨项目共享)
3. **混合信息** → 拆分存储到两个系统

## 敏感信息过滤

**禁止存储**（检测后阻止）:

| 类型 | 检测模式 |
|------|----------|
| API Key | `sk-`, `api_key`, `token=`, `bearer` |
| 密码 | `password`, `secret`, `credential` |
| 私钥 | `-----BEGIN`, `PRIVATE KEY` |
| 个人信息 | 身份证号, 银行卡号, 手机号 |

## 分类决策流程

```
信息输入
    ↓
敏感信息检测 → 是 → 阻止存储，提示用户
    ↓ 否
项目相关判断 → 是 → .memory/{category}.yaml
    ↓ 否
用户相关判断 → 是 → openmemory (add_memories)
    ↓ 否
丢弃 (琐碎信息)
```

## 项目相关信息判断

**存入 `.memory/` 的条件**:
- 包含项目路径、URL、域名
- 涉及部署配置、环境变量名（非值）
- 技术架构决策
- 项目里程碑、版本信息

## 用户相关信息判断

**存入 `openmemory` 的条件**:
- 用户表达偏好 ("我喜欢...", "以后都用...")
- 用户技能声明 ("我会...", "我熟悉...")
- 跨项目通用的习惯
- 用户个人经历、背景

## ROT 过滤规则

**不存储的信息**:

| 类型 | 示例 |
|------|------|
| 琐碎确认 | "好的", "OK", "明白了" |
| 临时状态 | "正在处理...", "稍等" |
| 重复信息 | 已存在的相同内容 |
| 过期信息 | 被明确否定或更新的旧信息 |

## MCP 工具调用

### 写入 openmemory

```
Tool: add_memories_openmemory
Parameter: text = "{提取的用户信息}"
```

### 搜索 openmemory

```
Tool: search_memory_openmemory
Parameter: query = "{搜索关键词}"
```

### 列出所有记忆

```
Tool: list_memories_openmemory
```

## 降级策略

**当 openmemory 不可用时**:
1. 检测 MCP 连接状态
2. 降级到仅 `.memory/` 存储
3. 用户相关信息临时存入 `.memory/user-context.yaml`
4. 服务恢复后提示同步

---

**版本**: v1.0
**更新日期**: 2026-02-02

