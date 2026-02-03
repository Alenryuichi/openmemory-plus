import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, copyFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { safeExec, waitForService, getPlatform } from '../lib/platform.js';
import { checkDocker } from '../lib/detector.js';

// ============================================================================
// Types
// ============================================================================

interface DepsOptions {
  global?: boolean;
  pull?: boolean;
}

/** Ollama API model info */
interface OllamaModel {
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
}

/** Ollama /api/tags response */
interface OllamaTagsResponse {
  models?: OllamaModel[];
}

// ============================================================================
// Constants
// ============================================================================

const COMPOSE_DIR_NAME = '.openmemory-plus';
const COMPOSE_FILE_NAME = 'docker-compose.yml';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the path to the docker-compose.yml file
 * Default: ~/.openmemory-plus/docker-compose.yml
 */
export function getComposeFilePath(useGlobal: boolean = true): string {
  if (useGlobal) {
    const globalDir = join(homedir(), COMPOSE_DIR_NAME);
    return join(globalDir, COMPOSE_FILE_NAME);
  }
  return join(process.cwd(), COMPOSE_FILE_NAME);
}

/**
 * Get the directory containing the docker-compose.yml
 */
export function getComposeDir(useGlobal: boolean = true): string {
  if (useGlobal) {
    return join(homedir(), COMPOSE_DIR_NAME);
  }
  return process.cwd();
}

/**
 * Get the path to the template docker-compose.yml
 */
function getTemplateComposePath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    join(__dirname, '..', 'templates', COMPOSE_FILE_NAME),
    join(__dirname, '..', '..', 'templates', COMPOSE_FILE_NAME),
    join(__dirname, '..', '..', '..', 'templates', COMPOSE_FILE_NAME),
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `docker-compose.yml 模板未找到。已检查路径:\n${possiblePaths.map((p) => `  - ${p}`).join('\n')}`
  );
}

/**
 * Ensure docker-compose.yml exists, copy from template if not
 */
export function ensureComposeFile(useGlobal: boolean = true): string {
  const composePath = getComposeFilePath(useGlobal);
  const composeDir = getComposeDir(useGlobal);

  if (!existsSync(composePath)) {
    // Create directory if needed
    mkdirSync(composeDir, { recursive: true });

    // Copy template
    const templatePath = getTemplateComposePath();
    copyFileSync(templatePath, composePath);
    console.log(chalk.green(`✓ 创建 ${composePath}`));
  }

  return composePath;
}

/**
 * Check if Docker Compose is available
 */
export async function checkDockerCompose(): Promise<boolean> {
  try {
    // Try docker compose (v2)
    const { code } = await safeExec('docker', ['compose', 'version'], { timeout: 5000 });
    return code === 0;
  } catch {
    try {
      // Try docker-compose (v1)
      const { code } = await safeExec('docker-compose', ['version'], { timeout: 5000 });
      return code === 0;
    } catch {
      return false;
    }
  }
}

/**
 * Run docker compose command
 */
