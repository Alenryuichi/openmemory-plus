---
name: 'step-04-code-generation'
description: 'Generate CLI code files based on approved design'

nextStepFile: './step-05-test-generation.md'
outputFolder: '{bmb_creations_output_folder}/cli'
cliPlanFile: '{outputFolder}/{cliName}/cli-plan-{cliName}.md'
cliOutputPath: '{outputFolder}/{cliName}'
---

# Step 4: CLI Code Generation

## STEP GOAL:

To generate the CLI code files based on the approved design from Step 3.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** implementing the design
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring Node.js and Commander.js expertise
- ✅ User brings domain-specific logic requirements

### Step-Specific Rules:

- 🎯 Focus ONLY on code generation
- 🚫 FORBIDDEN to generate tests yet (next step)
- 💬 Approach: Generate, show, confirm
- ⚠️ This step is **Branch A only** (new CLI)

## EXECUTION PROTOCOLS:

- 🎯 Generate code based on approved design
- 💾 Create files in {cliOutputPath}
- 📖 Document generated files in CLI plan
- 🚫 Do not proceed without showing generated code

## CONTEXT BOUNDARIES:

- Available: Approved design from Step 03
- Focus: Code generation only
- Limits: No tests, no documentation
- Dependencies: Step 03 completed with approval

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Load Design

Load {cliPlanFile} and extract:
- CLI name and description
- Commands list with parameters
- Architecture decisions

### 2. Generate package.json

Create `{cliOutputPath}/package.json`:

```json
{
  "name": "{cliName}",
  "version": "1.0.0",
  "description": "{cliDescription}",
  "main": "cli.js",
  "bin": {
    "{cliName}": "./cli.js"
  },
  "scripts": {
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "commander": "^11.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 3. Generate CLI Main File

Create `{cliOutputPath}/cli.js`:
- Shebang line
- Commander.js setup
- Global options (--help, --version, --json, --verbose)
- Command registrations
- Error handling

### 4. Generate Command Handlers

For each command in the design, create `{cliOutputPath}/lib/commands/{command}.js`:
- Command implementation
- Parameter validation
- JSON output support
- Error handling

### 5. Generate Utility Files

Create `{cliOutputPath}/lib/utils/`:
- `config.js` - Configuration management
- `logger.js` - Logging with --verbose support
- `output.js` - JSON/text output formatting

### 6. Display Generated Files

"🔧 **Generated CLI Code:**

✅ package.json
✅ cli.js
✅ lib/commands/{command1}.js
✅ lib/commands/{command2}.js
...
✅ lib/utils/config.js
✅ lib/utils/logger.js
✅ lib/utils/output.js

**Total files:** {count}

Would you like to review any specific file?"

### 7. Update CLI Plan

Update {cliPlanFile}:
- Add generatedFiles list
- Update stepsCompleted
- Set lastStep: 'step-04-code-generation'

### 8. Auto-Proceed to Tests

Display: "📋 **Code generation complete. Proceeding to test generation...**"

Load {nextStepFile}

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All code files generated
- Commander.js properly configured
- Commands implemented with parameters
- Utilities created
- CLI plan updated

### ❌ SYSTEM FAILURE:
- Missing command implementations
- No JSON output support
- No error handling
- Not updating CLI plan

**Master Rule:** Skipping steps is FORBIDDEN.

