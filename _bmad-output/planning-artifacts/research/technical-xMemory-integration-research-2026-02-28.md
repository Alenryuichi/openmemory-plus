---
stepsCompleted: [1, 2]
inputDocuments: []
workflowType: 'research'
lastStep: 2
research_type: 'technical'
research_topic: 'xMemory-hierarchical-integration'
research_goals: '将 xMemory 层级结构应用到 openmemory-plus 双层记忆系统'
user_name: 'Ryuichialen'
date: '2026-02-28'
web_research_enabled: true
source_verification: true
---

# Technical Research Report: xMemory Hierarchical Integration

**Date:** 2026-02-28
**Author:** Ryuichialen
**Research Type:** Technical Implementation Design

---

## Executive Summary

本研究文档详细设计了将 xMemory 4层级记忆架构集成到 OpenMemory Plus 双层系统的完整技术方案。核心目标是引入 **Theme 层**（L3）实现高层语义聚合，并通过**自适应检索**减少冗余上下文。

**关键交付物：**
1. TypeScript 类型定义和接口规范
2. ThemeManager 核心实现
3. HierarchicalMemoryGraph 图结构
4. 集成方案与迁移路径

---

## 1. Architecture Overview

### 1.1 层级映射

```
xMemory 原始架构           OpenMemory Plus 集成架构
==================         ==========================
L3: Themes      ────────>  _omp/memory/themes.yaml + themes/
L2: Semantics   ────────>  openmemory MCP (语义搜索)
L1: Episodes    ────────>  _omp/memory/activeContext.md
L0: Messages    ────────>  对话原文 (不持久化)
```

### 1.2 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Conversation Stream                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Memory Extraction Skill                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Detect valuable information                      │   │
│  │  2. Classify: PROJECT / PERSONAL / UNIVERSAL         │   │
│  │  3. Route to appropriate storage                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬───────────────────┬───────────────────┬───────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│  _omp/memory/   │ │ openmemory MCP  │ │   ThemeManager      │
│  (Project-level)│ │ (User-level)    │ │   (Theme Layer)     │
│                 │ │                 │ │                     │
│ - decisions.yaml│ │ - preferences   │ │ - themes.yaml       │
│ - techContext   │ │ - skills        │ │ - centroids.npy     │
│ - progress.md   │ │ - context       │ │ - graph.gexf        │
└─────────────────┘ └────────┬────────┘ └──────────┬──────────┘
                             │                     │
                             └──────────┬──────────┘
                                        │
                                        ▼
                          ┌─────────────────────────┐
                          │  Adaptive Retrieval     │
                          │  (Top-down Search)      │
                          └─────────────────────────┘
```

---

## 2. TypeScript Type Definitions

### 2.1 Core Types (`cli/src/lib/memory/xmemory-types.ts`)

```typescript
/**
 * xMemory Integration Types for OpenMemory Plus
 * Implements hierarchical memory structure
 */

// ============ Theme Layer Types ============

export interface ThemeNode {
  themeId: string;
  summary: string;
  embedding: number[];      // Summary vector
  centroid: number[];       // Member centroid (for similarity)
  semanticIds: string[];    // Member semantic memory IDs
  memberCount: number;
  
  // kNN adjacency
  neighbors: string[];      // Neighbor theme IDs
  neighborSims: number[];   // Similarity scores
  
  // Timestamps
  createdAt: string;        // ISO 8601
  updatedAt: string;
}
```

export interface SemanticMemory {
  memoryId: string;
  content: string;
  embedding: number[];
  sourceEpisodes: string[];   // Which episodes contributed
  knowledgeType: 'fact' | 'preference' | 'pattern' | 'decision';
  confidence: number;         // 0-1
  createdAt: string;
}

export interface EpisodeMemory {
  episodeId: string;
  title: string;
  content: string;            // Summary
  embedding: number[];
  messageIds: string[];       // Raw message references
  startTime: string;
  endTime: string;
}

// ============ Graph Types ============

export type NodeLevel = 0 | 1 | 2 | 3;  // message | episode | semantic | theme
export type EdgeKind = 'belongs_to' | 'supports' | 'abstracted_by';

export interface GraphNode {
  nodeId: string;
  level: NodeLevel;
  rawId: string;              // Original ID (message_id, episode_id, etc.)
  text: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
}

export interface HierarchyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  version: string;
  updatedAt: string;
}

// ============ Configuration Types ============

export interface ThemeConfig {
  attachThreshold: number;      // Default: 0.62
  maxThemeSize: number;         // Default: 12
  minIntraSimilarity: number;   // Default: 0.72
  mergeThreshold: number;       // Default: 0.78
  lenientAttachFloor: number;   // Default: 0.52
  knnK: number;                 // Default: 10
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  attachThreshold: 0.62,
  maxThemeSize: 12,
  minIntraSimilarity: 0.72,
  mergeThreshold: 0.78,
  lenientAttachFloor: 0.52,
  knnK: 10,
};

// ============ Search Types ============

export interface AdaptiveSearchOptions {
  topKThemes: number;           // Default: 3
  expandThreshold: number;      // Expand if theme score < this
  maxTokens: number;            // Context window limit
  includeRawMessages: boolean;  // Whether to expand to L0
}

export interface SearchResult {
  themes: ThemeNode[];
  semantics: SemanticMemory[];
  episodes?: EpisodeMemory[];
  totalTokens: number;
  expandedLevels: NodeLevel[];
}
```

