# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/) 和 [Keep a Changelog](https://keepachangelog.com/) 规范。

## [Unreleased]

### Added

#### 🧠 智能记忆系统增强

- **多维度分类体系** - 三维度记忆分类 (Scope/Confidence/Temporality)
  - Scope: PERSONAL / PROJECT / UNIVERSAL / EPHEMERAL
  - Confidence: EXPLICIT (≥0.9) / INFERRED (0.7-0.9) / UNCERTAIN (0.4-0.7) / NOISE (<0.4)
  - Temporality: PERMANENT / CONTEXTUAL / EPHEMERAL

- **ROT 智能过滤** - 自动识别并过滤低价值信息
  - Redundant: 语义相似度 >0.85 的重复记忆
  - Obsolete: 基于 TTL 的过时检测
  - Trivial: 多语言琐碎模式匹配 (中/英)

- **Ebbinghaus 衰减模型** - 基于遗忘曲线的记忆生命周期管理
  - 公式: `Retention(t) = base_retention + importance_boost × (1 - base_retention)`
  - 四级状态: Active (≥0.7) / Aging (0.3-0.7) / Stale (0.1-0.3) / Cleanup (<0.1)
  - 智能遗忘策略: 自动遗忘 / 确认遗忘 / 永不遗忘

- **冲突检测与解决** - 双层记忆同步机制
  - 自动检测项目级与用户级记忆冲突
  - 冲突类型: VALUE_MISMATCH / OUTDATED / DUPLICATE
  - 解决策略: 保留项目级 / 保留用户级 / 合并 / 手动选择

- **健康度评分系统** - 记忆系统质量监控
  - 四维度加权评分: 活跃率(30%) + ROT比例(20%) + 平均置信度(30%) + 冲突率(20%)
  - 健康等级: Excellent (≥80) / Good (60-79) / Needs Attention (<60)

- **质量指标面板** - `/mem metrics` 命令
  - 可视化健康度进度条
  - 衰减状态分布图
  - 改进建议自动生成

### Changed

- 更新 `memory-entry.yaml.tmpl` 模板，添加冲突追踪字段
- 优化 `status.md` workflow，集成健康度快照显示
- 增强 `decay.md` workflow，支持详细衰减分析

### Fixed

- 修复衰减公式可能超出 [0,1] 范围的数学错误
- 修复置信度阈值在决策树与表格中不一致的问题
- 修复 importance_boost 累加可能超过 0.5 上限的问题
- 修复 workflow 文件中的引用路径错误

---

## [1.0.0] - 2026-01-29

### Added

- 🐳 **Docker Compose 一键部署** - 只需 Docker，自动配置 Qdrant + Ollama + BGE-M3
- 📦 **CLI 安装工具** - `npx openmemory-plus install` 交互式安装
- 🔄 **双层记忆架构** - 项目级 (`_omp/memory/`) + 用户级 (`openmemory` MCP)
- 🎯 **智能分类路由** - 自动判断信息存储位置
- 🔍 **语义搜索** - 基于 BGE-M3 的多语言向量检索
- 🔐 **敏感信息过滤** - 自动阻止存储 API Key、密码等
- 🖥️ **多 IDE 支持** - Augment, Claude Code, Cursor, Gemini CLI

### Commands

- `omp install` - 安装向导
- `omp status` - 系统状态检查
- `omp doctor` - 诊断修复
- `omp deps up/down/status` - Docker 服务管理

---

[Unreleased]: https://github.com/Alenryuichi/openmemory-plus/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Alenryuichi/openmemory-plus/releases/tag/v1.0.0

