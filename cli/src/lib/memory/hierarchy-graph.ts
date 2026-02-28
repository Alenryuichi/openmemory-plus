/**
 * OpenMemory Plus - Hierarchical Memory Graph
 * Implements xMemory 4-level hierarchy: L3(Theme), L2(Semantic), L1(Episode), L0(Message)
 */

import { randomUUID } from 'crypto';
import * as path from 'node:path';
import {
  MemoryLevel,
  HierarchyNode,
  HierarchyEdge,
  HierarchyGraphData,
} from './xmemory-types.js';
import { FileSystem, nodeFs, ensureDir, safeReadJson, safeWriteJson } from './filesystem.js';

// ============ Level Prefixes ============

const LEVEL_PREFIXES: Record<MemoryLevel, string> = {
  L0: 'M_',
  L1: 'E_',
  L2: 'S_',
  L3: 'T_',
};

function makeNodeId(level: MemoryLevel, rawId: string): string {
  return `${LEVEL_PREFIXES[level]}${rawId}`;
}

function parseNodeId(id: string): { level: MemoryLevel; rawId: string } | null {
  for (const [level, prefix] of Object.entries(LEVEL_PREFIXES)) {
    if (id.startsWith(prefix)) {
      return { level: level as MemoryLevel, rawId: id.slice(prefix.length) };
    }
  }
  return null;
}

// ============ Hierarchical Memory Graph ============

export class HierarchicalMemoryGraph {
  private nodes: Map<string, HierarchyNode> = new Map();
  private edges: Map<string, HierarchyEdge> = new Map();
  
  // Indexes for efficient querying
  private nodesByLevel: Map<MemoryLevel, Set<string>> = new Map();
  private edgesBySource: Map<string, Set<string>> = new Map();
  private edgesByTarget: Map<string, Set<string>> = new Map();
  
  private storagePath: string;
  private fs: FileSystem;

  constructor(storagePath: string, fs: FileSystem = nodeFs) {
    this.storagePath = storagePath;
    this.fs = fs;
    
    // Initialize level indexes
    for (const level of ['L0', 'L1', 'L2', 'L3'] as MemoryLevel[]) {
      this.nodesByLevel.set(level, new Set());
    }
  }

  // ============ Node Operations ============

  addNode(
    level: MemoryLevel,
    rawId: string,
    text: string,
    embedding?: number[],
    metadata?: Record<string, unknown>
  ): HierarchyNode {
    const id = makeNodeId(level, rawId);
    
    const node: HierarchyNode = {
      id,
      level,
      rawId,
      text,
      embedding,
      metadata,
      createdAt: new Date(),
    };
    
    this.nodes.set(id, node);
    this.nodesByLevel.get(level)!.add(id);
    
    return node;
  }

  getNode(id: string): HierarchyNode | undefined {
    return this.nodes.get(id);
  }

  getNodeByRawId(level: MemoryLevel, rawId: string): HierarchyNode | undefined {
    const id = makeNodeId(level, rawId);
    return this.nodes.get(id);
  }

  getNodesByLevel(level: MemoryLevel): HierarchyNode[] {
    const ids = this.nodesByLevel.get(level);
    if (!ids) return [];
    return Array.from(ids).map(id => this.nodes.get(id)!);
  }

  // ============ Edge Operations ============

  addEdge(
    sourceId: string,
    targetId: string,
    kind: 'parent' | 'sibling' | 'temporal' | 'knn',
    weight?: number
  ): HierarchyEdge {
    const id = randomUUID();
    
    const edge: HierarchyEdge = {
      id,
      sourceId,
      targetId,
      kind,
      weight,
      createdAt: new Date(),
    };
    
    this.edges.set(id, edge);
    
    // Update indexes
    if (!this.edgesBySource.has(sourceId)) {
      this.edgesBySource.set(sourceId, new Set());
    }
    this.edgesBySource.get(sourceId)!.add(id);
    
    if (!this.edgesByTarget.has(targetId)) {
      this.edgesByTarget.set(targetId, new Set());
    }
    this.edgesByTarget.get(targetId)!.add(id);
    
    return edge;
  }