---

## 3. ThemeManager Implementation

### 3.1 Core Class (`cli/src/lib/memory/theme-manager.ts`)

```typescript
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  ThemeNode,
  SemanticMemory,
  ThemeConfig,
  DEFAULT_THEME_CONFIG,
} from './xmemory-types.js';

/**
 * ThemeManager - Manages L3 (Theme) layer of hierarchical memory
 *
 * Key responsibilities:
 * 1. Assimilate new semantics into existing themes
 * 2. Accommodate (split) when themes become too large/heterogeneous
 * 3. Merge similar themes
 * 4. Maintain kNN adjacency for efficient retrieval
 */
export class ThemeManager {
  private themes: Map<string, ThemeNode> = new Map();
  private config: ThemeConfig;
  private storageDir: string;
  private userId: string;

  // Caches
  private semanticTextCache: Map<string, string> = new Map();
  private semanticEmbCache: Map<string, number[]> = new Map();

  constructor(
    storageDir: string,
    userId: string,
    config: Partial<ThemeConfig> = {}
  ) {
    this.storageDir = storageDir;
    this.userId = userId;
    this.config = { ...DEFAULT_THEME_CONFIG, ...config };

    this.ensureDirectories();
    this.loadThemes();
  }

  // ============ Core Operations ============

  /**
   * Assimilate new semantic memories into themes
   * Returns statistics about the operation
   */
  assimilate(newSemantics: SemanticMemory[]): AssimilationStats {
    const stats: AssimilationStats = {
      attached: 0,
      created: 0,
      split: 0,
      merged: 0,
    };

    // Cache new semantics
    for (const sem of newSemantics) {
      this.semanticTextCache.set(sem.memoryId, sem.content);
      this.semanticEmbCache.set(sem.memoryId, sem.embedding);
    }

    // Attach each semantic to best theme or create new
    for (const sem of newSemantics) {
      const attached = this.attachSemantic(sem);
      if (attached) {
        stats.attached++;
      } else {
        this.createThemeFromSemantic(sem);
        stats.created++;
      }
    }

    // Post-processing
    stats.split = this.splitOversizedThemes();
    stats.merged = this.mergeSmallThemes();

    // Update kNN and persist
    this.recomputeKnn();
    this.saveThemes();

    return stats;
  }

  /**
   * Search themes by query embedding
   */
  searchThemes(queryEmb: number[], topK: number = 3): ThemeSearchResult[] {
    if (this.themes.size === 0) return [];

    const results: ThemeSearchResult[] = [];

    for (const theme of this.themes.values()) {
      const sim = this.cosineSim(queryEmb, theme.centroid);
      results.push({ theme, similarity: sim });
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // ============ Private: Attachment ============

  private attachSemantic(sem: SemanticMemory): boolean {
    if (this.themes.size === 0) return false;

    // Find best matching theme
    let bestTheme: ThemeNode | null = null;
    let bestSim = 0;

    for (const theme of this.themes.values()) {
      const sim = this.cosineSim(sem.embedding, theme.centroid);
      if (sim > bestSim) {
        bestSim = sim;
        bestTheme = theme;
      }
    }

    // Check threshold
    if (bestSim >= this.config.attachThreshold && bestTheme) {
      this.addSemanticToTheme(bestTheme, sem);
      return true;
    }

    // Lenient fallback for small themes
    if (bestSim >= this.config.lenientAttachFloor && bestTheme) {
      if (bestTheme.memberCount < this.config.maxThemeSize) {
        this.addSemanticToTheme(bestTheme, sem);
        return true;
      }
    }

    return false;
  }

  private addSemanticToTheme(theme: ThemeNode, sem: SemanticMemory): void {
    theme.semanticIds.push(sem.memoryId);
    theme.memberCount = theme.semanticIds.length;

    // Online centroid update
    const oldCentroid = theme.centroid;
    const n = theme.memberCount;
    theme.centroid = oldCentroid.map((v, i) =>
      (v * (n - 1) + sem.embedding[i]) / n
    );

    theme.updatedAt = new Date().toISOString();
  }

  private createThemeFromSemantic(sem: SemanticMemory): ThemeNode {
    const theme: ThemeNode = {
      themeId: randomUUID(),
      summary: sem.content.slice(0, 200), // Placeholder
      embedding: [...sem.embedding],
      centroid: [...sem.embedding],
      semanticIds: [sem.memoryId],
      memberCount: 1,
      neighbors: [],
      neighborSims: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.themes.set(theme.themeId, theme);
    return theme;
  }

  // ============ Private: Split/Merge ============

  private splitOversizedThemes(): number {
    let splitCount = 0;

    for (const [themeId, theme] of this.themes) {
      if (theme.memberCount > this.config.maxThemeSize) {
        const subThemes = this.splitTheme(theme);
        if (subThemes.length > 1) {
          this.themes.delete(themeId);
          for (const sub of subThemes) {
            this.themes.set(sub.themeId, sub);
          }
          splitCount++;
        }
      }
    }

    return splitCount;
  }

  private splitTheme(theme: ThemeNode): ThemeNode[] {
    // Cluster semantics by connectivity
    const clusters = this.clusterSemantics(theme.semanticIds);

    if (clusters.length <= 1) return [theme];

    return clusters.map(memberIds => ({
      themeId: randomUUID(),
      summary: this.generateSummary(memberIds),
      embedding: this.computeCentroid(memberIds),
      centroid: this.computeCentroid(memberIds),
      semanticIds: memberIds,
      memberCount: memberIds.length,
      neighbors: [],
      neighborSims: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  private mergeSmallThemes(): number {
    let mergeCount = 0;
    const SMALL_SIZE = 2;

    const smallThemes = Array.from(this.themes.values())
      .filter(t => t.memberCount <= SMALL_SIZE)
      .sort((a, b) => a.memberCount - b.memberCount);

    for (const small of smallThemes) {
      if (!this.themes.has(small.themeId)) continue;

      // Find best merge target
      let bestTarget: ThemeNode | null = null;
      let bestSim = 0;

      for (const other of this.themes.values()) {
        if (other.themeId === small.themeId) continue;
        if (small.memberCount + other.memberCount > this.config.maxThemeSize) continue;

        const sim = this.cosineSim(small.centroid, other.centroid);
        if (sim > bestSim && sim >= this.config.mergeThreshold) {
          bestSim = sim;
          bestTarget = other;
        }
      }

      if (bestTarget) {
        this.mergeThemes(bestTarget, small);
        this.themes.delete(small.themeId);
        mergeCount++;
      }
    }

    return mergeCount;
  }

  private mergeThemes(target: ThemeNode, source: ThemeNode): void {
    target.semanticIds.push(...source.semanticIds);
    target.memberCount = target.semanticIds.length;
    target.centroid = this.computeCentroid(target.semanticIds);
    target.updatedAt = new Date().toISOString();
  }

  // ============ Private: Utilities ============

  private cosineSim(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12);
  }

  private computeCentroid(semanticIds: string[]): number[] {
    const vecs = semanticIds
      .map(id => this.semanticEmbCache.get(id))
      .filter((v): v is number[] => v !== undefined);

    if (vecs.length === 0) return [];

    const dim = vecs[0].length;
    const centroid = new Array(dim).fill(0);

    for (const vec of vecs) {
      for (let i = 0; i < dim; i++) {
        centroid[i] += vec[i];
      }
    }

    return centroid.map(v => v / vecs.length);
  }

  private clusterSemantics(semanticIds: string[]): string[][] {
    // Simple connectivity-based clustering
    const THRESH = 0.66;
    const n = semanticIds.length;

    if (n <= this.config.maxThemeSize) return [semanticIds];

    // Build similarity graph
    const vecs = semanticIds.map(id => this.semanticEmbCache.get(id)!);
    const adj: boolean[][] = Array(n).fill(null).map(() => Array(n).fill(false));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.cosineSim(vecs[i], vecs[j]) >= THRESH) {
          adj[i][j] = adj[j][i] = true;
        }
      }
    }

    // Find connected components
    const visited = new Set<number>();
    const clusters: string[][] = [];

    for (let i = 0; i < n; i++) {
      if (visited.has(i)) continue;

      const component: number[] = [];
      const stack = [i];

      while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);
        component.push(node);

        for (let j = 0; j < n; j++) {
          if (adj[node][j] && !visited.has(j)) {
            stack.push(j);
          }
        }
      }

      clusters.push(component.map(idx => semanticIds[idx]));
    }

    return clusters;
  }

  private generateSummary(semanticIds: string[]): string {
    // Placeholder: concatenate first few semantic texts
    return semanticIds
      .slice(0, 3)
      .map(id => this.semanticTextCache.get(id) || '')
      .join('; ')
      .slice(0, 200);
  }

  private recomputeKnn(): void {
    const themeIds = Array.from(this.themes.keys());
    const n = themeIds.length;

    if (n < 2) {
      for (const theme of this.themes.values()) {
        theme.neighbors = [];
        theme.neighborSims = [];
      }
      return;
    }

    for (const theme of this.themes.values()) {
      const sims: Array<{ id: string; sim: number }> = [];

      for (const otherId of themeIds) {
        if (otherId === theme.themeId) continue;
        const other = this.themes.get(otherId)!;
        const sim = this.cosineSim(theme.centroid, other.centroid);
        sims.push({ id: otherId, sim });
      }

      sims.sort((a, b) => b.sim - a.sim);
      const topK = sims.slice(0, this.config.knnK);

      theme.neighbors = topK.map(x => x.id);
      theme.neighborSims = topK.map(x => x.sim);
    }
  }

  // ============ Persistence ============

  private ensureDirectories(): void {
    const themesDir = join(this.storageDir, 'themes');
    if (!existsSync(themesDir)) {
      mkdirSync(themesDir, { recursive: true });
    }
  }

  private get themesFilePath(): string {
    return join(this.storageDir, 'themes', `${this.userId}_themes.json`);
  }

  private loadThemes(): void {
    if (!existsSync(this.themesFilePath)) return;

    try {
      const data = JSON.parse(readFileSync(this.themesFilePath, 'utf-8'));
      for (const theme of data.themes || []) {
        this.themes.set(theme.themeId, theme);
      }
    } catch (e) {
      console.error('Failed to load themes:', e);
    }
  }

  private saveThemes(): void {
    const data = {
      version: '1.0',
      userId: this.userId,
      themes: Array.from(this.themes.values()),
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(this.themesFilePath, JSON.stringify(data, null, 2));
  }

  // ============ Public Getters ============

  getTheme(themeId: string): ThemeNode | undefined {
    return this.themes.get(themeId);
  }

  getAllThemes(): ThemeNode[] {
    return Array.from(this.themes.values());
  }

  getStats(): ThemeStats {
    const themes = this.getAllThemes();
    return {
      totalThemes: themes.length,
      totalSemantics: themes.reduce((sum, t) => sum + t.memberCount, 0),
      avgThemeSize: themes.length > 0
        ? themes.reduce((sum, t) => sum + t.memberCount, 0) / themes.length
        : 0,
      largestTheme: Math.max(...themes.map(t => t.memberCount), 0),
    };
  }
}

// ============ Supporting Types ============

export interface AssimilationStats {
  attached: number;
  created: number;
  split: number;
  merged: number;
}

export interface ThemeSearchResult {
  theme: ThemeNode;
  similarity: number;
}

export interface ThemeStats {
  totalThemes: number;
  totalSemantics: number;
  avgThemeSize: number;
  largestTheme: number;
}
```

