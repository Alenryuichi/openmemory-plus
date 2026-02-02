# CLI Best Practices

**Purpose:** Reference guide for Node.js CLI development best practices.

---

## Architecture Principles

### 1. Single Responsibility
- Each command does ONE thing well
- Separate concerns: parsing, logic, output

### 2. Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 126 | Permission denied |
| 127 | Command not found |

### 3. Input/Output
- **stdin:** Accept piped input when appropriate
- **stdout:** Normal output
- **stderr:** Errors and warnings only

---

## AI Agent Friendliness

### JSON Output
- Always support `--json` flag
- Consistent structure: `{ success, data, error }`
- Include timestamps and command info

### Predictable Behavior
- Same input = same output
- Clear error messages
- No interactive prompts (or skip with `--yes`)

### Discoverability
- `--help` for every command
- `--version` for version info
- List available commands in help

---

## Error Handling

### Do
- ✅ Provide actionable error messages
- ✅ Include error codes
- ✅ Log to stderr
- ✅ Exit with appropriate code

### Don't
- ❌ Silent failures
- ❌ Vague error messages
- ❌ Stack traces in production
- ❌ Continue after critical errors

---

## User Experience

### Progress Feedback
- Show progress for long operations
- Use spinners or progress bars
- Allow `--quiet` to suppress

### Colors
- Use colors for readability
- Respect `NO_COLOR` environment variable
- Provide `--no-color` option

### Configuration
- Support config files (`.{cliName}rc`)
- Environment variables (`CLI_NAME_*`)
- Command line flags (highest priority)

---

## Testing

### Coverage Targets
- Unit tests: >80%
- Integration tests: Critical paths
- E2E tests: Main user flows

### Test Types
1. **Unit:** Individual functions
2. **Integration:** Command execution
3. **Snapshot:** Output formatting

---

## Performance

### Startup Time
- Lazy load dependencies
- Avoid heavy initialization
- Cache when appropriate

### Resource Usage
- Stream large files
- Limit memory consumption
- Clean up temp files

---

## Documentation

### Required Docs
1. README with quick start
2. `--help` for all commands
3. API reference
4. Troubleshooting guide

