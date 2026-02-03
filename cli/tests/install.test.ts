import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TEST_DIR = '/tmp/omp-test-install';
const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

describe('install command', () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('should create _omp/memory directory with project.yaml', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, '_omp', 'memory'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '_omp', 'memory', 'project.yaml'))).toBe(true);

    const content = readFileSync(join(TEST_DIR, '_omp', 'memory', 'project.yaml'), 'utf-8');
    expect(content).toContain('name:');
  });

  it('should create augment IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Commands and skills in .augment/ (no config file like AGENTS.md)
    expect(existsSync(join(TEST_DIR, '.augment', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.augment', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
    // _omp structure
    expect(existsSync(join(TEST_DIR, '_omp', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '_omp', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should create cursor IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i cursor -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Commands and skills only (no .cursorrules config file)
    expect(existsSync(join(TEST_DIR, '.cursor', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should create claude IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i claude -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Commands only (no CLAUDE.md config file)
    expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claude', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should create gemini IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i gemini -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Commands only (no gemini.md config file)
    expect(existsSync(join(TEST_DIR, '.gemini', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.gemini', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should output MCP config with --show-mcp flag', () => {
    const output = execSync(`node ${CLI_PATH} install -i augment --show-mcp`, {
      cwd: TEST_DIR,
      encoding: 'utf-8',
    });

    expect(output).toContain('MCP 配置');
    expect(output).toContain('openmemory');
    expect(output).toContain('npx');
    expect(output).toContain('openmemory-mcp');
  });

  it('should create memory workflow with 7 step files', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Check main command file (lightweight entry point)
    expect(existsSync(join(TEST_DIR, '_omp', 'commands', 'memory.md'))).toBe(true);

    // Check workflow structure (BMAD pattern: workflows/memory/steps/)
    expect(existsSync(join(TEST_DIR, '_omp', 'workflows', 'memory', 'workflow.md'))).toBe(true);

    // Check 7 step files in workflows/memory/steps/
    const memorySteps = ['status.md', 'search.md', 'sync.md', 'clean.md', 'store.md', 'decay.md', 'graph.md'];
    for (const step of memorySteps) {
      expect(existsSync(join(TEST_DIR, '_omp', 'workflows', 'memory', 'steps', step))).toBe(true);
    }
  });

  // Fix M1: Add multi-select IDE tests
  it('should support multi-select IDE with comma-separated list', () => {
    execSync(`node ${CLI_PATH} install -i augment,cursor -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    // Both IDEs should have commands and skills
    expect(existsSync(join(TEST_DIR, '.augment', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.augment', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should warn about invalid IDE names', () => {
    const output = execSync(`node ${CLI_PATH} install -i augment,invalid_ide -y --skip-deps`, {
      cwd: TEST_DIR,
      encoding: 'utf-8',
    });

    // Should warn about invalid IDE
    expect(output).toContain('未知的 IDE');
    expect(output).toContain('invalid_ide');
    // But still install valid ones
    expect(existsSync(join(TEST_DIR, '.augment', 'commands', 'memory.md'))).toBe(true);
  });

  // H2 Fix: Add tests for --llm option
  describe('--llm option', () => {
    it('should accept valid provider via --llm option', () => {
      const output = execSync(`node ${CLI_PATH} install -i augment -y --skip-deps --llm deepseek`, {
        cwd: TEST_DIR,
        encoding: 'utf-8',
      });

      expect(output).toContain('DeepSeek');
      expect(existsSync(join(TEST_DIR, '_omp', 'commands', 'memory.md'))).toBe(true);
    });

    it('should warn about invalid provider in non-interactive mode', () => {
      const output = execSync(`node ${CLI_PATH} install -i augment -y --skip-deps --llm invalid_provider`, {
        cwd: TEST_DIR,
        encoding: 'utf-8',
      });

      expect(output).toContain('未知的 Provider');
      expect(output).toContain('invalid_provider');
      // Should still complete installation
      expect(existsSync(join(TEST_DIR, '_omp', 'commands', 'memory.md'))).toBe(true);
    });

    it('should show --llm option in help', () => {
      const output = execSync(`node ${CLI_PATH} install --help`, {
        encoding: 'utf-8',
      });

      expect(output).toContain('--llm');
      expect(output).toContain('deepseek');
    });

    it('should copy patches directory for LLM provider support', () => {
      execSync(`node ${CLI_PATH} install -i augment -y --skip-deps --llm ollama`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, '_omp', 'patches', 'categorization.py'))).toBe(true);
    });
  });

  // Issue #6 Fix: Add tests for entry file generation
  describe('entry file generation', () => {
    it('should create AGENTS.md for augment IDE', () => {
      execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, 'AGENTS.md'))).toBe(true);

      const content = readFileSync(join(TEST_DIR, 'AGENTS.md'), 'utf-8');
      expect(content).toContain('OpenMemory Plus');
      expect(content).toContain('Memory System');
      expect(content).toContain('Session Lifecycle');
    });

    it('should create CLAUDE.md for claude IDE', () => {
      execSync(`node ${CLI_PATH} install -i claude -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);

      const content = readFileSync(join(TEST_DIR, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('OpenMemory Plus');
      expect(content).toContain('Memory System');
    });

    it('should create .cursor/rules/openmemory.mdc for cursor IDE', () => {
      execSync(`node ${CLI_PATH} install -i cursor -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, '.cursor', 'rules', 'openmemory.mdc'))).toBe(true);

      const content = readFileSync(join(TEST_DIR, '.cursor', 'rules', 'openmemory.mdc'), 'utf-8');
      expect(content).toContain('OpenMemory Plus');
      expect(content).toContain('_omp/memory');
    });

    it('should create both AGENTS.md and CLAUDE.md for multi-IDE install', () => {
      execSync(`node ${CLI_PATH} install -i augment,claude -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, 'AGENTS.md'))).toBe(true);
      expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
    });

    it('should include decisions.yaml in memory directory', () => {
      execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      expect(existsSync(join(TEST_DIR, '_omp', 'memory', 'decisions.yaml'))).toBe(true);

      const content = readFileSync(join(TEST_DIR, '_omp', 'memory', 'decisions.yaml'), 'utf-8');
      expect(content).toContain('Technical Decisions Log');
      expect(content).toContain('decisions:');
    });

    it('should include memory-extraction skill files', () => {
      execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
        cwd: TEST_DIR,
        stdio: 'pipe',
      });

      // Check subagent-prompt.md
      expect(existsSync(join(TEST_DIR, '_omp', 'skills', 'memory-extraction', 'subagent-prompt.md'))).toBe(true);
      const subagentContent = readFileSync(
        join(TEST_DIR, '_omp', 'skills', 'memory-extraction', 'subagent-prompt.md'),
        'utf-8'
      );
      expect(subagentContent).toContain('Memory Extraction Subagent');
      expect(subagentContent).toContain('this project'); // Not {{PROJECT_NAME}}

      // Check triggers.md
      expect(existsSync(join(TEST_DIR, '_omp', 'skills', 'memory-extraction', 'triggers.md'))).toBe(true);
      const triggersContent = readFileSync(
        join(TEST_DIR, '_omp', 'skills', 'memory-extraction', 'triggers.md'),
        'utf-8'
      );
      expect(triggersContent).toContain('Trigger Priority Levels');
    });
  });
});

