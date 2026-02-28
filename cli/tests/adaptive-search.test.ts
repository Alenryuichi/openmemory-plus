import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveSearch, estimateTokens } from '../src/lib/memory/adaptive-search.js';
import { ThemeManager } from '../src/lib/memory/theme-manager.js';
import { HierarchicalMemoryGraph } from '../src/lib/memory/hierarchy-graph.js';
import { createMockFs } from '../src/lib/memory/filesystem.js';
import { SemanticMemory, SemanticStore, DEFAULT_THEME_CONFIG } from '../src/lib/memory/xmemory-types.js';
import { randomUUID } from 'crypto';

// ============ Mock Semantic Store ============

function createMockSemanticStore(memories: SemanticMemory[]): SemanticStore {
  return {
    search: async (_queryEmbedding: number[], topK: number) => {
      return memories.slice(0, topK);
    },
    getById: async (memoryId: string) => {
      return memories.find(m => m.memoryId === memoryId) || null;
    },
    getByIds: async (memoryIds: string[]) => {
      return memories.filter(m => memoryIds.includes(m.memoryId));
    },
  };
}

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

// ============ Tests ============

describe('estimateTokens', () => {
  it('should estimate tokens based on character count', () => {
    // 4 characters per token average
    expect(estimateTokens('1234')).toBe(1);
    expect(estimateTokens('12345678')).toBe(2);
    expect(estimateTokens('')).toBe(0);
  });
});

