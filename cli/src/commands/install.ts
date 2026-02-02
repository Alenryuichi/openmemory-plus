import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkAllDependencies, isSystemReady, type SystemStatus, checkDocker } from '../lib/detector.js';
import {
  getPlatform,
  isTTY,
  isCI,
  getOllamaInstallCommand,
  getOpenUrlCommand,
  safeExec,
  waitForService,
  isPortInUse,
} from '../lib/platform.js';
import {
  checkDockerCompose,
  ensureComposeFile,
  getComposeFilePath,
  getComposeDir,
} from './deps.js';

// ============================================================================
// Types
// ============================================================================

interface InstallOptions {
  yes?: boolean;
  ide?: string;
  skipDeps?: boolean;
  showMcp?: boolean;
  force?: boolean; // Fix Issue #11: Add force option
  compose?: boolean; // Use Docker Compose mode
}

interface IdeConfig {
  commandsDir: string;
  skillsDir: string;
}

// ============================================================================
// Constants
// ============================================================================

// Only commands and skills directories - no config files (AGENTS.md, CLAUDE.md, etc.)
const IDE_CONFIGS: Record<string, IdeConfig> = {
  augment: { commandsDir: '.augment/commands', skillsDir: '.augment/skills' },
  claude: { commandsDir: '.claude/commands', skillsDir: '.claude/skills' },
  cursor: { commandsDir: '.cursor/commands', skillsDir: '.cursor/skills' },
  gemini: { commandsDir: '.gemini/commands', skillsDir: '.gemini/skills' },
  common: { commandsDir: '.agents/commands', skillsDir: '.agents/skills' },
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

// Fix Issue #10: Use safeExec to prevent command injection
async function openUrl(url: string): Promise<void> {
  const cmd = getOpenUrlCommand();
  try {
    await safeExec(cmd, [url]);
  } catch {
    console.log(chalk.gray(`  请手动打开: ${url}`));
  }
}

// Fix Issue #1: Cross-platform Ollama installation
async function installOllama(): Promise<boolean> {
  const platform = getPlatform();
  const installCmd = getOllamaInstallCommand();

  if (!installCmd.command) {
    console.log(chalk.yellow(`  不支持的平台: ${platform}`));
    console.log(chalk.yellow(`  请手动安装: ${installCmd.manual}`));
    return false;
  }

  const spinner = ora(`安装 Ollama (${platform})...`).start();
  try {
    const { code, stderr } = await safeExec(installCmd.command, installCmd.args);
    if (code !== 0) {
      throw new Error(stderr || 'Installation failed');
    }
    spinner.succeed('Ollama 安装成功');
    return true;
  } catch (e: any) {
    spinner.fail('Ollama 安装失败');
    console.log(chalk.yellow(`  请手动安装: ${installCmd.manual || 'https://ollama.com/download'}`));
    // Fix Issue #6: Log error details
    if (e.message) {
      console.log(chalk.gray(`  错误: ${e.message}`));
    }
    return false;
  }
}

// Fix Issue #2: Reliable Ollama startup with polling
async function startOllama(): Promise<boolean> {
  const spinner = ora('启动 Ollama 服务...').start();
  try {
    // Start ollama serve in background
    const proc = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();

    // Wait for service to be available with polling
    spinner.text = '等待 Ollama 服务就绪...';
    const ready = await waitForService('http://localhost:11434/api/tags', 30, 1000);

    if (ready) {
      spinner.succeed('Ollama 服务已启动');
      return true;
    } else {
      spinner.fail('Ollama 启动超时');
      console.log(chalk.yellow('  请手动运行: ollama serve'));
      return false;
    }
  } catch (e: any) {
    spinner.fail('Ollama 启动失败');
    console.log(chalk.gray(`  错误: ${e.message || '未知错误'}`));
    return false;
  }
}

// Fix Issue #3: Better timeout and progress for BGE-M3 download
async function pullBgeM3(): Promise<boolean> {
  const spinner = ora('下载 BGE-M3 模型 (约 1.2GB，可能需要 5-10 分钟)...').start();

  return new Promise((resolve) => {
    const proc = spawn('ollama', ['pull', 'bge-m3'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let lastProgress = '';
    proc.stdout?.on('data', (data) => {
      const line = data.toString().trim();
      if (line && line !== lastProgress) {
        lastProgress = line;
        spinner.text = `下载 BGE-M3: ${line}`;
      }
    });

    proc.stderr?.on('data', (data) => {
      const line = data.toString().trim();
      if (line) {
        spinner.text = `下载 BGE-M3: ${line}`;
      }
    });

    // Fix Issue #3: Increase timeout to 30 minutes
    // Fix F4: Wait for process to terminate after kill
    let killed = false;
    const timeout = setTimeout(() => {
      killed = true;
      proc.kill('SIGTERM');
      // Give process time to terminate gracefully
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      }, 5000);
      spinner.fail('BGE-M3 下载超时 (30分钟)');
      console.log(chalk.yellow('  请手动运行: ollama pull bge-m3'));
      resolve(false);
    }, 30 * 60 * 1000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        spinner.succeed('BGE-M3 模型已下载');
        resolve(true);
      } else {
        spinner.fail('BGE-M3 下载失败');
        console.log(chalk.yellow('  请手动运行: ollama pull bge-m3'));
        resolve(false);
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      spinner.fail('BGE-M3 下载失败');
      console.log(chalk.gray(`  错误: ${err.message}`));
      resolve(false);
    });
  });
}

