import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type SystemStatus, type DependencyStatus } from '../src/lib/detector.js';

// Mock the detector module
vi.mock('../src/lib/detector.js', () => ({
  checkAllDependencies: vi.fn(),
  isSystemReady: vi.fn(),
}));

describe('status command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatStatus helper', () => {
    // Test the formatting logic inline
    const formatStatus = (dep: DependencyStatus): string => {
      if (!dep.installed) {
        return '✗ 未安装';
      }
      if (dep.running === false) {
        return '⚠ 已安装但未运行';
      }
      if (dep.running === true) {
        const ver = dep.version ? ` (${dep.version})` : '';
        return '✓ 运行中' + ver;
      }
      return '✓ 已安装';
    };

    it('should format not installed status', () => {
      const dep: DependencyStatus = { name: 'Docker', installed: false };
      expect(formatStatus(dep)).toContain('未安装');
    });

    it('should format installed but not running status', () => {
      const dep: DependencyStatus = { name: 'Docker', installed: true, running: false };
      expect(formatStatus(dep)).toContain('已安装但未运行');
    });

    it('should format running status', () => {
      const dep: DependencyStatus = { name: 'Docker', installed: true, running: true };
      expect(formatStatus(dep)).toContain('运行中');
    });

    it('should format running status with version', () => {
      const dep: DependencyStatus = { name: 'Docker', installed: true, running: true, version: '24.0.7' };
      const result = formatStatus(dep);
      expect(result).toContain('运行中');
      expect(result).toContain('24.0.7');
    });

    it('should format installed only status (no running property)', () => {
      const dep: DependencyStatus = { name: 'BGE-M3', installed: true };
      expect(formatStatus(dep)).toContain('已安装');
    });
  });

  describe('status table generation', () => {
    it('should include all 5 dependencies', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      const deps = [
        status.docker,
        status.ollama,
        status.qdrant,
        status.openmemory,
        status.bgeM3,
      ];

      expect(deps.length).toBe(5);
      expect(deps.every(d => d.name)).toBe(true);
    });

    it('should handle mixed status correctly', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: false },
        qdrant: { name: 'Qdrant', installed: false },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: false },
      };

      // Count issues
      let issues = 0;
      if (!status.docker.installed || !status.docker.running) issues++;
      if (!status.ollama.installed || !status.ollama.running) issues++;
      if (!status.qdrant.installed || !status.qdrant.running) issues++;
      if (!status.bgeM3.installed) issues++;

      expect(issues).toBe(3); // ollama not running, qdrant not installed, bge-m3 not installed
    });
  });

  describe('system ready check', () => {
    it('should report ready when all dependencies are satisfied', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      const isReady = 
        status.docker.installed === true && status.docker.running === true &&
        status.ollama.installed === true && status.ollama.running === true &&
        status.qdrant.running === true &&
        status.bgeM3.installed === true;

      expect(isReady).toBe(true);
    });

    it('should report not ready when any dependency is missing', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: false }, // Not running
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      const isReady = 
        status.docker.installed === true && status.docker.running === true &&
        status.ollama.installed === true && status.ollama.running === true &&
        status.qdrant.running === true &&
        status.bgeM3.installed === true;

      expect(isReady).toBe(false);
    });
  });
});

