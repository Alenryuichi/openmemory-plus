# 贡献指南 | Contributing Guide

感谢你对 OpenMemory Plus 的关注！我们欢迎各种形式的贡献。

Thank you for your interest in OpenMemory Plus! We welcome all forms of contributions.

## 🚀 快速开始 | Quick Start

```bash
# 克隆仓库 | Clone the repo
git clone https://github.com/Alenryuichi/openmemory-plus.git
cd openmemory-plus

# 安装依赖 | Install dependencies
cd cli && npm install

# 运行测试 | Run tests
npm test

# 本地开发 | Local development
npm run dev
```

## 📋 贡献类型 | Types of Contributions

### 🐛 Bug 报告 | Bug Reports

如果你发现了 bug，请创建一个 Issue，包含：
- 问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息 (OS, Node.js 版本, IDE)

### ✨ 功能请求 | Feature Requests

欢迎提出新功能建议！请在 Issue 中描述：
- 功能描述
- 使用场景
- 可能的实现方案

### 🔧 代码贡献 | Code Contributions

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/your-feature`
3. 提交更改: `git commit -m 'feat: add your feature'`
4. 推送分支: `git push origin feature/your-feature`
5. 创建 Pull Request

## 📝 代码规范 | Code Standards

- 使用 TypeScript
- 遵循 ESLint 规则
- 编写测试用例
- 使用 Conventional Commits 格式

### Commit 格式

```
<type>(<scope>): <description>

feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 🧪 测试 | Testing

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 📁 项目结构 | Project Structure

```
openmemory-plus/
├── cli/                   # CLI 工具
│   ├── src/
│   │   ├── commands/      # 命令实现
│   │   └── lib/           # 核心库
│   └── tests/             # 测试文件
├── templates/             # IDE 配置模板
├── skills/                # Agent Skills
└── docs/                  # 文档
```

## 🤝 行为准则 | Code of Conduct

- 尊重所有贡献者
- 保持友善和专业
- 接受建设性批评
- 关注项目最佳利益

## 📄 许可证 | License

贡献的代码将采用 [MIT License](LICENSE)。

---

如有问题，请通过 Issue 联系我们！

If you have questions, please reach out via Issues!

