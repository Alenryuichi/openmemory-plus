import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkAllDependencies, isSystemReady, type SystemStatus } from '../lib/detector.js';

const execAsync = promisify(exec);

interface InstallOptions {
  yes?: boolean;
  skipDocker?: boolean;
  skipOllama?: boolean;
}

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
    console.log(chalk.yellow('请手动安装: https://ollama.com/download'));
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
    if (e.message?.includes('already in use')) {
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

export async function installCommand(options: InstallOptions): Promise<void> {
  console.log(chalk.cyan.bold('\n🧠 OpenMemory Plus - 安装向导\n'));
  
  const spinner = ora('检测系统依赖...').start();
  const status = await checkAllDependencies();
  spinner.stop();
  
  // Show current status
  console.log(chalk.bold('当前状态:'));
  console.log(`  🐳 Docker:      ${status.docker.installed ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`  🦙 Ollama:      ${status.ollama.installed ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`  📦 Qdrant:      ${status.qdrant.running ? chalk.green('✓') : chalk.red('✗')}`);
  console.log(`  🔤 BGE-M3:      ${status.bgeM3.installed ? chalk.green('✓') : chalk.red('✗')}`);
  console.log('');
  
  if (isSystemReady(status)) {
    console.log(chalk.green.bold('✅ 所有依赖已就绪! 无需安装。\n'));
    console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus init') + chalk.gray(' 初始化项目'));
    return;
  }
  
  // Confirm installation
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '需要安装缺失的依赖，是否继续?',
      default: true,
    }]);
    if (!confirm) {
      console.log(chalk.yellow('已取消安装'));
      return;
    }
  }
  
  // Install Docker (manual)
  if (!status.docker.installed && !options.skipDocker) {
    console.log(chalk.yellow('\n📦 Docker 需要手动安装'));
    console.log(chalk.gray('   请访问 https://docker.com/download 下载安装'));
    const { openDocker } = await inquirer.prompt([{
      type: 'confirm', name: 'openDocker', message: '是否打开 Docker 下载页面?', default: true,
    }]);
    if (openDocker) await openUrl('https://docker.com/download');
    
    await inquirer.prompt([{ type: 'input', name: 'wait', message: '安装完成后按 Enter 继续...' }]);
  }
  
  // Install Ollama
  if (!status.ollama.installed && !options.skipOllama) {
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
  if (!status.qdrant.running && status.docker.running) {
    await startQdrant();
  }
  
  console.log(chalk.green.bold('\n✅ 安装完成!\n'));
  console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus status') + chalk.gray(' 验证状态'));
  console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus init') + chalk.gray(' 初始化项目\n'));
}

