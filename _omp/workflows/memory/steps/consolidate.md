---
name: consolidate
description: 整合碎片化记忆，合并相似条目
---

# Step: 记忆整合

## EXECUTION RULES

- ✅ Find similar memories using semantic search
- ✅ Group by topic/entity
- ✅ Merge with user confirmation

---

## EXECUTION

### 1. Scan All Memories

1. Call `list_memories_openmemory` for user memories
2. Read `_omp/memory/*.yaml` for project memories
3. Build memory index

### 2. Semantic Clustering

Group memories by semantic similarity:

```
For each memory M:
  1. Search for similar memories (threshold: 0.7)
  2. If found, add to cluster
  3. Else, create new cluster
```

### 3. Display Clusters

```
🔗 记忆整合分析

发现 {n} 个可整合的记忆组:

📦 组 1: {topic}
├── "{memory_1}" [项目级]
├── "{memory_2}" [用户级]
└── "{memory_3}" [用户级]
建议: 合并为 "{suggested_merge}"

📦 组 2: {topic}
├── "{memory_1}"
└── "{memory_2}"
建议: 保留 "{preferred}" (更完整)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

操作:
- "合并 1" - 执行组 1 的合并
- "全部合并" - 执行所有建议
- "跳过" - 不执行
```

### 4. Execute Merge

For each approved merge:

```
1. Backup: Save original memories to temp storage
2. Create: Create consolidated memory with merged content
3. Verify: Confirm new memory was created successfully
4. Delete: Delete original fragments one by one
5. Update: Update any references to old IDs

Error Handling:
- IF step 2 fails → Abort, no changes made
- IF step 4 fails → Rollback: delete new memory, restore from backup
- IF step 5 fails → Log warning, continue (non-critical)
```

### 5. Display Result

```
✅ 整合完成

合并了 {n} 组记忆
├── 删除碎片: {deleted} 条
├── 创建整合: {created} 条
└── 节省空间: ~{percent}%
```

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"

