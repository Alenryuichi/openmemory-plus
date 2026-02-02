import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import { getComposeFilePath, getComposeDir, ensureComposeFile, checkDockerCompose } from '../src/commands/deps.js';

// Mock modules
vi.mock('../src/lib/platform.js', () => ({
  safeExec: vi.fn(),
  waitForService: vi.fn(),
  getPlatform: vi.fn(() => 'darwin'),
}));

vi.mock('../src/lib/detector.js', () => ({
  checkDocker: vi.fn(),
}));

describe('deps', () => {
  describe('getComposeFilePath', () => {
    it('should return global path by default', () => {
      const path = getComposeFilePath();
      expect(path).toBe(join(homedir(), '.openmemory-plus', 'docker-compose.yml'));
    });

    it('should return global path when useGlobal is true', () => {
      const path = getComposeFilePath(true);
      expect(path).toBe(join(homedir(), '.openmemory-plus', 'docker-compose.yml'));
    });

    it('should return local path when useGlobal is false', () => {
      const path = getComposeFilePath(false);
      expect(path).toBe(join(process.cwd(), 'docker-compose.yml'));
    });
  });

  describe('getComposeDir', () => {
    it('should return global directory by default', () => {
      const dir = getComposeDir();
      expect(dir).toBe(join(homedir(), '.openmemory-plus'));
    });

    it('should return global directory when useGlobal is true', () => {
      const dir = getComposeDir(true);
      expect(dir).toBe(join(homedir(), '.openmemory-plus'));
    });

    it('should return current directory when useGlobal is false', () => {
      const dir = getComposeDir(false);
      expect(dir).toBe(process.cwd());
    });
  });

  describe('checkDockerCompose', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return true when docker compose v2 is available', async () => {
      const { safeExec } = await import('../src/lib/platform.js');
      vi.mocked(safeExec).mockResolvedValueOnce({ code: 0, stdout: 'Docker Compose version v2.x', stderr: '' });

      const result = await checkDockerCompose();
      expect(result).toBe(true);
      expect(safeExec).toHaveBeenCalledWith('docker', ['compose', 'version'], { timeout: 5000 });
    });

    it('should fallback to docker-compose v1 if v2 fails', async () => {
      const { safeExec } = await import('../src/lib/platform.js');
      vi.mocked(safeExec)
        .mockRejectedValueOnce(new Error('not found'))
        .mockResolvedValueOnce({ code: 0, stdout: 'docker-compose version 1.x', stderr: '' });

      const result = await checkDockerCompose();
      expect(result).toBe(true);
      expect(safeExec).toHaveBeenCalledTimes(2);
    });

    it('should return false when neither docker compose is available', async () => {
      const { safeExec } = await import('../src/lib/platform.js');
      vi.mocked(safeExec)
        .mockRejectedValueOnce(new Error('not found'))
        .mockRejectedValueOnce(new Error('not found'));

      const result = await checkDockerCompose();
      expect(result).toBe(false);
    });
  });

  describe('ensureComposeFile', () => {
    const testDir = join(tmpdir(), 'omp-test-deps');
    const originalCwd = process.cwd();

    beforeEach(() => {
      // Clean up test directory
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true });
      }
      mkdirSync(testDir, { recursive: true });
      process.chdir(testDir);
    });

    afterEach(() => {
      process.chdir(originalCwd);
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true });
      }
    });

    it('should create docker-compose.yml in local directory when useGlobal is false', () => {
      // Suppress console.log output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const composePath = ensureComposeFile(false);

      expect(existsSync(composePath)).toBe(true);
      // Use endsWith to handle macOS /private/var vs /var symlink issue
      expect(composePath.endsWith('docker-compose.yml')).toBe(true);
      expect(composePath).toContain('omp-test-deps');

      // Verify content is valid YAML with expected services
      const content = readFileSync(composePath, 'utf-8');
      expect(content).toContain('qdrant');
      expect(content).toContain('ollama');
      expect(content).toContain('bge-m3-init');

      consoleSpy.mockRestore();
    });

    it('should not overwrite existing docker-compose.yml', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Create first time
      const composePath1 = ensureComposeFile(false);
      const content1 = readFileSync(composePath1, 'utf-8');

      // Create second time - should not change
      const composePath2 = ensureComposeFile(false);
      const content2 = readFileSync(composePath2, 'utf-8');

      expect(composePath1).toBe(composePath2);
      expect(content1).toBe(content2);

      consoleSpy.mockRestore();
    });
  });
});

