/**
 * OpenMemory Plus - Scoped Memory Manager
 * Implements dual-layer memory architecture for multi-agent teams
 * 
 * Architecture:
 * - Team shared memory: _omp/memory/
 * - Agent private memory: _omp/agents/{agent_id}/memory/
 * - Handoff records: _omp/memory/handoffs/
 */

import * as path from 'node:path';
import * as YAML from 'yaml';
import {
  MemoryScope,
  AgentDefinition,
  TeamConfig,
  TeamMemoryConfig,
  DEFAULT_TEAM_MEMORY_CONFIG,
  ActorAttribution,
  HandoffRecord,
  HandoffStatus,
  SemanticMemory,
  ThemeNode,
} from './xmemory-types.js';
import { FileSystem, nodeFs, ensureDir } from './filesystem.js';

// ============ Scoped Memory Manager ============

export interface ScopedMemoryOptions {
  baseDir: string; // Project root (e.g., 'openclaw/')
  teamConfig?: TeamConfig;
  fs?: FileSystem;
}

export class ScopedMemoryManager {
  private baseDir: string;
  private teamConfig: TeamConfig | null;
  private memoryConfig: TeamMemoryConfig;
  private fs: FileSystem;

  constructor(options: ScopedMemoryOptions) {
    this.baseDir = options.baseDir;
    this.teamConfig = options.teamConfig ?? null;
    this.memoryConfig = options.teamConfig?.memory ?? DEFAULT_TEAM_MEMORY_CONFIG;
    this.fs = options.fs ?? nodeFs;
  }

  // ============ Path Resolution ============

  /**
   * Get path for team shared memory
   */
  getTeamMemoryPath(): string {
    return path.join(this.baseDir, this.memoryConfig.teamSharedPath);
  }

  /**
   * Get path for agent-specific memory
   */
  getAgentMemoryPath(agentId: string): string {
    const template = this.memoryConfig.agentScopesPath;
    const resolved = template.replace('{agent_id}', agentId);
    return path.join(this.baseDir, resolved);
  }

  /**
   * Get path for handoff records
   */
  getHandoffsPath(): string {
    return path.join(this.baseDir, this.memoryConfig.handoffsPath);
  }

  /**
   * Resolve memory path based on scope
   */
  resolveMemoryPath(scope: MemoryScope, agentId?: string): string {
    if (scope === 'team') {
      return this.getTeamMemoryPath();
    }
    if (!agentId) {
      throw new Error('agentId is required for agent-scoped memory');
    }
    return this.getAgentMemoryPath(agentId);
  }

  // ============ Directory Initialization ============

  /**
   * Initialize directory structure for multi-agent team
   */
  initializeTeamStructure(): void {
    // Create team shared memory directory
    const teamPath = this.getTeamMemoryPath();
    ensureDir(this.fs, teamPath);
    ensureDir(this.fs, path.join(teamPath, 'themes'));
    ensureDir(this.fs, this.getHandoffsPath());

    // Create agent-specific directories if team config exists
    if (this.teamConfig) {
      for (const agent of this.teamConfig.agents) {
        const agentPath = this.getAgentMemoryPath(agent.id);
        ensureDir(this.fs, agentPath);
        ensureDir(this.fs, path.join(agentPath, 'themes'));
      }
    }
  }

  // ============ Agent Registry ============

  /**
   * Get agent definition by ID
   */
  getAgent(agentId: string): AgentDefinition | undefined {
    return this.teamConfig?.agents.find(a => a.id === agentId);
  }

  /**
   * List all registered agents
   */
  listAgents(): AgentDefinition[] {
    return this.teamConfig?.agents ?? [];
  }

  /**
   * Check if agent exists
   */
  hasAgent(agentId: string): boolean {
    return this.teamConfig?.agents.some(a => a.id === agentId) ?? false;
  }

  // ============ Actor Attribution ============

  /**
   * Create actor attribution for a memory entry
   */
  createActorAttribution(actorId: string, actorType: 'agent' | 'user'): ActorAttribution {
    return {
      actorId,
      actorType,
      timestamp: new Date(),
    };
  }

  // ============ Scope Filtering ============

  /**
   * Filter memories by scope
   */
  filterByScope<T extends { scope?: MemoryScope; agentId?: string }>(
    memories: T[],
    scope: MemoryScope,
    agentId?: string,
    includeTeamMemory = true
  ): T[] {
    return memories.filter(m => {
      if (scope === 'team') {
        return m.scope === 'team' || m.scope === undefined;
      }
      // Agent scope: include agent's own + optionally team shared
      const isOwnMemory = m.agentId === agentId;
      const isTeamMemory = m.scope === 'team' || m.scope === undefined;
      return isOwnMemory || (includeTeamMemory && isTeamMemory);
    });
  }

  // ============ Handoff Management ============

  /**
   * Create a handoff record
   */
  createHandoff(
    fromAgent: string,
    toAgent: string,
    context: string,
    progress: number,
    artifacts?: string[]
  ): HandoffRecord {
    const handoffId = `handoff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: HandoffRecord = {
      handoffId,
      fromAgent,
      toAgent,
      timestamp: new Date(),
      status: 'pending',
      context,
      progress,
      artifacts,
    };

    // Save handoff record
    this.saveHandoff(record);
    return record;
  }

  /**
   * Accept a pending handoff
   */
  acceptHandoff(handoffId: string): HandoffRecord | null {
    const record = this.loadHandoff(handoffId);
    if (!record || record.status !== 'pending') {
      return null;
    }

    record.status = 'accepted';
    record.acceptedAt = new Date();
    this.saveHandoff(record);
    return record;
  }

  /**
   * Complete a handoff
   */
  completeHandoff(handoffId: string, notes?: string): HandoffRecord | null {
    const record = this.loadHandoff(handoffId);
    if (!record || record.status !== 'accepted') {
      return null;
    }

    record.status = 'completed';
    record.notes = notes;
    this.saveHandoff(record);
    return record;
  }

  /**
   * Save handoff record to file
   */
  private saveHandoff(record: HandoffRecord): void {
    const handoffsDir = this.getHandoffsPath();
    ensureDir(this.fs, handoffsDir);

    const filename = `${record.handoffId}.yaml`;
    const filepath = path.join(handoffsDir, filename);
    const content = YAML.stringify(record);
    this.fs.writeFileSync(filepath, content);
  }

  /**
   * Load handoff record from file
   */
  private loadHandoff(handoffId: string): HandoffRecord | null {
    const filepath = path.join(this.getHandoffsPath(), `${handoffId}.yaml`);
    if (!this.fs.existsSync(filepath)) {
      return null;
    }

    try {
      const content = this.fs.readFileSync(filepath, 'utf-8');
      return YAML.parse(content) as HandoffRecord;
    } catch {
      return null;
    }
  }

  /**
   * List pending handoffs for an agent
   */
  listPendingHandoffs(agentId: string): HandoffRecord[] {
    const handoffsDir = this.getHandoffsPath();
    if (!this.fs.existsSync(handoffsDir)) {
      return [];
    }

    // Note: In real implementation, would scan directory
    // For now, return empty array - to be enhanced
    return [];
  }
}

