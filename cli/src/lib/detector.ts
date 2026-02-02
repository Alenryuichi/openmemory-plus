import { exec } from 'child_process';
import { promisify } from 'util';
import which from 'which';

const execAsync = promisify(exec);

export interface DependencyStatus {
  name: string;
  installed: boolean;
  version?: string;
  running?: boolean;
  error?: string;
}

export interface SystemStatus {
  docker: DependencyStatus;
  ollama: DependencyStatus;
  qdrant: DependencyStatus;
  openmemory: DependencyStatus;
  bgeM3: DependencyStatus;
}

async function checkCommand(cmd: string): Promise<string | null> {
  try {
    return await which(cmd);
  } catch {
    return null;
  }
}

async function getVersion(cmd: string, args: string = '--version'): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`${cmd} ${args}`);
    return stdout.trim().split('\n')[0];
  } catch {
    return null;
  }
}

export async function checkDocker(): Promise<DependencyStatus> {
  const path = await checkCommand('docker');
  if (!path) {
    return { name: 'Docker', installed: false, error: '未安装' };
  }
  const version = await getVersion('docker', '--version');
  
  // Check if Docker daemon is running
  try {
    await execAsync('docker info');
    return { name: 'Docker', installed: true, version: version || undefined, running: true };
  } catch {
    return { name: 'Docker', installed: true, version: version || undefined, running: false, error: 'Docker 守护进程未运行' };
  }
}

export async function checkOllama(): Promise<DependencyStatus> {
  const path = await checkCommand('ollama');
  if (!path) {
    return { name: 'Ollama', installed: false, error: '未安装' };
  }
  const version = await getVersion('ollama', '--version');
  
  // Check if Ollama is running
  try {
    await execAsync('curl -s http://localhost:11434/api/tags');
    return { name: 'Ollama', installed: true, version: version || undefined, running: true };
  } catch {
    return { name: 'Ollama', installed: true, version: version || undefined, running: false, error: 'Ollama 服务未运行' };
  }
}

export async function checkQdrant(): Promise<DependencyStatus> {
  try {
    const { stdout } = await execAsync('curl -s http://localhost:6333/collections');
    const data = JSON.parse(stdout);
    return { name: 'Qdrant', installed: true, running: true, version: 'container' };
  } catch {
    // Check if container exists but not running
    try {
      const { stdout } = await execAsync('docker ps -a --filter name=qdrant --format "{{.Status}}"');
      if (stdout.trim()) {
        return { name: 'Qdrant', installed: true, running: false, error: '容器存在但未运行' };
      }
    } catch {}
    return { name: 'Qdrant', installed: false, error: '容器未创建' };
  }
}

export async function checkOpenMemory(): Promise<DependencyStatus> {
  try {
    // Check if OpenMemory MCP is responding (typical port 8765)
    await execAsync('curl -s http://localhost:8765/health || curl -s http://localhost:8765');
    return { name: 'OpenMemory MCP', installed: true, running: true };
  } catch {
    return { name: 'OpenMemory MCP', installed: false, running: false, error: '服务未运行' };
  }
}

export async function checkBgeM3(): Promise<DependencyStatus> {
  try {
    const { stdout } = await execAsync('curl -s http://localhost:11434/api/tags');
    const data = JSON.parse(stdout);
    const hasModel = data.models?.some((m: any) => m.name.includes('bge-m3'));
    if (hasModel) {
      return { name: 'BGE-M3', installed: true, running: true };
    }
    return { name: 'BGE-M3', installed: false, error: '模型未下载' };
  } catch {
    return { name: 'BGE-M3', installed: false, error: 'Ollama 未运行，无法检测' };
  }
}

export async function checkAllDependencies(): Promise<SystemStatus> {
  const [docker, ollama, qdrant, openmemory, bgeM3] = await Promise.all([
    checkDocker(),
    checkOllama(),
    checkQdrant(),
    checkOpenMemory(),
    checkBgeM3(),
  ]);
  return { docker, ollama, qdrant, openmemory, bgeM3 };
}

export function isSystemReady(status: SystemStatus): boolean {
  return (
    status.docker.installed && status.docker.running &&
    status.ollama.installed && status.ollama.running &&
    status.qdrant.running &&
    status.bgeM3.installed
  );
}

