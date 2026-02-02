---
name: status
description: 查看项目级和用户级记忆的详细状态
---

# Step: 查看记忆状态

## EXECUTION RULES

- ✅ Execute all steps in order
- ✅ Display results clearly
- ✅ End with menu prompt

---

## EXECUTION

### 1. Read Project-Level Memory

Read `_omp/.memory/` directory:
- List all files with last modified time
- Count total files

### 2. Get User-Level Memory

Call `list_memories_openmemory`:
- Get all user memories
- Count by decay status (Active/Aging/Stale/Cleanup)

### 3. Display Status

```
📊 记忆系统详细状态

📁 项目级 (_omp/.memory/)
├── project.yaml    ({last_modified})
├── decisions.yaml  ({last_modified})
└── ... 共 {n} 个文件

👤 用户级 (openmemory)
├── 总记忆数: {total} 条
├── 最近添加: "{latest_memory}" ({time_ago})
└── 衰减状态:
    ├── 🟢 Active:  {n} 条
    ├── 🟡 Aging:   {n} 条
    ├── 🔴 Stale:   {n} 条
    └── ⚫ Cleanup: {n} 条

{status_message}
```

### 4. Status Message Logic

- If Cleanup > 0: `"⚠️ 有 {n} 条待清理记忆，建议执行清理"`
- If Stale > 3: `"💡 有较多陈旧记忆，建议检查是否仍需要"`
- Else: `"✅ 系统状态正常"`

---

## RETURN TO MENU

完成后提示:
> "还需要其他操作吗？输入 **M** 返回菜单，或直接输入下一个操作"
