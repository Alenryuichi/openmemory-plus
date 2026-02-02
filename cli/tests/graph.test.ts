import { describe, it, expect, beforeEach } from 'vitest';
import { GraphStore } from '../src/lib/memory/graph.js';

describe('Graph Memory', () => {
  let store: GraphStore;

  beforeEach(() => {
    store = new GraphStore();
  });

  describe('Entity Operations', () => {
    it('should add an entity', () => {
      const entity = store.addEntity({
        type: 'service',
        name: 'API Service',
        properties: { port: 3000 },
      });

      expect(entity.id).toBeDefined();
      expect(entity.name).toBe('API Service');
      expect(entity.type).toBe('service');
      expect(entity.createdAt).toBeInstanceOf(Date);
    });

    it('should get entity by id', () => {
      const created = store.addEntity({
        type: 'database',
        name: 'PostgreSQL',
        properties: {},
      });

      const found = store.getEntity(created.id);
      expect(found).toEqual(created);
    });

    it('should find entities by type', () => {
      store.addEntity({ type: 'service', name: 'API', properties: {} });
      store.addEntity({ type: 'service', name: 'Worker', properties: {} });
      store.addEntity({ type: 'database', name: 'DB', properties: {} });

      const services = store.findEntitiesByType('service');
      expect(services.length).toBe(2);
    });

    it('should find entities by name', () => {
      store.addEntity({ type: 'service', name: 'User API', properties: {} });
      store.addEntity({ type: 'service', name: 'Order API', properties: {} });

      const found = store.findEntitiesByName('user');
      expect(found.length).toBe(1);
      expect(found[0].name).toBe('User API');
    });

    it('should update entity', () => {
      const entity = store.addEntity({
        type: 'config',
        name: 'App Config',
        properties: { debug: false },
      });

      const updated = store.updateEntity(entity.id, {
        properties: { debug: true },
      });

      expect(updated?.properties.debug).toBe(true);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(entity.createdAt.getTime());
    });
  });

  describe('Relation Operations', () => {
    it('should add a relation', () => {
      const api = store.addEntity({ type: 'service', name: 'API', properties: {} });
      const db = store.addEntity({ type: 'database', name: 'DB', properties: {} });

      const relation = store.addRelation({
        sourceId: api.id,
        targetId: db.id,
        type: 'depends_on',
        properties: {},
      });

      expect(relation.id).toBeDefined();
      expect(relation.type).toBe('depends_on');
    });

    it('should get relations for entity', () => {
      const api = store.addEntity({ type: 'service', name: 'API', properties: {} });
      const db = store.addEntity({ type: 'database', name: 'DB', properties: {} });
      const cache = store.addEntity({ type: 'service', name: 'Cache', properties: {} });

      store.addRelation({ sourceId: api.id, targetId: db.id, type: 'depends_on', properties: {} });
      store.addRelation({ sourceId: api.id, targetId: cache.id, type: 'uses', properties: {} });

      const relations = store.getRelationsFor(api.id);
      expect(relations.length).toBe(2);
    });
  });

  describe('Graph Queries', () => {
    it('should query related entities', () => {
      const api = store.addEntity({ type: 'service', name: 'API', properties: {} });
      const db = store.addEntity({ type: 'database', name: 'DB', properties: {} });
      const config = store.addEntity({ type: 'config', name: 'Config', properties: {} });

      store.addRelation({ sourceId: api.id, targetId: db.id, type: 'depends_on', properties: {} });
      store.addRelation({ sourceId: api.id, targetId: config.id, type: 'configured_by', properties: {} });

      const related = store.queryRelated(api.id, 1);
      expect(related.length).toBe(2);
    });

    it('should respect depth limit', () => {
      const a = store.addEntity({ type: 'service', name: 'A', properties: {} });
      const b = store.addEntity({ type: 'service', name: 'B', properties: {} });
      const c = store.addEntity({ type: 'service', name: 'C', properties: {} });

      store.addRelation({ sourceId: a.id, targetId: b.id, type: 'related_to', properties: {} });
      store.addRelation({ sourceId: b.id, targetId: c.id, type: 'related_to', properties: {} });

      const depth1 = store.queryRelated(a.id, 1);
      expect(depth1.length).toBe(1);
      expect(depth1[0].name).toBe('B');

      const depth2 = store.queryRelated(a.id, 2);
      expect(depth2.length).toBe(2);
    });
  });

  describe('Serialization', () => {
    it('should serialize to GraphMemory', () => {
      store.addEntity({ type: 'service', name: 'API', properties: {} });
      store.addEntity({ type: 'database', name: 'DB', properties: {} });

      const graph = store.toGraphMemory();
      expect(graph.entities.length).toBe(2);
      expect(graph.version).toBe('1.0');
    });

    it('should load from GraphMemory', () => {
      const api = store.addEntity({ type: 'service', name: 'API', properties: {} });
      const db = store.addEntity({ type: 'database', name: 'DB', properties: {} });
      store.addRelation({ sourceId: api.id, targetId: db.id, type: 'depends_on', properties: {} });

      const graph = store.toGraphMemory();

      const newStore = new GraphStore(graph);
      expect(newStore.getStats().entities).toBe(2);
      expect(newStore.getStats().relations).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      store.addEntity({ type: 'service', name: 'API', properties: {} });
      store.addEntity({ type: 'service', name: 'Worker', properties: {} });
      store.addEntity({ type: 'database', name: 'DB', properties: {} });

      const stats = store.getStats();
      expect(stats.entities).toBe(3);
      expect(stats.byType.service).toBe(2);
      expect(stats.byType.database).toBe(1);
    });
  });
});

