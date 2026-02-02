# resume-ai-validator

端到端验证 resumeAI 的 API 能力和 UI/UX 交互的 CLI 工具。

## Usage

```bash
cd web/scripts/resume-ai-validator
npx tsx cli.ts <command> [options]
```

## Commands

| 命令 | 描述 | 示例 |
|------|------|------|
| `validate` | API 验证 | `validate --yolo` |
| `validate --e2e` | API + UI 验证 | `validate --yolo --e2e` |
| `e2e` | UI/UX 测试 | `e2e --full` |
| `score` | 评分验证 | `score` |
| `optimize` | 优化验证 | `optimize` |
| `ats` | ATS 验证 | `ats` |
| `analyze-jd` | JD 分析 | `analyze-jd` |

## E2E Scenarios

| 场景 | 描述 |
|------|------|
| `auth` | 认证流程 |
| `home` | 首页 UI |
| `generate` | 简历生成 |
| `editor` | 简历编辑 |
| `optimize` | ATS/优化 |

## Options

- `--json` - JSON 输出
- `--verbose` - 详细输出
- `--base-url <url>` - API URL
- `--e2e` - 同时运行 UI 测试
- `--full` - 完整验证
- `--scenario <name>` - 指定 E2E 场景

## Exit Codes

- 0: 通过
- 1: 失败
- 2: 配置错误

