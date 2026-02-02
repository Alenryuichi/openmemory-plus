# Documentation Standards

> Tech-Writer Agent (Paige) 的文档标准和项目记忆

---

## User Specified CRITICAL Rules

### 项目部署信息

| 项目 | 值 |
|------|-----|
| **项目名称** | ResumeAI |
| **GitHub 仓库** | https://github.com/Alenryuichi/resumes |
| **许可证** | AGPL-3.0 |

### 部署架构

```
用户请求
    ↓
resume-ai.is-a.dev (待生效)
    ↓
Cloudflare Worker (resume-ai-proxy)
    ↓
Vercel (web-zeta-six-79.vercel.app)
    ↓
Supabase (后端数据库)
```

### 服务配置

| 服务 | 配置 | 状态 |
|------|------|------|
| **Vercel** | `web-zeta-six-79.vercel.app` | ✅ 已部署 |
| **Cloudflare Worker** | `resume-ai-proxy` | ✅ 代码就绪 |
| **is-a.dev 域名** | `resume-ai.is-a.dev` | ⏳ 等待审批 |
| **is-a-dev Fork** | https://github.com/Alenryuichi/register | ✅ 已 Fork |

### 域名注册流程

1. ✅ Fork is-a-dev/register 仓库
2. ⏳ 创建 `domains/resume-ai.json` 文件
3. ⏳ 提交 PR 到 is-a-dev/register
4. ⏳ 等待审批通过
5. ⏳ DNS 生效

### Cloudflare Worker 配置

**文件位置**: `web/cf-proxy/wrangler.toml`

```toml
name = "resume-ai-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
VERCEL_URL = "https://web-zeta-six-79.vercel.app"
```

### 待完成事项

- [ ] 在 Alenryuichi/register 仓库创建 `domains/resume-ai.json`
- [ ] 提交 PR 到 is-a-dev/register
- [ ] 等待 is-a.dev 审批
- [ ] 部署 Cloudflare Worker (`wrangler deploy`)
- [ ] 验证域名生效

---

## General Documentation Standards

### 语言规范

- **主要语言**: 中文
- **技术术语**: 保留英文原文
- **代码注释**: 英文

### 格式规范

- 使用 CommonMark 标准
- 标题层级不超过 4 级
- 代码块标注语言类型
- 表格用于结构化数据

### 图表规范

- 优先使用 Mermaid 图表
- 架构图使用 flowchart
- 时序图使用 sequenceDiagram
- 状态图使用 stateDiagram-v2

---

*最后更新: 2026-02-01*

