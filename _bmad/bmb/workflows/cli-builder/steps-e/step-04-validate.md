---
name: 'step-04-validate-edit'
description: 'Validate edits made to CLI'

outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 4: Validate Edit

## STEP GOAL:

To validate that edits were applied correctly and CLI still works.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** validating changes
- ✅ We engage in collaborative dialogue
- ✅ You run validation checks
- ✅ User reviews results

### Step-Specific Rules:

- 🎯 Focus ONLY on validation
- 🚫 FORBIDDEN to make more edits
- 💬 Approach: Check, report, confirm

## EXECUTION PROTOCOLS:

- 🎯 Run appropriate validation checks
- 💾 Report results clearly
- 📖 Handle failures gracefully
- 🚫 Do not mark complete until validation passes

## CONTEXT BOUNDARIES:

- Available: Edited CLI files
- Focus: Validation only
- Limits: No edits
- Dependencies: Step 03 completed

## MANDATORY SEQUENCE

### 1. Determine Validation Type

Based on edited component, run appropriate checks:

**Code edits:**
- Syntax check (lint)
- Run affected tests
- Check CLI execution

**Documentation edits:**
- Check file exists
- Verify links work
- Check formatting

### 2. Run Validations

Display: "🔍 **Running validation checks...**"

Run checks and collect results.

### 3. Display Results

"📋 **Validation Results:**

**Checks Passed:** ✅
{{#each passed}}
- ✅ {{this}}
{{/each}}

**Checks Failed:** ❌
{{#each failed}}
- ❌ {{this}}
{{/each}}"

### 4. Handle Results

**IF all passed:**
Display: "✅ All validations passed!"

**IF any failed:**
Display: "⚠️ Some validations failed.

Would you like to:
[F] Fix issues - Return to edit
[I] Ignore - Continue anyway (not recommended)
[R] Review - See details"

### 5. Present MENU OPTIONS

**Select an Option:**
[M] More Edits - Make additional changes
[D] Done - Complete edit session

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting validation results
- ONLY proceed based on user selection

#### Menu Handling Logic:

- IF F: Return to step-03-edit
- IF I: Continue with warning
- IF M: Return to step-02-select-target
- IF D: Complete edit mode, display summary

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Validations run
- Results displayed
- User informed of issues
- Session completed cleanly

### ❌ SYSTEM FAILURE:
- Skipping validations
- Not reporting failures
- Marking complete with failures
- Making edits in validation step

**Master Rule:** Skipping steps is FORBIDDEN.