// Fix Issue #4: Check port before starting Qdrant
async function startQdrant(): Promise<boolean> {
  const spinner = ora('启动 Qdrant 容器...').start();

  // Check if port 6333 is already in use
  const portInUse = await isPortInUse(6333);
  if (portInUse) {
    // Check if it's already Qdrant
    try {
      const response = await fetch('http://localhost:6333/collections');
      if (response.ok) {
        spinner.succeed('Qdrant 已在运行');
        return true;
      }
    } catch {
      // Not Qdrant
    }
    spinner.fail('端口 6333 已被其他服务占用');
    console.log(chalk.yellow('  请释放端口 6333 或使用其他端口'));
    return false;
  }

  // Try to start existing container first
  try {
    const { code } = await safeExec('docker', ['start', 'qdrant']);
    if (code === 0) {
      // Wait for service
      const ready = await waitForService('http://localhost:6333/collections', 30, 1000);
      if (ready) {
        spinner.succeed('Qdrant 容器已启动');
        return true;
      }
    }
  } catch {
    // Container doesn't exist, create new one
  }

  // Create new container
  try {
    const { code, stderr } = await safeExec('docker', [
      'run', '-d',
      '--name', 'qdrant',
      '-p', '6333:6333',
      '-p', '6334:6334',
      'qdrant/qdrant',
    ]);

    if (code !== 0) {
      throw new Error(stderr || 'Failed to create container');
    }

    // Wait for service
    const ready = await waitForService('http://localhost:6333/collections', 30, 1000);
    if (ready) {
      spinner.succeed('Qdrant 容器已启动');
      return true;
    } else {
      spinner.fail('Qdrant 启动超时');
      return false;
    }
  } catch (e: any) {
    spinner.fail('Qdrant 启动失败');
    console.log(chalk.gray(`  错误: ${e.message || '未知错误'}`));
    console.log(chalk.yellow('  请确保 Docker 正在运行'));
    return false;
  }
}

// Fix Issue #5: Better template path resolution with clear error
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

  // Fix Issue #5: Throw error instead of returning invalid path
  throw new Error(
    `模板目录未找到。已检查路径:\n${possiblePaths.map((p) => `  - ${p}`).join('\n')}\n` +
      '请确保 openmemory-plus 包安装完整。'
  );
}

// Fix Issue #6: Better error handling in copyDir
function copyDir(src: string, dest: string, errors: string[] = []): string[] {
  if (!existsSync(src)) {
    errors.push(`源目录不存在: ${src}`);
    return errors;
  }
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const destPath = join(dest, file.name);
    try {
      if (file.isDirectory()) {
        copyDir(srcPath, destPath, errors);
      } else {
        copyFileSync(srcPath, destPath);
      }
    } catch (err: any) {
      errors.push(`复制失败 ${srcPath}: ${err.message || '未知错误'}`);
    }
  }
  return errors;
}

