import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkAllDependencies, isSystemReady, type SystemStatus } from '../lib/detector.js';

const execAsync = promisify(exec);

// ============================================================================
// Types
// ============================================================================

interface InstallOptions {
  yes?: boolean;
  ide?: string;
  skipDeps?: boolean;
  showMcp?: boolean;
}

interface IdeConfig {
  dir: string;
  configFile: string;
  commandsDir: string;
  skillsDir: string;
  rulesDir: string;
}

// ============================================================================
// Constants
// ============================================================================

const IDE_CONFIGS: Record<string, IdeConfig> = {
  augment: { dir: '.augment', configFile: 'AGENTS.md', commandsDir: 'commands', skillsDir: 'skills', rulesDir: '.rules/memory' },
  claude: { dir: '.', configFile: 'CLAUDE.md', commandsDir: '.claude/commands', skillsDir: '.claude/skills', rulesDir: '.rules/memory' },
  cursor: { dir: '.cursor', configFile: '.cursorrules', commandsDir: 'commands', skillsDir: 'skills', rulesDir: '.rules/memory' },
  gemini: { dir: '.', configFile: 'gemini.md', commandsDir: '.gemini/commands', skillsDir: '.gemini/skills', rulesDir: '.rules/memory' },
  common: { dir: '.', configFile: 'AGENTS.md', commandsDir: '.agents/commands', skillsDir: '.agents/skills', rulesDir: '.rules/memory' },
};

const BANNER = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🧠  OpenMemory Plus - Agent Memory Management               ║
║                                                               ║
║   让任何 AI Agent 在 5 分钟内获得持久记忆能力                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

// ============================================================================
// Helper Functions
// ============================================================================

async function openUrl(url: string): Promise<void> {
  const { platform } = process;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  await execAsync(`${cmd} ${url}`);
}

async function installOllama(): Promise<boolean> {
  const spinner = ora('安装 Ollama...').start();
  try {
    await execAsync('brew install ollama');
    spinner.succeed('Ollama 安装成功');
    return true;
  } catch {
    spinner.fail('Ollama 安装失败');
    console.log(chalk.yellow('  请手动安装: https://ollama.com/download'));
    return false;
  }
}

async function startOllama(): Promise<boolean> {
  const spinner = ora('启动 Ollama 服务...').start();
  try {
    exec('ollama serve &');
    await new Promise(r => setTimeout(r, 2000));
    spinner.succeed('Ollama 服务已启动');
    return true;
  } catch {
    spinner.fail('Ollama 启动失败');
    return false;
  }
}

async function pullBgeM3(): Promise<boolean> {
  const spinner = ora('下载 BGE-M3 模型 (可能需要几分钟)...').start();
  try {
    await execAsync('ollama pull bge-m3', { timeout: 600000 });
    spinner.succeed('BGE-M3 模型已下载');
    return true;
  } catch {
    spinner.fail('BGE-M3 下载失败');
    return false;
  }
}

async function startQdrant(): Promise<boolean> {
  const spinner = ora('启动 Qdrant 容器...').start();
  try {
    await execAsync('docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant');
    spinner.succeed('Qdrant 容器已启动');
    return true;
  } catch (e: any) {
    if (e.message?.includes('already in use') || e.message?.includes('Conflict')) {
      try {
        await execAsync('docker start qdrant');
        spinner.succeed('Qdrant 容器已启动');
        return true;
      } catch {}
    }
    spinner.fail('Qdrant 启动失败');
    return false;
  }
}

function getTemplatesDir(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    join(__dirname, '..', 'templates'),
    join(__dirname, '..', '..', 'templates'),
    join(__dirname, '..', '..', '..', 'templates'),
  ];

  for (const p of possiblePaths) {
    if (existsSync(join(p, 'shared'))) {
      return p;
    }
  }
  return possiblePaths[0];
}

