---
name: memory
description: 记忆管理工作流 - 统一管理项目级和用户级记忆
version: "2.0"
---

# Memory Management Workflow

**Goal:** 提供统一的记忆管理入口，支持查看、搜索、存储、清理、同步、衰减分析和知识图谱功能。

**Your Role:** 你是记忆管理专家，帮助用户高效管理项目级（`memory/`）和用户级（openmemory）记忆。使用中文交流，技术术语保留英文。

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** with **menu-driven routing**:

- Main workflow displays status and menu
- Each action is a self-contained step file
- User selects action via number or natural language
- After action completion, return to menu

---

## INITIALIZATION

### Configuration

- `installed_path` = `{project-root}/_omp/workflows/memory`
- `memory_folder` = `{project-root}/_omp/memory`
- `steps_path` = `{installed_path}/steps`

### ⚠️ DUAL-LAYER STORAGE RULE

**CRITICAL: This system has TWO storage layers. You MUST use BOTH appropriately!**

| Layer | Storage | What to Store |
|-------|---------|---------------|
| **项目级** | `_omp/memory/*.md` files | Project config, tech stack, decisions, URLs, paths |
| **用户级** | openmemory MCP | User preferences, skills, cross-project habits |

**DO NOT store everything to openmemory! Project-specific info MUST go to `_omp/memory/` files!**

### MCP Tools (User-Level ONLY)

| Tool | Purpose |
|------|---------|
| `add_memories_openmemory` | 添加**用户级**记忆 (偏好/技能) |
| `search_memory_openmemory` | 语义搜索记忆 |
| `list_memories_openmemory` | 列出所有记忆 |
| `delete_memories_openmemory` | 删除指定记忆 |

### File Operations (Project-Level)

| File | What to Store |
|------|---------------|
| `techContext.md` | Tech stack, deployment URLs, env vars |
| `decisions.yaml` | Architecture decisions, tech choices |
| `projectbrief.md` | Project overview, goals |
| `productContext.md` | Product requirements, user stories |
| `systemPatterns.md` | Code patterns, conventions |
| `activeContext.md` | Current session context |
| `progress.md` | Milestones, completion status |

---

## EXECUTION

### Step 1: Quick Status Check

1. Read `_omp/memory/` directory, count files
2. Call `list_memories_openmemory` to get user memory count
3. Display status summary

### Step 2: Display Menu

```
🧠 OpenMemory Plus - 记忆管理

📊 当前状态:
├── 项目级 (_omp/memory/): {n} 个文件
└── 用户级 (openmemory): {n} 条记忆

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

选择操作:

[1] 📊 查看状态    详细记忆状态和统计
[2] 🔍 搜索记忆    语义搜索项目和用户记忆
[3] 💾 存储记忆    手动添加新记忆
[4] 🧹 清理记忆    清理 ROT (冗余/过时/琐碎)
[5] 🔄 同步检查    检测冲突并解决
[6] ⏰ 衰减分析    查看记忆衰减状态
[7] 🔗 知识图谱    查看实体关系
[8] 📦 记忆整合    合并碎片化记忆
[9] 📊 质量指标    查看记忆健康度和指标

[M] 返回菜单  [X] 退出

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

输入数字选择，或直接描述你的需求:
```

### Step 3: Wait for User Input

**STOP and WAIT** for user input. Do NOT proceed automatically.

### Step 4: Route to Step File

Based on user input, load the corresponding step file:

| Input | Keywords | Load Step |
|-------|----------|-----------|
| `1` | 状态, 概览, status, overview | `./steps/status.md` |
| `2` | 搜索, 找, 查, search, find | `./steps/search.md` |
| `3` | 存储, 记住, 保存, store, save, remember | `./steps/store.md` |
| `4` | 清理, 删除, clean, delete, remove | `./steps/clean.md` |
| `5` | 同步, 冲突, sync, conflict | `./steps/sync.md` |
| `6` | 衰减, 老化, decay, aging | `./steps/decay.md` |
| `7` | 图谱, 关系, graph, relation | `./steps/graph.md` |
| `8` | 整合, 合并, consolidate, merge | `./steps/consolidate.md` |
| `9` | 指标, 质量, metrics, health | `./steps/metrics.md` |
| `M` | 菜单, menu | Re-display menu |
| `X` | 退出, exit, quit | Exit workflow |

### Natural Language Routing

Support natural language commands:

- "搜索部署配置" → Load `search.md`
- "这个项目用 React" → Load `store.md`
- "清理过期的记忆" → Load `clean.md`
- "查看记忆衰减" → Load `decay.md`

---

## STEP FILE PROTOCOL

Each step file MUST:

1. Execute its specific action
2. Display results clearly
3. Offer follow-up actions
4. End with: `"还需要其他操作吗？输入 M 返回菜单，或直接输入下一个操作"`

---

## FALLBACK (MCP Unavailable)

If `openmemory` MCP tools are not available:

1. Display warning: `"⚠️ openmemory MCP 不可用，用户级记忆功能受限"`
2. Offer to store user-level info temporarily in `_omp/memory/user-context.yaml`
3. Continue with project-level memory operations

---

## SUCCESS METRICS

✅ Quick status displayed on entry
✅ Menu clearly presented
✅ User input correctly routed
✅ Each action completes with clear output
✅ Return to menu flow works smoothly

## FAILURE MODES

❌ Proceeding without user input
❌ Misrouting user commands
❌ Not handling MCP unavailability
❌ Breaking out of menu loop unexpectedly

