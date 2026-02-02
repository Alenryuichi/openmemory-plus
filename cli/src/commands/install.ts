import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, readFileSync } from 'fs';
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
}

// ============================================================================
// Constants
// ============================================================================

const IDE_CONFIGS: Record<string, IdeConfig> = {
  augment: { dir: '.augment', configFile: 'AGENTS.md', commandsDir: 'commands', skillsDir: 'skills' },
  claude: { dir: '.', configFile: 'CLAUDE.md', commandsDir: '.claude/commands', skillsDir: '.claude/skills' },
  cursor: { dir: '.cursor', configFile: '.cursorrules', commandsDir: 'commands', skillsDir: 'skills' },
  gemini: { dir: '.', configFile: 'gemini.md', commandsDir: '.gemini/commands', skillsDir: '.gemini/skills' },
  common: { dir: '.', configFile: 'AGENTS.md', commandsDir: '.agents/commands', skillsDir: '.agents/skills' },
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
  if (!existsSync(src)) {
    console.warn(chalk.yellow(`  ⚠ 源目录不存在: ${src}`));
    return;
  }
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const destPath = join(dest, file.name);
    try {
      if (file.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      console.warn(chalk.yellow(`  ⚠ 复制失败: ${srcPath}`));
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
  project_store: "_omp/.memory/"
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

function processTemplate(content: string, projectName: string): string {
  const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
    .replace(/\{\{CREATED_AT\}\}/g, now);
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

  const templatesDir = getTemplatesDir();
  const ompTemplates = join(templatesDir, 'shared', '_omp');
  const ideTemplates = join(templatesDir, ide === 'common' ? 'common' : ide!);

  // Create _omp/ directory (core)
  const ompDir = join(cwd, '_omp');
  mkdirSync(ompDir, { recursive: true });
  copyDir(ompTemplates, ompDir);
  console.log(chalk.green('  ✓ 创建 _omp/ (核心目录)'));

  // Process memory template files with project name
  const ompMemoryDir = join(ompDir, '.memory');
  // Ensure .memory directory exists (may not be in template)
  mkdirSync(ompMemoryDir, { recursive: true });

  if (existsSync(ompMemoryDir)) {
    const memoryFiles = readdirSync(ompMemoryDir);
    for (const file of memoryFiles) {
      const filePath = join(ompMemoryDir, file);
      const content = readFileSync(filePath, 'utf-8');
      writeFileSync(filePath, processTemplate(content, projectName));
    }
  }

  // Create project.yaml
  const projectYaml = join(ompMemoryDir, 'project.yaml');
  writeFileSync(projectYaml, generateProjectYaml(projectName));
  console.log(chalk.green('  ✓ 创建 _omp/.memory/project.yaml'));

  // Count files
  const commandsCount = existsSync(join(ompDir, 'commands'))
    ? readdirSync(join(ompDir, 'commands')).filter(f => f.endsWith('.md')).length
    : 0;
  const actionsCount = existsSync(join(ompDir, 'commands', 'memory-actions'))
    ? readdirSync(join(ompDir, 'commands', 'memory-actions')).length
    : 0;
  console.log(chalk.green(`  ✓ 创建 _omp/commands/ (${commandsCount} 命令, ${actionsCount} 子动作)`));
  console.log(chalk.green('  ✓ 创建 _omp/skills/ (memory-extraction)'));

  // Create IDE-specific directory and copy commands/skills
  const ideDir = join(cwd, config.dir);

  // Create and copy commands to IDE dir
  const ideCommandsDir = join(cwd, config.dir, config.commandsDir);
  mkdirSync(ideCommandsDir, { recursive: true });
  copyDir(join(ompDir, 'commands'), ideCommandsDir);
  console.log(chalk.green(`  ✓ 复制到 ${config.dir}/${config.commandsDir}/`));

  // Create and copy skills to IDE dir
  const ideSkillsDir = join(cwd, config.dir, config.skillsDir);
  mkdirSync(ideSkillsDir, { recursive: true });
  copyDir(join(ompDir, 'skills'), ideSkillsDir);
  console.log(chalk.green(`  ✓ 复制到 ${config.dir}/${config.skillsDir}/`));

  // Copy IDE-specific config file
  if (existsSync(ideTemplates)) {
    copyDir(ideTemplates, ideDir);
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
  console.log(chalk.gray('  2. 使用 ') + chalk.cyan('/memory') + chalk.gray(' 打开记忆管理菜单'));
  console.log(chalk.gray('  3. 选择操作或用自然语言描述需求'));
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