function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const destPath = join(dest, file.name);
    if (file.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function generateProjectYaml(projectName: string): string {
  return `# OpenMemory Plus Project Configuration
# Generated: ${new Date().toISOString()}

project:
  name: "${projectName}"
  version: "1.0.0"
  description: ""

memory:
  project_store: ".memory/"
  user_store: "openmemory"

classification:
  project_keywords:
    - "项目配置"
    - "技术决策"
    - "部署信息"
    - "API 密钥"
    - "架构设计"
    - "数据库"
  user_keywords:
    - "用户偏好"
    - "编码风格"
    - "技能"
    - "习惯"
    - "喜欢"

agent:
  auto_extract: true
  auto_search: true
  fallback_to_file: true
`;
}

function showMcpConfig(ide: string): void {
  console.log(chalk.bold('\n📋 MCP 配置 (复制到 IDE 配置文件):'));

  const mcpConfig = {
    openmemory: {
      command: "npx",
      args: ["-y", "openmemory-mcp"],
      env: {
        OPENAI_API_KEY: "your-openai-key-or-use-ollama",
        MEM0_EMBEDDING_MODEL: "bge-m3",
        MEM0_EMBEDDING_PROVIDER: "ollama",
        QDRANT_HOST: "localhost",
        QDRANT_PORT: "6333"
      }
    }
  };

  console.log(chalk.cyan('\n```json'));
  console.log(JSON.stringify(mcpConfig, null, 2));
  console.log(chalk.cyan('```\n'));

  const configPaths: Record<string, string> = {
    augment: '~/.augment/settings.json (mcpServers 字段)',
    claude: '~/.config/claude/mcp.json',
    cursor: '~/.cursor/mcp.json',
    gemini: '~/.config/gemini/mcp.json',
    common: '参考各 IDE 的 MCP 配置文档',
  };

  console.log(chalk.gray(`配置文件位置: ${configPaths[ide] || configPaths.common}\n`));
}

// ============================================================================
// Phase 1: System Dependencies
// ============================================================================

async function phase1_checkAndInstallDeps(options: InstallOptions): Promise<boolean> {
  console.log(chalk.bold.cyan('\n━━━ 第 1 步: 检测系统依赖 ━━━\n'));
  
  const spinner = ora('检测系统状态...').start();
  const status = await checkAllDependencies();
  spinner.stop();
  
  // Show status
  console.log(chalk.bold('当前状态:'));
  console.log(`  🐳 Docker:      ${status.docker.installed ? (status.docker.running ? chalk.green('✓ 运行中') : chalk.yellow('⚠ 已安装未运行')) : chalk.red('✗ 未安装')}`);
  console.log(`  🦙 Ollama:      ${status.ollama.installed ? (status.ollama.running ? chalk.green('✓ 运行中') : chalk.yellow('⚠ 已安装未运行')) : chalk.red('✗ 未安装')}`);
  console.log(`  📦 Qdrant:      ${status.qdrant.running ? chalk.green('✓ 运行中') : chalk.red('✗ 未运行')}`);
  console.log(`  🔤 BGE-M3:      ${status.bgeM3.installed ? chalk.green('✓ 已安装') : chalk.red('✗ 未安装')}`);
  console.log('');
  
  if (isSystemReady(status)) {
    console.log(chalk.green('✅ 所有依赖已就绪!\n'));
    return true;
  }
  
  if (options.skipDeps) {
    console.log(chalk.yellow('⚠️ 跳过依赖安装 (--skip-deps)\n'));
    return true;
  }
  
  // Confirm installation
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '需要安装/启动缺失的依赖，是否继续?',
      default: true,
    }]);
    if (!confirm) {
      console.log(chalk.yellow('\n已跳过依赖安装，继续项目配置...\n'));
      return true;
    }
  }
  
  // Install Docker (manual)
  if (!status.docker.installed) {
    console.log(chalk.yellow('\n📦 Docker 需要手动安装'));
    console.log(chalk.gray('   请访问 https://docker.com/download 下载安装'));
    if (!options.yes) {
      const { openDocker } = await inquirer.prompt([{
        type: 'confirm', name: 'openDocker', message: '是否打开 Docker 下载页面?', default: true,
      }]);
      if (openDocker) await openUrl('https://docker.com/download');
      await inquirer.prompt([{ type: 'input', name: 'wait', message: '安装完成后按 Enter 继续...' }]);
    }
  }
  
  // Install Ollama
  if (!status.ollama.installed) {
    await installOllama();
  }
  
  // Start Ollama if not running
  if (status.ollama.installed && !status.ollama.running) {
    await startOllama();
  }
  
  // Pull BGE-M3
  if (!status.bgeM3.installed) {
    await pullBgeM3();
  }
  
  // Start Qdrant
  if (!status.qdrant.running && (status.docker.running || status.docker.installed)) {
    await startQdrant();
  }
  
  console.log(chalk.green('\n✅ 依赖安装完成!\n'));
  return true;
}

// ============================================================================
// Phase 2: Project Configuration
// ============================================================================

