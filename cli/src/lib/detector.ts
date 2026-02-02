import { exec } from 'child_process';
import { promisify } from 'util';
import which from 'which';
import { safeExec, isPortInUse } from './platform.js';

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

async function getVersion(cmd: string, versionArgs: string[]): Promise<string | null> {
  try {
    const { stdout, code } = await safeExec(cmd, versionArgs);
    if (code !== 0) return null;
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
  const version = await getVersion('docker', ['--version']);

  // Check if Docker daemon is running using safeExec
  try {
    const { code } = await safeExec('docker', ['info']);
    if (code === 0) {
      return { name: 'Docker', installed: true, version: version || undefined, running: true };
    }
    return { name: 'Docker', installed: true, version: version || undefined, running: false, error: 'Docker 守护进程未运行' };
  } catch {
    return { name: 'Docker', installed: true, version: version || undefined, running: false, error: 'Docker 守护进程未运行' };
  }
}

export async function checkOllama(): Promise<DependencyStatus> {
  const path = await checkCommand('ollama');
  if (!path) {
    return { name: 'Ollama', installed: false, error: '未安装' };
  }
  const version = await getVersion('ollama', ['--version']);

  // Check if Ollama is running using fetch (no shell)
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      return { name: 'Ollama', installed: true, version: version || undefined, running: true };
    }
    return { name: 'Ollama', installed: true, version: version || undefined, running: false, error: 'Ollama 服务未运行' };
  } catch {
    return { name: 'Ollama', installed: true, version: version || undefined, running: false, error: 'Ollama 服务未运行' };
  }
}

export async function checkQdrant(): Promise<DependencyStatus> {
  // Fix Issue #4: Check port first, then check service
  const portInUse = await isPortInUse(6333);

  if (portInUse) {
    // Port is in use, check if it's Qdrant
    try {
      const response = await fetch('http://localhost:6333/collections');
      if (response.ok) {
        return { name: 'Qdrant', installed: true, running: true, version: 'container' };
      }
    } catch {
      // Port in use but not Qdrant
      return { name: 'Qdrant', installed: false, running: false, error: '端口 6333 被其他服务占用' };
    }
  }

  // Check if container exists but not running
  try {
    const { stdout, code } = await safeExec('docker', ['ps', '-a', '--filter', 'name=^qdrant$', '--format', '{{.Status}}']);
    if (code === 0 && stdout.trim()) {
      return { name: 'Qdrant', installed: true, running: false, error: '容器存在但未运行' };
    }
  } catch {
    // Docker not available
  }
  return { name: 'Qdrant', installed: false, error: '容器未创建' };
}

export async function checkOpenMemory(): Promise<DependencyStatus> {
  // Fix Issue #7: OpenMemory MCP is optional, just check if available
  try {
    const response = await fetch('http://localhost:8765/health');
    if (response.ok) {
      return { name: 'OpenMemory MCP', installed: true, running: true };
    }
  } catch {
    // Not running is OK - it's started on demand by IDE
  }
  return { name: 'OpenMemory MCP', installed: false, running: false, error: '按需启动 (可选)' };
}

export async function checkBgeM3(): Promise<DependencyStatus> {
  // Fix Issue #12: Use exact match for model name
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      return { name: 'BGE-M3', installed: false, error: 'Ollama 未运行，无法检测' };
    }
    const data = await response.json();
    // Exact match: model name should be exactly 'bge-m3' or 'bge-m3:latest'
    const hasModel = data.models?.some((m: any) =>
      m.name === 'bge-m3' || m.name === 'bge-m3:latest' || m.name.startsWith('bge-m3:')
    );
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
    status.docker.installed === true && status.docker.running === true &&
    status.ollama.installed === true && status.ollama.running === true &&
    status.qdrant.running === true &&
    status.bgeM3.installed === true
  );
}

