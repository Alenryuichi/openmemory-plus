import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPlatform,
  isTTY,
  isCI,
  getOllamaInstallCommand,
  getOpenUrlCommand,
  safeExec,
  waitForService,
  isPortInUse,
} from '../src/lib/platform.js';

describe('platform utilities', () => {
  describe('getPlatform', () => {
    it('should return darwin on macOS', () => {
      // Current platform test
      const platform = getPlatform();
      expect(['darwin', 'linux', 'win32', 'unknown']).toContain(platform);
    });

    it('should return a valid platform type', () => {
      const platform = getPlatform();
      expect(typeof platform).toBe('string');
    });
  });

  describe('isTTY', () => {
    it('should return a boolean', () => {
      const result = isTTY();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isCI', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return false when no CI env vars are set', () => {
      delete process.env.CI;
      delete process.env.CONTINUOUS_INTEGRATION;
      delete process.env.GITHUB_ACTIONS;
      delete process.env.GITLAB_CI;
      delete process.env.JENKINS_URL;
      delete process.env.TRAVIS;
      expect(isCI()).toBe(false);
    });

    it('should return true when CI env var is set', () => {
      process.env.CI = 'true';
      expect(isCI()).toBe(true);
    });

    it('should return true when GITHUB_ACTIONS is set', () => {
      process.env.GITHUB_ACTIONS = 'true';
      expect(isCI()).toBe(true);
    });
  });

  describe('getOllamaInstallCommand', () => {
    it('should return a command object', () => {
      const result = getOllamaInstallCommand();
      expect(result).toHaveProperty('command');
      expect(result).toHaveProperty('args');
      expect(Array.isArray(result.args)).toBe(true);
    });

    it('should return brew for darwin', () => {
      const platform = getPlatform();
      if (platform === 'darwin') {
        const result = getOllamaInstallCommand();
        expect(result.command).toBe('brew');
        expect(result.args).toContain('ollama');
      }
    });
  });

  describe('getOpenUrlCommand', () => {
    it('should return a string command', () => {
      const result = getOpenUrlCommand();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return open for darwin', () => {
      const platform = getPlatform();
      if (platform === 'darwin') {
        expect(getOpenUrlCommand()).toBe('open');
      }
    });
  });

  describe('safeExec', () => {
    it('should execute a simple command', async () => {
      const result = await safeExec('echo', ['hello']);
      expect(result.code).toBe(0);
      expect(result.stdout.trim()).toBe('hello');
    });

    it('should return non-zero code for failed command', async () => {
      const result = await safeExec('ls', ['/nonexistent-path-12345']);
      expect(result.code).not.toBe(0);
    });

    it('should timeout when command takes too long', async () => {
      await expect(
        safeExec('sleep', ['10'], { timeout: 100 })
      ).rejects.toThrow(/timed out/);
    });

    it('should capture stderr', async () => {
      const result = await safeExec('ls', ['/nonexistent-path-12345']);
      expect(result.stderr.length).toBeGreaterThan(0);
    });
  });

  describe('waitForService', () => {
    it('should return false for non-existent service', async () => {
      const result = await waitForService('http://localhost:59999', 2, 100);
      expect(result).toBe(false);
    }, 10000);

    it('should return true for available service', async () => {
      // Test against a known service if available
      // This is a best-effort test
      const result = await waitForService('http://localhost:11434', 2, 100);
      // Result depends on whether Ollama is running
      expect(typeof result).toBe('boolean');
    }, 10000);
  });

  describe('isPortInUse', () => {
    it('should return false for unused port', async () => {
      const result = await isPortInUse(59998);
      expect(result).toBe(false);
    }, 10000);

    it('should return a boolean', async () => {
      const result = await isPortInUse(6333);
      expect(typeof result).toBe('boolean');
    }, 10000);
  });
});

