# OpenMemory Plus - 项目开发指南

本文件为 AI Agent 在 openmemory-plus 仓库中工作时提供上下文。

## 项目概述

**OpenMemory Plus** 是一个 CLI 工具，用于为 AI Agent 安装和配置双层记忆系统。

- **npm 包名**: `openmemory-plus`
- **CLI 命令**: `openmemory-plus` 或 `omp`
- **技术栈**: TypeScript, Node.js (>=18), ESM

## 项目结构

```
openmemory-plus/
├── cli/                        # CLI 工具源码
│   ├── src/
│   │   ├── index.ts            # 入口文件
│   │   ├── commands/           # 命令实现
│   │   │   ├── install.ts      # 主安装命令 (3 阶段)
│   │   │   ├── status.ts       # 系统状态检查
│   │   │   └── doctor.ts       # 诊断修复
│   │   └── lib/                # 核心库
│   │       ├── detector.ts     # 依赖检测 (Docker, Ollama, Qdrant)
│   │       └── platform.ts     # 跨平台工具
│   ├── templates/              # 导出模板
│   │   └── shared/_omp/        # 用户项目模板
│   └── tests/                  # 测试文件
├── AGENTS.md                   # 本文件 (不导出)
├── README.md                   # 用户文档
└── CONTRIBUTING.md             # 贡献指南
```

## 开发命令

```bash
cd cli

# 安装依赖
npm install

# 本地开发 (使用 tsx)
npm run dev -- install --help

# 构建
npm run build

# 测试
npm test                    # 运行所有测试
npm run test:watch          # 监听模式
npm run test:coverage       # 覆盖率报告

# 本地测试 CLI
node dist/index.js install --help
```

## CLI 命令

| 命令 | 描述 |
|------|------|
| `install` | 一键安装 (默认命令) |
| `status` | 检查系统依赖状态 |
| `doctor` | 诊断并修复问题 |

### install 命令选项

- `-y, --yes`: 跳过确认提示
- `-i, --ide <type>`: 指定 IDE (augment/claude/cursor/gemini/common)
- `--skip-deps`: 跳过依赖安装
- `--show-mcp`: 显示 MCP 配置
- `-f, --force`: 强制覆盖

## 安装流程 (3 阶段)

1. **Phase 1**: 检测并安装依赖 (Docker, Ollama, Qdrant, BGE-M3)
2. **Phase 2**: 初始化项目 (复制模板到 `_omp/`, 配置 IDE)
3. **Phase 3**: 显示完成信息和 MCP 配置

## 模板管理

`cli/templates/shared/_omp/` 包含导出到用户项目的文件：

| 目录 | 内容 |
|------|------|
| `commands/` | `/memory` 命令入口 |
| `workflows/` | 记忆管理工作流 (7 个步骤) |
| `skills/` | memory-extraction Skill |
| `memory/` | 项目记忆模板文件 |

**注意**: `AGENTS.md` 等根目录配置文件**不会**被导出。

## 测试

测试文件位于 `cli/tests/`：

- `cli.test.ts` - CLI 入口测试
- `install.test.ts` - 安装命令测试
- `detector.test.ts` - 依赖检测测试
- `doctor.test.ts` - 诊断命令测试
- `status.test.ts` - 状态命令测试

## 发布

```bash
cd cli
npm run prepublishOnly  # 构建 + 测试
npm publish
```

## 代码规范

- TypeScript + ESM
- Conventional Commits (`feat:`, `fix:`, `docs:` 等)
- 使用 Vitest 进行测试

## 相关文档

- [README.md](./README.md) - 用户文档
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [cli/README.md](./cli/README.md) - CLI 详细文档 (如有)

