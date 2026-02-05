# 🔧 故障排查指南

本文档帮助你解决 OpenMemory Plus 安装和使用过程中的常见问题。

## 快速诊断

```bash
# 运行诊断命令
openmemory-plus doctor

# 自动修复可修复的问题
openmemory-plus doctor --fix

# 查看系统状态
openmemory-plus status
```

---

## 常见问题

### 1. Docker 相关问题

#### ❌ Docker 未安装

**症状**: `Docker 未安装`

**解决方案**:
1. 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. 安装并启动 Docker Desktop
3. 重新运行 `openmemory-plus install`

#### ❌ Docker 守护进程未运行

**症状**: `Docker 守护进程未运行` 或 `Cannot connect to the Docker daemon`

**解决方案**:
1. 启动 Docker Desktop 应用
2. 等待 Docker 图标显示 "Running"
3. 验证: `docker info`

**macOS 快速启动**:
```bash
open -a Docker
```

---

### 2. Ollama 相关问题

#### ❌ Ollama 未安装

**症状**: `Ollama 未安装`

**解决方案**:
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载: https://ollama.com/download
```

#### ❌ Ollama 服务未运行

**症状**: `Ollama 服务未运行` 或无法连接 `localhost:11434`

**解决方案**:
```bash
# 启动 Ollama 服务
ollama serve

# 或后台运行
ollama serve &
```

#### ❌ BGE-M3 模型未下载

**症状**: `BGE-M3 模型未下载`

**解决方案**:
```bash
ollama pull bge-m3
```

> ⚠️ 首次下载约 1.2GB，请耐心等待

---

### 3. Qdrant 相关问题

#### ❌ Qdrant 未运行

**症状**: `Qdrant 未运行` 或无法连接 `localhost:6333`

**解决方案**:
```bash
# 使用 Docker Compose (推荐)
cd your-project && docker compose up -d

# 或手动启动
docker run -d --name qdrant -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

#### ❌ 端口 6333 被占用

**症状**: `端口 6333 被其他服务占用`

**解决方案**:
```bash
# 查看占用端口的进程
lsof -i :6333

# 停止占用进程或使用其他端口
docker run -d --name qdrant -p 16333:6333 qdrant/qdrant
```

---

### 4. MCP 配置问题

#### ❌ MCP 验证未通过

**症状**: `MCP 验证未完全通过`

**检查步骤**:
1. 确保 Qdrant 正在运行: `curl http://localhost:6333/collections`
2. 确保 Ollama 正在运行: `curl http://localhost:11434/api/tags`
3. 确保 BGE-M3 已下载: `ollama list | grep bge-m3`

**重新配置**:
```bash
openmemory-plus install --force
```

#### ❌ IDE 未识别 MCP 配置

**症状**: IDE 中 `/memory` 命令不可用

**解决方案**:
1. 重启 IDE
2. 检查 MCP 配置文件是否正确:
   - Claude: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Cursor: `~/.cursor/mcp.json`
   - Augment: 项目根目录 `.augment/mcp_config.json`

---

### 5. 安装过程问题

#### ❌ 模板文件复制失败

**症状**: `部分文件复制失败`

**解决方案**:
```bash
# 强制重新安装
openmemory-plus install --force

# 或手动检查权限
ls -la _omp/
```

#### ❌ 网络超时

**症状**: Docker 镜像拉取超时或 Ollama 模型下载失败

**解决方案**:
1. 检查网络连接
2. 使用代理或镜像源
3. 手动拉取镜像:
```bash
docker pull qdrant/qdrant
ollama pull bge-m3
```

---

## 获取帮助

如果以上方案无法解决你的问题:

1. **运行诊断**: `openmemory-plus doctor` 并保存输出
2. **提交 Issue**: [GitHub Issues](https://github.com/Alenryuichi/openmemory-plus/issues)
3. **加入社区**: 在 Issue 中描述你的问题，附上诊断输出

---

## 相关命令

| 命令 | 说明 |
|------|------|
| `openmemory-plus status` | 查看系统状态 |
| `openmemory-plus doctor` | 诊断问题 |
| `openmemory-plus doctor --fix` | 自动修复 |
| `openmemory-plus install --force` | 强制重新安装 |

