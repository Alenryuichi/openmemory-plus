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

  it('should create .memory directory with project.yaml', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, '.memory'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.memory', 'project.yaml'))).toBe(true);

    const content = readFileSync(join(TEST_DIR, '.memory', 'project.yaml'), 'utf-8');
    expect(content).toContain('name:');
  });

  it('should create augment IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, '.augment', 'AGENTS.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.augment', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.augment', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.rules', 'memory', 'classification.md'))).toBe(true);
  });

  it('should create cursor IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i cursor -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, '.cursor', '.cursorrules'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor', 'commands', 'memory.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.cursor', 'skills', 'memory-extraction', 'SKILL.md'))).toBe(true);
  });

  it('should create claude IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i claude -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.claude', 'commands', 'memory.md'))).toBe(true);
  });

  it('should create gemini IDE structure', () => {
    execSync(`node ${CLI_PATH} install -i gemini -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    expect(existsSync(join(TEST_DIR, 'gemini.md'))).toBe(true);
    expect(existsSync(join(TEST_DIR, '.gemini', 'commands', 'memory.md'))).toBe(true);
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

  it('should create 8 memory commands', () => {
    execSync(`node ${CLI_PATH} install -i augment -y --skip-deps`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    });

    const commands = ['memory.md', 'mem-status.md', 'mem-search.md', 'mem-sync.md', 'mem-clean.md', 'mem-extract.md', 'mem-decay.md', 'mem-graph.md'];
    for (const cmd of commands) {
      expect(existsSync(join(TEST_DIR, '.augment', 'commands', cmd))).toBe(true);
    }
  });
});

