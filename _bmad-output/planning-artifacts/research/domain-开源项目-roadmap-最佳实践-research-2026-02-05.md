# 开源项目 Roadmap 最佳实践研究报告

**研究日期**: 2026-02-05  
**研究类型**: Domain Research  
**目标项目**: OpenMemory Plus  

---

## 📋 执行摘要

本研究分析了成功开源项目的 Roadmap 管理实践，包括 GitHub、Loom、Buffer 等项目的公开 Roadmap 案例，以及 CNCF 等组织的最佳实践指南。核心发现：**有效的开源 Roadmap 不仅是功能规划工具，更是社区建设和贡献者吸引的战略资产**。

### 关键洞察

| 维度 | 最佳实践 | OpenMemory Plus 建议 |
|------|----------|---------------------|
| **展示形式** | GitHub Projects + README 双轨制 | 采用 GitHub Projects 可视化 + README 精简版 |
| **更新频率** | 每 2-4 周同步更新 | 与版本发布节奏对齐 |
| **社区互动** | 投票 + 评论 + 反馈闭环 | 先实现基础可见性，后续增加互动 |
| **时间粒度** | 季度规划 + 月度迭代 | Now / Next / Later 模式更适合小团队 |

---

## 🔍 研究发现

### 1. Roadmap 类型分类

根据 CNCF 最佳实践，开源项目 Roadmap 分为四类：

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| **Feature Roadmap** | 功能规划，列出即将开发的特性 | 产品导向项目 |
| **Release Roadmap** | 版本发布计划，明确每个版本内容 | 有固定发布周期的项目 |
| **Technology Roadmap** | 技术栈演进计划 | 基础设施/框架项目 |
| **Non-Code Roadmap** | 社区、文档、活动等非代码目标 | 成熟的开源社区 |

**OpenMemory Plus 建议**: 采用 **Feature Roadmap + Release Roadmap 混合模式**

### 2. 成功案例分析

#### GitHub Public Roadmap
- **形式**: 独立仓库 `github/roadmap` + GitHub Projects
- **优点**: 按季度组织，状态清晰，与 GitHub 生态深度集成
- **缺点**: 只读模式，缺乏双向互动
- **学习点**: 使用 Projects 的 Roadmap 视图展示时间线

#### Loom Public Roadmap
- **形式**: Productboard 托管
- **优点**: 用户投票，按产品区域分类
- **缺点**: 无法订阅，只能投票不能评论
- **学习点**: 让用户参与优先级决策

#### Buffer Public Roadmap
- **形式**: Kanban 视图 (Planned → In Progress → Complete)
- **优点**: 状态变更通知，投票 + 评论系统
- **缺点**: 列过多时导航困难
- **学习点**: 简单的状态流转更易理解

### 3. Roadmap 核心要素

根据 Ducalis.io 和 CNCF 的综合建议：

```
✅ 必备要素:
├── 简洁设计 - 避免信息过载
├── 清晰状态 - Now / Next / Later 或 Planned / In Progress / Done
├── 易于导航 - 用户能快速找到关心的功能
├── 定期更新 - 保持与实际开发同步
└── 可访问性 - 嵌入网站或独立页面

⭐ 加分要素:
├── 用户投票 - 让社区影响优先级
├── 评论讨论 - 收集详细反馈
├── 状态通知 - 进度变更时通知关注者
└── 分类视图 - 按领域/模块筛选
```

### 4. GitHub Projects vs Milestones

| 特性 | GitHub Projects | GitHub Milestones |
|------|-----------------|-------------------|
| **可视化** | 表格/看板/Roadmap 多视图 | 仅进度条 |
| **跨仓库** | ✅ 支持 | ❌ 不支持 |
| **自定义字段** | ✅ 丰富 | ❌ 有限 |
| **时间线展示** | ✅ Roadmap 视图 | ❌ 无 |
| **适用场景** | 长期规划展示 | 版本发布管理 |

