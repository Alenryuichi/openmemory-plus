#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { installCommand } from './commands/install.js';
import { statusCommand } from './commands/status.js';
import { doctorCommand } from './commands/doctor.js';
import {
  depsInitCommand,
  depsUpCommand,
  depsDownCommand,
  depsStatusCommand,
  depsLogsCommand,
  depsPullModelCommand,
} from './commands/deps.js';

// Fix Issue #9: Read version from package.json
const __dirname = dirname(fileURLToPath(import.meta.url));
function getVersion(): string {
  const possiblePaths = [
    join(__dirname, '..', 'package.json'),
    join(__dirname, '..', '..', 'package.json'),
  ];
  for (const p of possiblePaths) {
    try {
      const pkg = JSON.parse(readFileSync(p, 'utf-8'));
      return pkg.version || '0.0.0';
    } catch {
      continue;
    }
  }
  return '0.0.0';
}

const program = new Command();

program
  .name('openmemory-plus')
  .description('🧠 Agent Memory Management - 让任何 AI Agent 获得持久记忆能力')
  .version(getVersion());

// Main command: install (unified entry point)
program
  .command('install', { isDefault: true })
  .description('一键安装和配置 OpenMemory Plus (推荐)')
  .option('-y, --yes', '跳过确认提示')
  .option('-i, --ide <type>', 'IDE 类型: augment, claude, cursor, gemini, common')
  .option('--skip-deps', '跳过依赖安装，仅配置项目')
  .option('--show-mcp', '显示 MCP 配置 JSON')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('--compose', '使用 Docker Compose 一键部署依赖')
  .option('--no-configure-mcp', '跳过 MCP 自动配置')
  .option('--skip-verify', '跳过安装后验证')
  .action(installCommand);

// Secondary commands (for advanced users)
program
  .command('status')
  .description('检查系统状态')
  .action(statusCommand);

program
  .command('doctor')
  .description('诊断并修复问题')
  .option('--fix', '自动修复问题')
  .action(doctorCommand);

// Deps command group - Docker Compose based dependency management
const deps = program
  .command('deps')
  .description('🐳 管理依赖服务 (Docker Compose)');

deps
  .command('init')
  .description('初始化 Docker Compose 配置')
  .option('--local', '在当前目录创建配置 (默认: 全局)')
  .action((options) => depsInitCommand({ global: !options.local }));

deps
  .command('up')
  .description('启动所有依赖服务 (Qdrant + Ollama + BGE-M3)')
  .option('--local', '使用当前目录的配置')
  .option('--pull', '启动前拉取最新镜像')
  .action((options) => depsUpCommand({ global: !options.local, pull: options.pull }));

deps
  .command('down')
  .description('停止所有依赖服务')
  .option('--local', '使用当前目录的配置')
  .action((options) => depsDownCommand({ global: !options.local }));

deps
  .command('status')
  .description('查看依赖服务状态')
  .option('--local', '使用当前目录的配置')
  .action((options) => depsStatusCommand({ global: !options.local }));

deps
  .command('logs [service]')
  .description('查看服务日志 (可选: qdrant, ollama, bge-m3-init)')
  .option('--local', '使用当前目录的配置')
  .option('-f, --follow', '持续输出日志')
  .action((service, options) => depsLogsCommand(service, { global: !options.local, follow: options.follow }));

deps
  .command('pull-model')
  .description('手动下载 BGE-M3 模型')
  .action(depsPullModelCommand);

// Parse and execute
program.parse();
