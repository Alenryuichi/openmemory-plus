我喜欢同时用好几个 Terminal CLI 工具来开发，甚至在同一个项目上混着用。
一方面是想跟上各家的最新特性，另一方面也是想保持技术敏感度——毕竟每个工具的思路和擅长点都不太一样，多用
用能学到不少东西。
但体验过程中，不同 CLI 之间的通信和同步一直困扰着我。

所以我做了个项目解决了这个问题，并顺带解决了其他一些场景的问题。效果还是不错的。
---

GitHub 地址： https://github.com/Alenryuichi/openmemory-plus


---

安装很简单，一行命令：

```bash
npx openmemory-plus install
```

会自动检测你用的 IDE （ Augment/Claude/Cursor/Gemini ），配置好双层记忆系统。

如果你本地没有 Docker/Qdrant/Ollama ，它也会引导你安装，或者直接用 Docker Compose 一键部署。


---

**场景一：Git worktree 开发**

我习惯用 worktree 并行开发多个功能分支。问题来了：

```
[main 分支] 
我花了半小时教会 Claude 这个项目的部署流程：
- Vercel 项目 ID 是 prj_xxx
- 环境变量要从 .env.production 读
- 部署前要跑 pnpm build:check
- 有个坑：要先 invalidate CDN 缓存

[新建 worktree: feature/payment]
我：帮我部署到测试环境
Claude：好的，请问你用什么部署平台？
我：......我刚才不是说了吗
Claude：抱歉，我没有这个上下文
```

worktree 是干净的工作目录，不会带上之前对话的任何记忆。每次新建分支，都要重新教一遍。

---

**场景二：让 AI 自动部署**

上周我让 Claude 帮我配置了一套自动部署流程，改了 GitHub Actions ，配了环境变量，调了半天终于跑通了。

这周我想改点东西：

```
我：上次的部署配置，我想加个 Slack 通知
Claude：请问你目前的部署配置是怎样的？
我：就是上周你帮我配的那个啊
Claude：抱歉，我没有之前对话的记录。能否描述一下当前的部署流程？
```

它完全不记得自己做过什么。我得翻 Git 历史，一点点告诉它当时改了哪些文件、为什么这么改。

---

**场景三：多 CLI 切换**

```
[Gemini CLI] 早上
我：我习惯用 TypeScript ，包管理器用 pnpm
Gemini：好的，记住了！

[Augment] 中午
我：帮我创建一个新组件
Augment：请问你用 JavaScript 还是 TypeScript ？
我：......TypeScript
Augment：用 npm 还是 yarn 还是 pnpm ？
我：......

[Claude Code] 下午
Claude：你好！请问你的技术栈偏好是？
我：我真的累了
```

每个工具都是独立的记忆孤岛。每天都在重复自我介绍。

---

**场景四：用 BMAD/OpenSpec 做需求管理**

我试过用 BMAD 、OpenSpec 这类方法论让 AI 帮我管理需求，生成 Epic 、Story 、Proposal 文档。

一开始挺好的，AI 会帮你拆解需求、生成规范的文档结构。

但用了一个月之后：

```
项目根目录：
├── _bmad-output/planning-artifacts
│   ├── epic-user-auth.md          # 三周前的
│   ├── epic-user-auth-v2.md       # 两周前改过
│   ├── epic-payment.md            # 上周的
│   ├── epic-payment-draft.md      # 这是草稿还是正式的？
│   ├── story-login-flow.md        # 这个做完了吗？
│   ├── story-login-flow-old.md    # 为什么有个 old ？
│   ├── proposal-refactor-api.md   # 这个提案通过了吗？
│   └── ...还有二十几个文件
```

问题来了：

1. **没有自动清理** - 完成的任务、废弃的提案、过时的 Epic 全堆在那里，越积越多

2. **新任务被旧文档干扰** - 我说"帮我做支付功能"，AI 读到了三周前那个半成品的 epic-payment-draft.md ，开始基于错误的上下文工作

3. **不知道什么是当前状态** - 哪些 Story 完成了？哪些 Proposal 被否决了？没有地方记录，全靠人脑记

4. **版本混乱** - v2 、draft 、old 、final 、final-v2......命名全靠自觉，三天后自己都看不懂

---

后来我想，mem0/openmemory 不是号称能解决 AI 记忆问题吗？

试了一下，确实能跨工具共享记忆了。但新的问题来了：

1. **所有信息都往一个地方塞** - 用户偏好、项目配置、部署记录全混在一起，搜索的时候一团糟

2. **项目切换很痛苦** - 我有 5 个项目，每个项目的部署方式都不一样，但 openmemory 不区分项目

3. **没有版本控制** - 部署配置改了，没有 Git 记录，下次想回滚都不知道之前是什么

4. **要手动调用** - 每次都要主动告诉它"记住这个"，但谁会在配置部署的时候还想着"我要让 AI 记住这个"？

---

所以我花了几周时间，在 openmemory 基础上做了一层增强：**OpenMemory Plus**

核心思路很简单：**双层记忆架构 + 生命周期管理**

```
用户级记忆 (openmemory)          项目级记忆 (_omp/memory/)
├── 我喜欢 TypeScript            ├── 部署在 Vercel ，项目 ID 是 xxx
├── 我用 pnpm                    ├── 部署前要跑 build:check
├── 我熟悉 React/Node.js         ├── 有个 CDN 缓存的坑要注意
└── 我偏好函数式风格              └── 上周加了 GitHub Actions
    ↑                                ↑
    跨项目共享                        跟着 Git 走，worktree 也能读到
```

项目级记忆存在 `_omp/memory/` 目录下，是普通的 Markdown/YAML 文件，会被 Git 追踪。

这意味着：
- 新建 worktree ？记忆跟着代码一起过去
- 团队成员 clone 项目？自动获得项目上下文
- 想知道之前怎么配的？ Git blame 一下就知道

针对 BMAD/OpenSpec 那种文档爆炸的问题，我加了几个机制：

1. **ROT 自动清理** - 识别冗余(Redundant)、过时(Obsolete)、琐碎(Trivial)的信息，定期提醒清理

2. **状态追踪** - 每条记忆都有生命周期状态，完成的任务自动标记，不会干扰新任务

3. **时间衰减** - 基于 Ebbinghaus 遗忘曲线，长期不用的记忆权重自动降低，搜索时不会优先出现

4. **冲突检测** - 发现矛盾信息时主动提醒，比如"你之前说用 MySQL ，现在又说用 PostgreSQL ，以哪个为准？"

---