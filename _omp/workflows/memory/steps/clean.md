---
name: clean
description: 清理过期、冗余或琐碎的记忆 (ROT)
---

# Step: 清理记忆

## EXECUTION RULES

- ✅ Analyze all memories for ROT
- ✅ Show candidates before deletion
- ✅ Require user confirmation

---

## EXECUTION

### 1. Get All Memories

Call `list_memories_openmemory` to get all user memories.

### 2. Analyze ROT

Identify cleanup candidates:

| Type | Definition | Detection |
|------|------------|-----------|
| **Redundant** (冗余) | 重复或相似 | 语义相似度 > 0.9 |
| **Outdated** (过时) | 超过 90 天 | 创建时间 > 90 days |
| **Trivial** (琐碎) | 无实际价值 | 内容 < 10 chars or too generic |

### 3. Display Candidates

```
🧹 清理候选记忆

以下记忆可能需要清理:

⚠️ Outdated (过时):
{foreach outdated}
{n}. "{content}"
   创建: {days_ago} 天前
{/foreach}

⚠️ Redundant (冗余):
{foreach redundant}
{n}. "{content}" (与 "{similar_to}" 相似)
{/foreach}

⚠️ Trivial (琐碎):
{foreach trivial}
{n}. "{content}"
{/foreach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

操作选项:
- "全部删除" - 删除所有候选
- "删除 1,2,3" - 删除指定项
- "取消" - 不删除
```

### 4. Execute Deletion

Based on user selection:
- Get memory IDs to delete
- Call `delete_memories_openmemory` with IDs
- Display deletion result

### 5. Display Result

```
🗑️ 清理完成

已删除 {n} 条记忆
释放空间: {estimated_size}
```

---

## SAFETY

- ⚠️ NEVER delete without user confirmation
- ⚠️ Show content preview before deletion
- ⚠️ Support selective deletion

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