async function runCompose(args: string[], useGlobal: boolean = true): Promise<{ code: number; stdout: string; stderr: string }> {
  const composeDir = getComposeDir(useGlobal);
  const composePath = getComposeFilePath(useGlobal);

  if (!existsSync(composePath)) {
    throw new Error(`docker-compose.yml 不存在: ${composePath}\n请先运行: omp deps init`);
  }

  // Try docker compose (v2) first
  try {
    return await safeExec('docker', ['compose', '-f', composePath, ...args], {
      cwd: composeDir,
      timeout: 300000, // 5 minutes for long operations
    });
  } catch {
    // Fallback to docker-compose (v1)
    return await safeExec('docker-compose', ['-f', composePath, ...args], {
      cwd: composeDir,
      timeout: 300000,
    });
  }
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Initialize docker-compose.yml
 */
export async function depsInitCommand(options: DepsOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n🐳 初始化 Docker Compose 配置\n'));

  // Check Docker
  const dockerStatus = await checkDocker();
  if (!dockerStatus.installed) {
    console.log(chalk.red('❌ Docker 未安装'));
    console.log(chalk.gray('   请访问 https://docker.com/download 下载安装'));
    return;
  }

  if (!dockerStatus.running) {
    console.log(chalk.yellow('⚠️ Docker 未运行'));
    console.log(chalk.gray('   请启动 Docker Desktop'));
    return;
  }

  // Check Docker Compose
  const hasCompose = await checkDockerCompose();
  if (!hasCompose) {
    console.log(chalk.red('❌ Docker Compose 不可用'));
    console.log(chalk.gray('   请确保 Docker Desktop 版本 >= 20.10'));
    return;
  }

  // Create compose file
  const useGlobal = options.global !== false;
  const composePath = ensureComposeFile(useGlobal);

  console.log(chalk.green(`\n✅ Docker Compose 配置已就绪`));
  console.log(chalk.gray(`   配置文件: ${composePath}`));
  console.log(chalk.gray('\n   启动服务: omp deps up'));
}

/**
 * Start all dependency services
 */
export async function depsUpCommand(options: DepsOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 启动依赖服务\n'));

  const useGlobal = options.global !== false;

  // Ensure compose file exists
  try {
    ensureComposeFile(useGlobal);
  } catch (e: any) {
    console.log(chalk.red(`❌ ${e.message}`));
    return;
  }

  const spinner = ora('启动 Docker Compose 服务...').start();

  try {
    // Pull images if requested
    if (options.pull) {
      spinner.text = '拉取最新镜像...';
      await runCompose(['pull'], useGlobal);
    }

    // Start services
    spinner.text = '启动服务...';
    const { code, stderr } = await runCompose(['up', '-d'], useGlobal);

    if (code !== 0) {
      throw new Error(stderr || '启动失败');
    }

    spinner.succeed('服务启动中...');

    // Wait for services to be healthy
    console.log(chalk.gray('\n等待服务就绪...'));

    const qdrantReady = await waitForService('http://localhost:6333/readyz', 30, 1000);
    console.log(qdrantReady ? chalk.green('  ✓ Qdrant 已就绪') : chalk.yellow('  ⚠ Qdrant 启动中...'));

    const ollamaReady = await waitForService('http://localhost:11434/api/tags', 30, 1000);
    console.log(ollamaReady ? chalk.green('  ✓ Ollama 已就绪') : chalk.yellow('  ⚠ Ollama 启动中...'));

    // Check BGE-M3 model
    if (ollamaReady) {
      console.log(chalk.gray('\n检查 BGE-M3 模型...'));
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json() as OllamaTagsResponse;
        const hasModel = data.models?.some((m) =>
          m.name === 'bge-m3' || m.name === 'bge-m3:latest' || m.name.startsWith('bge-m3:')
        );
        if (hasModel) {
          console.log(chalk.green('  ✓ BGE-M3 模型已就绪'));
        } else {
          console.log(chalk.yellow('  ⚠ BGE-M3 模型下载中 (首次启动需要几分钟)'));
          console.log(chalk.gray('    查看进度: omp deps logs bge-m3-init'));
        }
      } catch {
        console.log(chalk.yellow('  ⚠ 无法检查模型状态'));
      }
    }

    console.log(chalk.green('\n✅ 依赖服务已启动!'));
    console.log(chalk.gray('   查看状态: omp deps status'));
    console.log(chalk.gray('   查看日志: omp deps logs'));
  } catch (e: any) {
    spinner.fail('启动失败');
    console.log(chalk.red(`   ${e.message}`));
  }
}

/**
 * Stop all dependency services
 */
