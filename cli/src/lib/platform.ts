/**
 * Platform detection and cross-platform utilities
 * Fixes Issue #1: Platform compatibility
 */

import { exec, spawn, SpawnOptions } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type Platform = 'darwin' | 'linux' | 'win32' | 'unknown';

export function getPlatform(): Platform {
  const p = process.platform;
  if (p === 'darwin' || p === 'linux' || p === 'win32') {
    return p;
  }
  return 'unknown';
}

export function isTTY(): boolean {
  return process.stdout.isTTY === true && process.stdin.isTTY === true;
}

export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.JENKINS_URL ||
    process.env.TRAVIS
  );
}

/**
 * Get the command to install Ollama based on platform
 */
export function getOllamaInstallCommand(): { command: string; args: string[]; manual?: string } {
  const platform = getPlatform();
  switch (platform) {
    case 'darwin':
      return { command: 'brew', args: ['install', 'ollama'] };
    case 'linux':
      return {
        command: 'sh',
        args: ['-c', 'curl -fsSL https://ollama.com/install.sh | sh'],
        manual: 'curl -fsSL https://ollama.com/install.sh | sh',
      };
    case 'win32':
      return {
        command: 'winget',
        args: ['install', 'Ollama.Ollama'],
        manual: 'https://ollama.com/download/windows',
      };
    default:
      return { command: '', args: [], manual: 'https://ollama.com/download' };
  }
}

/**
 * Get the command to open a URL based on platform
 */
export function getOpenUrlCommand(): string {
  const platform = getPlatform();
  switch (platform) {
    case 'darwin':
      return 'open';
    case 'linux':
      return 'xdg-open';
    case 'win32':
      return 'start';
    default:
      return 'open';
  }
}

/**
 * Safe command execution using spawn with args array (prevents command injection)
 * Fixes Issue #10: Security - command injection
 */
export async function safeExec(
  command: string,
  args: string[],
  options?: SpawnOptions
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Wait for a service to be available with polling
 * Fixes Issue #2: Ollama startup reliability
 */
export async function waitForService(
  url: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return true;
      }
    } catch {
      // Service not ready yet
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

/**
 * Check if a port is in use
 * Fixes Issue #4: Qdrant race condition - port check
 */
export async function isPortInUse(port: number): Promise<boolean> {
  try {
    const { code } = await safeExec('lsof', ['-i', `:${port}`, '-t']);
    return code === 0;
  } catch {
    // Fallback: try to connect
    try {
      await fetch(`http://localhost:${port}`);
      return true;
    } catch {
      return false;
    }
  }
}

