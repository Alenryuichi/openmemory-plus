import chalk from 'chalk';
import ora from 'ora';
import { checkAllDependencies, isSystemReady, type SystemStatus, type DependencyStatus } from '../lib/detector.js';

function formatStatus(dep: DependencyStatus): string {
  if (!dep.installed) {
    return chalk.red('✗ 未安装');
  }
  if (dep.running === false) {
    return chalk.yellow('⚠ 已安装但未运行');
  }
  if (dep.running === true) {
    const ver = dep.version ? chalk.gray(` (${dep.version})`) : '';
    return chalk.green('✓ 运行中') + ver;
  }
  return chalk.green('✓ 已安装');
}

function printStatusTable(status: SystemStatus): void {
  console.log('\n' + chalk.bold('依赖检测结果:'));
  console.log('');
  
  const deps = [
    { ...status.docker, icon: '🐳' },
    { ...status.ollama, icon: '🦙' },
    { ...status.qdrant, icon: '📦' },
    { ...status.openmemory, icon: '🧠' },
    { ...status.bgeM3, icon: '🔤' },
  ];
  
  for (const dep of deps) {
    const statusStr = formatStatus(dep);
    const errorStr = dep.error && !dep.installed ? chalk.gray(` - ${dep.error}`) : '';
    console.log(`  ${dep.icon} ${dep.name.padEnd(16)} ${statusStr}${errorStr}`);
  }
  console.log('');
}

export async function statusCommand(): Promise<void> {
  console.log(chalk.cyan.bold('\n🧠 OpenMemory Plus - 系统状态\n'));
  
  const spinner = ora('检测系统依赖...').start();
  
  try {
    const status = await checkAllDependencies();
    spinner.stop();
    
    printStatusTable(status);
    
    if (isSystemReady(status)) {
      console.log(chalk.green.bold('✅ 系统就绪! OpenMemory Plus 可正常使用。\n'));
      console.log(chalk.gray('提示: 使用 /memory 命令查看记忆状态'));
    } else {
      console.log(chalk.yellow.bold('⚠️ 系统未就绪，部分依赖缺失或未运行。\n'));
      console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus install') + chalk.gray(' 安装缺失依赖'));
      console.log(chalk.gray('运行 ') + chalk.cyan('openmemory-plus doctor') + chalk.gray(' 诊断并修复问题'));
    }
  } catch (error) {
    spinner.fail('检测失败');
    console.error(chalk.red('错误:'), error);
    process.exit(1);
  }
}

