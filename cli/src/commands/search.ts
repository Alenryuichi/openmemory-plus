import chalk from 'chalk';
import ora from 'ora';
import * as path from 'node:path';
import { ThemeManager, nodeFs, DEFAULT_THEME_CONFIG } from '../lib/memory/index.js';

interface SearchOptions {
  limit?: number;
  json?: boolean;
  level?: 'theme' | 'semantic' | 'all';
  expand?: boolean; // AC8: --no-expand option
}

interface MemoryResult {
  id: string;
  memory: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload?: {
    data?: string;
    memory?: string;
    created_at?: string;
    updated_at?: string;
  };
}

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const COLLECTION_NAME = 'memories';

async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'bge-m3',
        prompt: text,
      }),
    });
    
    if (!response.ok) return null;
    const data = await response.json() as { embedding?: number[] };
    return data.embedding || null;
  } catch {
    return null;
  }
}

async function searchQdrant(vector: number[], limit: number): Promise<QdrantSearchResult[]> {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vector,
        limit,
        with_payload: true,
      }),
    });
    
    if (!response.ok) return [];
    const data = await response.json() as { result?: QdrantSearchResult[] };
    return data.result || [];
  } catch {
    return [];
  }
}

function formatMemory(result: QdrantSearchResult): MemoryResult {
  return {
    id: String(result.id),
    memory: result.payload?.memory || result.payload?.data || '(无内容)',
    score: result.score,
    created_at: result.payload?.created_at,
    updated_at: result.payload?.updated_at,
  };
}

export async function searchCommand(query: string, options: SearchOptions): Promise<void> {
  const limit = options.limit || 10;
  
  if (!query || query.trim() === '') {
    console.log(chalk.red('❌ 请提供搜索关键词'));
    console.log(chalk.gray('用法: openmemory-plus search <query>'));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🔍 搜索记忆\n'));
  
  // Step 1: Generate embedding
  const spinner = ora('生成语义向量...').start();
  const embedding = await getEmbedding(query);
  
  if (!embedding) {
    spinner.fail('无法生成语义向量');
    console.log(chalk.yellow('请确保 Ollama 正在运行且 BGE-M3 已安装:'));
    console.log(chalk.gray('  ollama serve'));
    console.log(chalk.gray('  ollama pull bge-m3'));
    return;
  }
  
  // Step 2: Search Qdrant
  spinner.text = '搜索记忆库...';
  const results = await searchQdrant(embedding, limit);
  spinner.stop();
  
  if (results.length === 0) {
    console.log(chalk.yellow('未找到相关记忆'));
    console.log(chalk.gray(`搜索词: "${query}"`));
    return;
  }
  
  // Step 3: Display results
  const memories = results.map(formatMemory);
  
  if (options.json) {
    console.log(JSON.stringify(memories, null, 2));
    return;
  }
  
  console.log(chalk.green(`找到 ${memories.length} 条相关记忆:\n`));
  
  memories.forEach((mem, index) => {
    const score = mem.score ? chalk.gray(`(${(mem.score * 100).toFixed(1)}%)`) : '';
    console.log(chalk.bold(`${index + 1}. ${score}`));
    console.log(`   ${mem.memory}`);
    if (mem.created_at) {
      console.log(chalk.gray(`   创建: ${new Date(mem.created_at).toLocaleString()}`));
    }
    console.log('');
  });
}

// ============ Theme Search (xMemory L3) ============

export async function searchThemesCommand(query: string, options: SearchOptions): Promise<void> {
  if (!query || query.trim() === '') {
    console.log(chalk.red('❌ 请提供搜索关键词'));
    console.log(chalk.gray('用法: openmemory-plus search <query> --level theme'));
    return;
  }

  console.log(chalk.cyan.bold('\n🔍 搜索主题记忆\n'));

  // Generate embedding
  const spinner = ora('生成语义向量...').start();
  const embedding = await getEmbedding(query);

  if (!embedding) {
    spinner.fail('无法生成语义向量');
    console.log(chalk.yellow('请确保 Ollama 正在运行且 BGE-M3 已安装:'));
    console.log(chalk.gray('  ollama serve'));
    console.log(chalk.gray('  ollama pull bge-m3'));
    return;
  }

  // Load theme manager
  spinner.text = '搜索主题...';
  const storageDir = path.join(process.cwd(), '_omp', 'memory');

  // Check if memory directory exists
  if (!nodeFs.existsSync(storageDir)) {
    spinner.fail('记忆目录不存在');
    console.log(chalk.yellow('请先运行: npx openmemory-plus install'));
    return;
  }

  const themeManager = new ThemeManager(storageDir, 'default', DEFAULT_THEME_CONFIG, nodeFs);
  themeManager.loadThemes();

  const limit = options.limit || 5;
  const results = themeManager.searchThemes(embedding, limit);
  spinner.stop();

  if (results.length === 0) {
    console.log(chalk.yellow('未找到相关主题'));
    console.log(chalk.gray(`搜索词: "${query}"`));
    console.log(chalk.gray('提示: 主题会在记忆积累后自动形成'));
    return;
  }

  if (options.json) {
    const jsonResults = results.map(r => ({
      themeId: r.theme.themeId,
      summary: r.theme.summary,
      score: r.score,
      memberCount: r.theme.memberCount,
    }));
    console.log(JSON.stringify(jsonResults, null, 2));
    return;
  }

  console.log(chalk.green(`找到 ${results.length} 个相关主题:\n`));

  results.forEach((result, index) => {
    const { theme, score } = result;
    const scoreStr = chalk.gray(`(${(score * 100).toFixed(1)}%)`);
    const memberStr = chalk.blue(`[${theme.memberCount} 条记忆]`);

    console.log(chalk.bold(`${index + 1}. ${scoreStr} ${memberStr}`));
    console.log(`   ${theme.summary}`);
    console.log('');
  });
}
