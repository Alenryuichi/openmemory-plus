#!/bin/bash
# OpenMemory Plus 沙盒测试运行脚本
# 使用 Docker-in-Docker 实现完全隔离的测试环境

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CLI_DIR="$PROJECT_ROOT/cli"

echo "🚀 OpenMemory Plus Sandbox E2E Test"
echo "Project root: $PROJECT_ROOT"
echo ""

# 检查 Docker 是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

# 先在本地构建 CLI
echo "🔨 Building CLI locally..."
cd "$CLI_DIR"
npm run build

# 构建沙盒镜像（使用预构建的 dist）
echo ""
echo "📦 Building sandbox image..."
docker build -t omp-sandbox:test \
    -f "$SCRIPT_DIR/Dockerfile.sandbox" \
    "$PROJECT_ROOT"

# 运行沙盒测试（需要 privileged 模式支持 DinD）
echo ""
echo "🧪 Running sandbox tests..."
docker run --rm \
    --privileged \
    --name omp-sandbox-test \
    omp-sandbox:test

echo ""
echo "✅ Sandbox test completed!"

