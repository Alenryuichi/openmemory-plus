---
name: 'resumes-cli'
description: '简历知识库管理工具'
cli-executable: 'resumes-cli'
---

# resumes-cli

## Quick Usage
resumes-cli <command> [options]

## Commands
- config init: 初始化配置
- config show: 显示配置
- yuque sync: 同步语雀文档
- yuque status: 查看同步状态
- yuque schedule: 管理定时同步
- resume validate: 验证简历 JSON 格式
- resume export: 导出简历为 HTML (默认主题: elegant)
- resume export-all: 导出所有主题风格
- resume serve: 本地预览简历
- workflow run: 执行完整流程 (sync → validate → export)

## Agent Notes
- Verify: `which resumes-cli`
- JSON: `--json` flag for structured output
/Users/ryuichi/Documents/Projects/resumes/CLAUDE.md- Help: `resumes-cli --help`
- Exit: 0=success, 1=error, 2=config error

## Docs
@resumes-cli/README.md | @resumes-cli/docs/

