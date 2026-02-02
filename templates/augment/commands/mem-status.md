---
description: '显示记忆系统状态概览'
argument-hint: ''
---

# /mem status

显示记忆系统状态概览。

> 💡 返回入口: `/memory`

## 触发

- `/mem status`
- `/memory status`
- `记忆状态`

## 执行流程

1. **检查 .memory/ 目录**
   ```bash
   ls -la .memory/*.yaml 2>/dev/null | wc -l
   du -sh .memory/ 2>/dev/null
   ```

2. **检查 openmemory MCP**
   - 调用 `list_memories_openmemory` 获取记忆数量
   - 检测 MCP 连接状态

3. **输出格式**

```
📊 记忆系统状态
├── .memory/ (项目级)
│   ├── 文件数: {count} 个
│   ├── 总大小: {size}
│   └── 最后更新: {timestamp}
├── openmemory (用户级)
│   ├── 记忆数: {count} 条
│   ├── MCP 状态: ✅ 已连接 / ❌ 未连接
│   └── 最后同步: {timestamp}
└── 健康状态: ✅ 正常 / ⚠️ 部分可用 / ❌ 异常
```

## 健康状态判断

| 状态 | 条件 |
|------|------|
| ✅ 正常 | 两个系统都可用 |
| ⚠️ 部分可用 | openmemory 不可用，仅 .memory/ 可用 |
| ❌ 异常 | .memory/ 目录不存在或不可读 |

## 示例输出

```
📊 记忆系统状态
├── .memory/ (项目级)
│   ├── 文件数: 4 个
│   ├── 总大小: 12KB
│   └── 最后更新: 2026-02-02 10:30
├── openmemory (用户级)
│   ├── 记忆数: 47 条
│   ├── MCP 状态: ✅ 已连接
│   └── 端点: localhost:8765
└── 健康状态: ✅ 正常
```

## 错误处理

- openmemory 连接失败：显示 "MCP 状态: ❌ 未连接"，建议检查服务
- .memory/ 不存在：提示创建目录

---

**版本**: v1.1

