import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { platform } from 'os';
import { checkAllDependencies, type SystemStatus } from '../lib/detector.js';
import { safeExec } from '../lib/platform.js';

interface DoctorOptions {
  fix?: boolean;
  verbose?: boolean;
}

interface Issue {
  name: string;
  description: string;
  severity: 'error' | 'warning';
  solution: string[];
  docLink?: string;
  fix?: () => Promise<boolean>;
}

const TROUBLESHOOTING_URL = 'https://github.com/Alenryuichi/openmemory-plus/blob/main/docs/troubleshooting.md';

function getPlatformHint(): { os: string; installCmd: string } {
  const os = platform();
  if (os === 'darwin') {
    return { os: 'macOS', installCmd: 'brew install' };
  } else if (os === 'win32') {
    return { os: 'Windows', installCmd: 'winget install' };
  }
  return { os: 'Linux', installCmd: 'curl -fsSL https://ollama.com/install.sh | sh' };
}

function diagnoseIssues(status: SystemStatus): Issue[] {
  const issues: Issue[] = [];
  const { os, installCmd } = getPlatformHint();

  if (!status.docker.installed) {
    issues.push({
      name: 'Docker 未安装',
      description: 'Docker 是运行 Qdrant 向量数据库的必要依赖',
      severity: 'error',
      solution: [
        '1. 下载 Docker Desktop: https://www.docker.com/products/docker-desktop/',
        '2. 安装并启动 Docker Desktop',
        '3. 重新运行 openmemory-plus install',
      ],
      docLink: `${TROUBLESHOOTING_URL}#-docker-未安装`,
    });
  } else if (!status.docker.running) {
    issues.push({
      name: 'Docker 守护进程未运行',
      description: 'Docker 已安装但未启动',
      severity: 'error',
      solution: os === 'darwin'
        ? ['运行: open -a Docker', '等待 Docker 图标显示 "Running"']
        : ['启动 Docker Desktop 应用', '等待 Docker 完全启动'],
      docLink: `${TROUBLESHOOTING_URL}#-docker-守护进程未运行`,
      fix: async () => {
        if (os === 'darwin') {
          try {
            exec('open -a Docker');
            console.log(chalk.yellow('  正在启动 Docker Desktop，请等待...'));
            await new Promise(r => setTimeout(r, 5000));
            return true;
          } catch {
            return false;
          }
        }
        console.log(chalk.yellow('  请手动启动 Docker Desktop'));
        return false;
      },
    });
  }

  if (!status.ollama.installed) {
    issues.push({
      name: 'Ollama 未安装',
      description: 'Ollama 用于运行 BGE-M3 embedding 模型',
      severity: 'error',
      solution: os === 'darwin'
        ? ['运行: brew install ollama']
        : os === 'win32'
          ? ['下载: https://ollama.com/download']
          : ['运行: curl -fsSL https://ollama.com/install.sh | sh'],
      docLink: `${TROUBLESHOOTING_URL}#-ollama-未安装`,
      fix: async () => {
        if (os === 'darwin') {
          try {
            const { code } = await safeExec('brew', ['install', 'ollama']);
            return code === 0;
          } catch {
            return false;
          }
        }
        return false;
      },
    });
  } else if (!status.ollama.running) {
    issues.push({
      name: 'Ollama 服务未运行',
      description: '无法连接 localhost:11434',
      severity: 'warning',
      solution: ['运行: ollama serve', '或后台运行: ollama serve &'],
      docLink: `${TROUBLESHOOTING_URL}#-ollama-服务未运行`,
      fix: async () => {
        try {
          exec('ollama serve &');
          await new Promise(r => setTimeout(r, 2000));
          return true;
        } catch {
          return false;
        }
      },
    });
  }

  if (!status.qdrant.running) {
    const portError = status.qdrant.error?.includes('端口');
    issues.push({
      name: portError ? '端口 6333 被占用' : 'Qdrant 未运行',
      description: portError
        ? '端口 6333 被其他服务占用，无法启动 Qdrant'
        : '无法连接 localhost:6333',
      severity: 'error',
      solution: portError
        ? ['运行: lsof -i :6333 查看占用进程', '停止占用进程或使用其他端口']
        : ['运行: docker compose up -d', '或: docker run -d --name qdrant -p 6333:6333 qdrant/qdrant'],
      docLink: `${TROUBLESHOOTING_URL}#-qdrant-未运行`,
      fix: portError ? undefined : async () => {
        try {
          const { code } = await safeExec('docker', ['start', 'qdrant']);
          if (code === 0) return true;
          const { code: runCode } = await safeExec('docker', [
            'run', '-d', '--name', 'qdrant',
            '-p', '6333:6333', '-p', '6334:6334',
            'qdrant/qdrant'
          ]);
          return runCode === 0;
        } catch {
          return false;
        }
      },
    });
  }

  if (!status.bgeM3.installed) {
    const ollamaNotRunning = status.bgeM3.error?.includes('Ollama 未运行');
    issues.push({
      name: 'BGE-M3 模型未下载',
      description: ollamaNotRunning
        ? '需要先启动 Ollama 才能检测模型'
        : 'BGE-M3 是记忆向量化的核心模型 (~1.2GB)',
      severity: 'warning',
      solution: ollamaNotRunning
        ? ['先解决 Ollama 服务未运行的问题', '然后运行: ollama pull bge-m3']
        : ['运行: ollama pull bge-m3', '首次下载约 1.2GB，请耐心等待'],
      docLink: `${TROUBLESHOOTING_URL}#-bge-m3-模型未下载`,
      fix: ollamaNotRunning ? undefined : async () => {
        try {
          console.log(chalk.yellow('  正在下载 BGE-M3 (~1.2GB)，请耐心等待...'));
          const { code } = await safeExec('ollama', ['pull', 'bge-m3'], { timeout: 600000 });
          return code === 0;
        } catch {
          return false;
        }
      },
    });
  }

  return issues;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  console.log(chalk.cyan.bold('\n🩺 OpenMemory Plus - 问题诊断\n'));

  const spinner = ora('检测系统状态...').start();
  const status = await checkAllDependencies();
  spinner.stop();

  const issues = diagnoseIssues(status);

  if (issues.length === 0) {
    console.log(chalk.green.bold('✅ 未发现问题，系统运行正常!\n'));
    printSystemSummary(status);
    return;
  }

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  console.log(chalk.yellow.bold(`发现 ${issues.length} 个问题:`));
  if (errors.length > 0) console.log(chalk.red(`  ${errors.length} 个错误`));
  if (warnings.length > 0) console.log(chalk.yellow(`  ${warnings.length} 个警告`));
  console.log('');

  for (const issue of issues) {
    const icon = issue.severity === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
    console.log(`${icon} ${chalk.bold(issue.name)}`);
    console.log(`  ${chalk.gray(issue.description)}`);

    // Show solutions
    if (options.verbose || !options.fix) {
      console.log(chalk.cyan('  解决方案:'));
      issue.solution.forEach(step => {
        console.log(chalk.white(`    ${step}`));
      });
      if (issue.docLink) {
        console.log(chalk.gray(`    📖 详细文档: ${issue.docLink}`));
      }
    }
    console.log('');
  }

  // Auto-fix if requested
  if (options.fix) {
    console.log(chalk.bold('🔧 尝试自动修复...\n'));

    let fixed = 0;
    let failed = 0;

    for (const issue of issues) {
      if (issue.fix) {
        const fixSpinner = ora(`修复: ${issue.name}`).start();
        try {
          const success = await issue.fix();
          if (success) {
            fixSpinner.succeed(`已修复: ${issue.name}`);
            fixed++;
          } else {
            fixSpinner.fail(`无法修复: ${issue.name}`);
            failed++;
            // Show solution for failed fixes
            console.log(chalk.cyan('    手动解决:'));
            issue.solution.forEach(step => {
              console.log(chalk.white(`      ${step}`));
            });
          }
        } catch (e: any) {
          fixSpinner.fail(`修复失败: ${issue.name}`);
          console.log(chalk.gray(`    错误: ${e.message || '未知错误'}`));
          failed++;
        }
      } else {
        console.log(chalk.gray(`⏭  跳过: ${issue.name} (需手动修复)`));
        issue.solution.forEach(step => {
          console.log(chalk.white(`    ${step}`));
        });
      }
    }

    console.log('');
    if (fixed > 0) console.log(chalk.green(`✅ 成功修复 ${fixed} 个问题`));
    if (failed > 0) console.log(chalk.yellow(`⚠  ${failed} 个问题需手动处理`));
    console.log(chalk.gray('\n运行 ') + chalk.cyan('openmemory-plus status') + chalk.gray(' 验证修复结果'));
  } else {
    const fixable = issues.filter(i => i.fix).length;
    if (fixable > 0) {
      console.log(chalk.gray('━'.repeat(50)));
      console.log(chalk.green(`💡 ${fixable} 个问题可自动修复`));
      console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus doctor --fix') + chalk.gray(' 尝试修复'));
    }
    console.log(chalk.gray('\n📖 完整故障排查指南: ') + chalk.underline(TROUBLESHOOTING_URL));
  }

  console.log('');
}

function printSystemSummary(status: SystemStatus): void {
  console.log(chalk.gray('系统状态:'));
  console.log(`  Docker: ${status.docker.running ? chalk.green('✓ 运行中') : chalk.red('✗')}`);
  console.log(`  Ollama: ${status.ollama.running ? chalk.green('✓ 运行中') : chalk.red('✗')}`);
  console.log(`  Qdrant: ${status.qdrant.running ? chalk.green('✓ 运行中') : chalk.red('✗')}`);
  console.log(`  BGE-M3: ${status.bgeM3.installed ? chalk.green('✓ 已安装') : chalk.red('✗')}`);
  console.log('');
}

