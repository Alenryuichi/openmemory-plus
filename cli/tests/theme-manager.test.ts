import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, cosineSim, computeCentroid } from '../src/lib/memory/theme-manager.js';
import { createMockFs } from '../src/lib/memory/filesystem.js';
import { SemanticMemory, DEFAULT_THEME_CONFIG } from '../src/lib/memory/xmemory-types.js';
import { randomUUID } from 'crypto';

// ============ Test Helpers ============

function createSemanticMemory(overrides: Partial<SemanticMemory> = {}): SemanticMemory {
  return {
    memoryId: randomUUID(),
    content: 'Test semantic memory content',
    embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
    sourceEpisodes: [],
    importance: 0.5,
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    ...overrides,
  };
}

// ============ Pure Function Tests ============

describe('Vector Math Utilities', () => {
  describe('cosineSim', () => {
    it('should return 1 for identical vectors', () => {
      const v = [1, 2, 3];
      expect(cosineSim(v, v)).toBeCloseTo(1.0);
    });

    it('should return 0 for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      expect(cosineSim(v1, v2)).toBeCloseTo(0);
    });

    it('should return -1 for opposite vectors', () => {
      const v1 = [1, 2, 3];
      const v2 = [-1, -2, -3];
      expect(cosineSim(v1, v2)).toBeCloseTo(-1.0);
    });

    it('should return 0 for empty vectors', () => {
      expect(cosineSim([], [])).toBe(0);
    });

    it('should return 0 for zero vectors', () => {
      const v1 = [0, 0, 0];
      const v2 = [1, 2, 3];
      expect(cosineSim(v1, v2)).toBe(0);
    });

    it('should return 0 for mismatched length vectors', () => {
      const v1 = [1, 2];
      const v2 = [1, 2, 3];
      expect(cosineSim(v1, v2)).toBe(0);
    });
  });

  describe('computeCentroid', () => {
    it('should return empty array for empty input', () => {
      expect(computeCentroid([])).toEqual([]);
    });

    it('should return the same vector for single input', () => {
      const v = [1, 2, 3];
      expect(computeCentroid([v])).toEqual(v);
    });

    it('should compute average of multiple vectors', () => {
      const v1 = [2, 4, 6];
      const v2 = [4, 6, 8];
      const centroid = computeCentroid([v1, v2]);
      expect(centroid).toEqual([3, 5, 7]);
    });
  });
});

// ============ ThemeManager Tests ============