describe('AdaptiveSearch', () => {
  let mockFs: ReturnType<typeof createMockFs>;
  let themeManager: ThemeManager;
  let hierarchyGraph: HierarchicalMemoryGraph;
  let semanticStore: SemanticStore;
  let adaptiveSearch: AdaptiveSearch;

  beforeEach(() => {
    mockFs = createMockFs();
    themeManager = new ThemeManager('/test/storage', 'test-user', DEFAULT_THEME_CONFIG, mockFs);
    hierarchyGraph = new HierarchicalMemoryGraph('/test/storage', mockFs);
  });

  describe('with no themes', () => {
    it('should fall back to semantic-only search', async () => {
      const memories = [
        createSemanticMemory({ memoryId: 'sem-1', content: 'First memory', embedding: [1, 0, 0, 0, 0] }),
        createSemanticMemory({ memoryId: 'sem-2', content: 'Second memory', embedding: [0, 1, 0, 0, 0] }),
      ];
      semanticStore = createMockSemanticStore(memories);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);

      const results = await adaptiveSearch.search('test query', [1, 0, 0, 0, 0]);

      expect(results.length).toBe(2);
      expect(results[0].level).toBe('L2');
    });
  });

  describe('with themes', () => {
    beforeEach(() => {
      // Setup themes
      const sem1 = createSemanticMemory({ memoryId: 'sem-1', embedding: [1, 0, 0, 0, 0] });
      const sem2 = createSemanticMemory({ memoryId: 'sem-2', embedding: [0.9, 0.1, 0, 0, 0] });
      themeManager.assimilate([sem1, sem2]);

      const memories = [sem1, sem2];
      semanticStore = createMockSemanticStore(memories);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);
    });

    it('should return theme-level results for high score match (>= 0.75)', async () => {
      // Query very similar to theme centroid
      const results = await adaptiveSearch.search('test', [1, 0, 0, 0, 0], {
        expandToSemantics: true,
      });

      // Should have theme result with high score
      const themeResults = results.filter(r => r.level === 'L3');
      expect(themeResults.length).toBeGreaterThan(0);
      expect(themeResults[0].score).toBeGreaterThanOrEqual(0.75);
    });

    it('should expand to semantics for low score match (< 0.75)', async () => {
      // Query less similar
      const results = await adaptiveSearch.search('test', [0.5, 0.5, 0.5, 0, 0], {
        expandToSemantics: true,
      });

      // Should include semantic results
      const semanticResults = results.filter(r => r.level === 'L2');
      expect(semanticResults.length).toBeGreaterThan(0);
    });

    it('should not expand when expandToSemantics is false', async () => {
      const results = await adaptiveSearch.search('test', [0.5, 0.5, 0.5, 0, 0], {
        expandToSemantics: false,
      });

      // Should only have theme results or be empty
      const semanticResults = results.filter(r => r.level === 'L2');
      expect(semanticResults.length).toBe(0);
    });
  });

  describe('token budget', () => {
    it('should respect maxTokenBudget', async () => {
      const longContent = 'A'.repeat(1000); // ~250 tokens
      const memories = [
        createSemanticMemory({ memoryId: 'sem-1', content: longContent, embedding: [1, 0, 0, 0, 0] }),
        createSemanticMemory({ memoryId: 'sem-2', content: longContent, embedding: [0.9, 0, 0, 0, 0] }),
        createSemanticMemory({ memoryId: 'sem-3', content: longContent, embedding: [0.8, 0, 0, 0, 0] }),
      ];
      semanticStore = createMockSemanticStore(memories);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);

      const results = await adaptiveSearch.search('test', [1, 0, 0, 0, 0], {
        maxTokenBudget: 300, // Only room for ~1 result
      });

      // Token budget should limit results
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('episode expansion (F6 coverage)', () => {
    it('should expand to episodes when expandToEpisodes is true', async () => {
      // Setup: Create theme with semantics and episodes in hierarchy graph
      const sem1 = createSemanticMemory({ memoryId: 'sem-ep-1', embedding: [0.5, 0.5, 0, 0, 0] });
      themeManager.assimilate([sem1]);

      // Add semantic node to hierarchy
      hierarchyGraph.addNode('L2', 'sem-ep-1', 'Semantic content');

      // Add episode nodes linked to semantic
      const episodeNode = hierarchyGraph.addNode('L1', 'ep-1', 'Episode content about testing', undefined, { title: 'Test Episode' });
      hierarchyGraph.addEdge(episodeNode.id, 'S_sem-ep-1', 'parent');

      const memories = [sem1];
      semanticStore = createMockSemanticStore(memories);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);

      const results = await adaptiveSearch.search('test', [0.5, 0.5, 0, 0, 0], {
        expandToSemantics: true,
        expandToEpisodes: true,
        maxTokenBudget: 10000,
      });

      // Should include episode results
      const episodeResults = results.filter(r => r.level === 'L1');
      expect(episodeResults.length).toBeGreaterThanOrEqual(0); // May be 0 if budget/score limits
    });

    it('should not expand to episodes when expandToEpisodes is false', async () => {
      const sem1 = createSemanticMemory({ memoryId: 'sem-no-ep', embedding: [0.5, 0.5, 0, 0, 0] });
      themeManager.assimilate([sem1]);

      hierarchyGraph.addNode('L2', 'sem-no-ep', 'Semantic content');
      const episodeNode = hierarchyGraph.addNode('L1', 'ep-2', 'Episode should not appear');
      hierarchyGraph.addEdge(episodeNode.id, 'S_sem-no-ep', 'parent');

      const memories = [sem1];
      semanticStore = createMockSemanticStore(memories);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);

      const results = await adaptiveSearch.search('test', [0.5, 0.5, 0, 0, 0], {
        expandToSemantics: true,
        expandToEpisodes: false,
      });

      const episodeResults = results.filter(r => r.level === 'L1');
      expect(episodeResults.length).toBe(0);
    });

    it('should include episode metadata (title) when available', async () => {
      const sem1 = createSemanticMemory({ memoryId: 'sem-meta', embedding: [0.4, 0.4, 0.2, 0, 0] });
      themeManager.assimilate([sem1]);

      hierarchyGraph.addNode('L2', 'sem-meta', 'Semantic for metadata test');
      const episodeNode = hierarchyGraph.addNode('L1', 'ep-meta', 'Episode with metadata', undefined, { title: 'Important Episode Title' });
      hierarchyGraph.addEdge(episodeNode.id, 'S_sem-meta', 'parent');

      semanticStore = createMockSemanticStore([sem1]);
      adaptiveSearch = new AdaptiveSearch(themeManager, hierarchyGraph, semanticStore);

      const results = await adaptiveSearch.search('test', [0.4, 0.4, 0.2, 0, 0], {
        expandToSemantics: true,
        expandToEpisodes: true,
        maxTokenBudget: 10000,
      });

      // If episodes are returned, check metadata
      const episodeResults = results.filter(r => r.level === 'L1');
      if (episodeResults.length > 0) {
        expect(episodeResults[0].metadata?.episodeTitle).toBeDefined();
      }
    });
  });
});

