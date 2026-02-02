#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from './commands/install.js';
import { initCommand } from './commands/init.js';
import { statusCommand } from './commands/status.js';
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('openmemory-plus')
  .description('🧠 Agent Memory Management CLI - Install, configure, and manage OpenMemory Plus')
  .version('1.0.0');

program
  .command('install')
  .description('Install and configure all dependencies (Docker, Ollama, Qdrant, OpenMemory)')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--skip-docker', 'Skip Docker installation')
  .option('--skip-ollama', 'Skip Ollama installation')
  .action(installCommand);

program
  .command('init')
  .description('Initialize OpenMemory Plus in current project')
  .option('-i, --ide <type>', 'IDE type: augment, claude, cursor, gemini, common', 'augment')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--project-name <name>', 'Project name for configuration')
  .option('--generate-mcp', 'Generate MCP configuration snippet')
  .action(initCommand);

program
  .command('status')
  .description('Check OpenMemory Plus system status')
  .action(statusCommand);

program
  .command('doctor')
  .description('Diagnose and fix common issues')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(doctorCommand);

// Default action - show status
program
  .action(() => {
    console.log(chalk.cyan.bold('\n🧠 OpenMemory Plus - Agent Memory Management\n'));
    console.log('Usage: openmemory-plus <command> [options]\n');
    console.log('Commands:');
    console.log('  install   Install and configure dependencies');
    console.log('  init      Initialize in current project');
    console.log('  status    Check system status');
    console.log('  doctor    Diagnose issues\n');
    console.log('Run "openmemory-plus --help" for more information.');
  });

program.parse();

