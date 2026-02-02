---
name: 'step-02-run-checks'
description: 'Run validation checks on selected CLI'

nextStepFile: './step-03-report.md'
outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 2: Run Validation Checks

## STEP GOAL:

To run all validation checks on the selected CLI.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 DO NOT BE LAZY - RUN ALL CHECKS THOROUGHLY
- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** validating quality
- ✅ We engage in collaborative dialogue
- ✅ You run checks systematically
- ✅ User observes progress

### Step-Specific Rules:

- 🎯 Focus ONLY on running checks
- 🚫 FORBIDDEN to make fixes
- 💬 Approach: Check, record, proceed

## EXECUTION PROTOCOLS:

- 🎯 Run checks based on scope
- 💾 Record all results
- 📖 Show progress
- 🚫 Do not fix issues here

## CONTEXT BOUNDARIES:

- Available: Selected CLI, validation scope
- Focus: Running checks
- Limits: No fixes
- Dependencies: Step 01 completed

## MANDATORY SEQUENCE

### 1. Begin Validation

Display:

"🔍 **Running {scope} validation on {cliName}...**"

### 2. Code Validation (Full/Custom)

**Checks:**
- [ ] package.json valid
- [ ] cli.js exists and valid
- [ ] All command handlers exist
- [ ] Utilities exist
- [ ] ESLint passes

Display progress:
"📦 **Code Validation:**
✅ package.json valid
✅ cli.js exists
🔄 Checking command handlers..."

### 3. Test Validation (Full/Custom)

**Checks:**
- [ ] Unit tests exist
- [ ] Integration tests exist
- [ ] Tests pass
- [ ] Coverage >80%

Display progress:
"🧪 **Test Validation:**
✅ Unit tests found
✅ Integration tests found
🔄 Running tests..."

### 4. Documentation Validation

**Checks:**
- [ ] Layer 0: Skill file exists
- [ ] Layer 1: README exists (50-100 lines)
- [ ] Layer 2: Command file exists (15-25 lines)
- [ ] Layer 3: Docs folder complete

Display progress:
"📝 **Documentation Validation:**
✅ Layer 0: Skill file found
✅ Layer 1: README (75 lines)
✅ Layer 2: Command file (20 lines)
🔄 Checking Layer 3..."

### 5. Integration Validation

**Checks:**
- [ ] Skill file in project .augment/skills/
- [ ] Command file in project .augment/commands/
- [ ] CLAUDE.md references CLI
- [ ] CLI executable

Display progress:
"🔗 **Integration Validation:**
✅ Skill file integrated
✅ Command file integrated
🔄 Checking CLAUDE.md..."

### 6. Compile Results

Compile all results into validation report.

### 7. Auto-Proceed

Display: "**Validation complete. Generating report...**"

Load {nextStepFile}

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All checks run
- Results recorded
- Progress shown
- Report ready

### ❌ SYSTEM FAILURE:
- Skipping checks
- Making fixes
- Not recording results
- Not showing progress

**Master Rule:** Skipping steps is FORBIDDEN.

