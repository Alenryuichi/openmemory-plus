---
description: '同步两个记忆系统，检测并解决冲突'
argument-hint: ''
---

# /mem sync

同步两个记忆系统，检测并解决冲突。

> 💡 返回入口: `/memory`

## 触发

- `/mem sync`
- `/memory sync`
- `同步记忆`

## 执行流程

```
/mem sync
    ↓
1. 读取 .memory/ 关键配置
    ↓
2. 搜索 openmemory 相关记忆
    ↓
3. 比对检测冲突
    ↓
4. 展示冲突列表
    ↓
5. 用户确认解决方案
    ↓
6. 更新/删除过时记录
```

## 冲突检测逻辑

### 检测范围

| 类型 | .memory/ 字段 | openmemory 关键词 |
|------|---------------|-------------------|
| 部署 URL | `deployment.*.url` | 部署, deploy, url |
| 项目路径 | `paths.*` | 路径, path, 目录 |
| 技术选型 | `decisions.*.choice` | 选择, 采用, 使用 |

### 冲突判定

1. 提取 `.memory/` 中的关键值
2. 搜索 `openmemory` 相关记忆
3. 比对同类信息是否一致
4. 不一致 → 标记为冲突

## 输出格式

### 无冲突

```
🔄 记忆同步检查

✅ 两个系统数据一致，无需同步

检查项目:
├── 部署 URL: 一致
├── 项目路径: 一致
└── 技术决策: 一致
```

### 发现冲突

```
🔄 记忆同步检查

⚠️ 发现 2 处冲突:

1. 部署 URL
   ├── .memory/: https://old-url.vercel.app
   └── openmemory: https://new-url.vercel.app
   
   [1] 保留 .memory/ 版本
   [2] 保留 openmemory 版本
   [3] 跳过

请选择解决方案 (输入数字):
```

## 解决冲突

| 选择 | 操作 |
|------|------|
| 保留 .memory/ | 删除 openmemory 中的过时记忆 |
| 保留 openmemory | 更新 .memory/ 对应字段 |
| 跳过 | 不处理，保留两边 |

## 自动同步规则

**优先级**: `.memory/` > `openmemory`

原因:
- `.memory/` 有 Git 版本控制
- `.memory/` 是项目级 SSOT
- `openmemory` 可能包含过时对话记忆

---

**版本**: v1.1