function generateProjectYaml(projectName: string): string {
  return `# OpenMemory Plus Project Configuration
# Generated: ${new Date().toISOString()}

project:
  name: "${projectName}"
  version: "1.0.0"
  description: ""

memory:
  project_store: "_omp/memory/"
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

// Fix Issue #7: Improved MCP configuration guidance
function showMcpConfig(ide: string): void {
  console.log(chalk.bold('\n📋 MCP 配置 (复制到 IDE 配置文件):'));

  // Fix Issue #7: Clarify that OPENAI_API_KEY is optional when using Ollama
  console.log(chalk.gray('\n💡 使用本地 Ollama + BGE-M3，无需 OpenAI API Key\n'));

  const mcpConfig = {
    openmemory: {
      command: 'npx',
      args: ['-y', 'openmemory-mcp'],
      env: {
        // Fix Issue #7: Remove misleading OPENAI_API_KEY
        MEM0_EMBEDDING_MODEL: 'bge-m3',
        MEM0_EMBEDDING_PROVIDER: 'ollama',
        OLLAMA_HOST: 'http://localhost:11434',
        QDRANT_HOST: 'localhost',
        QDRANT_PORT: '6333',
      },
    },
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

  console.log(chalk.gray(`配置文件位置: ${configPaths[ide] || configPaths.common}`));
  console.log(chalk.gray('\n📖 详细配置说明: https://github.com/mem0ai/mem0/tree/main/openmemory\n'));
}

// ============================================================================
// Phase 1: System Dependencies (with Docker Compose support)
// ============================================================================

/**
 * Start services using Docker Compose
 */
async function startWithDockerCompose(): Promise<boolean> {
  const spinner = ora('使用 Docker Compose 启动服务...').start();

  try {
    // Ensure compose file exists
    const composePath = ensureComposeFile(true);
    const composeDir = getComposeDir(true);

    spinner.text = '启动 Qdrant + Ollama...';

    // Run docker compose up -d
    const { code, stderr } = await safeExec('docker', ['compose', '-f', composePath, 'up', '-d'], {
      cwd: composeDir,
      timeout: 300000, // 5 minutes
    });

    if (code !== 0) {
      throw new Error(stderr || '启动失败');
    }

    spinner.text = '等待服务就绪...';

    // Wait for Qdrant
    const qdrantReady = await waitForService('http://localhost:6333/readyz', 60, 1000);
    if (!qdrantReady) {
      spinner.warn('Qdrant 启动超时，但服务可能仍在启动中');
    }

    // Wait for Ollama
    const ollamaReady = await waitForService('http://localhost:11434/api/tags', 60, 1000);
    if (!ollamaReady) {
      spinner.warn('Ollama 启动超时，但服务可能仍在启动中');
    }

    spinner.succeed('Docker Compose 服务已启动');

    // Check BGE-M3 status
    console.log(chalk.gray('\n检查 BGE-M3 模型状态...'));
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      const hasModel = data.models?.some((m: any) =>
        m.name === 'bge-m3' || m.name === 'bge-m3:latest' || m.name.startsWith('bge-m3:')
      );
      if (hasModel) {
        console.log(chalk.green('  ✓ BGE-M3 模型已就绪'));
      } else {
        console.log(chalk.yellow('  ⚠ BGE-M3 模型正在后台下载 (首次启动需要几分钟)'));
        console.log(chalk.gray('    查看进度: omp deps logs bge-m3-init'));
      }
    } catch {
      console.log(chalk.yellow('  ⚠ 无法检查模型状态'));
    }

    return true;
  } catch (e: any) {
    spinner.fail('Docker Compose 启动失败');
    console.log(chalk.red(`   ${e.message}`));
    return false;
  }
}

async function phase1_checkAndInstallDeps(options: InstallOptions): Promise<boolean> {
  console.log(chalk.bold.cyan('\n━━━ 第 1 步: 检测系统依赖 ━━━\n'));

  // Fix Issue #8: Detect CI/CD environment
  const inCI = isCI();
  const hasTTY = isTTY();

  if (inCI) {
    console.log(chalk.gray('检测到 CI/CD 环境，使用非交互模式\n'));
  }

  const spinner = ora('检测系统状态...').start();
  const status = await checkAllDependencies();
  const hasDockerCompose = status.docker.running ? await checkDockerCompose() : false;
  spinner.stop();

  // Show status
  console.log(chalk.bold('当前状态:'));
  console.log(
    `  🐳 Docker:      ${status.docker.installed ? (status.docker.running ? chalk.green('✓ 运行中') : chalk.yellow('⚠ 已安装未运行')) : chalk.red('✗ 未安装')}`
  );
  if (hasDockerCompose) {
    console.log(chalk.green('  🐳 Compose:     ✓ 可用'));
  }
  console.log(
    `  🦙 Ollama:      ${status.ollama.installed ? (status.ollama.running ? chalk.green('✓ 运行中') : chalk.yellow('⚠ 已安装未运行')) : chalk.red('✗ 未安装')}`
  );
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

  // Fix Issue #8: In CI or non-TTY, fail fast instead of hanging
  if (inCI || !hasTTY) {
    console.log(chalk.yellow('⚠️ 非交互环境，跳过依赖安装'));
    console.log(chalk.gray('  请在交互式终端中运行，或使用 --skip-deps 跳过\n'));
    return true;
  }

  // Check if Docker is available for Docker Compose mode
  if (status.docker.running && hasDockerCompose) {
    // Recommend Docker Compose mode
    console.log(chalk.cyan('💡 检测到 Docker Compose 可用，推荐使用一键部署模式\n'));

    let useCompose = options.compose;
    if (useCompose === undefined && !options.yes) {
      const { mode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'mode',
          message: '选择依赖安装方式:',
          choices: [
            { name: '🐳 Docker Compose 一键部署 (推荐)', value: 'compose' },
            { name: '📦 原生安装 (分别安装各组件)', value: 'native' },
            { name: '⏭️  跳过依赖安装', value: 'skip' },
          ],
          default: 'compose',
        },
      ]);

      if (mode === 'skip') {
        console.log(chalk.yellow('\n已跳过依赖安装，继续项目配置...\n'));
        return true;
      }
      useCompose = mode === 'compose';
    }

    if (useCompose) {
      return await startWithDockerCompose();
    }
  }

  // Original native installation flow
  // Confirm installation (only in interactive mode)
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '需要安装/启动缺失的依赖，是否继续?',
        default: true,
      },
    ]);
    if (!confirm) {
      console.log(chalk.yellow('\n已跳过依赖安装，继续项目配置...\n'));
      return true;
    }
  }

  // Install Docker (manual - requires user interaction)
  if (!status.docker.installed) {
    console.log(chalk.yellow('\n📦 Docker 需要手动安装'));
    console.log(chalk.gray('   请访问 https://docker.com/download 下载安装'));
    if (!options.yes && hasTTY) {
      const { openDocker } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'openDocker',
          message: '是否打开 Docker 下载页面?',
          default: true,
        },
      ]);
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

  const cwd = process.cwd();
  const ompDir = join(cwd, '_omp');

  // Fix F9: Use local variable instead of modifying options object
  let shouldForce = options.force ?? false;

  // Fix Issue #11: Check if already installed
  if (existsSync(ompDir) && !shouldForce) {
    console.log(chalk.yellow('⚠️ 检测到已存在的 _omp/ 目录'));

    // Check if in interactive mode
    if (!isTTY() || isCI()) {
      console.log(chalk.gray('  使用 --force 强制覆盖，或手动删除 _omp/ 目录'));
      console.log(chalk.yellow('\n跳过项目配置，保留现有配置\n'));
      // Return default IDE
      return options.ide?.toLowerCase() || 'augment';
    }

    if (!options.yes) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '如何处理现有配置?',
          choices: [
            { name: '保留现有配置 (跳过)', value: 'skip' },
            { name: '覆盖现有配置', value: 'overwrite' },
            { name: '仅更新 commands 和 skills', value: 'update' },
          ],
          default: 'skip',
        },
      ]);

      if (action === 'skip') {
        console.log(chalk.yellow('\n保留现有配置\n'));
        return options.ide?.toLowerCase() || 'augment';
      }

      // Fix F9: Update local variable, not options object
      if (action === 'update') {
        shouldForce = false; // Only update commands/skills
      } else {
        shouldForce = true;
      }
    }
  }

  // Select IDE(s) - support multiple selection
  let selectedIdes: string[] = [];

  if (options.ide) {
    // Parse comma-separated IDE list from command line
    const requestedIdes = options.ide
      .toLowerCase()
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Fix M2: Warn about invalid IDE names instead of silent ignore
    const validIdes = requestedIdes.filter((s) => IDE_CONFIGS[s]);
    const invalidIdes = requestedIdes.filter((s) => !IDE_CONFIGS[s]);

    if (invalidIdes.length > 0) {
      console.log(chalk.yellow(`  ⚠ 未知的 IDE: ${invalidIdes.join(', ')}`));
      console.log(chalk.gray(`    有效选项: ${Object.keys(IDE_CONFIGS).join(', ')}`));
    }

    selectedIdes = validIdes;
  }

  if (selectedIdes.length === 0) {
    // Fix Issue #8: Handle non-TTY environment
    if (!isTTY() || isCI()) {
      selectedIdes = ['augment']; // Default to augment in non-interactive mode
      console.log(chalk.gray(`  使用默认 IDE: augment`));
    } else {
      const { ides } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'ides',
          message: '选择 IDE 类型 (空格选择，回车确认):',
          choices: [
            { name: 'Augment', value: 'augment', checked: true },
            { name: 'Claude Code', value: 'claude' },
            { name: 'Cursor', value: 'cursor' },
            { name: 'Gemini', value: 'gemini' },
            { name: '通用 (AGENTS.md)', value: 'common' },
          ],
        },
      ]);
      selectedIdes = ides.length > 0 ? ides : ['augment'];
    }
  }

  // Get project name
  const defaultName = cwd.split('/').pop() || 'my-project';
  let projectName = defaultName;

  if (!options.yes && isTTY() && !isCI()) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        default: defaultName,
      },
    ]);
    projectName = name;
  }

  console.log(chalk.bold('\n📁 创建配置文件...\n'));

  // Fix Issue #5: Wrap in try-catch for better error handling
  let templatesDir: string;
  try {
    templatesDir = getTemplatesDir();
  } catch (e: any) {
    console.error(chalk.red('❌ ' + e.message));
    process.exit(1);
  }

  const ompTemplates = join(templatesDir, 'shared', '_omp');

  // Create _omp/ directory (core)
  mkdirSync(ompDir, { recursive: true });
  const copyErrors = copyDir(ompTemplates, ompDir);

  // Fix Issue #6: Report copy errors
  if (copyErrors.length > 0) {
    console.log(chalk.yellow('  ⚠ 部分文件复制失败:'));
    copyErrors.forEach((err) => console.log(chalk.gray(`    - ${err}`)));
  }
  console.log(chalk.green('  ✓ 创建 _omp/ (核心目录)'));

  // Process memory template files with project name
  const ompMemoryDir = join(ompDir, 'memory');
  // Ensure memory directory exists (may not be in template)
  mkdirSync(ompMemoryDir, { recursive: true });

  if (existsSync(ompMemoryDir)) {
    const memoryFiles = readdirSync(ompMemoryDir);
    for (const file of memoryFiles) {
      const filePath = join(ompMemoryDir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        writeFileSync(filePath, processTemplate(content, projectName));
      } catch (e: any) {
        console.log(chalk.yellow(`  ⚠ 处理模板失败: ${file} - ${e.message}`));
      }
    }
  }

  // Create project.yaml
  const projectYaml = join(ompMemoryDir, 'project.yaml');
  writeFileSync(projectYaml, generateProjectYaml(projectName));
  console.log(chalk.green('  ✓ 创建 _omp/memory/project.yaml'));

  // Count files
  const commandsCount = existsSync(join(ompDir, 'commands'))
    ? readdirSync(join(ompDir, 'commands')).filter((f) => f.endsWith('.md')).length
    : 0;
  const workflowStepsCount = existsSync(join(ompDir, 'workflows', 'memory', 'steps'))
    ? readdirSync(join(ompDir, 'workflows', 'memory', 'steps')).length
    : 0;
  console.log(chalk.green(`  ✓ 创建 _omp/commands/ (${commandsCount} 命令)`));
  console.log(chalk.green(`  ✓ 创建 _omp/workflows/ (${workflowStepsCount} 步骤)`));
  console.log(chalk.green('  ✓ 创建 _omp/skills/ (memory-extraction)'));

  // Create IDE-specific directories for each selected IDE
  // Only copy commands and skills - no config files (AGENTS.md, CLAUDE.md, etc.)
  for (const ide of selectedIdes) {
    const config = IDE_CONFIGS[ide];
    if (!config) continue;

    // Create and copy commands to IDE dir
    const ideCommandsDir = join(cwd, config.commandsDir);
    mkdirSync(ideCommandsDir, { recursive: true });
    copyDir(join(ompDir, 'commands'), ideCommandsDir);

    // Create and copy skills to IDE dir
    const ideSkillsDir = join(cwd, config.skillsDir);
    mkdirSync(ideSkillsDir, { recursive: true });
    copyDir(join(ompDir, 'skills'), ideSkillsDir);

    console.log(chalk.green(`  ✓ 配置 ${ide} (${config.commandsDir}/)`));
  }

  // Show summary for multi-select (Fix L2)
  if (selectedIdes.length > 1) {
    console.log(chalk.green(`\n  ✓ 已为 ${selectedIdes.length} 个 IDE 配置完成: ${selectedIdes.join(', ')}`));
  }

  // Return first IDE for MCP config display
  return selectedIdes[0];
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
