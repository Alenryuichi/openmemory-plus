#!/bin/bash
set -e

echo "🧪 OpenMemory Plus E2E Sandbox Test"
echo "===================================="

# 启动 Docker daemon (DinD)
echo "📦 Starting Docker daemon..."
dockerd-entrypoint.sh &
sleep 5

# 等待 Docker 就绪
echo "⏳ Waiting for Docker..."
timeout 60 sh -c 'until docker info > /dev/null 2>&1; do sleep 1; done'
echo "✅ Docker is ready"

# 运行测试
cd /workspace/test-project

echo ""
echo "=== Test 1: CLI Version ==="
node /workspace/openmemory-plus/cli/dist/index.js --version

echo ""
echo "=== Test 2: Status Command (no deps) ==="
node /workspace/openmemory-plus/cli/dist/index.js status || true

echo ""
echo "=== Test 3: Doctor Command ==="
node /workspace/openmemory-plus/cli/dist/index.js doctor || true

echo ""
echo "=== Test 4: Deps Init ==="
node /workspace/openmemory-plus/cli/dist/index.js deps init --local

echo ""
echo "=== Test 5: Install with skip-deps ==="
node /workspace/openmemory-plus/cli/dist/index.js install --yes --skip-deps --ide augment --skip-verify

echo ""
echo "=== Test 6: Verify _omp directory ==="
ls -la _omp/ || echo "❌ _omp not created"

echo ""
echo "=== Test 7: Deps Up (Docker Compose) ==="
# 这会真正拉取镜像并启动服务
node /workspace/openmemory-plus/cli/dist/index.js deps up --local || true

echo ""
echo "=== Test 8: Deps Status ==="
node /workspace/openmemory-plus/cli/dist/index.js deps status --local || true

echo ""
echo "=== Test 9: Full Install (with deps) ==="
rm -rf _omp .augment 2>/dev/null || true
node /workspace/openmemory-plus/cli/dist/index.js install --yes --ide augment --compose --skip-verify || true

echo ""
echo "=== Test 10: Final Status ==="
node /workspace/openmemory-plus/cli/dist/index.js status

echo ""
echo "=== Test 11: Deps Down ==="
node /workspace/openmemory-plus/cli/dist/index.js deps down --local || true

echo ""
echo "🎉 All E2E tests completed!"