  getEdgesFrom(nodeId: string): HierarchyEdge[] {
    const edgeIds = this.edgesBySource.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!);
  }

  getEdgesTo(nodeId: string): HierarchyEdge[] {
    const edgeIds = this.edgesByTarget.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!);
  }

  // ============ Graph Traversal ============

  /**
   * Get all descendants at a specific level
   * Traverses down from the given node to collect nodes at target level
   */
  getDescendantsAtLevel(nodeId: string, targetLevel: MemoryLevel): HierarchyNode[] {
    const result: HierarchyNode[] = [];
    const visited = new Set<string>();

    this.traverseDown(nodeId, targetLevel, visited, result);

    return result;
  }

  private traverseDown(
    nodeId: string,
    targetLevel: MemoryLevel,
    visited: Set<string>,
    result: HierarchyNode[]
  ): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Check if we've reached target level
    if (node.level === targetLevel) {
      result.push(node);
      return; // Stop at target level
    }

    // Continue traversing children (via 'parent' edges where this node is target)
    const childEdges = this.getEdgesTo(nodeId).filter(e => e.kind === 'parent');
    for (const edge of childEdges) {
      this.traverseDown(edge.sourceId, targetLevel, visited, result);
    }
  }

  /**
   * Get ancestor chain from node up to theme level
   * Returns array ordered from immediate parent to root (Theme)
   */
  getAncestorChain(nodeId: string): HierarchyNode[] {
    const chain: HierarchyNode[] = [];
    const visited = new Set<string>();

    let currentId = nodeId;

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);

      // Find parent edge
      const parentEdges = this.getEdgesFrom(currentId).filter(e => e.kind === 'parent');
      if (parentEdges.length === 0) break;

      const parentId = parentEdges[0].targetId;
      const parent = this.nodes.get(parentId);

      if (parent) {
        chain.push(parent);
        currentId = parentId;
      } else {
        break;
      }
    }

    return chain;
  }

  // ============ Persistence ============

  private get graphPath(): string {
    return path.join(this.storagePath, 'hierarchy-graph.json');
  }

  save(): void {
    ensureDir(this.fs, this.storagePath);

    const data: HierarchyGraphData = {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      version: '1.0',
      updatedAt: new Date(),
    };

    safeWriteJson(this.fs, this.graphPath, data);
  }

  load(): void {
    const data = safeReadJson<HierarchyGraphData>(this.fs, this.graphPath, {
      nodes: [],
      edges: [],
      version: '1.0',
      updatedAt: new Date(),
    });

    // Clear existing data
    this.nodes.clear();
    this.edges.clear();
    for (const level of ['L0', 'L1', 'L2', 'L3'] as MemoryLevel[]) {
      this.nodesByLevel.get(level)!.clear();
    }
    this.edgesBySource.clear();
    this.edgesByTarget.clear();

    // Load nodes
    for (const nodeData of data.nodes) {
      const node: HierarchyNode = {
        ...nodeData,
        createdAt: new Date(nodeData.createdAt),
      };
      this.nodes.set(node.id, node);
      this.nodesByLevel.get(node.level)!.add(node.id);
    }

    // Load edges
    for (const edgeData of data.edges) {
      const edge: HierarchyEdge = {
        ...edgeData,
        createdAt: new Date(edgeData.createdAt),
      };
      this.edges.set(edge.id, edge);

      if (!this.edgesBySource.has(edge.sourceId)) {
        this.edgesBySource.set(edge.sourceId, new Set());
      }
      this.edgesBySource.get(edge.sourceId)!.add(edge.id);

      if (!this.edgesByTarget.has(edge.targetId)) {
        this.edgesByTarget.set(edge.targetId, new Set());
      }
      this.edgesByTarget.get(edge.targetId)!.add(edge.id);
    }
  }

  // ============ Statistics ============

  getStats(): {
    nodeCount: number;
    edgeCount: number;
    byLevel: Record<MemoryLevel, number>;
  } {
    const byLevel: Record<MemoryLevel, number> = {
      L0: this.nodesByLevel.get('L0')!.size,
      L1: this.nodesByLevel.get('L1')!.size,
      L2: this.nodesByLevel.get('L2')!.size,
      L3: this.nodesByLevel.get('L3')!.size,
    };

    return {
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      byLevel,
    };
  }
}

// Export utility functions
export { makeNodeId, parseNodeId };
