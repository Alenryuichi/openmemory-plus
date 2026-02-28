/**
 * OpenMemory Plus - Adaptive Search
 * Implements xMemory top-down retrieval with expansion control
 */

import {
  SearchResult,
  AdaptiveSearchOptions,
  DEFAULT_SEARCH_OPTIONS,
  SemanticMemory,
  SemanticStore,
  ThemeNode,
} from './xmemory-types.js';
import { ThemeManager, cosineSim } from './theme-manager.js';
import { HierarchicalMemoryGraph } from './hierarchy-graph.js';

// ============ Token Estimation ============

const AVG_CHARS_PER_TOKEN = 4;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
}

// ============ Adaptive Search Class ============

export class AdaptiveSearch {
  private themeManager: ThemeManager;
  private hierarchyGraph: HierarchicalMemoryGraph;
  private semanticStore: SemanticStore;

  constructor(
    themeManager: ThemeManager,
    hierarchyGraph: HierarchicalMemoryGraph,
    semanticStore: SemanticStore
  ) {
    this.themeManager = themeManager;
    this.hierarchyGraph = hierarchyGraph;
    this.semanticStore = semanticStore;
  }

  /**
   * Main search entry point
   * Implements top-down adaptive retrieval
   */
  async search(
    query: string,
    queryEmbedding: number[],
    options: Partial<AdaptiveSearchOptions> = {}
  ): Promise<SearchResult[]> {
    const opts: AdaptiveSearchOptions = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    
    // Step 1: Search themes
    const themeResults = this.themeManager.searchThemes(queryEmbedding, opts.topKThemes);
    
    // If no themes exist, fall back to semantic-only search
    if (themeResults.length === 0) {
      return this.searchSemanticsOnly(queryEmbedding, opts);
    }
    
    const results: SearchResult[] = [];
    let tokenBudget = opts.maxTokenBudget;
    
    // Step 2: Process themes based on score
    const topTheme = themeResults[0];
    
    // Threshold depends on whether expansion is enabled
    const highConfidenceThreshold = opts.expandToSemantics ? 0.75 : 1.0;
    if (topTheme.score >= highConfidenceThreshold) {
      // High confidence: return theme-level only
      for (const { theme, score } of themeResults) {
        if (tokenBudget <= 0) break;
        
        const tokens = estimateTokens(theme.summary);
        if (tokens <= tokenBudget) {
          results.push({
            level: 'L3',
            id: theme.themeId,
            content: theme.summary,
            score,
            metadata: {
              themeId: theme.themeId,
              themeSummary: theme.summary,
            },
          });
          tokenBudget -= tokens;
        }
      }
      
      // If expand is disabled or high score, return theme results
      if (!opts.expandToSemantics || topTheme.score >= 0.75) {
        return results;
      }
    }
    
    // Step 3: Expand to semantics if score is lower
    if (opts.expandToSemantics && topTheme.score < 0.75) {
      const semanticIds = this.collectSemanticIds(themeResults.map(r => r.theme));
      const semantics = await this.semanticStore.getByIds(semanticIds);
      
      // Rerank by query similarity
      const reranked = this.rerankBySimilarity(semantics, queryEmbedding);
      
      for (const { memory, score } of reranked.slice(0, opts.topKSemantics)) {
        if (tokenBudget <= 0) break;
        
        const tokens = estimateTokens(memory.content);
        if (tokens <= tokenBudget) {
          results.push({
            level: 'L2',
            id: memory.memoryId,
            content: memory.content,
            score,
            metadata: {
              themeId: memory.themeId,
            },
          });
          tokenBudget -= tokens;
        }
      }
    }
    
    // Step 4: Optionally expand to episodes
    if (opts.expandToEpisodes && tokenBudget > 0) {
      // Get episodes via hierarchy graph
      for (const result of results.filter(r => r.level === 'L2')) {
        const nodeId = `S_${result.id}`;
        const episodes = this.hierarchyGraph.getDescendantsAtLevel(nodeId, 'L1');
        
        for (const episode of episodes) {
          if (tokenBudget <= 0) break;
          
          const tokens = estimateTokens(episode.text);
          if (tokens <= tokenBudget) {
            results.push({
              level: 'L1',
              id: episode.rawId,
              content: episode.text,
              score: result.score * 0.9, // Slightly lower score for episodes
              metadata: {
                themeId: result.metadata?.themeId,
                episodeTitle: episode.metadata?.title as string | undefined,
              },
            });
            tokenBudget -= tokens;
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Fallback search when no themes exist
   */
  private async searchSemanticsOnly(
    queryEmbedding: number[],
    opts: AdaptiveSearchOptions
  ): Promise<SearchResult[]> {
    const semantics = await this.semanticStore.search(queryEmbedding, opts.topKSemantics);
    const results: SearchResult[] = [];
    let tokenBudget = opts.maxTokenBudget;

    for (const memory of semantics) {
      if (tokenBudget <= 0) break;

      const tokens = estimateTokens(memory.content);
      const score = cosineSim(queryEmbedding, memory.embedding);

      if (tokens <= tokenBudget) {
        results.push({
          level: 'L2',
          id: memory.memoryId,
          content: memory.content,
          score,
        });
        tokenBudget -= tokens;
      }
    }

    return results;
  }

  /**
   * Collect all semantic IDs from matched themes
   */
  private collectSemanticIds(themes: ThemeNode[]): string[] {
    const ids = new Set<string>();

    for (const theme of themes) {
      for (const semId of theme.semanticIds) {
        ids.add(semId);
      }
    }

    return Array.from(ids);
  }

  /**
   * Rerank semantics by similarity to query
   */
  private rerankBySimilarity(
    semantics: SemanticMemory[],
    queryEmbedding: number[]
  ): Array<{ memory: SemanticMemory; score: number }> {
    return semantics
      .map(memory => ({
        memory,
        score: cosineSim(queryEmbedding, memory.embedding),
      }))
      .sort((a, b) => b.score - a.score);
  }
}

// Export token estimation for testing
export { estimateTokens };
