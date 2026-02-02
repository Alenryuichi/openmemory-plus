# PRD: OpenMemory Plus CLI

**版本**: v1.0
**日期**: 2026-02-02
**状态**: Draft
**stepsCompleted**: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

---

## 项目背景

### 问题陈述

AI Agent 记忆管理需要复杂的基础设施配置：
- OpenMemory MCP 服务
- Docker 容器 (Qdrant 向量数据库)
- Ollama (BGE-M3 Embedding 模型)
- 项目级配置文件 (.memory/, commands, skills)

当前痛点：
1. **配置复杂**: 新用户需要手动安装多个依赖
2. **文档分散**: 安装步骤散落在多个 README
3. **无自动检测**: 不知道哪些已安装、哪些缺失
4. **无项目初始化**: 每个项目需手动复制配置

### 解决方案

创建 `openmemory-plus` CLI 工具，提供：
- **一键安装**: 自动检测并安装缺失依赖
- **智能引导**: 交互式配置向导
- **项目初始化**: 快速生成项目级配置
- **多 IDE 支持**: Augment, Claude Code, Cursor, Gemini 等

---

## 产品愿景

> "让任何项目在 5 分钟内获得 Agent 记忆管理能力"

### 成功标准

| 指标 | 目标 |
|------|------|
| 安装时间 (新电脑) | < 10 分钟 |
| 安装时间 (已有依赖) | < 2 分钟 |
| 项目初始化时间 | < 1 分钟 |
| 用户满意度 | > 4.5/5 |

---

## 产品范围

### MVP (2 周)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 依赖检测 | P0 | 检测 Docker, Ollama, OpenMemory |
| 依赖安装引导 | P0 | 引导用户安装缺失依赖 |
| 项目初始化 | P0 | 生成 .memory/, commands, skills |
| 多 IDE 支持 | P1 | Augment, Claude, Cursor |

### Growth (4 周)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 自动安装 | P1 | 自动执行安装命令 |
| 配置迁移 | P2 | 从其他项目导入配置 |
| 健康检查 | P2 | 检测服务运行状态 |

### Vision (8 周+)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 云端同步 | P3 | 跨设备记忆同步 |
| 团队共享 | P3 | 团队级记忆管理 |
| 插件系统 | P3 | 扩展更多 IDE |

---

## 用户旅程

### 旅程 1: 新电脑首次安装

```
用户: openmemory-plus install

CLI: 🔍 检测系统环境...

     依赖检测结果:
     ├── Docker: ❌ 未安装
     ├── Ollama: ❌ 未安装
     ├── OpenMemory MCP: ❌ 未安装
     └── BGE-M3 模型: ❌ 未下载

     需要安装以上依赖，是否继续? [Y/n]

用户: Y

CLI: 📦 安装 Docker...
     请访问 https://docker.com/download 下载安装
     安装完成后按 Enter 继续...

用户: [Enter]

CLI: ✅ Docker 已检测到
     📦 安装 Ollama...
     brew install ollama
     ...
     ✅ 所有依赖已就绪!
```

### 旅程 2: 已有依赖，初始化项目

```
用户: openmemory-plus init

CLI: 🔍 检测系统环境...

     依赖检测结果:
     ├── Docker: ✅ v24.0.7
     ├── Ollama: ✅ v0.1.29
     ├── OpenMemory MCP: ✅ 运行中
     └── BGE-M3 模型: ✅ 已下载

     ✅ 所有依赖已就绪!

CLI: 📁 初始化项目配置...

     选择 IDE 类型:
     [1] Augment
     [2] Claude Code
     [3] Cursor
     [4] Gemini
     [5] 通用 (AGENTS.md)

用户: 1

CLI: ✅ 已生成配置:
     ├── .memory/project.yaml
     ├── .augment/skills/memory-extraction/
     ├── .augment/commands/mem-*.md
     └── openmemory-plus/

     🎉 OpenMemory Plus 已就绪!
     使用 /memory 查看状态
```