**推荐**: 使用 **GitHub Projects** 作为公开 Roadmap，**Milestones** 作为内部版本管理

### 5. 小型开源项目的简化方案

对于个人/小团队项目（如 OpenMemory Plus），过度复杂的 Roadmap 系统会增加维护负担。

**推荐的 "Now / Next / Later" 模式**:

```markdown
## 🗺️ Roadmap

### 🔥 Now (当前进行中)
- [ ] 功能 A - 预计 2 周内完成
- [ ] 功能 B - 开发中

### 📅 Next (下一阶段)
- [ ] 功能 C
- [ ] 功能 D

### 💡 Later (未来考虑)
- [ ] 功能 E
- [ ] 功能 F
```

**优势**:
- 无需精确日期承诺（避免估算压力）
- 维护成本低
- 用户易于理解
- 灵活调整优先级

---

## 💡 OpenMemory Plus Roadmap 建议

### 推荐方案: README + GitHub Projects 双轨制

#### 1. README 精简版 Roadmap

在 README 中保留高层次的方向性 Roadmap：

```markdown
## 🗺️ Roadmap

### 🔥 Now (v1.6)
- [ ] 记忆搜索增强 - 支持语义搜索
- [ ] 批量记忆管理命令

### 📅 Next (v2.0)
- [ ] Web UI 管理界面
- [ ] 团队记忆共享 (可选)

### 💡 Later
- [ ] 云端同步选项
- [ ] 记忆分析洞察

👉 [查看完整 Roadmap](链接到 GitHub Projects)
```

#### 2. GitHub Projects 详细版

创建公开的 GitHub Project，使用 Roadmap 视图：

| 字段 | 用途 |
|------|------|
| **Status** | Inbox / Planned / In Progress / Done |
| **Priority** | 🔴 High / 🟡 Medium / 🟢 Low |
| **Target Version** | v1.6 / v2.0 / Future |
| **Category** | Core / CLI / Integration / Docs |

#### 3. 更新节奏

| 事件 | 更新内容 |
|------|----------|
| 版本发布 | 移动已完成项到 Done，更新 README |
| 每 2 周 | Review Project 状态，调整优先级 |
| 社区反馈 | 添加到 Inbox，定期 triage |

---

## 🎯 立即行动计划

### Phase 1: 基础建设 (本周)

1. **创建 GitHub Project**
   - 名称: "OpenMemory Plus Roadmap"
   - 可见性: Public
   - 视图: Table + Roadmap

2. **迁移现有 README Roadmap**
   - 将当前 Roadmap 项目转为 Issues
   - 关联到 Project

3. **更新 README**
   - 采用 Now / Next / Later 格式
   - 添加 Project 链接

### Phase 2: 社区互动 (下月)

1. 启用 Discussions 收集反馈
2. 定期发布 Roadmap 更新公告
3. 在 Issue 模板中引导用户查看 Roadmap

---

## 📚 参考资源

| 资源 | 链接 |
|------|------|
| CNCF Roadmap Best Practices | https://contribute.cncf.io/projects/best-practices/community/contributor-growth/open-source-roadmaps/ |
| GitHub Public Roadmap | https://github.com/github/roadmap |
| GitHub Projects Docs | https://docs.github.com/en/issues/planning-and-tracking-with-projects |
| Ducalis Public Roadmap Guide | https://hi.ducalis.io/glossary/public-roadmap-best-practices-examples-and-templates |

---

## ✅ 研究结论

1. **简单优于复杂** - 对于小型开源项目，Now/Next/Later 模式足够有效
2. **双轨制最佳** - README 概览 + GitHub Projects 详情
3. **维护是关键** - 不更新的 Roadmap 比没有 Roadmap 更糟糕
4. **社区参与可选** - 先建立可见性，再逐步增加互动功能
5. **与发布节奏对齐** - Roadmap 更新应与版本发布同步

---

*报告生成时间: 2026-02-05*
*研究方法: Web Research + 案例分析*

