---
name: 'step-02-requirements'
description: 'Collect CLI requirements and detect new vs existing CLI mode'

nextStepFile: './step-03-design.md'
outputFolder: '{bmb_creations_output_folder}/cli'
templateFile: '../templates/cli-plan-template.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 2: Requirements Collection

## STEP GOAL:

To collect CLI requirements, detect whether this is a new CLI or existing CLI, and gather command specifications.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a **CLI Architect** gathering requirements
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring CLI design expertise and best practices
- ✅ User brings their domain knowledge and requirements

### Step-Specific Rules:

- 🎯 Focus ONLY on requirements collection
- 🚫 FORBIDDEN to start designing or coding
- 💬 Approach: Open-ended questions, deep exploration
- 🌐 Use Web-Browsing if analyzing existing CLI

## EXECUTION PROTOCOLS:

- 🎯 Determine CLI mode (new vs existing)
- 💾 Create CLI plan file from template
- 📖 Document all requirements in plan file
- 🚫 Do not proceed without complete requirements

## CONTEXT BOUNDARIES:

- Available: User input, Web-Browsing (for existing CLI)
- Focus: CLI purpose, commands, parameters, target users
- Limits: No design decisions yet
- Dependencies: Step 01 completed

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly.

### 1. Determine CLI Mode

Ask: "🎯 **Is this a new CLI or an existing one?**

**[N] New CLI** - I'll help you design and build from scratch
**[E] Existing CLI** - I'll analyze it and build the documentation system

Which mode?"

**IF N (New):** Set `cliMode: 'new'`, continue to step 2
**IF E (Existing):** Set `cliMode: 'existing'`, go to step 1a

### 1a. Analyze Existing CLI (Branch B Only)

Ask: "Please provide the CLI name or URL (npm, GitHub, etc.)"

Use **Web-Browsing** to:
- Search for the CLI (npm, GitHub, documentation)
- Extract command structure
- Identify parameters and options
- Find usage examples

Present findings: "📋 **I found this CLI structure:**"
- List discovered commands
- List parameters for each command
- Ask user to confirm or correct

### 2. Collect Basic Information

Ask: "📝 **Let's define your CLI:**

1. **CLI Name:** What should we call it? (lowercase, no spaces)
2. **Description:** One sentence describing what it does
3. **Target Users:** Who will use this?
   - [A] AI Agents primarily
   - [H] Humans primarily
   - [B] Both equally"

### 3. Collect Command List

Ask: "📋 **What commands should this CLI have?**

List 3-7 core commands. For each, provide:
- Command name
- Brief description
- Key parameters (if known)

Example:
```
init - Initialize configuration
sync - Sync data with remote
status - Check current status
```"

### 4. Collect Command Details

For each command, ask:
- Required parameters
- Optional parameters
- Expected input/output
- Common use cases

### 5. Create CLI Plan File

Create `{outputFolder}/{cliName}/cli-plan-{cliName}.md` from {templateFile}:
- Fill in cliName, cliDescription, cliMode
- Add commands list
- Set status: 'IN_PROGRESS'
- Set stepsCompleted: ['step-01-init', 'step-02-requirements']

### 6. Present MENU OPTIONS

Display requirements summary, then:

**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Design

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects appropriate option

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}, then redisplay menu
- IF P: Execute {partyModeWorkflow}, then redisplay menu
- IF C: Update CLI plan file, then load {nextStepFile}

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- CLI mode determined (new/existing)
- Basic info collected (name, description, users)
- Commands list complete (3-7 commands)
- CLI plan file created
- Requirements documented

### ❌ SYSTEM FAILURE:
- Starting design without complete requirements
- Not using Web-Browsing for existing CLI
- Missing command details
- Not creating CLI plan file

**Master Rule:** Skipping steps is FORBIDDEN.