async function phase2_initProject(options: InstallOptions): Promise<string> {
  console.log(chalk.bold.cyan('\n━━━ 第 2 步: 配置项目 ━━━\n'));
  
  // Select IDE
  let ide = options.ide?.toLowerCase();
  if (!ide || !IDE_CONFIGS[ide]) {
    const { selectedIde } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedIde',
      message: '选择 IDE 类型:',
      choices: [
        { name: 'Augment', value: 'augment' },
        { name: 'Claude Code', value: 'claude' },
        { name: 'Cursor', value: 'cursor' },
        { name: 'Gemini', value: 'gemini' },
        { name: '通用 (AGENTS.md)', value: 'common' },
      ],
      default: 'augment',
    }]);
    ide = selectedIde;
  }
  
  // Get project name
  const cwd = process.cwd();
  const defaultName = cwd.split('/').pop() || 'my-project';
  let projectName = defaultName;
  
  if (!options.yes) {
    const { name } = await inquirer.prompt([{
      type: 'input', name: 'name', message: '项目名称:', default: defaultName,
    }]);
    projectName = name;
  }
  
  const config = IDE_CONFIGS[ide!];
  
  console.log(chalk.bold('\n📁 创建配置文件...\n'));
  
  // Create .memory directory
  const memoryDir = join(cwd, '.memory');
  if (!existsSync(memoryDir)) {
    mkdirSync(memoryDir, { recursive: true });
  }
  console.log(chalk.green('  ✓ 创建 .memory/'));
  
  // Create project.yaml
  const projectYaml = join(memoryDir, 'project.yaml');
  writeFileSync(projectYaml, generateProjectYaml(projectName));
  console.log(chalk.green('  ✓ 创建 .memory/project.yaml'));
  
  const templatesDir = getTemplatesDir();
  const sharedTemplates = join(templatesDir, 'shared');
  const ideTemplates = join(templatesDir, ide === 'common' ? 'common' : ide!);

  // Create and copy commands
  const commandsDir = join(cwd, config.dir, config.commandsDir);
  mkdirSync(commandsDir, { recursive: true });
  copyDir(join(sharedTemplates, 'commands'), commandsDir);
  const cmdCount = existsSync(join(sharedTemplates, 'commands')) 
    ? readdirSync(join(sharedTemplates, 'commands')).length 
    : 0;
  console.log(chalk.green(`  ✓ 创建 ${config.dir}/${config.commandsDir}/ (${cmdCount} 个命令)`));

  // Create and copy skills
  const skillsDir = join(cwd, config.dir, config.skillsDir);
  mkdirSync(skillsDir, { recursive: true });
  copyDir(join(sharedTemplates, 'skills'), skillsDir);
  console.log(chalk.green(`  ✓ 创建 ${config.dir}/${config.skillsDir}/ (memory-extraction)`));

  // Create and copy rules
  const rulesDir = join(cwd, config.rulesDir);
  mkdirSync(rulesDir, { recursive: true });
  copyDir(join(sharedTemplates, 'rules'), rulesDir);
  console.log(chalk.green(`  ✓ 创建 ${config.rulesDir}/ (classification.md)`));

  // Copy IDE-specific config file
  if (existsSync(ideTemplates)) {
    copyDir(ideTemplates, join(cwd, config.dir));
    console.log(chalk.green(`  ✓ 复制 ${config.configFile}`));
  }

  return ide!;
}

// ============================================================================
// Phase 3: Completion
// ============================================================================

function phase3_showCompletion(ide: string, showMcp: boolean): void {
  console.log(chalk.bold.cyan('\n━━━ 安装完成 ━━━\n'));
  
  console.log(chalk.green.bold('🎉 OpenMemory Plus 已成功安装!\n'));
  
  console.log(chalk.bold('💡 下一步:'));
  console.log(chalk.gray('  1. 在 IDE 中打开项目'));
  console.log(chalk.gray('  2. 使用 ') + chalk.cyan('/memory') + chalk.gray(' 查看记忆状态'));
  console.log(chalk.gray('  3. 使用 ') + chalk.cyan('/mem search <query>') + chalk.gray(' 搜索记忆'));
  console.log('');
  
  if (showMcp) {
    showMcpConfig(ide);
  } else {
    console.log(chalk.gray('📋 查看 MCP 配置: ') + chalk.cyan('npx openmemory-plus install --show-mcp'));
  }
  
  console.log('');
}

// ============================================================================
// Main Install Command
// ============================================================================

export async function installCommand(options: InstallOptions): Promise<void> {
  // Show banner
  console.log(chalk.cyan(BANNER));
  
  // If only showing MCP config
  if (options.showMcp) {
    const ide = options.ide || 'augment';
    showMcpConfig(ide);
    return;
  }
  
  // Phase 1: Check and install dependencies
  await phase1_checkAndInstallDeps(options);
  
  // Phase 2: Initialize project
  const ide = await phase2_initProject(options);
  
  // Phase 3: Show completion
  phase3_showCompletion(ide, false);
}
