# /mem graph - 知识图谱

管理和查询记忆的实体关系图谱。

## 使用方法

```
/mem graph [subcommand] [options]
```

## 子命令

| 子命令 | 说明 |
|--------|------|
| `show` | 显示图谱概览 |
| `add <type> <name>` | 添加实体 |
| `link <source> <target> <relation>` | 创建关系 |
| `query <entity>` | 查询相关实体 |
| `export` | 导出图谱 |

## 实体类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `project` | 项目 | my-app |
| `service` | 服务 | API, Worker |
| `database` | 数据库 | PostgreSQL, Redis |
| `api` | API 端点 | /users, /orders |
| `config` | 配置 | 环境变量, 密钥 |
| `person` | 人员 | 开发者, 用户 |
| `technology` | 技术 | React, Node.js |
| `decision` | 决策 | 架构选择 |
| `preference` | 偏好 | 编码风格 |

## 关系类型

| 关系 | 说明 |
|------|------|
| `depends_on` | 依赖 |
| `configured_by` | 被配置 |
| `created_by` | 创建者 |
| `uses` | 使用 |
| `prefers` | 偏好 |
| `decided` | 决定 |
| `related_to` | 相关 |

## 示例

### 添加实体

```
/mem graph add service "User API"
/mem graph add database "PostgreSQL"
```

### 创建关系

```
/mem graph link "User API" "PostgreSQL" depends_on
```

### 查询相关

```
/mem graph query "User API"
```

输出:
```
## 🔗 User API 的关系图

User API (service)
├── depends_on → PostgreSQL (database)
├── configured_by → API Config (config)
└── uses → JWT Auth (technology)
```

## 图谱存储

图谱数据存储在 `.memory/graph.yaml`:

```yaml
entities:
  - id: "uuid-1"
    type: "service"
    name: "User API"
    properties:
      port: 3000
      
relations:
  - id: "uuid-2"
    sourceId: "uuid-1"
    targetId: "uuid-3"
    type: "depends_on"
```

## 自动提取

对话中提到的实体和关系会被自动提取到图谱：

- "API 服务依赖 PostgreSQL 数据库" → 自动创建实体和关系
- "我们决定使用 React 作为前端框架" → 创建 decision 和 technology 实体

## 相关命令

- `/mem status` - 查看记忆状态
- `/mem search` - 搜索记忆
- `/mem decay` - 查看衰减状态

---
*OpenMemory Plus v2.0 - Graph Memory System*