export async function depsDownCommand(options: DepsOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n🛑 停止依赖服务\n'));

  const useGlobal = options.global !== false;
  const spinner = ora('停止服务...').start();

  try {
    const { code, stderr } = await runCompose(['down'], useGlobal);

    if (code !== 0) {
      throw new Error(stderr || '停止失败');
    }

    spinner.succeed('服务已停止');
    console.log(chalk.gray('\n   数据已保留在 Docker volumes 中'));
    console.log(chalk.gray('   重新启动: omp deps up'));
  } catch (e: any) {
    spinner.fail('停止失败');
    console.log(chalk.red(`   ${e.message}`));
  }
}

/**
 * Show status of dependency services
 */
export async function depsStatusCommand(options: DepsOptions): Promise<void> {
  console.log(chalk.bold.cyan('\n📊 依赖服务状态\n'));

  const useGlobal = options.global !== false;

  try {
    const { code, stdout } = await runCompose(['ps', '--format', 'table'], useGlobal);

    if (code === 0 && stdout.trim()) {
      console.log(stdout);
    } else {
      console.log(chalk.yellow('没有运行中的服务'));
    }

    // Also check service health
    console.log(chalk.bold('\n服务健康检查:'));

    try {
      const qdrantRes = await fetch('http://localhost:6333/readyz');
      console.log(qdrantRes.ok ? chalk.green('  ✓ Qdrant: 健康') : chalk.yellow('  ⚠ Qdrant: 不健康'));
    } catch {
      console.log(chalk.red('  ✗ Qdrant: 未运行'));
    }

    try {
      const ollamaRes = await fetch('http://localhost:11434/api/tags');
      if (ollamaRes.ok) {
        const data = await ollamaRes.json() as OllamaTagsResponse;
        const hasModel = data.models?.some((m) =>
          m.name === 'bge-m3' || m.name === 'bge-m3:latest' || m.name.startsWith('bge-m3:')
        );
        console.log(chalk.green('  ✓ Ollama: 健康'));
        console.log(hasModel ? chalk.green('  ✓ BGE-M3: 已安装') : chalk.yellow('  ⚠ BGE-M3: 未安装'));
      } else {
        console.log(chalk.yellow('  ⚠ Ollama: 不健康'));
      }
    } catch {
      console.log(chalk.red('  ✗ Ollama: 未运行'));
    }
  } catch (e: any) {
    console.log(chalk.yellow('无法获取服务状态'));
    console.log(chalk.gray(`   ${e.message}`));
  }
}

/**
 * Show logs of dependency services
 */
export async function depsLogsCommand(service: string | undefined, options: DepsOptions & { follow?: boolean }): Promise<void> {
  const useGlobal = options.global !== false;
  const args = ['logs'];

  if (options.follow) {
    args.push('-f');
  }

  if (service) {
    args.push(service);
  }

  try {
    const { stdout, stderr } = await runCompose(args, useGlobal);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (e: any) {
    console.log(chalk.red(`无法获取日志: ${e.message}`));
  }
}

/**
 * Pull BGE-M3 model manually
 */
export async function depsPullModelCommand(): Promise<void> {
  console.log(chalk.bold.cyan('\n📥 下载 BGE-M3 模型\n'));

  // Check if Ollama is running
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error('Ollama 未响应');
    }
  } catch {
    console.log(chalk.red('❌ Ollama 未运行'));
    console.log(chalk.gray('   请先启动服务: omp deps up'));
    return;
  }

  const spinner = ora('下载 BGE-M3 模型 (约 1.2GB)...').start();

  try {
    const { code, stderr } = await safeExec('docker', [
      'exec', 'openmemory-ollama',
      'ollama', 'pull', 'bge-m3'
    ], { timeout: 30 * 60 * 1000 }); // 30 minutes

    if (code !== 0) {
      throw new Error(stderr || '下载失败');
    }

    spinner.succeed('BGE-M3 模型下载完成');
  } catch (e: any) {
    spinner.fail('下载失败');
    console.log(chalk.red(`   ${e.message}`));
    console.log(chalk.gray('\n   手动下载: docker exec openmemory-ollama ollama pull bge-m3'));
  }
}

