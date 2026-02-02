#!/usr/bin/env bash

# Memory YAML Validation Script
# Usage: ./validate.sh [file|all]
# Validates _omp/memory/*.yaml files against JSON Schema
#
# Dependencies (optional, for full schema validation):
#   npm install -g ajv-cli
#
# Without ajv-cli, only YAML syntax is validated.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Navigate up to project root: scripts -> memory-extraction -> skills -> _omp -> project_root
PROJECT_ROOT="${SCRIPT_DIR}/../../../../"
MEMORY_DIR="${PROJECT_ROOT}/_omp/memory"
SCHEMA_DIR="${MEMORY_DIR}/schema"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

validate_yaml() {
  local file="$1"
  local schema="$2"

  echo -n "  Validating $(basename "$file")... "

  # Check if file exists
  if [ ! -f "$file" ]; then
    echo -e "${RED}NOT FOUND${NC}"
    return 1
  fi

  # Check YAML syntax using ruby (built-in on macOS)
  if command -v ruby &> /dev/null; then
    if ! ruby -e "require 'yaml'; YAML.load_file('$file')" 2>/dev/null; then
      echo -e "${RED}YAML SYNTAX ERROR${NC}"
      return 1
    fi
  # Fallback: basic structure check
  elif ! grep -q "^[a-z_]*:" "$file" 2>/dev/null; then
    echo -e "${YELLOW}COULD NOT VALIDATE${NC}"
    return 0
  fi

  # Validate against schema (if ajv or similar is available)
  if command -v ajv &> /dev/null && [ -f "$schema" ]; then
    if ajv validate -s "$schema" -d "$file" --spec=draft7 2>/dev/null; then
      echo -e "${GREEN}VALID${NC}"
      return 0
    else
      echo -e "${YELLOW}SCHEMA MISMATCH${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}YAML OK${NC} (schema validation skipped)"
    return 0
  fi
}

echo "🔍 Memory YAML Validation"
echo "========================="
echo ""

ERRORS=0

# Validate project.yaml
echo "📁 _omp/memory/"
validate_yaml "${MEMORY_DIR}/project.yaml" "${SCHEMA_DIR}/project.schema.json" || ERRORS=$((ERRORS + 1))
validate_yaml "${MEMORY_DIR}/decisions.yaml" "${SCHEMA_DIR}/decisions.schema.json" || ERRORS=$((ERRORS + 1))
validate_yaml "${MEMORY_DIR}/changelog.yaml" "" || ERRORS=$((ERRORS + 1))

# Validate session files
echo ""
echo "📁 _omp/memory/sessions/"
for session_file in "${MEMORY_DIR}"/sessions/*.yaml; do
  if [ -f "$session_file" ]; then
    validate_yaml "$session_file" "${SCHEMA_DIR}/session.schema.json" || ERRORS=$((ERRORS + 1))
  fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All validations passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS validation error(s) found${NC}"
  exit 1
fi

