---
name: 'step-02-select-target'
description: 'Select edit target for CLI modification'

nextStepFile: './step-03-edit.md'
outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 2: Select Edit Target

## STEP GOAL:

To select the specific CLI and component to edit.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** helping select edit target
- ✅ We engage in collaborative dialogue
- ✅ You present options clearly
- ✅ User makes selection decisions

### Step-Specific Rules:

- 🎯 Focus ONLY on selection
- 🚫 FORBIDDEN to make edits yet
- 💬 Approach: Present options, confirm selection

## EXECUTION PROTOCOLS:

- 🎯 List editable components
- 💾 Confirm user selection
- 📖 Store selection for next step
- 🚫 Do not edit until confirmed

## CONTEXT BOUNDARIES:

- Available: Selected CLI data
- Focus: Component selection
- Limits: Selection only
- Dependencies: Step 01 completed

## MANDATORY SEQUENCE

### 1. Display CLI List

"📋 **Select CLI to Edit:**

{{#each clis}}
[{{index}}] {{name}} - {{description}} ({{status}})
{{/each}}"

Wait for user selection.

### 2. Load Selected CLI

Load the selected CLI's plan file.
Display summary of CLI structure.

### 3. Display Editable Components

"🔧 **What would you like to edit?**

**Code:**
[1] Commands - Add/modify/remove commands
[2] Options - Modify global options
[3] Utilities - Edit utility functions

**Documentation:**
[4] Layer 0 - Skill file
[5] Layer 1 - README
[6] Layer 2 - Command file
[7] Layer 3 - Full docs

**Tests:**
[8] Unit tests
[9] Integration tests

**Configuration:**
[10] package.json
[11] CLI configuration

Enter number or describe what you want to change:"

### 4. Confirm Selection

"✅ **Editing: {selectedComponent}**

Please describe the changes you want to make:"

Wait for change description.

### 5. Present MENU OPTIONS

Display summary of planned edit, then:

**Select an Option:** [C] Continue to Edit [R] Reselect

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed when user confirms edit target

#### Menu Handling Logic:

- IF C: Store selection, load {nextStepFile}
- IF R: Return to step 3

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- CLI selected
- Component identified
- Change described
- Selection confirmed

### ❌ SYSTEM FAILURE:
- Making edits in this step
- Unclear selection
- Not confirming with user

**Master Rule:** Skipping steps is FORBIDDEN.

