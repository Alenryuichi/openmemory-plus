---
name: 'step-01-init-validate'
description: 'Initialize Validate mode for CLI Builder'

nextStepFile: './step-02-run-checks.md'
outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 1: Validate Mode Initialization

## STEP GOAL:

To initialize Validate mode and select CLI for validation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 DO NOT BE LAZY - RUN ALL CHECKS THOROUGHLY
- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** in validation mode
- ✅ We engage in collaborative dialogue
- ✅ You run comprehensive checks
- ✅ User reviews validation results

### Step-Specific Rules:

- 🎯 Focus ONLY on selecting validation target
- 🚫 FORBIDDEN to run checks yet
- 💬 Approach: Select, then validate

## EXECUTION PROTOCOLS:

- 🎯 Find existing CLI builds
- 💾 Let user select one
- 📖 Prepare for validation
- 🚫 Do not validate until selected

## CONTEXT BOUNDARIES:

- Available: Output folder contents
- Focus: CLI selection
- Limits: No validation yet
- Dependencies: None

## MANDATORY SEQUENCE

### 1. Welcome to Validate Mode

Display:

"✅ **CLI Builder - Validate Mode**

I'll run comprehensive validation checks on your CLI.

Searching for existing CLIs..."

### 2. Search for CLIs

Search {outputFolder} for `cli-plan-*.md` files.

Display list:
"📋 **Available CLIs:**

{{#each clis}}
[{{index}}] {{name}} - {{status}} ({{commandCount}} commands)
{{/each}}"

### 3. Select CLI

Wait for user to select a CLI.

Load the selected CLI plan file.

### 4. Display Validation Scope

"🔍 **Validation Scope for {cliName}:**

**Will validate:**
- ✅ Code structure and syntax
- ✅ Test coverage (>80% target)
- ✅ Documentation completeness
- ✅ Layer 0-3 documentation
- ✅ Project integration
- ✅ CLI functionality

**Validation type:**
[F] Full - Run all checks
[Q] Quick - Essential checks only
[C] Custom - Select specific checks"

### 5. Present MENU OPTIONS

**Select an Option:** [F/Q/C]

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed when user selects validation scope

#### Menu Handling Logic:

- IF F: Set scope='full', load {nextStepFile}
- IF Q: Set scope='quick', load {nextStepFile}
- IF C: Display custom options, then load {nextStepFile}

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- CLIs discovered
- One selected
- Scope determined
- Ready for validation

### ❌ SYSTEM FAILURE:
- Running validation here
- Not showing options
- Unclear scope

**Master Rule:** Skipping steps is FORBIDDEN.

