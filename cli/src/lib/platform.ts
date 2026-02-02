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
 * Fix F2: Added timeout support
 */
export async function safeExec(
  command: string,
  args: string[],
  options?: SpawnOptions & { timeout?: number }
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      shell: false,
    });

    let stdout = '';
    let stderr = '';

    // Fix F2: Add timeout support (default 60 seconds)
    const timeoutMs = options?.timeout ?? 60000;
    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, code: code ?? 0 });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Wait for a service to be available with polling
 * Fixes Issue #2: Ollama startup reliability
 * Fix F3: Added fetch timeout using AbortController
 */
export async function waitForService(
  url: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      // Fix F3: Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
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
 * Fix F1: Cross-platform port check (works on Windows too)
 */
export async function isPortInUse(port: number): Promise<boolean> {
  const platform = getPlatform();

  // Fix F1: Use platform-specific commands
  if (platform === 'win32') {
    try {
      const { code, stdout } = await safeExec('netstat', ['-ano'], { timeout: 5000 });
      if (code === 0 && stdout.includes(`:${port}`)) {
        return true;
      }
    } catch {
      // Fallback to fetch
    }
  } else {
    // macOS/Linux: use lsof
    try {
      const { code } = await safeExec('lsof', ['-i', `:${port}`, '-t'], { timeout: 5000 });
      if (code === 0) {
        return true;
      }
    } catch {
      // Fallback to fetch
    }
  }

  // Fallback: try to connect with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch(`http://localhost:${port}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}
