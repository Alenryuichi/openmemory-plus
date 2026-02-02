---
name: 'step-03-report'
description: 'Generate and present validation report'

outputFolder: '{bmb_creations_output_folder}/cli'
---

# Step 3: Validation Report

## STEP GOAL:

To present the validation report and provide recommendations.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 DO NOT BE LAZY - PRESENT ALL FINDINGS COMPLETELY
- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a **CLI Architect** reporting results
- ✅ We engage in collaborative dialogue
- ✅ You present findings clearly
- ✅ User decides next steps

### Step-Specific Rules:

- 🎯 Focus ONLY on reporting
- 🚫 FORBIDDEN to make fixes here
- 💬 Approach: Report, recommend, wait

## EXECUTION PROTOCOLS:

- 🎯 Present clear report
- 💾 Highlight issues
- 📖 Provide recommendations
- 🚫 Let user decide action

## CONTEXT BOUNDARIES:

- Available: Validation results
- Focus: Reporting only
- Limits: No fixes
- Dependencies: Step 02 completed

## MANDATORY SEQUENCE

### 1. Display Summary

"📊 **Validation Report: {cliName}**

**Overall Score:** {score}%
**Status:** {PASS|FAIL|WARNING}

| Category | Passed | Failed | Score |
|----------|--------|--------|-------|
| Code | {x}/{y} | {z} | {%} |
| Tests | {x}/{y} | {z} | {%} |
| Docs | {x}/{y} | {z} | {%} |
| Integration | {x}/{y} | {z} | {%} |"

### 2. Display Passed Checks

"✅ **Passed Checks ({count}):**

{{#each passed}}
- ✅ {{this}}
{{/each}}"

### 3. Display Failed Checks

"❌ **Failed Checks ({count}):**

{{#each failed}}
- ❌ {{name}}
  - Issue: {{issue}}
  - Fix: {{recommendation}}
{{/each}}"

### 4. Display Warnings

"⚠️ **Warnings ({count}):**

{{#each warnings}}
- ⚠️ {{this}}
{{/each}}"

### 5. Recommendations

"📋 **Recommendations:**

**Priority 1 (Must Fix):**
{{#each priority1}}
- {{this}}
{{/each}}

**Priority 2 (Should Fix):**
{{#each priority2}}
- {{this}}
{{/each}}

**Priority 3 (Nice to Have):**
{{#each priority3}}
- {{this}}
{{/each}}"

### 6. Save Report

Save report to `{outputFolder}/{cliName}/validation-report-{date}.md`

### 7. Present MENU OPTIONS

**Select an Option:**
[E] Edit Mode - Fix issues
[R] Re-validate - Run again
[S] Save Report - Save and exit
[D] Done - Exit validation

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting report
- ONLY proceed based on user selection

#### Menu Handling Logic:

- IF E: Load Edit mode step-01
- IF R: Load step-01-init (this mode)
- IF S: Confirm report saved, exit
- IF D: Display completion message, exit

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Report displayed clearly
- Issues highlighted
- Recommendations given
- Report saved
- User informed of options

### ❌ SYSTEM FAILURE:
- Unclear report
- Missing recommendations
- Not saving report
- Making fixes here

**Master Rule:** Skipping steps is FORBIDDEN.

