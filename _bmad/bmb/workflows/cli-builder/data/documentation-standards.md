# Documentation Standards

**Purpose:** Standards for the three-layer documentation system.

---

## Three-Layer System Overview

| Layer | File | Purpose | Size |
|-------|------|---------|------|
| 0 | `.augment/skills/{cli}/SKILL.md` | AI discovery | 30-50 lines |
| 1 | `{cli}/README.md` | Human entry point | 50-100 lines |
| 2 | `.augment/commands/{cli}.md` | Slash command | 15-25 lines |
| 3 | `{cli}/docs/*` | Complete docs | Unlimited |

---

## Layer 0: Skill File

**Purpose:** Help AI agents discover and understand CLI capabilities.

**Required Sections:**
- Triggers (keywords that activate)
- Capabilities (what it can do)
- Quick Reference (minimal commands)
- Agent Integration notes

**Example:**
```markdown
# my-cli Skill

## Triggers
- User mentions "my-cli"
- Keywords: sync, backup, deploy

## Capabilities
- Initialize projects
- Sync data

## Quick Reference
- Entry: `/my-cli <command>`
- Help: `my-cli --help`
```

---

## Layer 1: README

**Purpose:** Human-readable entry point.

**Required Sections:**
1. Title and description
2. Quick Start (install + basic usage)
3. Commands list with examples
4. Global options table
5. Links to full docs

**Style:**
- Clear headings
- Code examples for every command
- Tables for options
- 50-100 lines max

---

## Layer 2: Command File (BMAD Style)

**Purpose:** Minimal reference for slash commands.

**Constraints:**
- 15-25 lines ONLY
- No verbose explanations
- Essential info only

**Required Sections:**
```markdown
# {cliName}

## Quick Usage
{basic command}

## Commands
- command1: description
- command2: description

## Agent Notes
- Verify: how to check
- JSON: json flag
- Help: help command

## Docs
@links
```

---

## Layer 3: Full Documentation

**Required Files:**
1. `usage.md` - Detailed usage guide
2. `api.md` - API/command reference
3. `troubleshooting.md` - Common issues
4. `advanced.md` - Advanced patterns

**Style:**
- Comprehensive examples
- Edge cases covered
- Troubleshooting steps
- No size limit

---

## Writing Guidelines

### Do
- ✅ Use code blocks for commands
- ✅ Provide copy-paste examples
- ✅ Include expected output
- ✅ Link between layers

### Don't
- ❌ Duplicate content across layers
- ❌ Verbose Layer 2
- ❌ Skip Layer 0 for AI tools
- ❌ Outdated examples

