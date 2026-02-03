/**
 * OpenMemory Plus - Memory Decay System
 * Implements time-based relevance scoring for memories
 */

import { MemoryMetadata, DecayConfig, DEFAULT_DECAY_CONFIG } from './types.js';

/**
 * Calculate the decay score for a memory based on time and access patterns
 * Score ranges from 0 (should be forgotten) to 1 (highly relevant)
 */
export function calculateDecayScore(
  memory: MemoryMetadata,
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date()
): number {
  const daysSinceAccess = getDaysBetween(memory.lastAccessedAt, now);
  const daysSinceCreation = getDaysBetween(memory.createdAt, now);
  
  // Core memories (frequently accessed) don't decay
  if (memory.accessCount >= config.coreMemoryAccessThreshold) {
    return 1.0;
  }
  
  // Within grace period, no decay
  if (daysSinceAccess <= config.gracePeriodDays) {
    return 1.0;
  }
  
  // Calculate decay after grace period
  const daysDecaying = daysSinceAccess - config.gracePeriodDays;
  const decayAmount = daysDecaying * config.dailyDecayRate;
  
  // Access count provides some protection against decay
  const accessBonus = Math.min(memory.accessCount * 0.1, 0.3);
  
  // Calculate final score
  const score = Math.max(0, 1.0 - decayAmount + accessBonus);
  
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Determine if a memory should be marked for cleanup
 */
export function shouldCleanup(
  memory: MemoryMetadata,
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date()
): boolean {
  const daysSinceAccess = getDaysBetween(memory.lastAccessedAt, now);
  
  // Never cleanup core memories
  if (memory.accessCount >= config.coreMemoryAccessThreshold) {
    return false;
  }
  
  // Cleanup if past threshold and low decay score
  if (daysSinceAccess >= config.cleanupThresholdDays) {
    const score = calculateDecayScore(memory, config, now);
    return score < 0.2;
  }
  
  return false;
}

/**
 * Categorize memory by its decay status
 */
export type DecayStatus = 'active' | 'aging' | 'stale' | 'cleanup';

export function getDecayStatus(
  memory: MemoryMetadata,
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date()
): DecayStatus {
  const score = calculateDecayScore(memory, config, now);
  const daysSinceAccess = getDaysBetween(memory.lastAccessedAt, now);
  
  if (score >= 0.8 || memory.accessCount >= config.coreMemoryAccessThreshold) {
    return 'active';
  }
  
  if (score >= 0.5) {
    return 'aging';
  }
  
  if (shouldCleanup(memory, config, now)) {
    return 'cleanup';
  }
  
  return 'stale';
}

/**
 * Get memories grouped by decay status
 */
export function groupByDecayStatus(
  memories: MemoryMetadata[],
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date()
): Record<DecayStatus, MemoryMetadata[]> {
  const groups: Record<DecayStatus, MemoryMetadata[]> = {
    active: [],
    aging: [],
    stale: [],
    cleanup: [],
  };
  
  for (const memory of memories) {
    const status = getDecayStatus(memory, config, now);
    groups[status].push(memory);
  }
  
  return groups;
}

/**
 * Update decay scores for all memories
 */
export function updateDecayScores(
  memories: MemoryMetadata[],
  config: DecayConfig = DEFAULT_DECAY_CONFIG,
  now: Date = new Date()
): MemoryMetadata[] {
  return memories.map(memory => ({
    ...memory,
    decayScore: calculateDecayScore(memory, config, now),
  }));
}

// ============ Utility Functions ============

function getDaysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

