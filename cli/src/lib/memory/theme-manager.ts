/**
 * OpenMemory Plus - Theme Manager
 * Implements xMemory L3 (Theme) layer with lazy loading
 */

import { randomUUID } from 'crypto';
import * as path from 'node:path';
import * as YAML from 'yaml';
import {
  ThemeNode,
  SemanticMemory,
  ThemeConfig,
  DEFAULT_THEME_CONFIG,
  ThemeIndexData,
  ThemeEmbeddingsData,
} from './xmemory-types.js';
import { FileSystem, nodeFs, ensureDir, safeReadJson, safeWriteJson } from './filesystem.js';

// ============ Vector Math Utilities ============

export function cosineSim(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

export function computeCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return [];
  
  const dim = embeddings[0].length;
  const centroid = new Array(dim).fill(0);
  
  for (const emb of embeddings) {
    for (let i = 0; i < dim; i++) {
      centroid[i] += emb[i];
    }
  }
  
  for (let i = 0; i < dim; i++) {
    centroid[i] /= embeddings.length;
  }
  
  return centroid;
}

// ============ Theme Manager Class ============

export class ThemeManager {
  private storageDir: string;
  private userId: string;
  private config: ThemeConfig;
  private fs: FileSystem;

  private themes: Map<string, ThemeNode> = new Map();
  private embeddings: Map<string, number[]> | null = null; // Theme centroids (lazy loaded)
  private embeddingsLoaded = false;

  // Semantic embeddings cache (populated during assimilate, used for clustering)
  private semanticEmbCache: Map<string, number[]> = new Map();

  constructor(
    storageDir: string,
    userId: string,
    config: ThemeConfig = DEFAULT_THEME_CONFIG,
    fs: FileSystem = nodeFs
  ) {
    this.storageDir = storageDir;
    this.userId = userId;
    this.config = config;
    this.fs = fs;
  }

  // ============ Persistence ============

  private get indexPath(): string {
    return path.join(this.storageDir, 'themes', 'index.yaml');
  }

  private get embeddingsPath(): string {
    return path.join(this.storageDir, 'themes', 'embeddings.json');
  }

  loadThemes(): void {
    if (!this.fs.existsSync(this.indexPath)) {
      return;
    }
    
    try {
      const content = this.fs.readFileSync(this.indexPath, 'utf-8');
      const data = YAML.parse(content) as ThemeIndexData;
      
      this.themes.clear();
      for (const t of data.themes) {
        this.themes.set(t.themeId, {
          ...t,
          centroid: [], // Will be loaded lazily
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        });
      }
    } catch {
      // Invalid file, start fresh
      this.themes.clear();
    }
  }

  private loadEmbeddings(): void {
    if (this.embeddingsLoaded) return;

    this.embeddings = new Map();
    const data = safeReadJson<ThemeEmbeddingsData>(this.fs, this.embeddingsPath, {});

    for (const [themeId, emb] of Object.entries(data)) {
      this.embeddings.set(themeId, emb);
      // Also populate theme centroids
      const theme = this.themes.get(themeId);
      if (theme) {
        theme.centroid = emb;
      }
    }

    this.embeddingsLoaded = true;
  }

