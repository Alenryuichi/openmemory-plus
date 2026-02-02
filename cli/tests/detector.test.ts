import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isSystemReady, type SystemStatus } from '../src/lib/detector.js';

describe('detector', () => {
  describe('isSystemReady', () => {
    it('should return true when all dependencies are ready', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      expect(isSystemReady(status)).toBe(true);
    });

    it('should return false when docker is not installed', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: false },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      expect(isSystemReady(status)).toBe(false);
    });

    it('should return false when docker is not running', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: false },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      expect(isSystemReady(status)).toBe(false);
    });

    it('should return false when ollama is not running', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: false },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      expect(isSystemReady(status)).toBe(false);
    });

    it('should return false when qdrant is not running', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: false },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: true },
      };

      expect(isSystemReady(status)).toBe(false);
    });

    it('should return false when bge-m3 is not installed', () => {
      const status: SystemStatus = {
        docker: { name: 'Docker', installed: true, running: true },
        ollama: { name: 'Ollama', installed: true, running: true },
        qdrant: { name: 'Qdrant', installed: true, running: true },
        openmemory: { name: 'OpenMemory', installed: true, running: true },
        bgeM3: { name: 'BGE-M3', installed: false },
      };

      expect(isSystemReady(status)).toBe(false);
    });
  });
});

