---
name: 'step-03-edit'
description: 'Execute the requested edit on CLI component'

nextStepFile: './step-04-validate.md'
outputFolder: '{bmb_creations_output_folder}/cli'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Execute Edit

## STEP GOAL:

To make the requested changes to the selected CLI component.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** making edits
- ✅ We engage in collaborative dialogue
- ✅ You propose changes for approval
- ✅ User confirms before applying

### Step-Specific Rules:

- 🎯 Focus ONLY on the selected component
- 🚫 FORBIDDEN to edit unrelated files
- 💬 Approach: Show changes, confirm, apply

## EXECUTION PROTOCOLS:

- 🎯 Make targeted edits only
- 💾 Show before/after comparison
- 📖 Get user approval before saving
- 🚫 Do not proceed without approval

## CONTEXT BOUNDARIES:

- Available: Selected CLI, component, change request
- Focus: Making specific edit
- Limits: Only selected component
- Dependencies: Step 02 completed

## MANDATORY SEQUENCE

### 1. Display Current State

"📋 **Current State of {component}:**"

Display the current content of the selected component.

### 2. Propose Changes

Based on user's change description, propose edits:

"🔧 **Proposed Changes:**

```diff
- [removed lines]
+ [added lines]
```

**Summary:**
- Change 1: description
- Change 2: description"

### 3. Review Changes

"⚠️ **Please review these changes.**

Do they match your expectations?"

Wait for feedback.

### 4. Apply or Revise

**IF user approves:**
- Apply changes to files
- Display: "✅ Changes applied successfully."

**IF user wants revisions:**
- Collect feedback
- Return to step 2

### 5. Update CLI Plan

Update the CLI plan file:
- Add edit to history
- Update lastModified date

### 6. Present MENU OPTIONS

**Select an Option:** 
[A] Advanced Elicitation - Refine more [P] Party Mode [V] Validate Changes [M] More Edits [D] Done

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed based on user selection

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}, return
- IF P: Execute {partyModeWorkflow}, return
- IF V: Load {nextStepFile}
- IF M: Return to step-02-select-target
- IF D: Complete edit mode

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Changes proposed clearly
- User approved changes
- Files updated correctly
- CLI plan updated

### ❌ SYSTEM FAILURE:
- Applying without approval
- Editing wrong files
- Not showing diff
- Forgetting to update plan

**Master Rule:** Skipping steps is FORBIDDEN.

