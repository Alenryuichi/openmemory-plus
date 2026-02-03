---
name: store
description: 手动添加新的记忆到系统中
---

# Step: 存储记忆

## ⚠️ CRITICAL RULE

**MUST classify EVERY piece of information into project-level OR user-level BEFORE storing!**

- **项目级** → Write to `_omp/memory/*.md` or `decisions.yaml` files
- **用户级** → Call `add_memories_openmemory` MCP tool

**DO NOT store everything to openmemory! Project-specific info MUST go to `_omp/memory/`!**

---

## CLASSIFICATION RULES (MANDATORY)

### 项目级 → `_omp/memory/` (Write to files)

| Info Type | Target File | Examples |
|-----------|-------------|----------|
| 项目概述、目标、范围 | `projectbrief.md` | "这是一个简历生成器项目" |
| 产品需求、用户故事 | `productContext.md` | "用户需要导出 PDF" |
| 技术栈、框架、依赖 | `techContext.md` | "使用 React + TypeScript" |
| 部署 URL、环境变量、路径 | `techContext.md` | "部署到 vercel.app" |
| 架构决策、技术选型 | `decisions.yaml` | "选择 PostgreSQL 而非 MongoDB" |
| 代码规范、设计模式 | `systemPatterns.md` | "使用 Repository 模式" |
| 当前任务、进度 | `activeContext.md` | "正在实现登录功能" |
| 里程碑、完成状态 | `progress.md` | "v1.0 已发布" |

### 用户级 → openmemory (MCP tool)

| Info Type | Examples |
|-----------|----------|
| 用户偏好 | "我喜欢用 pnpm", "偏好函数式编程" |
| 用户技能 | "熟悉 Python", "有 5 年 React 经验" |
| 跨项目习惯 | "习惯用 Vim 键位", "喜欢暗色主题" |
| 个人信息 | "我是全栈工程师", "在北京工作" |

---

## EXECUTION

### Step 1: Get Content

If user provided content, use it. Otherwise ask:
> "请输入要存储的信息："

### Step 2: MANDATORY Classification

**For EACH piece of information, determine:**

```
┌─────────────────────────────────────────────────────────┐
│ 这条信息是关于...                                        │
├─────────────────────────────────────────────────────────┤
│ ❓ 这个项目的配置/决策/架构？                             │
│    → 项目级 → _omp/memory/{file}.md                     │
│                                                         │
│ ❓ 用户个人的偏好/技能/习惯？                             │
│    → 用户级 → openmemory                                │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Show Classification Result

Display classification for user confirmation:

```
📝 信息分类结果:

┌─────────────────────────────────────────────────────────┐
│ 📁 项目级 (_omp/memory/)                                │
├─────────────────────────────────────────────────────────┤
│ 1. "部署到 vercel.app" → techContext.md                 │
│ 2. "使用 React + TypeScript" → techContext.md          │
│ 3. "选择 PostgreSQL" → decisions.yaml                  │
├─────────────────────────────────────────────────────────┤
│ 👤 用户级 (openmemory)                                  │
├─────────────────────────────────────────────────────────┤
│ 4. "熟悉 Python" → openmemory                          │
│ 5. "偏好函数式编程" → openmemory                        │
└─────────────────────────────────────────────────────────┘

确认存储？[Y/n]
```

### Step 4: Execute Storage

#### For 项目级 (MUST use file operations):

**techContext.md example:**
```markdown
## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Language | TypeScript | 5.x |
| Framework | React | 18.x |
| Deployment | Vercel | - |
```

**decisions.yaml example:**
```yaml
decisions:
  - id: dec-2026-02-03-001
    date: 2026-02-03
    title: "Database Selection"
    context: "Need complex queries"
    choice: "PostgreSQL"
    alternatives: ["MongoDB", "MySQL"]
    impact: "All data models use SQL"
```

**Action:** Read file → Append/Update content → Write file

#### For 用户级:

**Action:** Call `add_memories_openmemory` with content

### Step 5: Display Result

```
💾 存储完成

📁 项目级 (_omp/memory/):
  ✓ techContext.md: 添加 2 条
  ✓ decisions.yaml: 添加 1 条

👤 用户级 (openmemory):
  ✓ 添加 2 条记忆

时间: 2026-02-03
```

---

## EXAMPLE: Batch Storage

User says: "存储一下：项目用 React，部署到 Vercel，我熟悉 TypeScript"

**Classification:**
| Content | Type | Target |
|---------|------|--------|
| "项目用 React" | 项目技术栈 | `techContext.md` |
| "部署到 Vercel" | 项目部署 | `techContext.md` |
| "我熟悉 TypeScript" | 用户技能 | openmemory |

**Execution:**
1. Update `_omp/memory/techContext.md` with React + Vercel
2. Call `add_memories_openmemory("用户熟悉 TypeScript")`

---

## RETURN TO MENU

完成后提示:
> "还需要存储其他信息吗？输入 **M** 返回菜单，或直接输入下一个操作"