---

## 4. HierarchicalMemoryGraph Implementation

### 4.1 Graph Structure (`cli/src/lib/memory/hierarchy-graph.ts`)

```typescript
import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  GraphNode,
  GraphEdge,
  HierarchyGraph,
  NodeLevel,
  EdgeKind,
} from './xmemory-types.js';

/**
 * HierarchicalMemoryGraph - Manages the 4-level memory structure
 *
 * Levels:
 * - L0: Messages (raw conversation turns)
 * - L1: Episodes (conversation segment summaries)
 * - L2: Semantics (extracted facts/knowledge)
 * - L3: Themes (high-level abstractions)
 */
export class HierarchicalMemoryGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge[]> = new Map(); // sourceId -> edges
  private levelIndex: Map<NodeLevel, Set<string>> = new Map();
  private storageDir: string;

  constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.initLevelIndex();
    this.load();
  }

  private initLevelIndex(): void {
    for (const level of [0, 1, 2, 3] as NodeLevel[]) {
      this.levelIndex.set(level, new Set());
    }
  }

  // ============ Node Operations ============

  addNode(
    level: NodeLevel,
    rawId: string,
    text: string,
    embedding?: number[],
    metadata: Record<string, unknown> = {}
  ): GraphNode {
    const node: GraphNode = {
      nodeId: randomUUID(),
      level,
      rawId,
      text,
      embedding,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.nodes.set(node.nodeId, node);
    this.levelIndex.get(level)!.add(node.nodeId);

    return node;
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  getNodesByLevel(level: NodeLevel): GraphNode[] {
    const ids = this.levelIndex.get(level);
    if (!ids) return [];
    return Array.from(ids).map(id => this.nodes.get(id)!);
  }

  findNodeByRawId(rawId: string): GraphNode | undefined {
    for (const node of this.nodes.values()) {
      if (node.rawId === rawId) return node;
    }
    return undefined;
  }

  // ============ Edge Operations ============

  addEdge(sourceId: string, targetId: string, kind: EdgeKind): GraphEdge {
    const edge: GraphEdge = { sourceId, targetId, kind };

    if (!this.edges.has(sourceId)) {
      this.edges.set(sourceId, []);
    }
    this.edges.get(sourceId)!.push(edge);

    return edge;
  }

  getChildNodes(nodeId: string): GraphNode[] {
    const edges = this.edges.get(nodeId) || [];
    return edges
      .map(e => this.nodes.get(e.targetId))
      .filter((n): n is GraphNode => n !== undefined);
  }

  getParentNodes(nodeId: string): GraphNode[] {
    const parents: GraphNode[] = [];

    for (const [sourceId, edges] of this.edges) {
      for (const edge of edges) {
        if (edge.targetId === nodeId) {
          const parent = this.nodes.get(sourceId);
          if (parent) parents.push(parent);
        }
      }
    }

    return parents;
  }

  // ============ Hierarchy Traversal ============

  /**
   * Get all descendants at a specific level
   */
  getDescendantsAtLevel(nodeId: string, targetLevel: NodeLevel): GraphNode[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    if (node.level === targetLevel) return [node];
    if (node.level < targetLevel) return []; // Can't go up

    const results: GraphNode[] = [];
    const stack = [nodeId];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const children = this.getChildNodes(currentId);
      for (const child of children) {
        if (child.level === targetLevel) {
          results.push(child);
        } else if (child.level > targetLevel) {
          stack.push(child.nodeId);
        }
      }
    }

    return results;
  }

  /**
   * Get ancestor chain up to theme level
   */
  getAncestorChain(nodeId: string): GraphNode[] {
    const chain: GraphNode[] = [];
    let currentId = nodeId;

    while (true) {
      const parents = this.getParentNodes(currentId);
      if (parents.length === 0) break;

      // Take first parent (primary hierarchy)
      chain.push(parents[0]);
      currentId = parents[0].nodeId;
    }

    return chain.reverse(); // Theme -> Semantic -> Episode
  }

  // ============ Persistence ============

  private get graphFilePath(): string {
    return join(this.storageDir, 'hierarchy_graph.json');
  }

  load(): void {
    if (!existsSync(this.graphFilePath)) return;

    try {
      const data: HierarchyGraph = JSON.parse(
        readFileSync(this.graphFilePath, 'utf-8')
      );

      for (const node of data.nodes) {
        this.nodes.set(node.nodeId, node);
        this.levelIndex.get(node.level)!.add(node.nodeId);
      }

      for (const edge of data.edges) {
        if (!this.edges.has(edge.sourceId)) {
          this.edges.set(edge.sourceId, []);
        }
        this.edges.get(edge.sourceId)!.push(edge);
      }
    } catch (e) {
      console.error('Failed to load hierarchy graph:', e);
    }
  }

  save(): void {
    const allEdges: GraphEdge[] = [];
    for (const edges of this.edges.values()) {
      allEdges.push(...edges);
    }

    const data: HierarchyGraph = {
      nodes: Array.from(this.nodes.values()),
      edges: allEdges,
      version: '1.0',
      updatedAt: new Date().toISOString(),
    };

    writeFileSync(this.graphFilePath, JSON.stringify(data, null, 2));
  }

  // ============ Statistics ============

  getStats(): HierarchyStats {
    return {
      totalNodes: this.nodes.size,
      nodesByLevel: {
        messages: this.levelIndex.get(0)!.size,
        episodes: this.levelIndex.get(1)!.size,
        semantics: this.levelIndex.get(2)!.size,
        themes: this.levelIndex.get(3)!.size,
      },
      totalEdges: Array.from(this.edges.values())
        .reduce((sum, e) => sum + e.length, 0),
    };
  }
}

export interface HierarchyStats {
  totalNodes: number;
  nodesByLevel: {
    messages: number;
    episodes: number;
    semantics: number;
    themes: number;
  };
  totalEdges: number;
}
```

