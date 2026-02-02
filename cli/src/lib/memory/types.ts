/**
 * OpenMemory Plus - Memory Types
 * Phase 2: Enhanced Memory Capabilities
 */

// ============ Memory Decay Types ============

export interface MemoryMetadata {
  id: string;
  content: string;
  category: 'project' | 'user';
  tags: string[];
  
  // Time-based decay
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  
  // Decay scoring (0-1, lower = more likely to be forgotten)
  decayScore: number;
  
  // Source tracking
  source: 'conversation' | 'manual' | 'import';
  conversationId?: string;
}

export interface DecayConfig {
  // Days until memory starts decaying
  gracePeriodDays: number;
  // Days until memory is marked for cleanup
  cleanupThresholdDays: number;
  // Minimum access count to be considered "core" memory
  coreMemoryAccessThreshold: number;
  // Decay rate per day after grace period (0-1)
  dailyDecayRate: number;
}

export const DEFAULT_DECAY_CONFIG: DecayConfig = {
  gracePeriodDays: 7,
  cleanupThresholdDays: 90,
  coreMemoryAccessThreshold: 5,
  dailyDecayRate: 0.01,
};

// ============ Graph Memory Types ============

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  description?: string;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type EntityType = 
  | 'project'
  | 'service'
  | 'database'
  | 'api'
  | 'config'
  | 'person'
  | 'technology'
  | 'decision'
  | 'preference';

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  properties: Record<string, unknown>;
  createdAt: Date;
}

export type RelationType =
  | 'depends_on'
  | 'configured_by'
  | 'created_by'
  | 'uses'
  | 'prefers'
  | 'decided'
  | 'related_to';

export interface GraphMemory {
  entities: Entity[];
  relations: Relation[];
  version: string;
  updatedAt: Date;
}

// ============ Conflict Detection Types ============

export interface MemoryConflict {
  id: string;
  type: 'value_mismatch' | 'outdated' | 'duplicate';
  projectMemory: {
    path: string;
    key: string;
    value: unknown;
  };
  userMemory: {
    id: string;
    content: string;
  };
  detectedAt: Date;
  resolved: boolean;
  resolution?: 'keep_project' | 'keep_user' | 'merge' | 'ignore';
}

// ============ Memory Store Interface ============

export interface MemoryStore {
  // Basic CRUD
  add(memory: Omit<MemoryMetadata, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount' | 'decayScore'>): Promise<MemoryMetadata>;
  get(id: string): Promise<MemoryMetadata | null>;
  update(id: string, updates: Partial<MemoryMetadata>): Promise<MemoryMetadata>;
  delete(id: string): Promise<boolean>;
  
  // Search
  search(query: string, limit?: number): Promise<MemoryMetadata[]>;
  
  // Decay operations
  getDecayedMemories(threshold: number): Promise<MemoryMetadata[]>;
  refreshAccess(id: string): Promise<void>;
  
  // Graph operations
  getGraph(): Promise<GraphMemory>;
  addEntity(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity>;
  addRelation(relation: Omit<Relation, 'id' | 'createdAt'>): Promise<Relation>;
  queryRelated(entityId: string, depth?: number): Promise<Entity[]>;
}

