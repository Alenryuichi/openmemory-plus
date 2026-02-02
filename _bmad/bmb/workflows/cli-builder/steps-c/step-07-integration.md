---
name: 'step-07-integration'
description: 'Integrate CLI into project and complete workflow'

outputFolder: '{bmb_creations_output_folder}/cli'
cliPlanFile: '{outputFolder}/{cliName}/cli-plan-{cliName}.md'
sidecarFile: '{bmb_creations_output_folder}/cli-builder-history.md'
claudeFile: '{project-root}/CLAUDE.md'
---

# Step 7: Project Integration

## STEP GOAL:

To integrate the CLI into the project, update CLAUDE.md, and complete the workflow.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** completing the build
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring integration expertise
- ✅ User brings project-specific requirements

### Step-Specific Rules:

- 🎯 Focus ONLY on integration and completion
- 🚫 FORBIDDEN to modify CLI code or docs
- 💬 Approach: Verify, integrate, confirm
- ✅ This is **Checkpoint 4 (Final)** - workflow completion

## EXECUTION PROTOCOLS:

- 🎯 Verify CLI is functional
- 💾 Update CLAUDE.md with CLI reference
- 📖 Update sidecar history file
- 🚫 Mark workflow complete only after verification

## CONTEXT BOUNDARIES:

- Available: Complete CLI with documentation
- Focus: Integration and verification
- Limits: No code or doc changes
- Dependencies: Step 06 completed

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Build and Global Install CLI

For Branch A (new CLI):

**Execute these commands in sequence:**

```bash
# Navigate to CLI directory
cd {outputFolder}/{cliName}

# Install dependencies
npm install

# Build TypeScript
npm run build

# Global install via npm link
npm link
```

**Verify global installation:**

```bash
# Check CLI is globally available
which {cliName}

# Should return path like: /opt/homebrew/bin/{cliName} or /usr/local/bin/{cliName}
```

**If `which` returns empty or "not found":**
- Re-run `npm link` with sudo if needed: `sudo npm link`
- Check npm global bin path: `npm config get prefix`

For Branch B (existing CLI):
- Verify CLI is accessible via `which {cliName}`
- If not installed, run build and link steps above
- Verify documentation matches CLI

**Verify CLI works:**
- Check `{cliName} --help` works
- Check `{cliName} --version` works

Display verification results.

### 2. Copy Integration Files

Copy to project root:
- `.augment/skills/{cliName}/` → `{project-root}/.augment/skills/{cliName}/`
- `.augment/commands/{cliName}.md` → `{project-root}/.augment/commands/{cliName}.md`

### 3. Update CLAUDE.md

Add CLI reference to {claudeFile}:

```markdown
## CLI Tools

### {cliName}

- **Purpose:** {cliDescription}
- **Source:** `{outputFolder}/{cliName}/`
- **Usage:** `{cliName} <command> [options]`
- **Skill:** `.augment/skills/{cliName}/SKILL.md`

**使用前检查 (Agent 必读):**
\`\`\`bash
# 1. 检查是否已全局安装
which {cliName}

# 2. 如果未安装，先进入目录安装
cd {outputFolder}/{cliName} && npm run build && npm link

# 3. 安装后直接在项目根目录使用，无需 cd
{cliName} --version
\`\`\`
```

### 4. Update Sidecar History

Append to {sidecarFile}:

```markdown
## {cliName}
- **Created:** {date}
- **Mode:** {cliMode}
- **Commands:** {commandCount}
- **Status:** Complete
```

### 5. Mark CLI Plan Complete

Update {cliPlanFile}:
- Set status: 'COMPLETE'
- Set completedDate: {date}
- Update stepsCompleted with all steps

### 6. Display Completion Summary

"🎉 **CLI Builder Complete!**

**CLI:** {cliName}
**Mode:** {cliMode}
**Status:** ✅ Complete

**Created:**
- 📦 CLI code (Branch A) or analyzed (Branch B)
- 📝 Three-layer documentation
- ✅ Tests with >80% coverage (Branch A)
- 🔗 Project integration

**Next Steps:**
1. Run: `{cliName} --help`
2. Use Slash Command: `/{cliName} <command>`
3. AI Agent can discover via Skill

**Thank you for using CLI Builder!**"

### 7. Checkpoint 4: Final Confirmation

"✅ **Checkpoint 4: Final Confirmation**

**Select an Option:**
[C] Complete - Finish workflow
[T] Test - Run CLI tests
[V] Validate - Enter validation mode"

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting final checkpoint
- ONLY complete workflow when user selects Complete option

#### Menu Handling Logic:

- IF C: Mark workflow complete, display final message, END
- IF T: Run tests, show results, redisplay checkpoint
- IF V: Load validation mode workflow

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- CLI verified functional
- Integration files copied
- CLAUDE.md updated
- Sidecar history updated
- CLI plan marked complete
- User confirmed completion

### ❌ SYSTEM FAILURE:
- CLI not functional
- Missing integration files
- CLAUDE.md not updated
- Workflow not marked complete

**Master Rule:** Skipping steps is FORBIDDEN.

