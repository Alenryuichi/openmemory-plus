/**
 * OpenMemory Plus - Graph Memory System
 * Entity-relationship graph for knowledge representation
 */

import { Entity, Relation, GraphMemory, EntityType, RelationType } from './types.js';
import { randomUUID } from 'crypto';

/**
 * In-memory graph store (can be persisted to memory/graph.yaml)
 */
export class GraphStore {
  private entities: Map<string, Entity> = new Map();
  private relations: Map<string, Relation> = new Map();
  private entityIndex: Map<string, Set<string>> = new Map(); // type -> entity ids
  private relationIndex: Map<string, Set<string>> = new Map(); // entityId -> relation ids

  constructor(initial?: GraphMemory) {
    if (initial) {
      this.load(initial);
    }
  }

  // ============ Entity Operations ============

  addEntity(data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity {
    const entity: Entity = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entities.set(entity.id, entity);
    
    // Update type index
    if (!this.entityIndex.has(entity.type)) {
      this.entityIndex.set(entity.type, new Set());
    }
    this.entityIndex.get(entity.type)!.add(entity.id);

    return entity;
  }

  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  findEntitiesByType(type: EntityType): Entity[] {
    const ids = this.entityIndex.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.entities.get(id)!);
  }

  findEntitiesByName(name: string): Entity[] {
    const lowerName = name.toLowerCase();
    return Array.from(this.entities.values()).filter(
      e => e.name.toLowerCase().includes(lowerName)
    );
  }

  updateEntity(id: string, updates: Partial<Omit<Entity, 'id' | 'createdAt'>>): Entity | undefined {
    const entity = this.entities.get(id);
    if (!entity) return undefined;

    const updated: Entity = {
      ...entity,
      ...updates,
      updatedAt: new Date(),
    };
    this.entities.set(id, updated);
    return updated;
  }

  // ============ Relation Operations ============

  addRelation(data: Omit<Relation, 'id' | 'createdAt'>): Relation {
    const relation: Relation = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
    };

    this.relations.set(relation.id, relation);

    // Update relation index for both source and target
    for (const entityId of [relation.sourceId, relation.targetId]) {
      if (!this.relationIndex.has(entityId)) {
        this.relationIndex.set(entityId, new Set());
      }
      this.relationIndex.get(entityId)!.add(relation.id);
    }

    return relation;
  }

  getRelationsFor(entityId: string): Relation[] {
    const ids = this.relationIndex.get(entityId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.relations.get(id)!);
  }

  // ============ Graph Queries ============

  /**
   * Find all entities related to a given entity up to a certain depth
   */
  queryRelated(entityId: string, depth: number = 1): Entity[] {
    const visited = new Set<string>();
    const result: Entity[] = [];
    
    this.traverseRelated(entityId, depth, visited, result);
    
    return result;
  }

  private traverseRelated(
    entityId: string,
    depth: number,
    visited: Set<string>,
    result: Entity[]
  ): void {
    if (depth <= 0 || visited.has(entityId)) return;
    visited.add(entityId);

    const relations = this.getRelationsFor(entityId);
    for (const rel of relations) {
      const relatedId = rel.sourceId === entityId ? rel.targetId : rel.sourceId;
      if (!visited.has(relatedId)) {
        const entity = this.entities.get(relatedId);
        if (entity) {
          result.push(entity);
          this.traverseRelated(relatedId, depth - 1, visited, result);
        }
      }
    }
  }

  // ============ Serialization ============

  toGraphMemory(): GraphMemory {
    return {
      entities: Array.from(this.entities.values()),
      relations: Array.from(this.relations.values()),
      version: '1.0',
      updatedAt: new Date(),
    };
  }

  load(data: GraphMemory): void {
    this.entities.clear();
    this.relations.clear();
    this.entityIndex.clear();
    this.relationIndex.clear();

    for (const entity of data.entities) {
      this.entities.set(entity.id, entity);
      if (!this.entityIndex.has(entity.type)) {
        this.entityIndex.set(entity.type, new Set());
      }
      this.entityIndex.get(entity.type)!.add(entity.id);
    }

    for (const relation of data.relations) {
      this.relations.set(relation.id, relation);
      for (const entityId of [relation.sourceId, relation.targetId]) {
        if (!this.relationIndex.has(entityId)) {
          this.relationIndex.set(entityId, new Set());
        }
        this.relationIndex.get(entityId)!.add(relation.id);
      }
    }
  }

  // ============ Statistics ============

  getStats(): { entities: number; relations: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const [type, ids] of this.entityIndex) {
      byType[type] = ids.size;
    }
    return {
      entities: this.entities.size,
      relations: this.relations.size,
      byType,
    };
  }
}