  saveThemes(): void {
    ensureDir(this.fs, path.join(this.storageDir, 'themes'));

    // Save index.yaml (metadata only)
    const indexData: ThemeIndexData = {
      version: '1.0',
      themes: Array.from(this.themes.values()).map(t => ({
        themeId: t.themeId,
        summary: t.summary,
        semanticIds: t.semanticIds,
        neighbors: t.neighbors,
        memberCount: t.memberCount,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      metadata: {
        totalThemes: this.themes.size,
        lastAssimilation: new Date().toISOString(),
      },
    };

    this.fs.writeFileSync(this.indexPath, YAML.stringify(indexData));

    // Save embeddings.json
    if (this.embeddings) {
      const embData: ThemeEmbeddingsData = {};
      for (const [themeId, emb] of this.embeddings) {
        embData[themeId] = emb;
      }
      safeWriteJson(this.fs, this.embeddingsPath, embData);
    }
  }

  // ============ Theme Operations ============

  assimilate(newSemantics: SemanticMemory[]): void {
    if (!this.embeddings) {
      this.loadEmbeddings();
    }

    // Cache semantic embeddings for clustering during split
    for (const sem of newSemantics) {
      this.semanticEmbCache.set(sem.memoryId, sem.embedding);
    }

    for (const sem of newSemantics) {
      this.attachSemantic(sem);
    }

    this.splitOversizedThemes();
    this.mergeSmallThemes();
    this.recomputeKnn();
    this.saveThemes();
  }

  private attachSemantic(sem: SemanticMemory): void {
    let bestTheme: ThemeNode | null = null;
    let bestSim = 0;

    // Find best matching theme
    for (const theme of this.themes.values()) {
      if (theme.centroid.length === 0) continue;
      const sim = cosineSim(sem.embedding, theme.centroid);
      if (sim > bestSim) {
        bestSim = sim;
        bestTheme = theme;
      }
    }

    if (bestTheme && bestSim >= this.config.attachThreshold) {
      // Attach to existing theme
      const n = bestTheme.memberCount; // Count BEFORE adding
      bestTheme.semanticIds.push(sem.memoryId);
      bestTheme.memberCount = bestTheme.semanticIds.length;
      bestTheme.updatedAt = new Date();

      // Online centroid update (xMemory paper formula):
      // c_new = (c_old * n + v_new) / (n + 1)
      const newCentroid = bestTheme.centroid.map((v, i) =>
        (v * n + sem.embedding[i]) / (n + 1)
      );
      bestTheme.centroid = newCentroid;
      this.embeddings!.set(bestTheme.themeId, bestTheme.centroid);
    } else {
      // Create new theme
      const themeId = randomUUID();
      const newTheme: ThemeNode = {
        themeId,
        summary: sem.content.slice(0, 100),
        centroid: sem.embedding,
        semanticIds: [sem.memoryId],
        neighbors: [],
        memberCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.themes.set(themeId, newTheme);
      this.embeddings!.set(themeId, sem.embedding);
    }
  }

  private splitOversizedThemes(): void {
    const toSplit: ThemeNode[] = [];

    for (const theme of this.themes.values()) {
      if (theme.memberCount > this.config.maxThemeSize) {
        toSplit.push(theme);
      }
    }

    for (const theme of toSplit) {
      // Use connected component clustering (xMemory paper algorithm)
      const clusters = this.clusterSemantics(theme.semanticIds);

      if (clusters.length <= 1) {
        // Cannot split further, keep as is
        continue;
      }

      // Update original theme with first cluster
      const firstCluster = clusters[0];
      theme.semanticIds = firstCluster;
      theme.memberCount = firstCluster.length;
      theme.centroid = this.computeClusterCentroid(firstCluster);
      theme.updatedAt = new Date();
      this.embeddings!.set(theme.themeId, theme.centroid);

      // Create new themes for remaining clusters
      for (let i = 1; i < clusters.length; i++) {
        const cluster = clusters[i];
        const newThemeId = randomUUID();
        const centroid = this.computeClusterCentroid(cluster);

        const newTheme: ThemeNode = {
          themeId: newThemeId,
          summary: `${theme.summary} (cluster ${i + 1})`,
          centroid,
          semanticIds: cluster,
          neighbors: [],
          memberCount: cluster.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.themes.set(newThemeId, newTheme);
        this.embeddings!.set(newThemeId, centroid);
      }
    }
  }

  /**
   * Cluster semantics by connectivity (xMemory paper algorithm)
   * Builds similarity graph and finds connected components
   */
  private clusterSemantics(semanticIds: string[]): string[][] {
    const CLUSTER_THRESHOLD = 0.66; // Similarity threshold for edge
    const n = semanticIds.length;

    if (n <= this.config.maxThemeSize) {
      return [semanticIds];
    }

    // Get embeddings for all semantics
    const embeddings: number[][] = [];
    for (const id of semanticIds) {
      const emb = this.semanticEmbCache.get(id);
      if (emb) {
        embeddings.push(emb);
      } else {
        // Fallback: use empty vector (will not connect)
        embeddings.push([]);
      }
    }

    // Build adjacency matrix based on similarity
    const adj: boolean[][] = Array.from({ length: n }, () =>
      Array(n).fill(false)
    );

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (embeddings[i].length > 0 && embeddings[j].length > 0) {
          const sim = cosineSim(embeddings[i], embeddings[j]);
          if (sim >= CLUSTER_THRESHOLD) {
            adj[i][j] = adj[j][i] = true;
          }
        }
      }
    }

    // Find connected components using DFS
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

    // Fallback: if any cluster is still too large, force binary split
    const result: string[][] = [];
    for (const cluster of clusters) {
      if (cluster.length > this.config.maxThemeSize) {
        // Force split into two halves
        const mid = Math.ceil(cluster.length / 2);
        result.push(cluster.slice(0, mid));
        result.push(cluster.slice(mid));
      } else {
        result.push(cluster);
      }
    }

    return result;
  }

  /**
   * Compute centroid for a cluster of semantic IDs
   */
  private computeClusterCentroid(semanticIds: string[]): number[] {
    const embeddings: number[][] = [];

    for (const id of semanticIds) {
      const emb = this.semanticEmbCache.get(id);
      if (emb && emb.length > 0) {
        embeddings.push(emb);
      }
    }

    return computeCentroid(embeddings);
  }

  private mergeSmallThemes(): void {
    const themeList = Array.from(this.themes.values());
    const merged = new Set<string>();

    for (let i = 0; i < themeList.length; i++) {
      if (merged.has(themeList[i].themeId)) continue;

      for (let j = i + 1; j < themeList.length; j++) {
        if (merged.has(themeList[j].themeId)) continue;

        const t1 = themeList[i];
        const t2 = themeList[j];

        if (t1.centroid.length === 0 || t2.centroid.length === 0) continue;

        const sim = cosineSim(t1.centroid, t2.centroid);
        const combinedSize = t1.memberCount + t2.memberCount;

        if (sim >= this.config.mergeThreshold && combinedSize <= this.config.maxThemeSize) {
          // Merge t2 into t1
          t1.semanticIds.push(...t2.semanticIds);
          t1.memberCount = t1.semanticIds.length;
          t1.centroid = computeCentroid([t1.centroid, t2.centroid]);
          t1.updatedAt = new Date();

          this.embeddings!.set(t1.themeId, t1.centroid);

          // Remove t2
          this.themes.delete(t2.themeId);
          this.embeddings!.delete(t2.themeId);
          merged.add(t2.themeId);
        }
      }
    }
  }

  private recomputeKnn(): void {
    const themeList = Array.from(this.themes.values());

    for (const theme of themeList) {
      if (theme.centroid.length === 0) continue;

      const similarities: { themeId: string; sim: number }[] = [];

      for (const other of themeList) {
        if (other.themeId === theme.themeId || other.centroid.length === 0) continue;
        const sim = cosineSim(theme.centroid, other.centroid);
        similarities.push({ themeId: other.themeId, sim });
      }

      similarities.sort((a, b) => b.sim - a.sim);
      theme.neighbors = similarities.slice(0, this.config.knnK).map(s => s.themeId);
    }
  }

  // ============ Search Operations ============

  searchThemes(queryEmbedding: number[], topK: number): Array<{ theme: ThemeNode; score: number }> {
    // Lazy load embeddings on first search
    if (!this.embeddingsLoaded) {
      this.loadEmbeddings();
    }

    const results: Array<{ theme: ThemeNode; score: number }> = [];

    for (const theme of this.themes.values()) {
      if (theme.centroid.length === 0) continue;
      const score = cosineSim(queryEmbedding, theme.centroid);
      results.push({ theme, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  // ============ Accessors ============

  getTheme(themeId: string): ThemeNode | undefined {
    return this.themes.get(themeId);
  }

  getAllThemes(): ThemeNode[] {
    return Array.from(this.themes.values());
  }

  getThemeCount(): number {
    return this.themes.size;
  }
}
