/**
 * OpenMemory Plus - xMemory Hierarchical Types
 * Based on xMemory paper: 4-level memory architecture
 * L3: Themes, L2: Semantics, L1: Episodes, L0: Messages
 *
 * Extended for Multi-Agent Team Support (v2.0):
 * - Agent identity and scoped memory
 * - Team shared memory
 * - Handoff protocol
 */

// ============ Memory Level Enum ============

export type MemoryLevel = 'L0' | 'L1' | 'L2' | 'L3';

// ============ Memory Scope (Multi-Agent) ============

export type MemoryScope = 'team' | 'agent';

// ============ Agent Definition ============

export interface AgentDefinition {
  id: string; // Unique agent identifier (e.g., 'tech-lead', 'dev-bot')
  role: AgentRole;
  name?: string; // Human-readable name
  channels?: string[]; // Communication channels (e.g., ['feishu', 'discord'])
  description?: string;
}

export type AgentRole =
  | 'coordinator' // Main orchestrator (e.g., 'main')
  | 'architect' // Technical lead
  | 'developer' // Dev agent
  | 'algorithm' // Algo specialist
  | 'operations' // DevOps
  | 'researcher' // Research agent
  | 'writer' // Documentation
  | 'reviewer' // Code review
  | 'custom'; // User-defined role

// ============ Team Configuration ============

export interface TeamConfig {
  name: string; // Team name (e.g., 'openclaw')
  runId: string; // Project/run identifier for memory partitioning
  agents: AgentDefinition[];
  memory: TeamMemoryConfig;
}

export interface TeamMemoryConfig {
  teamSharedPath: string; // Path to team shared memory (e.g., '_omp/memory/')
  agentScopesPath: string; // Path template for agent scopes (e.g., '_omp/agents/{agent_id}/memory/')
  handoffsPath: string; // Path to handoff records (e.g., '_omp/memory/handoffs/')
}

export const DEFAULT_TEAM_MEMORY_CONFIG: TeamMemoryConfig = {
  teamSharedPath: '_omp/memory/',
  agentScopesPath: '_omp/agents/{agent_id}/memory/',
  handoffsPath: '_omp/memory/handoffs/',
};

// ============ Actor Attribution ============

export interface ActorAttribution {
  actorId: string; // Agent ID or 'user:{username}'
  actorType: 'agent' | 'user';
  timestamp: Date;
}

// ============ Handoff Record ============

export interface HandoffRecord {
  handoffId: string;
  fromAgent: string;
  toAgent: string;
  timestamp: Date;
  status: HandoffStatus;
  context: string; // Summary of work done
  progress: number; // 0-100 percentage
  artifacts?: string[]; // Related file paths
  acceptedAt?: Date;
  notes?: string;
}

export type HandoffStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

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
  // Multi-Agent Support (v2.0)
  scope?: MemoryScope; // 'team' (shared) or 'agent' (private)
  agentId?: string; // Owner agent ID (if scope='agent')
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
  // Multi-Agent Support (v2.0)
  scope?: MemoryScope; // 'team' (shared) or 'agent' (private)
  agentId?: string; // Owner agent ID (if scope='agent')
  actor?: ActorAttribution; // Who created this memory
  categories?: string[]; // Memory categories (e.g., ['decision', 'architecture'])
  runId?: string; // Project/team run ID for partitioning
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
  // Multi-Agent Support (v2.0)
  agentId?: string; // Agent that created this episode
  actor?: ActorAttribution; // Actor attribution
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
  // Similarity threshold for clustering semantics during split (F7 fix)
  clusterThreshold: number;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  attachThreshold: 0.62,
  maxThemeSize: 12,
  mergeThreshold: 0.78,
  knnK: 10,
  expandThreshold: 0.75,
  clusterThreshold: 0.66,
};

// ============ Search Types ============

export interface AdaptiveSearchOptions {
  topKThemes: number;
  topKSemantics: number;
  maxTokenBudget: number;
  expandToSemantics: boolean;
  expandToEpisodes: boolean;
  // Multi-Agent Support (v2.0)
  scope?: MemoryScope; // Filter by scope ('team' or 'agent')
  agentId?: string; // Filter by agent ID (required if scope='agent')
  includeTeamMemory?: boolean; // Include team shared memory in agent search (default: true)
  runId?: string; // Filter by run/project ID
}

export const DEFAULT_SEARCH_OPTIONS: AdaptiveSearchOptions = {
  topKThemes: 3,
  topKSemantics: 10,
  maxTokenBudget: 4000,
  expandToSemantics: true,
  expandToEpisodes: false,
  includeTeamMemory: true,
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
    // Multi-Agent Support (v2.0)
    scope?: MemoryScope;
    agentId?: string;
    actor?: ActorAttribution;
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

