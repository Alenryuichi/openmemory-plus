---
name: 'step-03-design'
description: 'Design CLI architecture and documentation structure'

nextStepFile: './step-04-code-generation.md'
nextStepFileBranchB: './step-06-documentation.md'
outputFolder: '{bmb_creations_output_folder}/cli'
cliPlanFile: '{outputFolder}/{cliName}/cli-plan-{cliName}.md'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Solution Design

## STEP GOAL:

To design the CLI architecture, command structure, and three-layer documentation plan.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** designing the solution
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring architecture expertise and best practices
- ✅ User brings domain requirements and preferences

### Step-Specific Rules:

- 🎯 Focus ONLY on design, not implementation
- 🚫 FORBIDDEN to generate code yet
- 💬 Approach: Propose designs, get feedback, refine
- ✅ This is **Checkpoint 1** - user must approve design

## EXECUTION PROTOCOLS:

- 🎯 Design CLI architecture based on requirements
- 💾 Document design in CLI plan file
- 📖 Get user approval before proceeding
- 🚫 Do not proceed without explicit approval

## CONTEXT BOUNDARIES:

- Available: Requirements from Step 02, CLI plan file
- Focus: Architecture, structure, documentation plan
- Limits: No code generation
- Dependencies: Step 02 completed

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Load Requirements

Load {cliPlanFile} and review:
- CLI name and description
- CLI mode (new/existing)
- Commands list
- Target users

### 2. Design CLI Architecture (Branch A Only)

For new CLIs, propose architecture:

"📐 **Proposed CLI Architecture:**

**Tech Stack:**
- Runtime: Node.js
- Framework: Commander.js
- Package Manager: npm

**File Structure:**
```
{cliName}/
├── package.json
├── cli.js              # Entry point
├── lib/
│   ├── commands/       # Command handlers
│   └── utils/          # Utilities
└── test/               # Tests
```

**Command Structure:**
```
{cliName} <command> [options]

Global Options:
  --help, -h      Show help
  --version, -v   Show version
  --json          Output as JSON (for AI Agents)
  --verbose       Verbose output
```"

### 3. Design Documentation Structure

"📝 **Three-Layer Documentation Plan:**

**Layer 0 (Discovery):**
- `.augment/skills/{cliName}/SKILL.md`
- Triggers: Keywords that activate this CLI

**Layer 1 (Entry Point):**
- `{cliName}/README.md` (50-100 lines)
- Quick start guide

**Layer 2 (Slash Command):**
- `.augment/commands/{cliName}.md` (15-25 lines)
- BMAD-style minimal reference

**Layer 3 (Complete Docs):**
- `{cliName}/docs/usage.md`
- `{cliName}/docs/api.md`
- `{cliName}/docs/troubleshooting.md`"

### 4. Design Error Handling

"⚠️ **Error Handling Strategy:**

- Exit codes: 0 (success), 1 (error), 2 (config error)
- Error messages: Clear, actionable
- JSON errors: Structured for AI parsing"

### 5. Checkpoint 1: Design Review

"✅ **Checkpoint 1: Design Review**

Please review the proposed design above.

**Select an Option:**
[A] Approve - Design looks good, continue
[M] Modify - I want to change something
[P] Party Mode - Discuss with multiple perspectives
[S] Save - Save progress, continue later"

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting checkpoint
- ONLY proceed to next step when user approves design

#### Menu Handling Logic:

- IF A: Update CLI plan with design, determine next step:
  - Branch A (new): Load {nextStepFile}
  - Branch B (existing): Load {nextStepFileBranchB}
- IF M: Collect modifications, update design, redisplay checkpoint
- IF P: Execute {partyModeWorkflow}, then redisplay checkpoint
- IF S: Save progress, update stepsCompleted, end session

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Architecture designed (Branch A) or confirmed (Branch B)
- Documentation structure planned
- Error handling defined
- User explicitly approved design
- CLI plan updated with design

### ❌ SYSTEM FAILURE:
- Proceeding without user approval
- Generating code in this step
- Missing documentation plan
- Not updating CLI plan file

**Master Rule:** Skipping steps is FORBIDDEN.

