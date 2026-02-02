---
name: 'step-05-test-generation'
description: 'Generate tests for CLI with >80% coverage target'

nextStepFile: './step-06-documentation.md'
outputFolder: '{bmb_creations_output_folder}/cli'
cliPlanFile: '{outputFolder}/{cliName}/cli-plan-{cliName}.md'
cliOutputPath: '{outputFolder}/{cliName}'
---

# Step 5: Test Generation

## STEP GOAL:

To generate comprehensive tests for the CLI with >80% coverage target.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** ensuring quality
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring testing expertise and best practices
- ✅ User brings edge cases and domain knowledge

### Step-Specific Rules:

- 🎯 Focus ONLY on test generation
- 🚫 FORBIDDEN to generate documentation yet
- 💬 Approach: Generate tests, show coverage, confirm
- ✅ This is **Checkpoint 2** - user reviews code and tests
- ⚠️ This step is **Branch A only** (new CLI)

## EXECUTION PROTOCOLS:

- 🎯 Generate unit and integration tests
- 💾 Create test files in {cliOutputPath}/test/
- 📖 Target >80% coverage
- 🚫 Do not proceed without user approval

## CONTEXT BOUNDARIES:

- Available: Generated code from Step 04
- Focus: Test generation only
- Limits: No documentation
- Dependencies: Step 04 completed

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Load Generated Code

Load {cliPlanFile} and review:
- Generated files list
- Commands and their parameters
- Utility functions

### 2. Generate Unit Tests

Create `{cliOutputPath}/test/unit/` with tests for:

**Command Tests:**
- Each command handler
- Parameter validation
- Error cases
- JSON output format

**Utility Tests:**
- Config loading/saving
- Logger functionality
- Output formatting

### 3. Generate Integration Tests

Create `{cliOutputPath}/test/integration/` with tests for:

**CLI Integration:**
- Full command execution
- Global options (--help, --version, --json)
- Error handling
- Exit codes

### 4. Display Test Summary

"✅ **Generated Tests:**

**Unit Tests:**
- test/unit/commands/{command1}.test.js
- test/unit/commands/{command2}.test.js
- test/unit/utils/config.test.js
- test/unit/utils/logger.test.js

**Integration Tests:**
- test/integration/cli.test.js
- test/integration/commands.test.js

**Coverage Target:** >80%
**Test Framework:** Jest"

### 5. Checkpoint 2: Code Review

"✅ **Checkpoint 2: Code and Test Review**

All code and tests have been generated.

**Select an Option:**
[A] Approve - Code and tests look good
[E] Edit - I want to modify something
[R] Run Tests - Execute tests to verify
[S] Save - Save progress, continue later"

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting checkpoint
- ONLY proceed to next step when user approves tests

#### Menu Handling Logic:

- IF A: Update CLI plan, load {nextStepFile}
- IF E: Collect edits, apply changes, redisplay checkpoint
- IF R: Run `npm test`, show results, redisplay checkpoint
- IF S: Save progress, update stepsCompleted, end session

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Unit tests for all commands
- Integration tests for CLI
- Coverage target documented
- User approved code and tests
- CLI plan updated

### ❌ SYSTEM FAILURE:
- Missing tests for commands
- No integration tests
- Proceeding without approval
- Not updating CLI plan

**Master Rule:** Skipping steps is FORBIDDEN.

