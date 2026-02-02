---
name: resume-ai-validator
description: 端到端验证 resumeAI 的 API 能力和 UI/UX 交互的 CLI 工具，支持完整闭环测试
---

# ResumeAI Validator Skill

## Triggers

- User mentions "验证 resumeAI", "validate resume", "测试简历功能"
- User wants to run end-to-end tests on resume AI capabilities
- User mentions "rav", "resume-ai-validator"
- User wants UI/UX interaction testing
- Keywords: 验证, validate, 测试, test, 端到端, e2e, UI, 交互

## Capabilities

- **完整闭环验证**: API + UI/UX 交互的端到端验证
- **API 验证**: JD分析、简历评分、ATS分析、简历优化
- **E2E UI 测试**: 使用 Playwright 进行 UI/UX 交互测试
- **认证流程测试**: 登录/注册页面 UI 交互
- **用户旅程测试**: 完整的简历生成、编辑、优化流程

## Quick Reference

```bash
cd web/scripts/resume-ai-validator

# 完整闭环验证 (API + UI/UX) - 推荐
npx tsx cli.ts validate --yolo --e2e

# 仅 API 验证
npx tsx cli.ts validate --yolo

# 仅 E2E UI 测试
npx tsx cli.ts e2e

# 完整用户旅程测试
npx tsx cli.ts e2e --full

# 指定场景测试
npx tsx cli.ts e2e --scenario auth
npx tsx cli.ts e2e --scenario generate
npx tsx cli.ts e2e --scenario editor
npx tsx cli.ts e2e --scenario optimize

# JSON 输出 (AI Agent 友好)
npx tsx cli.ts validate --yolo --e2e --json
```

## Commands

| 命令 | 描述 |
|------|------|
| `validate` | 运行 API 验证流程 |
| `validate --e2e` | 运行 API + UI/UX 验证 |
| `e2e` | 运行 E2E UI/UX 测试 |
| `score` | 验证简历评分能力 |
| `optimize` | 验证简历优化能力 |
| `ats` | 验证 ATS 分析能力 |
| `analyze-jd` | 验证 JD 分析能力 |

## E2E 测试场景

| 场景 | 描述 | 测试文件 |
|------|------|----------|
| `auth` | 认证流程 (登录/注册) | `e2e/auth.spec.ts` |
| `home` | 首页 UI 和导航 | `e2e/home.spec.ts` |
| `dashboard` | 仪表盘功能 | `e2e/dashboard.spec.ts` |
| `generate` | 简历生成流程 | `e2e/generate.spec.ts` |
| `editor` | 简历编辑器交互 | `e2e/editor.spec.ts` |
| `optimize` | ATS/评分/优化流程 | `e2e/optimize.spec.ts` |
| `api` | API 端点验证 | `e2e/resume-ai-validator.spec.ts` |

## Global Options

- `--json` - JSON 格式输出 (AI Agent 友好)
- `--verbose` - 详细输出
- `--base-url` - API 基础 URL (默认: http://localhost:3000)
- `--e2e` - 同时运行 UI/UX 交互测试
- `--full` - 运行完整验证 (API + 所有 E2E 测试)

## Exit Codes

| 代码 | 含义 |
|------|------|
| 0 | 验证通过 |
| 1 | 验证失败 |
| 2 | 配置错误 |

## Prerequisites

1. Web 服务必须正在运行: `cd web && npm run dev`
2. 需要有效的 API 密钥配置 (DEEPSEEK_API_KEY)
3. Playwright 已安装: `cd web && npx playwright install`

## Related Files

- @web/scripts/resume-ai-validator/README.md - 完整文档
- @.augment/commands/resume-ai-validator.md - 命令参考

