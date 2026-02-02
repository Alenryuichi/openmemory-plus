---
name: store
description: 手动添加新的记忆到系统中
---

# Step: 存储记忆

## EXECUTION RULES

- ✅ Get content from user if not provided
- ✅ Classify and route to correct storage
- ✅ Confirm before storing

---

## EXECUTION

### 1. Get Content

If user provided content in their command, use it directly.
Otherwise ask:
> "请输入要存储的信息："

### 2. Classify Information

Analyze content and determine storage location:

| Keywords | Storage | Action |
|----------|---------|--------|
| 项目路径, URL, 配置, deploy, domain | `_omp/.memory/` | Write to YAML |
| 选择, 决定, 使用, 采用 (技术决策) | `_omp/.memory/decisions.yaml` | Append decision |
| 喜欢, 偏好, 习惯 (用户偏好) | openmemory | `add_memories_openmemory` |
| 熟悉, 擅长, 会用 (用户技能) | openmemory | `add_memories_openmemory` |
| Other | Ask user | - |

### 3. Confirm Storage

```
📝 即将存储:

内容: "{content}"
类型: {type}
位置: {location}

确认存储？[Y/n]
```

### 4. Execute Storage

**For project-level:**
- Read existing YAML file
- Append new entry with timestamp
- Write back

**For user-level:**
- Call `add_memories_openmemory` with content

### 5. Display Result

```
💾 记忆已存储

类型: {type}
内容: "{content}"
位置: {location}
时间: {timestamp}
```

### 6. Batch Storage

If content contains multiple items (comma/semicolon separated):
- Split into individual items
- Classify each separately
- Store all with confirmation

---

## RETURN TO MENU

完成后提示:
> "还需要存储其他信息吗？输入 **M** 返回菜单，或直接输入下一个操作"
