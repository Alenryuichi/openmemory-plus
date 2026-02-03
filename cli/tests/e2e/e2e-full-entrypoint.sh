#!/bin/bash
set -e

echo "🧪 OpenMemory Plus - Full E2E Test"
echo "==================================="
echo ""

CLI="/workspace/openmemory-plus/cli/dist/index.js"
PASSED=0
FAILED=0

# 测试辅助函数
run_test() {
    local name="$1"
    local cmd="$2"
    echo ""
    echo "━━━ Test: $name ━━━"
    if eval "$cmd"; then
        echo "✅ PASSED: $name"
        ((PASSED++))
    else
        echo "❌ FAILED: $name"
        ((FAILED++))
    fi
}

# 等待服务就绪
echo "⏳ Waiting for services..."

# 等待 Qdrant
echo "  Checking Qdrant..."
for i in {1..30}; do
    if curl -sf "http://${QDRANT_HOST:-qdrant}:${QDRANT_PORT:-6333}/readyz" > /dev/null 2>&1; then
        echo "  ✅ Qdrant is ready"
        break
    fi
    sleep 2
done

# 等待 Ollama
echo "  Checking Ollama..."
for i in {1..30}; do
    if curl -sf "${OLLAMA_HOST:-http://ollama:11434}/api/tags" > /dev/null 2>&1; then
        echo "  ✅ Ollama is ready"
        break
    fi
    sleep 2
done

# 检查 BGE-M3 模型
echo "  Checking BGE-M3 model..."
for i in {1..60}; do
    if curl -sf "${OLLAMA_HOST:-http://ollama:11434}/api/tags" | grep -q "bge-m3"; then
        echo "  ✅ BGE-M3 model is ready"
        break
    fi
    echo "  Waiting for BGE-M3 model... ($i/60)"
    sleep 5
done

echo ""
echo "🚀 Starting tests..."

# ============ CLI 基础测试 ============

run_test "CLI Version" "node $CLI --version"

run_test "CLI Help" "node $CLI --help"

run_test "Status Command" "node $CLI status"

run_test "Doctor Command" "node $CLI doctor"

# ============ 项目配置测试 ============

run_test "Install (skip-deps)" "node $CLI install --yes --skip-deps --ide augment --skip-verify"

run_test "Verify _omp directory" "ls -la _omp/ && test -d _omp/memory && test -d _omp/workflows"

run_test "Verify project.yaml" "test -f _omp/memory/project.yaml && cat _omp/memory/project.yaml"

# ============ Memory 功能测试 ============

echo ""
echo "━━━ Memory Function Tests ━━━"

# 测试 OpenMemory MCP 服务
# 注意：MCP 是通过 npx openmemory-mcp 启动的，这里我们直接测试 API

# 启动 openmemory-mcp 服务（后台）
echo "Starting OpenMemory MCP service..."
export USER_ID="e2e-test-user"
export MEM0_EMBEDDING_MODEL="bge-m3"
export MEM0_EMBEDDING_PROVIDER="ollama"
export QDRANT_HOST="${QDRANT_HOST:-qdrant}"
export QDRANT_PORT="${QDRANT_PORT:-6333}"

# 由于 MCP 是 stdio 协议，我们需要通过其他方式测试
# 这里我们直接测试 Qdrant 和 Ollama 的连接性

run_test "Qdrant Connection" "curl -sf http://${QDRANT_HOST}:${QDRANT_PORT}/collections | jq ."

run_test "Ollama Connection" "curl -sf ${OLLAMA_HOST}/api/tags | jq '.models[] | .name'"

run_test "BGE-M3 Embedding Test" \
    "curl -sf ${OLLAMA_HOST}/api/embeddings -d '{\"model\":\"bge-m3\",\"prompt\":\"test\"}' | jq '.embedding | length'"

# ============ 完整流程测试 ============

echo ""
echo "━━━ Full Flow Test ━━━"

# 清理并重新安装
rm -rf _omp .augment 2>/dev/null || true

run_test "Full Install" "node $CLI install --yes --ide augment --skip-deps --skip-verify"

run_test "Final Status" "node $CLI status"

# ============ 测试结果 ============

echo ""
echo "═══════════════════════════════════════════"
echo "📊 Test Results"
echo "═══════════════════════════════════════════"
echo "  ✅ Passed: $PASSED"
echo "  ❌ Failed: $FAILED"
echo "  📝 Total:  $((PASSED + FAILED))"
echo "═══════════════════════════════════════════"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo "❌ Some tests failed!"
    exit 1
else
    echo ""
    echo "🎉 All tests passed!"
    exit 0
fi

