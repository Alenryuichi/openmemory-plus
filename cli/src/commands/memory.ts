import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync } from 'fs';

interface MemoryOptions {
  all?: boolean;
  ids?: string;
  output?: string;
  json?: boolean;
  limit?: number;
}

interface QdrantPoint {
  id: string | number;
  payload?: {
    data?: string;
    memory?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
  };
}

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'memories';

async function listMemories(limit: number): Promise<QdrantPoint[]> {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/scroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit,
        with_payload: true,
      }),
    });
    
    if (!response.ok) return [];
    const data = await response.json() as { result?: { points?: QdrantPoint[] } };
    return data.result?.points || [];
  } catch {
    return [];
  }
}

async function deleteMemory(id: string | number): Promise<boolean> {
  try {
    const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        points: [id],
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function deleteAllMemories(): Promise<boolean> {
  try {
    // Delete the collection and recreate it
    const deleteRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'DELETE',
    });
    if (!deleteRes.ok) return false;
    
    // Recreate collection with proper config
    const createRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vectors: {
          size: 1024, // BGE-M3 embedding size
          distance: 'Cosine',
        },
      }),
    });
    return createRes.ok;
  } catch {
    return false;
  }
}

export async function memoryListCommand(options: MemoryOptions): Promise<void> {
  const limit = options.limit || 50;
  
  console.log(chalk.cyan.bold('\n📋 记忆列表\n'));
  
  const spinner = ora('获取记忆列表...').start();
  const memories = await listMemories(limit);
  spinner.stop();
  
  if (memories.length === 0) {
    console.log(chalk.yellow('暂无记忆'));
    return;
  }
  
  if (options.json) {
    console.log(JSON.stringify(memories, null, 2));
    return;
  }
  
  console.log(chalk.green(`共 ${memories.length} 条记忆:\n`));
  
  memories.forEach((mem, index) => {
    const content = mem.payload?.memory || mem.payload?.data || '(无内容)';
    const preview = content.length > 80 ? content.substring(0, 80) + '...' : content;
    console.log(chalk.bold(`${index + 1}. [${mem.id}]`));
    console.log(`   ${preview}`);
    if (mem.payload?.created_at) {
      console.log(chalk.gray(`   ${new Date(mem.payload.created_at).toLocaleString()}`));
    }
    console.log('');
  });
}

export async function memoryDeleteCommand(options: MemoryOptions): Promise<void> {
  console.log(chalk.cyan.bold('\n🗑️  删除记忆\n'));
  
  if (options.all) {
    const spinner = ora('删除所有记忆...').start();
    const success = await deleteAllMemories();
    
    if (success) {
      spinner.succeed('已删除所有记忆');
    } else {
      spinner.fail('删除失败');
      console.log(chalk.yellow('请确保 Qdrant 正在运行'));
    }
    return;
  }
  
  if (!options.ids) {
    console.log(chalk.red('❌ 请指定要删除的记忆 ID'));
    console.log(chalk.gray('用法: omp memory delete --ids "id1,id2,id3"'));
    console.log(chalk.gray('或: omp memory delete --all'));
    return;
  }
  
  const ids = options.ids.split(',').map(id => id.trim());
  const spinner = ora(`删除 ${ids.length} 条记忆...`).start();
  
  let success = 0;
  let failed = 0;
  
  for (const id of ids) {
    if (await deleteMemory(id)) {
      success++;
    } else {
      failed++;
    }
  }
  
  spinner.stop();
  console.log(chalk.green(`✓ 成功删除 ${success} 条`));
  if (failed > 0) {
    console.log(chalk.yellow(`⚠ 失败 ${failed} 条`));
  }
}

export async function memoryExportCommand(options: MemoryOptions): Promise<void> {
  const limit = options.limit || 1000;
  const output = options.output || 'memories-export.json';
  
  console.log(chalk.cyan.bold('\n📤 导出记忆\n'));
  
  const spinner = ora('获取所有记忆...').start();
  const memories = await listMemories(limit);
  spinner.stop();
  
  if (memories.length === 0) {
    console.log(chalk.yellow('暂无记忆可导出'));
    return;
  }
  
  const exportData = memories.map(m => ({
    id: m.id,
    content: m.payload?.memory || m.payload?.data,
    created_at: m.payload?.created_at,
    updated_at: m.payload?.updated_at,
    user_id: m.payload?.user_id,
  }));
  
  try {
    writeFileSync(output, JSON.stringify(exportData, null, 2));
    console.log(chalk.green(`✅ 已导出 ${memories.length} 条记忆到 ${output}`));
  } catch (e: any) {
    console.log(chalk.red(`❌ 导出失败: ${e.message}`));
  }
}

