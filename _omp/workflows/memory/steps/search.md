---
name: search
description: 在项目级和用户级记忆中进行语义搜索
---

# Step: 搜索记忆

## EXECUTION RULES

- ✅ Get search query from user if not provided
- ✅ Search both project and user memory
- ✅ Display results with relevance scores

---

## EXECUTION

### 1. Get Search Query

If user provided query in their command, use it directly.
Otherwise ask:
> "请输入搜索关键词："

### 2. Search User Memory

Call `search_memory_openmemory` with the query:
- Get matching memories with scores
- Sort by relevance

### 3. Search Project Memory

Search `_omp/memory/*.md` and `_omp/memory/*.yaml` files:
- Grep for query keywords
- Match file content

### 4. Display Results

```
🔍 搜索结果: "{query}"

📁 项目级结果:
{foreach result}
{n}. [{filename}] {matched_content}
   匹配位置: 行 {line_number}
{/foreach}

👤 用户级结果:
{foreach result}
{n}. {memory_content}
   相关度: {score} | 创建: {time_ago} | 状态: {decay_status}
{/foreach}

共找到 {total} 条相关记忆
```

### 5. Follow-up Actions

用户可继续操作：
- `"删除 N"` → 删除指定记忆
- `"详情 N"` → 展示完整内容
- `"更新 N"` → 修改记忆内容

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
