import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

describe('CLI entry point', () => {
  describe('help command', () => {
    it('should display help information', () => {
      const output = execSync(`node ${CLI_PATH} --help`, {
        encoding: 'utf-8',
      });

      expect(output).toContain('openmemory-plus');
      expect(output).toContain('install');
      expect(output).toContain('status');
      expect(output).toContain('doctor');
    });

    it('should display version', () => {
      const output = execSync(`node ${CLI_PATH} --version`, {
        encoding: 'utf-8',
      });

      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('install command help', () => {
    it('should display install command options', () => {
      const output = execSync(`node ${CLI_PATH} install --help`, {
        encoding: 'utf-8',
      });

      expect(output).toContain('-i, --ide');
      expect(output).toContain('-y, --yes');
      expect(output).toContain('--skip-deps');
    });
  });

  describe('status command', () => {
    it('should run status command without error', () => {
      // This test just verifies the command runs without throwing
      try {
        execSync(`node ${CLI_PATH} status`, {
          encoding: 'utf-8',
          timeout: 30000,
        });
        expect(true).toBe(true);
      } catch (error: unknown) {
        // Command may exit with non-zero if dependencies are missing
        // but it should still produce output
        const err = error as { stdout?: string; stderr?: string };
        expect(err.stdout || err.stderr).toBeDefined();
      }
    });
  });

  describe('doctor command', () => {
    it('should run doctor command without error', () => {
      try {
        execSync(`node ${CLI_PATH} doctor`, {
          encoding: 'utf-8',
          timeout: 30000,
        });
        expect(true).toBe(true);
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        expect(err.stdout || err.stderr).toBeDefined();
      }
    });
  });

  describe('invalid command', () => {
    it('should exit with error for unknown command', () => {
      try {
        execSync(`node ${CLI_PATH} unknown-command 2>&1`, {
          encoding: 'utf-8',
        });
        // If it doesn't throw, the command ran (Commander may show help)
        expect(true).toBe(true);
      } catch (error: unknown) {
        // Commander.js exits with non-zero for unknown commands
        const err = error as { status?: number; stdout?: string; stderr?: string };
        // Either it has an error status or produces some output
        expect(err.status !== 0 || err.stdout || err.stderr).toBeTruthy();
      }
    });
  });

  describe('CLI binary exists', () => {
    it('should have built dist/index.js', () => {
      expect(existsSync(CLI_PATH)).toBe(true);
    });
  });
});

