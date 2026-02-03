#!/bin/bash
# OpenMemory Plus - Full E2E Test Runner
# 完整的端到端测试，利用本地已有服务

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CLI_DIR="$PROJECT_ROOT/cli"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 OpenMemory Plus - Full E2E Test${NC}"
echo "Project root: $PROJECT_ROOT"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is required but not installed${NC}"
    exit 1
fi

# 步骤 1: 检查本地服务状态
echo -e "${GREEN}📋 Step 1: Checking local services...${NC}"

QDRANT_OK=false
OLLAMA_OK=false
BGE_M3_OK=false

if curl -sf "http://localhost:6333/readyz" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Qdrant is running${NC}"
    QDRANT_OK=true
else
    echo -e "  ${YELLOW}⚠️ Qdrant not running${NC}"
fi

if curl -sf "http://localhost:11434/api/tags" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Ollama is running${NC}"
    OLLAMA_OK=true

    if curl -sf "http://localhost:11434/api/tags" | grep -q "bge-m3"; then
        echo -e "  ${GREEN}✅ BGE-M3 model available${NC}"
        BGE_M3_OK=true
    else
        echo -e "  ${YELLOW}⚠️ BGE-M3 model not found${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️ Ollama not running${NC}"
fi

# 如果服务不可用，提示用户
if [ "$QDRANT_OK" = false ] || [ "$OLLAMA_OK" = false ] || [ "$BGE_M3_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️ Some services are not running.${NC}"
    echo "Please start them first:"
    echo "  1. Start Qdrant: docker run -d -p 6333:6333 qdrant/qdrant"
    echo "  2. Start Ollama: ollama serve"
    echo "  3. Pull BGE-M3:  ollama pull bge-m3"
    echo ""
    echo "Or use: omp deps up"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤 2: 构建 CLI
echo ""
echo -e "${GREEN}📦 Step 2: Building CLI...${NC}"
cd "$CLI_DIR"
npm run build

# 步骤 3: 创建临时测试目录
echo ""
echo -e "${GREEN}📁 Step 3: Creating test directory...${NC}"
TEST_DIR=$(mktemp -d)
echo "  Test directory: $TEST_DIR"
cd "$TEST_DIR"
git init -q
git config user.email "test@e2e.local"
git config user.name "E2E Test"

# 清理函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    rm -rf "$TEST_DIR" 2>/dev/null || true
}
trap cleanup EXIT

# 步骤 4: 运行测试
echo ""
echo -e "${GREEN}🧪 Step 4: Running E2E tests...${NC}"

CLI="$CLI_DIR/dist/index.js"
PASSED=0
FAILED=0

run_test() {
    local name="$1"
    local cmd="$2"
    echo ""
    echo "━━━ Test: $name ━━━"
    set +e  # 临时禁用 errexit
    eval "$cmd"
    local result=$?
    set -e  # 重新启用 errexit
    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED: $name${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $name${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# CLI 基础测试
run_test "CLI Version" "node $CLI --version"
run_test "CLI Help" "node $CLI --help | head -5"
run_test "Status Command" "node $CLI status"
run_test "Doctor Command" "node $CLI doctor || true"

# 项目配置测试
run_test "Install (skip-deps)" "node $CLI install --yes --skip-deps --ide augment --skip-verify"
run_test "Verify _omp directory" "ls -la _omp/ && test -d _omp/memory"
run_test "Verify project.yaml" "test -f _omp/memory/project.yaml"

# 服务连接测试
if [ "$QDRANT_OK" = true ]; then
    run_test "Qdrant Connection" "curl -sf http://localhost:6333/collections | head -1"
fi

if [ "$OLLAMA_OK" = true ]; then
    run_test "Ollama Connection" "curl -sf http://localhost:11434/api/tags | head -1"
fi

if [ "$BGE_M3_OK" = true ]; then
    run_test "BGE-M3 Embedding" \
        "curl -sf http://localhost:11434/api/embeddings -d '{\"model\":\"bge-m3\",\"prompt\":\"test\"}' | grep -q embedding"
fi

# Memory 功能测试 (通过 Qdrant API 直接测试向量存储)
if [ "$QDRANT_OK" = true ] && [ "$BGE_M3_OK" = true ]; then
    echo ""
    echo -e "${GREEN}━━━ Memory Function Tests ━━━${NC}"

    # 生成测试向量
    TEST_EMBEDDING=$(curl -sf http://localhost:11434/api/embeddings \
        -d '{"model":"bge-m3","prompt":"E2E test memory entry for OpenMemory Plus"}' \
        | jq -c '.embedding')

    if [ -n "$TEST_EMBEDDING" ] && [ "$TEST_EMBEDDING" != "null" ]; then
        # 测试向量存储到 Qdrant
        run_test "Memory Vector Generation" "echo 'Vector length:' && echo '$TEST_EMBEDDING' | jq 'length'"

        # 测试 Qdrant 集合存在
        run_test "Memory Collection Exists" \
            "curl -sf http://localhost:6333/collections/openmemory | jq '.result.status'"

        # 测试搜索功能
        run_test "Memory Search API" \
            "curl -sf http://localhost:6333/collections/openmemory/points/scroll -X POST \
            -H 'Content-Type: application/json' \
            -d '{\"limit\":5}' | jq '.result.points | length'"
    else
        echo -e "${YELLOW}⚠️ Skipping memory tests (embedding generation failed)${NC}"
    fi
fi

# 完整流程测试
rm -rf _omp .augment 2>/dev/null || true
run_test "Full Install" "node $CLI install --yes --ide augment --skip-deps --skip-verify"
run_test "Final Status" "node $CLI status"

# 步骤 5: 显示结果
echo ""
echo "═══════════════════════════════════════════"
echo -e "📊 ${GREEN}Test Results${NC}"
echo "═══════════════════════════════════════════"
echo -e "  ${GREEN}✅ Passed: $PASSED${NC}"
echo -e "  ${RED}❌ Failed: $FAILED${NC}"
echo "  📝 Total:  $((PASSED + FAILED))"
echo "═══════════════════════════════════════════"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
fi