describe('ThemeManager', () => {
  let mockFs: ReturnType<typeof createMockFs>;
  let manager: ThemeManager;

  beforeEach(() => {
    mockFs = createMockFs();
    manager = new ThemeManager('/test/storage', 'test-user', DEFAULT_THEME_CONFIG, mockFs);
  });

  describe('assimilate', () => {
    it('should create new theme when no existing themes match', () => {
      const sem = createSemanticMemory({
        memoryId: 'sem-1',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
      });

      manager.assimilate([sem]);

      expect(manager.getThemeCount()).toBe(1);
      const themes = manager.getAllThemes();
      expect(themes[0].semanticIds).toContain('sem-1');
      expect(themes[0].memberCount).toBe(1);
    });

    it('should attach to existing theme when similarity >= 0.62', () => {
      // Create first semantic to establish a theme
      const sem1 = createSemanticMemory({
        memoryId: 'sem-1',
        embedding: [1, 0, 0, 0, 0],
      });
      manager.assimilate([sem1]);

      // Create second semantic with high similarity (same direction)
      const sem2 = createSemanticMemory({
        memoryId: 'sem-2',
        embedding: [0.9, 0.1, 0, 0, 0], // Very similar to sem1
      });
      manager.assimilate([sem2]);

      // Should still be 1 theme with 2 members
      expect(manager.getThemeCount()).toBe(1);
      const themes = manager.getAllThemes();
      expect(themes[0].semanticIds).toContain('sem-1');
      expect(themes[0].semanticIds).toContain('sem-2');
      expect(themes[0].memberCount).toBe(2);
    });

    it('should create new theme when similarity < 0.62', () => {
      const sem1 = createSemanticMemory({
        memoryId: 'sem-1',
        embedding: [1, 0, 0, 0, 0],
      });
      manager.assimilate([sem1]);

      // Create second semantic with low similarity (orthogonal)
      const sem2 = createSemanticMemory({
        memoryId: 'sem-2',
        embedding: [0, 1, 0, 0, 0], // Orthogonal to sem1
      });
      manager.assimilate([sem2]);

      // Should be 2 themes
      expect(manager.getThemeCount()).toBe(2);
    });
  });

  describe('splitOversizedThemes', () => {
    it('should split theme when memberCount > 12', () => {
      // Create 13 similar semantics
      const semantics: SemanticMemory[] = [];
      for (let i = 0; i < 13; i++) {
        semantics.push(createSemanticMemory({
          memoryId: `sem-${i}`,
          embedding: [1, 0.01 * i, 0, 0, 0], // Very similar embeddings
        }));
      }

      manager.assimilate(semantics);

      // Should have been split (exact count depends on implementation)
      expect(manager.getThemeCount()).toBeGreaterThanOrEqual(2);
    });
  });

  describe('searchThemes', () => {
    it('should trigger lazy load of embeddings on first search', () => {
      // Setup: save themes then create new manager
      const sem1 = createSemanticMemory({
        memoryId: 'sem-1',
        embedding: [1, 0, 0, 0, 0],
      });
      manager.assimilate([sem1]);

      // Create new manager to simulate fresh load
      const manager2 = new ThemeManager('/test/storage', 'test-user', DEFAULT_THEME_CONFIG, mockFs);
      manager2.loadThemes();

      // Search should work (lazy loads embeddings)
      const results = manager2.searchThemes([1, 0, 0, 0, 0], 3);
      expect(results.length).toBe(1);
      expect(results[0].score).toBeCloseTo(1.0);
    });

    it('should return top-K themes sorted by similarity', () => {
      const sem1 = createSemanticMemory({ memoryId: 'sem-1', embedding: [1, 0, 0, 0, 0] });
      const sem2 = createSemanticMemory({ memoryId: 'sem-2', embedding: [0, 1, 0, 0, 0] });
      const sem3 = createSemanticMemory({ memoryId: 'sem-3', embedding: [0, 0, 1, 0, 0] });

      manager.assimilate([sem1]);
      manager.assimilate([sem2]);
      manager.assimilate([sem3]);

      // Query similar to sem1
      const results = manager.searchThemes([0.9, 0.1, 0, 0, 0], 2);

      expect(results.length).toBe(2);
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });

  describe('persistence', () => {
    it('should save and load themes correctly', () => {
      const sem = createSemanticMemory({
        memoryId: 'sem-persist',
        content: 'Persistence test content',
        embedding: [0.5, 0.5, 0.5, 0, 0],
      });
      manager.assimilate([sem]);

      // Create new manager with same mock fs
      const manager2 = new ThemeManager('/test/storage', 'test-user', DEFAULT_THEME_CONFIG, mockFs);
      manager2.loadThemes();

      expect(manager2.getThemeCount()).toBe(1);
      const themes = manager2.getAllThemes();
      expect(themes[0].semanticIds).toContain('sem-persist');
    });
  });
});

// ============ FileSystem Helper Tests (F7 coverage) ============

import { ensureDir, safeReadJson, safeWriteJson } from '../src/lib/memory/filesystem.js';

describe('FileSystem Helpers', () => {
  let mockFs: ReturnType<typeof createMockFs>;

  beforeEach(() => {
    mockFs = createMockFs();
  });

  describe('ensureDir', () => {
    it('should create directory if it does not exist', () => {
      expect(mockFs.existsSync('/new/dir')).toBe(false);
      ensureDir(mockFs, '/new/dir');
      expect(mockFs.existsSync('/new/dir')).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      mockFs.mkdirSync('/existing/dir', { recursive: true });
      expect(() => ensureDir(mockFs, '/existing/dir')).not.toThrow();
    });
  });

  describe('safeReadJson', () => {
    it('should return default value if file does not exist', () => {
      const result = safeReadJson(mockFs, '/nonexistent.json', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return parsed JSON if file exists', () => {
      mockFs.writeFileSync('/test.json', '{"key": "value"}');
      const result = safeReadJson<{ key: string }>(mockFs, '/test.json', { key: 'default' });
      expect(result).toEqual({ key: 'value' });
    });

    it('should return default value if JSON is invalid', () => {
      mockFs.writeFileSync('/invalid.json', 'not valid json');
      const result = safeReadJson(mockFs, '/invalid.json', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });
  });

  describe('safeWriteJson', () => {
    it('should write JSON to file', () => {
      safeWriteJson(mockFs, '/output.json', { data: 123 });
      const content = mockFs.readFileSync('/output.json', 'utf-8');
      expect(JSON.parse(content)).toEqual({ data: 123 });
    });

    it('should create parent directories if they do not exist', () => {
      safeWriteJson(mockFs, '/deep/nested/dir/output.json', { nested: true });
      expect(mockFs.existsSync('/deep/nested/dir')).toBe(true);
    });
  });

  describe('createMockFs', () => {
    it('should initialize with provided files', () => {
      const fsWithFiles = createMockFs({
        initialFiles: {
          '/init/file.txt': 'initial content',
        },
      });
      expect(fsWithFiles.existsSync('/init/file.txt')).toBe(true);
      expect(fsWithFiles.readFileSync('/init/file.txt', 'utf-8')).toBe('initial content');
    });

    it('should track written files via getWrittenFiles', () => {
      mockFs.writeFileSync('/tracked.txt', 'tracked content');
      const written = mockFs.getWrittenFiles();
      expect(written['/tracked.txt']).toBe('tracked content');
    });

    it('should clear all files on reset', () => {
      mockFs.writeFileSync('/to-clear.txt', 'content');
      mockFs.reset();
      expect(mockFs.existsSync('/to-clear.txt')).toBe(false);
    });
  });
});

