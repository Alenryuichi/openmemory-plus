/**
 * OpenMemory Plus - Scoped Memory Manager
 * Implements dual-layer memory architecture for multi-agent teams
 * 
 * Architecture:
 * - Team shared memory: _omp/memory/
 * - Agent private memory: _omp/agents/{agent_id}/memory/
 * - Handoff records: _omp/memory/handoffs/
 */

import { randomUUID } from 'crypto';
import * as fs from 'node:fs';
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
   * @throws Error if fromAgent or toAgent not registered (when teamConfig exists)
   * @throws Error if progress is not in 0-100 range
   */
  createHandoff(
    fromAgent: string,
    toAgent: string,
    context: string,
    progress: number,
    artifacts?: string[]
  ): HandoffRecord {
    // Validate agents if team config exists
    if (this.teamConfig) {
      if (!this.hasAgent(fromAgent)) {
        throw new Error(`Unknown source agent: ${fromAgent}`);
      }
      if (!this.hasAgent(toAgent)) {
        throw new Error(`Unknown target agent: ${toAgent}`);
      }
    }

    // Validate progress range
    if (progress < 0 || progress > 100) {
      throw new Error(`Progress must be 0-100, got: ${progress}`);
    }

    const handoffId = `handoff-${Date.now()}-${randomUUID().slice(0, 8)}`;
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
   * Load handoff record from file with proper Date parsing
   */
  private loadHandoff(handoffId: string): HandoffRecord | null {
    const filepath = path.join(this.getHandoffsPath(), `${handoffId}.yaml`);
    if (!this.fs.existsSync(filepath)) {
      return null;
    }

    try {
      const content = this.fs.readFileSync(filepath, 'utf-8');
      const parsed = YAML.parse(content) as Record<string, unknown>;

      // Convert date strings back to Date objects
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp as string),
        acceptedAt: parsed.acceptedAt ? new Date(parsed.acceptedAt as string) : undefined,
      } as HandoffRecord;
    } catch {
      return null;
    }
  }

  /**
   * List pending handoffs for a target agent
   */
  listPendingHandoffs(agentId: string): HandoffRecord[] {
    const handoffsDir = this.getHandoffsPath();
    if (!this.fs.existsSync(handoffsDir)) {
      return [];
    }

    const pendingHandoffs: HandoffRecord[] = [];

    try {
      // Use native fs to list directory (FileSystem interface doesn't have readdirSync)
      const files = fs.readdirSync(handoffsDir);

      for (const file of files) {
        if (!file.endsWith('.yaml') || file.startsWith('.')) continue;

        const handoffId = file.replace('.yaml', '');
        const record = this.loadHandoff(handoffId);

        if (record && record.status === 'pending' && record.toAgent === agentId) {
          pendingHandoffs.push(record);
        }
      }
    } catch {
      // Directory read error, return empty
    }

    return pendingHandoffs;
  }
}

