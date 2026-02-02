# CLI Validation Checklist

**Purpose:** Validation checks for CLI quality assurance.

---

## Pre-Build Validation

### Requirements Check
- [ ] CLI name is valid (lowercase, no spaces)
- [ ] Description is clear and concise
- [ ] Commands are well-defined (3-7 recommended)
- [ ] Parameters have descriptions
- [ ] Target users identified

### Design Check
- [ ] Architecture approved
- [ ] File structure planned
- [ ] Documentation layers defined
- [ ] Error handling strategy set

---

## Code Validation

### Structure
- [ ] `package.json` valid
- [ ] Entry point (`cli.js`) exists
- [ ] All commands have handlers
- [ ] Utilities are in place

### Functionality
- [ ] `--help` works
- [ ] `--version` works
- [ ] `--json` produces valid JSON
- [ ] All commands execute
- [ ] Error handling works

### Quality
- [ ] ESLint passes
- [ ] No console.log in production code
- [ ] Proper error messages
- [ ] Exit codes correct

---

## Test Validation

### Coverage
- [ ] Unit tests exist for all commands
- [ ] Integration tests exist
- [ ] Coverage >80%
- [ ] All tests pass

### Test Quality
- [ ] Tests cover happy path
- [ ] Tests cover error cases
- [ ] Tests cover edge cases
- [ ] JSON output tested

---

## Documentation Validation

### Layer 0 (Skill)
- [ ] File exists at correct path
- [ ] Triggers defined
- [ ] Capabilities listed
- [ ] Quick reference correct

### Layer 1 (README)
- [ ] 50-100 lines
- [ ] Quick start included
- [ ] All commands documented
- [ ] Examples provided

### Layer 2 (Command)
- [ ] 15-25 lines ONLY
- [ ] BMAD style followed
- [ ] Commands listed
- [ ] Agent notes included

### Layer 3 (Docs)
- [ ] usage.md exists
- [ ] api.md exists
- [ ] troubleshooting.md exists
- [ ] All content accurate

---

## Integration Validation

### Project Integration
- [ ] Skill file copied to `.augment/skills/`
- [ ] Command file copied to `.augment/commands/`
- [ ] CLAUDE.md updated
- [ ] Sidecar history updated

### Runtime Check
- [ ] CLI executable (`which {cliName}`)
- [ ] All commands work
- [ ] JSON output valid
- [ ] No runtime errors

---

## Final Checklist

- [ ] All validations pass
- [ ] User approved each checkpoint
- [ ] Workflow marked complete
- [ ] CLI ready for use