---

## 5. Adaptive Retrieval System

### 5.1 Search Implementation (`cli/src/lib/memory/adaptive-search.ts`)

```typescript
import { ThemeManager, ThemeSearchResult } from './theme-manager.js';
import { HierarchicalMemoryGraph } from './hierarchy-graph.js';
import {
  ThemeNode,
  SemanticMemory,
  EpisodeMemory,
  AdaptiveSearchOptions,
  SearchResult,
  NodeLevel,
} from './xmemory-types.js';

/**
 * AdaptiveSearch - Top-down hierarchical retrieval
 *
 * Strategy:
 * 1. Search Themes (L3) first
 * 2. If theme match is strong (>= threshold), return theme-level context
 * 3. If uncertain, expand to Semantics (L2)
 * 4. If still uncertain, expand to Episodes (L1)
 * 5. Never expand to raw Messages (L0) unless explicitly requested
 */
export class AdaptiveSearch {
  private themeManager: ThemeManager;
  private graph: HierarchicalMemoryGraph;
  private semanticStore: SemanticStore; // Interface to openmemory MCP

  constructor(
    themeManager: ThemeManager,
    graph: HierarchicalMemoryGraph,
    semanticStore: SemanticStore
  ) {
    this.themeManager = themeManager;
    this.graph = graph;
    this.semanticStore = semanticStore;
  }

  /**
   * Main search entry point
   */
  async search(
    query: string,
    queryEmbedding: number[],
    options: Partial<AdaptiveSearchOptions> = {}
  ): Promise<SearchResult> {
    const opts: AdaptiveSearchOptions = {
      topKThemes: options.topKThemes ?? 3,
      expandThreshold: options.expandThreshold ?? 0.75,
      maxTokens: options.maxTokens ?? 4000,
      includeRawMessages: options.includeRawMessages ?? false,
    };

    const result: SearchResult = {
      themes: [],
      semantics: [],
      episodes: undefined,
      totalTokens: 0,
      expandedLevels: [],
    };

    // Step 1: Search Themes
    const themeResults = this.themeManager.searchThemes(
      queryEmbedding,
      opts.topKThemes
    );

    result.themes = themeResults.map(r => r.theme);
    result.expandedLevels.push(3);

    if (themeResults.length === 0) {
      // No themes exist, search semantics directly
      return this.searchSemanticsOnly(query, opts);
    }

    // Step 2: Check if we need to expand
    const topScore = themeResults[0]?.similarity ?? 0;

    if (topScore >= opts.expandThreshold) {
      // High confidence: return theme-level summary
      result.totalTokens = this.estimateTokens(result.themes);
      return result;
    }

    // Step 3: Expand to Semantics
    result.expandedLevels.push(2);
    const semanticIds = this.collectSemanticIds(result.themes);
    result.semantics = await this.semanticStore.getByIds(semanticIds);

    // Re-rank semantics by query similarity
    result.semantics = await this.rerankBySimilarity(
      result.semantics,
      queryEmbedding
    );

    result.totalTokens = this.estimateTokens(result.themes, result.semantics);

    // Step 4: Check token budget and uncertainty
    if (result.totalTokens < opts.maxTokens * 0.5 && topScore < 0.5) {
      // Still uncertain and have budget: expand to episodes
      result.expandedLevels.push(1);
      result.episodes = await this.getRelatedEpisodes(result.semantics);
      result.totalTokens = this.estimateTokens(
        result.themes,
        result.semantics,
        result.episodes
      );
    }

    return result;
  }

  // ============ Private Methods ============

  private async searchSemanticsOnly(
    query: string,
    opts: AdaptiveSearchOptions
  ): Promise<SearchResult> {
    const semantics = await this.semanticStore.search(query, 10);

    return {
      themes: [],
      semantics,
      episodes: undefined,
      totalTokens: this.estimateTokens([], semantics),
      expandedLevels: [2],
    };
  }

  private collectSemanticIds(themes: ThemeNode[]): string[] {
    const ids = new Set<string>();
    for (const theme of themes) {
      for (const id of theme.semanticIds) {
        ids.add(id);
      }
    }
    return Array.from(ids);
  }

  private async rerankBySimilarity(
    semantics: SemanticMemory[],
    queryEmbedding: number[]
  ): Promise<SemanticMemory[]> {
    return semantics
      .map(sem => ({
        sem,
        sim: this.cosineSim(sem.embedding, queryEmbedding),
      }))
      .sort((a, b) => b.sim - a.sim)
      .map(x => x.sem);
  }

  private async getRelatedEpisodes(
    semantics: SemanticMemory[]
  ): Promise<EpisodeMemory[]> {
    const episodeIds = new Set<string>();

    for (const sem of semantics) {
      for (const epId of sem.sourceEpisodes) {
        episodeIds.add(epId);
      }
    }

    // Fetch from graph
    const episodes: EpisodeMemory[] = [];
    for (const epId of episodeIds) {
      const node = this.graph.findNodeByRawId(epId);
      if (node && node.level === 1) {
        episodes.push({
          episodeId: node.rawId,
          title: node.metadata.title as string || '',
          content: node.text,
          embedding: node.embedding || [],
          messageIds: node.metadata.messageIds as string[] || [],
          startTime: node.metadata.startTime as string || '',
          endTime: node.metadata.endTime as string || '',
        });
      }
    }

    return episodes;
  }

  private cosineSim(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-12);
  }

  private estimateTokens(
    themes: ThemeNode[],
    semantics?: SemanticMemory[],
    episodes?: EpisodeMemory[]
  ): number {
    let tokens = 0;

    // Rough estimation: 1 token ≈ 4 chars
    for (const t of themes) {
      tokens += Math.ceil(t.summary.length / 4);
    }

    for (const s of semantics || []) {
      tokens += Math.ceil(s.content.length / 4);
    }

    for (const e of episodes || []) {
      tokens += Math.ceil(e.content.length / 4);
    }

    return tokens;
  }
}

// ============ SemanticStore Interface ============

export interface SemanticStore {
  search(query: string, limit: number): Promise<SemanticMemory[]>;
  getByIds(ids: string[]): Promise<SemanticMemory[]>;
  add(memory: Omit<SemanticMemory, 'memoryId'>): Promise<SemanticMemory>;
}
```