---

## 功能需求

### FR-1: 依赖检测

| ID | 需求 | 优先级 |
|----|------|--------|
| FR-1.1 | 检测 Docker 安装状态和版本 | P0 |
| FR-1.2 | 检测 Ollama 安装状态和版本 | P0 |
| FR-1.3 | 检测 Qdrant 容器运行状态 | P0 |
| FR-1.4 | 检测 OpenMemory MCP 服务状态 | P0 |
| FR-1.5 | 检测 BGE-M3 模型下载状态 | P0 |

### FR-2: 依赖安装

| ID | 需求 | 优先级 |
|----|------|--------|
| FR-2.1 | 提供 Docker 安装引导 (macOS/Linux/Windows) | P0 |
| FR-2.2 | 自动安装 Ollama (brew/apt) | P1 |
| FR-2.3 | 自动启动 Qdrant 容器 | P1 |
| FR-2.4 | 自动下载 BGE-M3 模型 | P1 |
| FR-2.5 | 自动配置 OpenMemory MCP | P1 |

### FR-3: 项目初始化

| ID | 需求 | 优先级 |
|----|------|--------|
| FR-3.1 | 创建 .memory/ 目录结构 | P0 |
| FR-3.2 | 生成 project.yaml 配置 | P0 |
| FR-3.3 | 复制 commands 到目标 IDE 目录 | P0 |
| FR-3.4 | 复制 skills 到目标 IDE 目录 | P0 |
| FR-3.5 | 生成 AGENTS.md 入口文件 | P0 |

### FR-4: 多 IDE 支持

| ID | 需求 | 优先级 |
|----|------|--------|
| FR-4.1 | Augment (.augment/) | P0 |
| FR-4.2 | Claude Code (CLAUDE.md) | P0 |
| FR-4.3 | Cursor (.cursorrules) | P1 |
| FR-4.4 | Gemini (gemini.md) | P2 |
| FR-4.5 | 通用 (AGENTS.md) | P0 |

---

## 非功能需求

| ID | 需求 | 优先级 |
|----|------|--------|
| NFR-1 | 安装时间 < 10 分钟 (新电脑) | P0 |
| NFR-2 | 初始化时间 < 1 分钟 | P0 |
| NFR-3 | 支持 macOS, Linux | P0 |
| NFR-4 | 支持 Windows (WSL) | P2 |
| NFR-5 | 离线模式 (跳过网络依赖) | P2 |
| NFR-6 | 无 root 权限安装 | P1 |

---

## 技术规格

### CLI 命令

```bash
openmemory-plus --help
openmemory-plus install    # 安装依赖
openmemory-plus init       # 初始化项目
openmemory-plus status     # 检查状态
openmemory-plus doctor     # 诊断问题
openmemory-plus update     # 更新配置
```

### 技术栈

| 组件 | 选型 | 理由 |
|------|------|------|
| CLI 框架 | TypeScript + Commander | 跨平台, 类型安全 |
| 包管理 | npm/npx | 无需全局安装 |
| 模板引擎 | Handlebars | 灵活的配置生成 |

### 目录结构

```
openmemory-plus/
├── cli/                   # CLI 源码
│   ├── src/
│   │   ├── index.ts       # 入口
│   │   ├── commands/      # 命令实现
│   │   ├── detectors/     # 依赖检测
│   │   ├── installers/    # 安装器
│   │   └── templates/     # 配置模板
│   ├── package.json
│   └── tsconfig.json
├── templates/             # IDE 配置模板
│   ├── augment/
│   ├── claude/
│   ├── cursor/
│   └── common/
└── ...
```

---

## 实施计划

### Week 1: 核心功能

- [ ] CLI 框架搭建
- [ ] 依赖检测实现
- [ ] 安装引导实现

### Week 2: 项目初始化

- [ ] 模板系统实现
- [ ] 多 IDE 支持
- [ ] 测试和文档

