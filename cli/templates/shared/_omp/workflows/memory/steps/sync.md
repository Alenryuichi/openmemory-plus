---
name: sync
description: 检测并解决项目级和用户级记忆之间的冲突
---

# Step: 同步检查

## EXECUTION RULES

- ✅ Compare project and user memories semantically
- ✅ Detect conflicts using similarity threshold
- ✅ Auto-resolve when confidence is high
- ✅ Guide user through ambiguous cases

---

## CONFLICT DETECTION

### Semantic Matching

使用向量搜索检测冲突:

```yaml
conflict_detection:
  similarity_threshold: 0.7
  confidence_threshold: 0.8
  conflict_types:
    - value_mismatch    # 同一实体不同值
    - duplicate         # 两边存在相同信息
    - stale             # 一边过时
    - partial           # 部分重叠
```

### Auto-Resolution Rules

| 场景 | 条件 | 自动处理 |
|------|------|----------|
| 时间戳可判断 | 时间差 > 24h | 保留较新版本 |
| 置信度差异 | 置信度差 > 0.3 | 保留高置信度版本 |
| 完整性差异 | 一方更完整 | 保留完整版本 |
| 项目 vs 用户 | 项目配置相关 | 优先项目级 |
| 完全重复 | 语义相似度 > 0.95 | 删除重复，保留一份 |

### Manual Resolution Required

- 两边时间戳接近 (< 24h)
- 置信度相近 (差 < 0.2)
- 语义相似但不完全相同 (0.7-0.95)
- 安全/合规相关信息
- 用户明确标记为重要的信息

---

## EXECUTION

### 1. Read Project Memory

Read all files in `_omp/memory/`:
- Extract key-value pairs from YAML files
- Extract topics from markdown files
- Record timestamps and confidence scores

### 2. Build Comparison Index

For each project memory item:
1. Generate semantic embedding
2. Store with metadata (timestamp, confidence, source)
3. Prepare for similarity matching

### 3. Search User Memory

Call `search_memory_openmemory` with project topics:
- Find related user memories with similarity scores
- Retrieve timestamps and confidence data
- Build comparison pairs

### 4. Analyze Conflicts

For each comparison pair:

```
IF similarity_score >= 0.95:
  → Type: DUPLICATE
  → Confidence: HIGH
  → Action: Auto-resolve (delete duplicate)

ELSE IF similarity_score >= 0.7:
  → Type: POTENTIAL_CONFLICT
  → Analyze timestamps:
    IF time_diff > 24h:
      → Confidence: HIGH
      → Action: Auto-resolve (keep newer)
    ELSE IF time_diff <= 24h:
      → Confidence: MEDIUM
      → Action: Manual review needed

  → Analyze confidence scores:
    IF confidence_diff > 0.3:
      → Confidence: HIGH
      → Action: Auto-resolve (keep higher confidence)
    ELSE:
      → Confidence: MEDIUM
      → Action: Manual review needed

  → Analyze completeness:
    IF one_is_significantly_more_complete:
      → Confidence: HIGH
      → Action: Auto-resolve (keep complete version)

ELSE IF similarity_score >= 0.5:
  → Type: PARTIAL_OVERLAP
  → Action: Manual review (may need merge)

ELSE:
  → No conflict detected
```

### 5. Display Results

```
🔄 同步检查结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 自动解决 ({auto_count} 个):

{foreach auto_resolved}
✓ {description}
  ├── 类型: {conflict_type}
  ├── 置信度: {confidence}%
  └── 操作: {action}
{/foreach}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 需要手动处理 ({manual_count} 个):

{foreach manual_review}
{n}. {description}
  ├── 📁 项目级: {project_value} (时间: {project_time})
  ├── 👤 用户级: {user_value} (时间: {user_time})
  ├── 相似度: {similarity}%
  ├── 置信度: {confidence}%
  └── 建议: {recommendation}
{/foreach}

{if no_conflicts}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 无冲突，项目级和用户级记忆同步正常
{/if}
```

### 6. Resolution Options

Display menu:

```
操作选项:
[A] 执行所有自动解决
[M] 逐个处理手动项
[R] 查看详细报告
[C] 完成同步
```

#### Menu Handling Logic:

- IF A: Execute all auto-resolved conflicts, then display results
- IF M: Enter manual resolution mode (see step 7)
- IF R: Display detailed conflict analysis report
- IF C: Save changes and return to menu
- IF Any other: Help user, then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed when user selects 'C'
- After other menu items execution, return to this menu

### 7. Manual Resolution Mode

For each manual conflict:

```
⚠️ 冲突 {n}/{total}: {description}

📁 项目级: {project_value}
   时间: {project_time}
   置信度: {project_confidence}%

👤 用户级: {user_value}
   时间: {user_time}
   置信度: {user_confidence}%

相似度: {similarity}%
建议: {recommendation}

操作选项:
[P] 保留项目级版本
[U] 保留用户级版本
[M] 手动合并
[S] 跳过此冲突
[Q] 返回菜单
```

Handle each selection:
- P: Keep project version, delete user version
- U: Keep user version, update project version
- M: Prompt for merged content
- S: Skip this conflict
- Q: Return to main menu

### 8. Execute Resolution

Based on user selections:
- Update or delete memories as needed
- For project-level: update YAML files
- For user-level: call `update_memories_openmemory` or `delete_memories_openmemory`
- Display summary of changes

### 9. Display Summary

```
✅ 同步完成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 处理统计:
├── 自动解决: {auto_count} 个
├── 手动处理: {manual_count} 个
├── 跳过: {skipped_count} 个
└── 总计: {total_count} 个

📝 变更详情:
├── 更新: {updated_count} 条记忆
├── 删除: {deleted_count} 条记忆
└── 合并: {merged_count} 条记忆

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
