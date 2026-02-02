---
name: 'step-06-documentation'
description: 'Generate three-layer documentation system'

nextStepFile: './step-07-integration.md'
outputFolder: '{bmb_creations_output_folder}/cli'
cliPlanFile: '{outputFolder}/{cliName}/cli-plan-{cliName}.md'
cliOutputPath: '{outputFolder}/{cliName}'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 6: Three-Layer Documentation Generation

## STEP GOAL:

To generate the complete three-layer documentation system for AI Agent usability.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** creating documentation
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring documentation architecture expertise
- ✅ User brings domain knowledge and preferences

### Step-Specific Rules:

- 🎯 Focus ONLY on documentation generation
- 🚫 FORBIDDEN to modify code
- 💬 Approach: Generate docs, show structure, confirm
- ✅ This is **Checkpoint 3** - user reviews documentation
- 📝 This step applies to **both Branch A and Branch B**

## EXECUTION PROTOCOLS:

- 🎯 Generate all four documentation layers
- 💾 Create files in appropriate locations
- 📖 Follow BMAD style for Layer 2
- 🚫 Do not proceed without user approval

## CONTEXT BOUNDARIES:

- Available: CLI plan, code (Branch A) or analysis (Branch B)
- Focus: Documentation only
- Limits: No code changes
- Dependencies: Step 03 (Branch B) or Step 05 (Branch A) completed

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Load CLI Information

Load {cliPlanFile} and extract:
- CLI name, description
- Commands with parameters
- Target users

### 2. Generate Layer 0: Skill File

Create `.augment/skills/{cliName}/SKILL.md`:

```markdown
---
name: '{cliName}'
description: '{cliDescription}'
---

# {cliName} Skill

## Triggers
- User mentions "{cliName}"
- User wants to [primary use case]
- Keywords: [keyword1], [keyword2], [keyword3]

## Capabilities
- [capability1]
- [capability2]

## Quick Reference
- Entry: `/{cliName} <command>`
- Help: `{cliName} --help`
```

### 3. Generate Layer 1: README

Create `{cliOutputPath}/README.md` (50-100 lines):
- CLI introduction
- Quick start guide
- Installation instructions
- Basic usage examples
- Link to full documentation

### 4. Generate Layer 2: Command File

Create `.augment/commands/{cliName}.md` (15-25 lines, BMAD style):

```markdown
---
name: '{cliName}'
description: '{cliDescription}'
cli-executable: '{cliName}'
---

# {cliName}

## Quick Usage
{cliName} <command> [options]

## Commands
- init: Initialize
- {main}: {description}
- status: Check status

## Agent Notes
- Verify: `which {cliName}`
- JSON: `--json` flag
- Help: `{cliName} --help`

## Docs
@{cliName}/README.md | @{cliName}/docs/
```

### 5. Generate Layer 3: Complete Docs

Create `{cliOutputPath}/docs/`:
- `usage.md` - Detailed usage guide
- `api.md` - API reference for each command
- `troubleshooting.md` - Common issues and solutions
- `advanced.md` - Advanced usage patterns

### 6. Display Documentation Summary

"📝 **Generated Documentation:**

**Layer 0 (Skill):**
✅ .augment/skills/{cliName}/SKILL.md

**Layer 1 (README):**
✅ {cliName}/README.md

**Layer 2 (Command):**
✅ .augment/commands/{cliName}.md

**Layer 3 (Docs):**
✅ {cliName}/docs/usage.md
✅ {cliName}/docs/api.md
✅ {cliName}/docs/troubleshooting.md
✅ {cliName}/docs/advanced.md"

### 7. Checkpoint 3: Documentation Review

"✅ **Checkpoint 3: Documentation Review**

**Select an Option:**
[A] Approve - Documentation looks good
[R] Regenerate - Regenerate specific layer
[P] Party Mode - Discuss documentation improvements
[S] Save - Save progress, continue later"

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting checkpoint
- ONLY proceed to next step when user approves documentation

#### Menu Handling Logic:

- IF A: Update CLI plan, load {nextStepFile}
- IF R: Ask which layer, regenerate, redisplay checkpoint
- IF P: Execute {partyModeWorkflow}, then redisplay checkpoint
- IF S: Save progress, update stepsCompleted, end session

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 4 layers generated
- Layer 2 follows BMAD style (15-25 lines)
- Documentation is complete and accurate
- User approved documentation

### ❌ SYSTEM FAILURE:
- Missing documentation layers
- Layer 2 too verbose (>25 lines)
- Proceeding without approval
- Inaccurate command documentation

**Master Rule:** Skipping steps is FORBIDDEN.

