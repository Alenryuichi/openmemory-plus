---
name: search
description: 在项目级和用户级记忆中进行语义搜索（支持 xMemory 多层架构）
---

# Step: 搜索记忆

## EXECUTION RULES

- ✅ Get search query from user if not provided
- ✅ Search both project and user memory
- ✅ Support xMemory layer selection (theme/semantic/all)
- ✅ Display results with relevance scores

---

## xMemory Layers

| 层级 | CLI 选项 | 描述 |
|------|----------|------|
| L3 Theme | `--level theme` | 搜索主题层（聚合） |
| L2 Semantic | `--level semantic` | 搜索语义层（默认） |
| All | `--level all` | 自适应检索（L3→L2→L1） |

---

## EXECUTION

### 1. Get Search Query

If user provided query in their command, use it directly.
Otherwise ask:
> "请输入搜索关键词（可选：指定层级 theme/semantic/all）："

### 2. Determine Search Level

根据用户输入或显式参数确定搜索层级：
- 默认: `semantic` (L2 语义层)
- 用户说 "主题/theme": `theme` (L3 主题层)
- 用户说 "全部/all": `all` (自适应)

### 3. Search User Memory

**L2 Semantic (默认):**
```bash
# 使用 openmemory MCP
search_memory_openmemory(query="{query}")
```

**L3 Theme (xMemory):**
```bash
omp search "{query}" --level theme
# 不展开: omp search "{query}" --level theme --no-expand
```

### 4. Search Project Memory

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
