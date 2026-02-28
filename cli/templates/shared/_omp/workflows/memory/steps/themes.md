---
name: themes
description: xMemory L3 主题层检索和管理
---

# Step: 主题检索 (xMemory L3)

## EXECUTION RULES

- ✅ 使用 `omp search --level theme` 搜索主题层
- ✅ 支持 `--no-expand` 选项仅返回主题，不展开到语义层
- ✅ 显示主题的语义聚合信息

---

## xMemory 4-Layer Architecture

```
L3 (Theme)    ← 本操作的目标层
    ↓ 包含
L2 (Semantic) ← 语义记忆（Qdrant 向量）
    ↓ 来源
L1 (Episode)  ← 情节记忆（会话）
    ↓ 包含
L0 (Message)  ← 原始消息
```

---

## EXECUTION

### 1. Get Search Query

如果用户没有提供查询词：
> "请输入主题搜索关键词："

### 2. Search Themes

使用 CLI 搜索主题层：

```bash
# 搜索主题（自动展开到语义层）
omp search "关键词" --level theme

# 仅返回主题，不展开
omp search "关键词" --level theme --no-expand
```

### 3. Display Results

```
🎯 主题检索结果: "{query}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 L3 主题层:
{foreach theme}
[{n}] 主题: {theme_label}
     相似度: {score}
     包含语义记忆: {semantic_count} 条
     质心向量: [{centroid_preview}...]
{/foreach}

📚 L2 语义层 (展开):
{foreach semantic}
[{n}] {content_preview}
     来源主题: {parent_theme}
     重要度: {importance}
{/foreach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

共找到 {theme_count} 个主题，{semantic_count} 条语义记忆
```

### 4. Theme Management Actions

用户可继续操作：
- `"展开 N"` → 查看主题 N 下的所有语义记忆
- `"详情 N"` → 显示主题完整信息
- `"搜索语义"` → 切换到 L2 语义层搜索

### 5. Theme Configuration

主题配置位于 `_omp/memory/themes/index.yaml`:

```yaml
# 主题配置
attachThreshold: 0.62    # 语义吸附到主题的阈值
mergeThreshold: 0.78     # 主题合并阈值
expandThreshold: 0.75    # 搜索时展开到语义层的阈值
maxThemes: 50            # 最大主题数量
splitThreshold: 10       # 单主题语义数超过此值时分裂
```

---

## FALLBACK (CLI Unavailable)

如果 `omp` CLI 不可用：

1. 显示提示: `"⚠️ omp CLI 不可用，请先安装: npm install -g openmemory-plus"`
2. 尝试直接读取 `_omp/memory/themes/index.yaml`
3. 显示原始主题数据

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"

