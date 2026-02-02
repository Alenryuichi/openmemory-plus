---
name: 'resumes-cli'
description: '简历知识库管理工具，支持语雀同步和 JSON Resume 主题渲染'
---

# resumes-cli Skill

## Triggers

- User mentions "resumes-cli", "简历CLI", "resume tool"
- User wants to sync documents from Yuque (语雀)
- User wants to validate or export resume
- User wants to preview resume with themes
- Keywords: 简历导出, 语雀同步, resume export, yuque sync, 主题渲染

## Capabilities

- **语雀同步**: 从语雀同步项目文档到本地
- **简历验证**: 验证简历 JSON 格式是否符合 JSON Resume 标准
- **主题渲染**: 使用 json-resume 主题导出精美 HTML
- **本地预览**: 实时预览简历效果
- **批量导出**: 一键导出所有主题风格
- **工作流**: 一键执行完整流程 (sync → validate → export)

## Available Themes

> 全部支持 projects 字段渲染

| 主题 | 风格 | GitHub Stars |
|------|------|-------------|
| `elegant` | 优雅专业 (默认) | ⭐ 126 |
| `stackoverflow` | Stack Overflow 风格 | ⭐ 154 |
| `kendall` | 经典传统 | ⭐ 68 |
| `macchiato` | 咖啡色调 | ⭐ 18 |
| `github` | GitHub Primer 风格 | ⭐ 17 |
| `actual` | 现代简约 | - |

## 使用前检查 (Agent 必读)

**每次使用前必须先检查 CLI 是否可用：**

```bash
# 1. 检查是否已全局安装
which resumes-cli

# 2. 如果返回路径 (如 /opt/homebrew/bin/resumes-cli)，直接使用
# 3. 如果返回空或 "not found"，先安装：
cd _bmad-output/bmb-creations/cli/resumes-cli && npm run build && npm link

# 4. 安装后回到项目根目录使用
cd /Users/ryuichi/Documents/Projects/resumes
resumes-cli --version
```

⚠️ **禁止行为：** 不要 cd 到源码目录用 `npx ts-node` 运行，应该全局安装后直接使用 `resumes-cli` 命令。

## Quick Reference

```bash
# 初始化配置
resumes-cli config init

# 语雀同步
resumes-cli yuque sync --json

# 验证简历
resumes-cli resume validate --file ./resume/resume.json

# 导出简历 (使用主题)
resumes-cli resume export --theme elegant --output ./resume.html

# 导出所有主题
resumes-cli resume export-all --file ./resume/resume.json

# 本地预览
resumes-cli resume serve --theme elegant --port 4000

# 一键执行完整流程
resumes-cli workflow run --skip-sync --theme elegant
```

## Command Groups

| 命令组 | 描述 |
|--------|------|
| `config` | 配置管理 (init, show) |
| `yuque` | 语雀同步 (sync, status, schedule) |
| `resume` | 简历管理 (validate, export, export-all, serve) |
| `workflow` | 工作流 (run) |

## Global Options

- `--json` - JSON 格式输出 (AI Agent 友好)
- `--verbose` - 详细输出
- `--help` - 显示帮助

## Exit Codes

| 代码 | 含义 |
|------|------|
| 0 | 成功 |
| 1 | 错误 |
| 2 | 配置错误/警告 |

## Related Files

- @resumes-cli/README.md - 完整文档
- @.augment/commands/resumes-cli.md - 命令参考

