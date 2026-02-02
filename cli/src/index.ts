#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install.js';
import { statusCommand } from './commands/status.js';
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('openmemory-plus')
  .description('🧠 Agent Memory Management - 让任何 AI Agent 获得持久记忆能力')
  .version('1.0.0');

// Main command: install (unified entry point)
program
  .command('install', { isDefault: true })
  .description('一键安装和配置 OpenMemory Plus (推荐)')
  .option('-y, --yes', '跳过确认提示')
  .option('-i, --ide <type>', 'IDE 类型: augment, claude, cursor, gemini, common')
  .option('--skip-deps', '跳过依赖安装，仅配置项目')
  .option('--show-mcp', '显示 MCP 配置')
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

// Parse and execute
program.parse();
