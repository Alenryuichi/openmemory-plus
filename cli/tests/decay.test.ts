import { describe, it, expect } from 'vitest';
import {
  calculateDecayScore,
  shouldCleanup,
  getDecayStatus,
  groupByDecayStatus,
  updateDecayScores,
} from '../src/lib/memory/decay.js';
import { MemoryMetadata, DEFAULT_DECAY_CONFIG } from '../src/lib/memory/types.js';

function createMemory(overrides: Partial<MemoryMetadata> = {}): MemoryMetadata {
  const now = new Date();
  return {
    id: 'test-id',
    content: 'test content',
    category: 'user',
    tags: [],
    createdAt: now,
    lastAccessedAt: now,
    accessCount: 0,
    decayScore: 1.0,
    source: 'conversation',
    ...overrides,
  };
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

describe('Memory Decay', () => {
  describe('calculateDecayScore', () => {
    it('should return 1.0 for recently accessed memory', () => {
      const memory = createMemory({ lastAccessedAt: new Date() });
      expect(calculateDecayScore(memory)).toBe(1.0);
    });

    it('should return 1.0 for memory within grace period', () => {
      const memory = createMemory({ lastAccessedAt: daysAgo(5) });
      expect(calculateDecayScore(memory)).toBe(1.0);
    });

    it('should return 1.0 for core memory (high access count)', () => {
      const memory = createMemory({
        lastAccessedAt: daysAgo(100),
        accessCount: 10,
      });
      expect(calculateDecayScore(memory)).toBe(1.0);
    });

    it('should decay after grace period', () => {
      const memory = createMemory({ lastAccessedAt: daysAgo(20) });
      const score = calculateDecayScore(memory);
      expect(score).toBeLessThan(1.0);
      expect(score).toBeGreaterThan(0);
    });

    it('should decay more with longer time', () => {
      const memory30 = createMemory({ lastAccessedAt: daysAgo(30) });
      const memory60 = createMemory({ lastAccessedAt: daysAgo(60) });
      
      expect(calculateDecayScore(memory30)).toBeGreaterThan(calculateDecayScore(memory60));
    });

    it('should give access bonus', () => {
      const noAccess = createMemory({ lastAccessedAt: daysAgo(30), accessCount: 0 });
      const someAccess = createMemory({ lastAccessedAt: daysAgo(30), accessCount: 3 });
      
      expect(calculateDecayScore(someAccess)).toBeGreaterThan(calculateDecayScore(noAccess));
    });
  });

  describe('shouldCleanup', () => {
    it('should not cleanup recent memory', () => {
      const memory = createMemory({ lastAccessedAt: new Date() });
      expect(shouldCleanup(memory)).toBe(false);
    });

    it('should not cleanup core memory', () => {
      const memory = createMemory({
        lastAccessedAt: daysAgo(100),
        accessCount: 10,
      });
      expect(shouldCleanup(memory)).toBe(false);
    });

    it('should cleanup old unused memory', () => {
      const memory = createMemory({
        lastAccessedAt: daysAgo(100),
        accessCount: 0,
      });
      expect(shouldCleanup(memory)).toBe(true);
    });
  });

  describe('getDecayStatus', () => {
    it('should return active for recent memory', () => {
      const memory = createMemory({ lastAccessedAt: new Date() });
      expect(getDecayStatus(memory)).toBe('active');
    });

    it('should return active for core memory', () => {
      const memory = createMemory({ accessCount: 10, lastAccessedAt: daysAgo(50) });
      expect(getDecayStatus(memory)).toBe('active');
    });

    it('should return aging for moderately old memory', () => {
      const memory = createMemory({ lastAccessedAt: daysAgo(40), accessCount: 1 });
      expect(getDecayStatus(memory)).toBe('aging');
    });

    it('should return cleanup for very old unused memory', () => {
      const memory = createMemory({ lastAccessedAt: daysAgo(100), accessCount: 0 });
      expect(getDecayStatus(memory)).toBe('cleanup');
    });
  });

  describe('groupByDecayStatus', () => {
    it('should group memories correctly', () => {
      const memories = [
        createMemory({ id: '1', lastAccessedAt: new Date() }),
        createMemory({ id: '2', lastAccessedAt: daysAgo(100), accessCount: 0 }),
        createMemory({ id: '3', accessCount: 10, lastAccessedAt: daysAgo(50) }),
      ];

      const groups = groupByDecayStatus(memories);
      
      expect(groups.active.length).toBe(2);
      expect(groups.cleanup.length).toBe(1);
    });
  });

  describe('updateDecayScores', () => {
    it('should update decay scores for all memories', () => {
      const memories = [
        createMemory({ id: '1', lastAccessedAt: new Date(), decayScore: 0 }),
        createMemory({ id: '2', lastAccessedAt: daysAgo(30), decayScore: 0 }),
      ];

      const updated = updateDecayScores(memories);
      
      expect(updated[0].decayScore).toBe(1.0);
      expect(updated[1].decayScore).toBeLessThan(1.0);
    });
  });
});

