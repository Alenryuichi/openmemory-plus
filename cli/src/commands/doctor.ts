import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { checkAllDependencies, type SystemStatus } from '../lib/detector.js';
import { safeExec } from '../lib/platform.js';

interface DoctorOptions {
  fix?: boolean;
}

interface Issue {
  name: string;
  description: string;
  severity: 'error' | 'warning';
  fix?: () => Promise<boolean>;
}

function diagnoseIssues(status: SystemStatus): Issue[] {
  const issues: Issue[] = [];
  
  if (!status.docker.installed) {
    issues.push({
      name: 'Docker 未安装',
      description: '需要手动安装 Docker Desktop',
      severity: 'error',
    });
  } else if (!status.docker.running) {
    issues.push({
      name: 'Docker 守护进程未运行',
      description: '请启动 Docker Desktop 应用',
      severity: 'error',
      fix: async () => {
        console.log(chalk.yellow('  请手动启动 Docker Desktop'));
        return false;
      },
    });
  }
  
  if (!status.ollama.installed) {
    issues.push({
      name: 'Ollama 未安装',
      description: '使用 brew install ollama 安装',
      severity: 'error',
      fix: async () => {
        try {
          const { code } = await safeExec('brew', ['install', 'ollama']);
          return code === 0;
        } catch {
          return false;
        }
      },
    });
  } else if (!status.ollama.running) {
    issues.push({
      name: 'Ollama 服务未运行',
      description: '使用 ollama serve 启动',
      severity: 'warning',
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
    issues.push({
      name: 'Qdrant 未运行',
      description: '需要启动 Qdrant 容器',
      severity: 'error',
      fix: async () => {
        try {
          // Try to start existing container first
          const { code } = await safeExec('docker', ['start', 'qdrant']);
          if (code === 0) return true;
          // If no container exists, create one
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
    issues.push({
      name: 'BGE-M3 模型未下载',
      description: '使用 ollama pull bge-m3 下载',
      severity: 'warning',
      fix: async () => {
        try {
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
    return;
  }
  
  console.log(chalk.yellow.bold(`发现 ${issues.length} 个问题:\n`));
  
  for (const issue of issues) {
    const icon = issue.severity === 'error' ? chalk.red('✗') : chalk.yellow('⚠');
    console.log(`  ${icon} ${chalk.bold(issue.name)}`);
    console.log(`    ${chalk.gray(issue.description)}`);
  }
  
  console.log('');
  
  // Auto-fix if requested
  if (options.fix) {
    console.log(chalk.bold('尝试自动修复...\n'));
    
    for (const issue of issues) {
      if (issue.fix) {
        const fixSpinner = ora(`修复: ${issue.name}`).start();
        const success = await issue.fix();
        if (success) {
          fixSpinner.succeed(`已修复: ${issue.name}`);
        } else {
          fixSpinner.fail(`无法修复: ${issue.name}`);
        }
      }
    }
    
    console.log(chalk.gray('\n运行 ') + chalk.cyan('openmemory-plus status') + chalk.gray(' 验证修复结果'));
  } else {
    const fixable = issues.filter(i => i.fix).length;
    if (fixable > 0) {
      console.log(chalk.gray(`${fixable} 个问题可自动修复`));
      console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus doctor --fix') + chalk.gray(' 尝试修复'));
    }
  }
  
  console.log('');
}

