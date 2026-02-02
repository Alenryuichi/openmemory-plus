---
name: 'step-01-init-edit'
description: 'Initialize Edit mode for CLI Builder'

nextStepFile: './step-02-select-target.md'
outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 1: Edit Mode Initialization

## STEP GOAL:

To initialize Edit mode and find existing CLI builds for editing.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style

### Role Reinforcement:

- ✅ You are a **CLI Architect** in edit mode
- ✅ We engage in collaborative dialogue
- ✅ You help modify existing CLI builds
- ✅ User brings their change requirements

### Step-Specific Rules:

- 🎯 Focus ONLY on finding existing CLIs
- 🚫 FORBIDDEN to make edits yet
- 💬 Approach: Discovery, then target selection

## EXECUTION PROTOCOLS:

- 🎯 Search for existing CLI builds
- 💾 Display available options
- 📖 Route to target selection
- 🚫 Do not edit until target confirmed

## CONTEXT BOUNDARIES:

- Available: Output folder contents
- Focus: Finding editable CLIs
- Limits: No edits in this step
- Dependencies: None

## MANDATORY SEQUENCE

### 1. Welcome to Edit Mode

Display:

"🔧 **CLI Builder - Edit Mode**

I'll help you modify an existing CLI build.

Searching for existing CLIs..."

### 2. Search for Existing CLIs

Search {outputFolder} for `cli-plan-*.md` files.

For each found, display:
- CLI name
- Status (COMPLETE / IN_PROGRESS)
- Last modified date
- Number of commands

### 3. Check for CLIs

**IF no CLIs found:**
Display: "❌ No existing CLI builds found.

Would you like to create a new CLI instead?

[N] New CLI - Start a new build
[Q] Quit - Exit"

**IF CLIs found:**
Continue to menu

### 4. Present MENU OPTIONS

Display: "**Found {count} CLI(s). Ready to select one for editing.**"

**Select an Option:** [C] Continue to Selection

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed when user confirms selection

#### Menu Handling Logic:

- IF C: Load {nextStepFile}
- IF N: Load Create mode step-02
- IF Q: End session

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Existing CLIs discovered
- Status displayed correctly
- User proceeds to selection

### ❌ SYSTEM FAILURE:
- Making edits in this step
- Missing existing CLIs
- Not showing status

**Master Rule:** Skipping steps is FORBIDDEN.