---

## 6. Integration with Existing OMP System

### 6.1 Memory Extraction Skill Updates

修改 `_omp/skills/memory-extraction/SKILL.md`，在提取流程中添加 Theme 层处理：

```markdown
## 三层记忆架构（升级版）

| 层级 | 存储位置 | 用途 | 触发时机 |
|------|----------|------|----------|
| **Themes (L3)** | `_omp/memory/themes/` | 高层主题聚合 | 会话结束时 |
| **Semantics (L2)** | openmemory MCP | 语义事实 | 每次提取 |
| **Episodes/Context** | `_omp/memory/*.md` | 项目上下文 | 实时更新 |

### Theme 层触发规则

当 Session 结束时 (`/memory wrap-up` 或会话自然结束):
1. 收集本次会话新增的 Semantic memories
2. 调用 ThemeManager.assimilate() 将它们聚合到主题
3. 更新 themes.yaml 文件
```

### 6.2 CLI Command Updates

修改 `cli/src/commands/search.ts`，集成自适应检索：

```typescript
// 新增选项
interface SearchOptions {
  query: string;
  limit?: number;
  level?: 'theme' | 'semantic' | 'all';  // NEW
  expand?: boolean;                       // NEW
}

export async function searchCommand(options: SearchOptions): Promise<void> {
  const { query, limit = 10, level = 'all', expand = true } = options;

  // Initialize components
  const themeManager = new ThemeManager(OMP_MEMORY_DIR, USER_ID);
  const graph = new HierarchicalMemoryGraph(OMP_MEMORY_DIR);
  const semanticStore = new OpenMemoryMCPStore(); // Adapter

  const search = new AdaptiveSearch(themeManager, graph, semanticStore);

  // Get embedding for query
  const queryEmb = await getEmbedding(query);

  // Perform search
  const result = await search.search(query, queryEmb, {
    topKThemes: level === 'theme' ? limit : 3,
    expandThreshold: expand ? 0.75 : 1.0,
  });

  // Display results
  displaySearchResults(result);
}
```

---

## 7. Storage Schema

### 7.1 themes.yaml Template

```yaml
# _omp/memory/themes.yaml
# xMemory Theme Layer - Auto-generated
version: "1.0"
userId: "{{USER_ID}}"
config:
  attachThreshold: 0.62
  maxThemeSize: 12
  minIntraSimilarity: 0.72
  mergeThreshold: 0.78

themes:
  - themeId: "uuid-example-001"
    summary: "TypeScript 开发偏好和严格模式配置"
    keywords:
      - TypeScript
      - strict mode
      - 类型安全
      - ESLint
    semanticIds:
      - "mem-ts-strict-001"
      - "mem-ts-config-002"
    memberCount: 2
    neighbors:
      - "uuid-example-002"
    neighborSims:
      - 0.78
    createdAt: "2026-02-28T10:00:00Z"
    updatedAt: "2026-02-28T10:00:00Z"

  - themeId: "uuid-example-002"
    summary: "测试策略和 Vitest 配置"
    keywords:
      - Vitest
      - unit test
      - coverage
      - TDD
    semanticIds:
      - "mem-vitest-001"
    memberCount: 1
    neighbors:
      - "uuid-example-001"
    neighborSims:
      - 0.78
    createdAt: "2026-02-28T10:00:00Z"
    updatedAt: "2026-02-28T10:00:00Z"

metadata:
  totalThemes: 2
  totalSemantics: 3
  lastAssimilation: "2026-02-28T10:00:00Z"
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `cli/src/lib/memory/xmemory-types.ts`
- [ ] Create `cli/src/lib/memory/theme-manager.ts`
- [ ] Create `cli/src/lib/memory/hierarchy-graph.ts`
- [ ] Add unit tests for core classes

### Phase 2: Integration (Week 3-4)
- [ ] Create `cli/src/lib/memory/adaptive-search.ts`
- [ ] Implement OpenMemory MCP adapter (`SemanticStore`)
- [ ] Update `cli/src/commands/search.ts`
- [ ] Add themes.yaml template to `cli/templates/`

### Phase 3: Skill Updates (Week 5)
- [ ] Update `_omp/skills/memory-extraction/SKILL.md`
- [ ] Add theme extraction workflow
- [ ] Integration testing

### Phase 4: Documentation & Polish (Week 6)
- [ ] Update CLI help text
- [ ] Add migration guide for existing users
- [ ] Performance optimization

---

## 9. Key Configuration Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `ATTACH_THRESHOLD` | 0.62 | Minimum similarity to attach semantic to theme |
| `MAX_THEME_SIZE` | 12 | Maximum semantics per theme before split |
| `MIN_INTRA_SIMILARITY` | 0.72 | Minimum similarity within theme cluster |
| `MERGE_THRESHOLD` | 0.78 | Minimum similarity to merge two themes |
| `LENIENT_ATTACH_FLOOR` | 0.52 | Fallback threshold for small themes |
| `KNN_K` | 10 | Number of neighbor themes to track |
| `EXPAND_THRESHOLD` | 0.75 | Theme score threshold for expansion |
| `MAX_CONTEXT_TOKENS` | 4000 | Default token budget for retrieval |

---

## 10. References

1. **xMemory Paper**: "Beyond RAG for Agent Memory: Retrieval by Decoupling and Aggregation" (2026)
   - GitHub: https://github.com/HU-xiaobai/xMemory

2. **OpenMemory Plus**:
   - Repository: openmemory-plus CLI
   - Current memory types: `cli/src/lib/memory/types.ts`

3. **Key Algorithms**:
   - Sparsity-Semantics Objective: `f = SparsityScore + SemScore`
   - Online Centroid Update: `c_new = (c_old * (n-1) + v_new) / n`

---

**Document Status**: ✅ Complete
**Next Steps**: Begin Phase 1 implementation

