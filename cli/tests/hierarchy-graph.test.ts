import { describe, it, expect, beforeEach } from 'vitest';
import { HierarchicalMemoryGraph, makeNodeId, parseNodeId } from '../src/lib/memory/hierarchy-graph.js';
import { createMockFs } from '../src/lib/memory/filesystem.js';

describe('HierarchicalMemoryGraph', () => {
  let mockFs: ReturnType<typeof createMockFs>;
  let graph: HierarchicalMemoryGraph;

  beforeEach(() => {
    mockFs = createMockFs();
    graph = new HierarchicalMemoryGraph('/test/storage', mockFs);
  });

  // ============ Utility Function Tests ============

  describe('makeNodeId', () => {
    it('should create L3 (Theme) node ID with T_ prefix', () => {
      expect(makeNodeId('L3', 'abc123')).toBe('T_abc123');
    });

    it('should create L2 (Semantic) node ID with S_ prefix', () => {
      expect(makeNodeId('L2', 'def456')).toBe('S_def456');
    });

    it('should create L1 (Episode) node ID with E_ prefix', () => {
      expect(makeNodeId('L1', 'ghi789')).toBe('E_ghi789');
    });

    it('should create L0 (Message) node ID with M_ prefix', () => {
      expect(makeNodeId('L0', 'jkl012')).toBe('M_jkl012');
    });
  });

  describe('parseNodeId', () => {
    it('should parse T_ prefix as L3', () => {
      const result = parseNodeId('T_abc123');
      expect(result).toEqual({ level: 'L3', rawId: 'abc123' });
    });

    it('should parse S_ prefix as L2', () => {
      const result = parseNodeId('S_def456');
      expect(result).toEqual({ level: 'L2', rawId: 'def456' });
    });

    it('should return null for invalid prefix', () => {
      expect(parseNodeId('X_invalid')).toBeNull();
    });
  });

  // ============ Node Operations Tests ============

  describe('Node Operations', () => {
    it('should add node with correct ID prefix', () => {
      const node = graph.addNode('L3', 'theme-1', 'Test theme content');
      
      expect(node.id).toBe('T_theme-1');
      expect(node.level).toBe('L3');
      expect(node.rawId).toBe('theme-1');
      expect(node.text).toBe('Test theme content');
      expect(node.createdAt).toBeInstanceOf(Date);
    });

    it('should get node by full ID', () => {
      graph.addNode('L2', 'sem-1', 'Semantic memory');
      
      const found = graph.getNode('S_sem-1');
      expect(found?.text).toBe('Semantic memory');
    });

    it('should get node by raw ID and level', () => {
      graph.addNode('L1', 'ep-1', 'Episode content');
      
      const found = graph.getNodeByRawId('L1', 'ep-1');
      expect(found?.text).toBe('Episode content');
    });

    it('should filter nodes by level', () => {
      graph.addNode('L3', 't1', 'Theme 1');
      graph.addNode('L3', 't2', 'Theme 2');
      graph.addNode('L2', 's1', 'Semantic 1');
      graph.addNode('L1', 'e1', 'Episode 1');

      const themes = graph.getNodesByLevel('L3');
      expect(themes.length).toBe(2);
      
      const semantics = graph.getNodesByLevel('L2');
      expect(semantics.length).toBe(1);
    });
  });

  // ============ Edge Operations Tests ============

  describe('Edge Operations', () => {
    it('should add edge between nodes', () => {
      const theme = graph.addNode('L3', 't1', 'Theme');
      const semantic = graph.addNode('L2', 's1', 'Semantic');
      
      const edge = graph.addEdge(semantic.id, theme.id, 'parent');
      
      expect(edge.sourceId).toBe('S_s1');
      expect(edge.targetId).toBe('T_t1');
      expect(edge.kind).toBe('parent');
    });

    it('should get edges from a node', () => {
      const theme = graph.addNode('L3', 't1', 'Theme');
      const sem1 = graph.addNode('L2', 's1', 'Semantic 1');
      const sem2 = graph.addNode('L2', 's2', 'Semantic 2');
      
      graph.addEdge(sem1.id, theme.id, 'parent');
      graph.addEdge(sem2.id, theme.id, 'parent');
      
      const edgesFromSem1 = graph.getEdgesFrom(sem1.id);
      expect(edgesFromSem1.length).toBe(1);
      expect(edgesFromSem1[0].targetId).toBe(theme.id);
    });

    it('should get edges to a node', () => {
      const theme = graph.addNode('L3', 't1', 'Theme');
      const sem1 = graph.addNode('L2', 's1', 'Semantic 1');
      const sem2 = graph.addNode('L2', 's2', 'Semantic 2');
      
      graph.addEdge(sem1.id, theme.id, 'parent');
      graph.addEdge(sem2.id, theme.id, 'parent');
      
      const edgesToTheme = graph.getEdgesTo(theme.id);
      expect(edgesToTheme.length).toBe(2);
    });
  });

  // ============ Traversal Tests ============

  describe('Graph Traversal', () => {
    it('should get descendants at target level', () => {
      // Build hierarchy: Theme -> Semantic -> Episode
      const theme = graph.addNode('L3', 't1', 'Theme');
      const sem = graph.addNode('L2', 's1', 'Semantic');
      const ep1 = graph.addNode('L1', 'e1', 'Episode 1');
      const ep2 = graph.addNode('L1', 'e2', 'Episode 2');
      
      graph.addEdge(sem.id, theme.id, 'parent');
      graph.addEdge(ep1.id, sem.id, 'parent');
      graph.addEdge(ep2.id, sem.id, 'parent');
      
      // Get all episodes under theme
      const episodes = graph.getDescendantsAtLevel(theme.id, 'L1');
      expect(episodes.length).toBe(2);
    });

    it('should stop at target level', () => {
      const theme = graph.addNode('L3', 't1', 'Theme');
      const sem = graph.addNode('L2', 's1', 'Semantic');
      
      graph.addEdge(sem.id, theme.id, 'parent');
      
      // Get semantics under theme (should stop there)
      const semantics = graph.getDescendantsAtLevel(theme.id, 'L2');
      expect(semantics.length).toBe(1);
      expect(semantics[0].id).toBe(sem.id);
    });

    it('should get ancestor chain in correct order', () => {
      const theme = graph.addNode('L3', 't1', 'Theme');
      const sem = graph.addNode('L2', 's1', 'Semantic');
      const ep = graph.addNode('L1', 'e1', 'Episode');

      graph.addEdge(sem.id, theme.id, 'parent');
      graph.addEdge(ep.id, sem.id, 'parent');

      // Get ancestor chain from episode
      const chain = graph.getAncestorChain(ep.id);
      expect(chain.length).toBe(2);
      expect(chain[0].level).toBe('L2'); // Semantic first
      expect(chain[1].level).toBe('L3'); // Theme last
    });
  });

  // ============ Persistence Tests ============

  describe('Persistence', () => {
    it('should save and load graph correctly', () => {
      // Build graph
      const theme = graph.addNode('L3', 't1', 'Theme content');
      const sem = graph.addNode('L2', 's1', 'Semantic content');
      graph.addEdge(sem.id, theme.id, 'parent');

      // Save
      graph.save();

      // Create new graph and load
      const graph2 = new HierarchicalMemoryGraph('/test/storage', mockFs);
      graph2.load();

      // Verify
      expect(graph2.getStats().nodeCount).toBe(2);
      expect(graph2.getStats().edgeCount).toBe(1);

      const loadedTheme = graph2.getNode('T_t1');
      expect(loadedTheme?.text).toBe('Theme content');
    });
  });

  // ============ Statistics Tests ============

  describe('Statistics', () => {
    it('should return correct stats by level', () => {
      graph.addNode('L3', 't1', 'Theme 1');
      graph.addNode('L3', 't2', 'Theme 2');
      graph.addNode('L2', 's1', 'Semantic 1');
      graph.addNode('L2', 's2', 'Semantic 2');
      graph.addNode('L2', 's3', 'Semantic 3');
      graph.addNode('L1', 'e1', 'Episode 1');

      const stats = graph.getStats();

      expect(stats.nodeCount).toBe(6);
      expect(stats.byLevel.L3).toBe(2);
      expect(stats.byLevel.L2).toBe(3);
      expect(stats.byLevel.L1).toBe(1);
      expect(stats.byLevel.L0).toBe(0);
    });
  });
});

