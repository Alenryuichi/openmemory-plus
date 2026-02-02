# OpenMemory Plus 迭代研究报告

**研究类型**: Domain Research
**日期**: 2026-02-02
**研究者**: AI Research Partner
**置信度**: High

---

## 执行摘要

基于对当前 openmemory-plus 项目的分析和行业最佳实践研究，本报告识别了 **5 个关键迭代领域**，按优先级排序：

| 优先级 | 领域 | 当前状态 | 建议 |
|--------|------|----------|------|
| P0 | 模板系统完善 | 部分实现 | 补全所有 IDE 模板 |
| P1 | 规则文件模板化 | 缺失 | 添加 classification.md 模板 |
| P1 | .memory 初始化 | 基础 | 增强 project.yaml 模板 |
| P2 | MCP 配置生成 | 缺失 | 自动生成 MCP 配置 |
| P3 | 多语言支持 | 缺失 | 支持中英文模板 |

---

## 1. 当前问题分析

### 1.1 模板系统现状

```
openmemory-plus/templates/
├── augment/           ✅ 完整 (commands + skills)
│   ├── commands/      ✅ 6 个命令文件
│   └── skills/        ✅ memory-extraction
├── claude/            ⚠️ 仅 CLAUDE.md
├── cursor/            ❌ 空目录
└── common/            ⚠️ 仅 AGENTS.md
```

**问题**: 
- Claude/Cursor/Common 模板不完整
- 缺少 rules/ 目录模板
- 缺少 .memory/ 初始化模板

### 1.2 init 命令问题

当前 `init.ts` 的问题：
1. 只复制 IDE 特定模板，不复制通用文件
2. 不生成 rules/classification.md
3. project.yaml 模板过于简单
4. 不生成 MCP 配置提示

---

## 2. 迭代建议

### 2.1 P0: 补全模板系统

**目标**: 所有 IDE 模板都包含完整的 commands + skills + rules

**任务清单**:

- [ ] 复制 augment/commands/* 到 claude/commands/
- [ ] 复制 augment/commands/* 到 cursor/commands/
- [ ] 复制 augment/commands/* 到 common/commands/
- [ ] 复制 augment/skills/* 到所有 IDE 模板
- [ ] 创建 templates/shared/rules/classification.md

**预期结构**:
```
templates/
├── shared/                    # 🆕 共享模板
│   ├── rules/
│   │   └── classification.md
│   ├── commands/
│   │   └── mem-*.md
│   └── skills/
│       └── memory-extraction/
├── augment/                   # IDE 特定配置
│   └── AGENTS.md              # 或入口配置
├── claude/
│   └── CLAUDE.md
├── cursor/
│   └── .cursorrules
└── common/
    └── AGENTS.md
```

### 2.2 P1: 增强 .memory 初始化

**当前 project.yaml**:
```yaml
project:
  name: "xxx"
  version: "1.0.0"
memory:
  project_store: ".memory/"
  user_store: "openmemory"
```

**建议增强**:
```yaml
project:
  name: "{{project_name}}"
  version: "1.0.0"
  description: ""
  
memory:
  project_store: ".memory/"
  user_store: "openmemory"
  
  # 分类关键词 (可自定义)
  classification:
    project_keywords:
      - "项目配置"
      - "技术决策"
      - "部署信息"
      - "API 密钥"
    user_keywords:
      - "用户偏好"
      - "编码风格"
      - "技能"

# Agent 行为配置
agent:
  auto_extract: true           # 对话结束自动提取
  auto_search: true            # 对话开始自动搜索
  fallback_to_file: true       # MCP 不可用时降级到文件
```

### 2.3 P2: MCP 配置生成

**问题**: 用户需要手动配置 MCP，容易出错

**建议**: init 命令生成 MCP 配置提示或文件

```bash
openmemory-plus init --generate-mcp
```

生成 `~/.config/claude/mcp.json` 片段:
```json
{
  "openmemory": {
    "command": "npx",
    "args": ["-y", "openmemory-mcp"],
    "env": {
      "OPENAI_API_KEY": "your-key",
      "QDRANT_HOST": "localhost",
      "QDRANT_PORT": "6333"
    }
  }
}
```

### 2.4 P3: 多语言模板

**问题**: 当前模板全中文，国际用户不友好

**建议**: 
- 添加 `--lang en|zh` 选项
- 模板使用 Handlebars 变量
- 默认检测系统语言

---

## 3. 实施计划

### Week 1: P0 模板补全

| 任务 | 工作量 | 说明 |
|------|--------|------|
| 创建 shared/ 目录 | 0.5h | 共享模板 |
| 复制 commands 到所有 IDE | 0.5h | 统一命令 |
| 复制 skills 到所有 IDE | 0.5h | 统一 Skill |
| 创建 rules 模板 | 0.5h | 分类规则 |
| 更新 init.ts 逻辑 | 2h | 复制共享模板 |

### Week 2: P1 增强初始化

| 任务 | 工作量 | 说明 |
|------|--------|------|
| 增强 project.yaml 模板 | 1h | 更多配置项 |
| 添加交互式配置 | 2h | 询问用户偏好 |
| 生成 AGENTS.md 入口 | 1h | 动态生成 |

---

## 4. 来源引用

1. [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) - Anthropic, 2025
2. [Mem0 GitHub Repository](https://github.com/mem0ai/mem0) - Mem0 官方文档
3. [LangChain Memory for Agents](https://www.blog.langchain.com/memory-for-agents/) - LangChain Blog, 2024
4. [Spec-Driven Development](https://developer.microsoft.com/blog/spec-driven-development-spec-kit) - Microsoft, 2025

---

## 5. 下一步行动

1. **立即执行**: P0 模板补全
2. **本周完成**: P1 增强初始化
3. **下周规划**: P2 MCP 配置生成

