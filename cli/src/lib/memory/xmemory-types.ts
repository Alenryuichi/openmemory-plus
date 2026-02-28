/**
 * OpenMemory Plus - xMemory Hierarchical Types
 * Based on xMemory paper: 4-level memory architecture
 * L3: Themes, L2: Semantics, L1: Episodes, L0: Messages
 */

// ============ Memory Level Enum ============

export type MemoryLevel = 'L0' | 'L1' | 'L2' | 'L3';

// ============ Theme Node (L3) ============

export interface ThemeNode {
  themeId: string;
  summary: string;
  centroid: number[]; // Averaged embedding of member semantics
  semanticIds: string[]; // References to L2 semantic memories
  neighbors: string[]; // KNN neighbor theme IDs
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Semantic Memory (L2) ============

export interface SemanticMemory {
  memoryId: string;
  content: string;
  embedding: number[];
  themeId?: string; // Reference to parent theme
  sourceEpisodes: string[]; // References to L1 episodes
  importance: number; // 0-1 score
  createdAt: Date;
  lastAccessedAt: Date;
}

// ============ Episode Memory (L1) ============

export interface EpisodeMemory {
  episodeId: string;
  title: string;
  content: string;
  embedding?: number[];
  messageIds: string[]; // References to L0 messages (not persisted)
  timestamp: Date;
  duration?: number; // Seconds
  metadata?: Record<string, unknown>;
}

// ============ Theme Configuration ============

export interface ThemeConfig {
  // Similarity threshold for attaching semantic to existing theme
  attachThreshold: number;
  // Maximum members before splitting a theme
  maxThemeSize: number;
  // Similarity threshold for merging two themes
  mergeThreshold: number;
  // Number of KNN neighbors to maintain
  knnK: number;
  // Threshold for expanding search from theme to semantics
  expandThreshold: number;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  attachThreshold: 0.62,
  maxThemeSize: 12,
  mergeThreshold: 0.78,
  knnK: 10,
  expandThreshold: 0.75,
};

// ============ Search Types ============

export interface AdaptiveSearchOptions {
  topKThemes: number;
  topKSemantics: number;
  maxTokenBudget: number;
  expandToSemantics: boolean;
  expandToEpisodes: boolean;
}

export const DEFAULT_SEARCH_OPTIONS: AdaptiveSearchOptions = {
  topKThemes: 3,
  topKSemantics: 10,
  maxTokenBudget: 4000,
  expandToSemantics: true,
  expandToEpisodes: false,
};

export interface SearchResult {
  level: MemoryLevel;
  id: string;
  content: string;
  score: number;
  metadata?: {
    themeId?: string;
    themeSummary?: string;
    episodeTitle?: string;
  };
}

// ============ Hierarchical Graph Node ============

export interface HierarchyNode {
  id: string; // Prefixed: T_{uuid}, S_{uuid}, E_{uuid}, M_{uuid}
  level: MemoryLevel;
  rawId: string; // Original ID without prefix
  text: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface HierarchyEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: 'parent' | 'sibling' | 'temporal' | 'knn';
  weight?: number;
  createdAt: Date;
}

export interface HierarchyGraphData {
  nodes: HierarchyNode[];
  edges: HierarchyEdge[];
  version: string;
  updatedAt: Date;
}

// ============ Theme Storage Types ============

export interface ThemeIndexData {
  version: string;
  themes: Omit<ThemeNode, 'centroid'>[]; // Centroids stored separately
  metadata: {
    totalThemes: number;
    lastAssimilation: string | null;
  };
}

export interface ThemeEmbeddingsData {
  [themeId: string]: number[];
}

// ============ Semantic Store Interface ============

export interface SemanticStore {
  search(queryEmbedding: number[], topK: number): Promise<SemanticMemory[]>;
  getById(memoryId: string): Promise<SemanticMemory | null>;
  getByIds(memoryIds: string[]): Promise<SemanticMemory[]>;
}

