import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Mock the modules before importing
vi.mock('os', async () => {
  const actual = await vi.importActual('os');
  return {
    ...actual,
    homedir: vi.fn(() => '/tmp/omp-test-mcp-home'),
    platform: vi.fn(() => 'darwin'),
  };
});

// Import after mocking
import {
  configureMcpForIde,
  checkMcpConfigured,
  getSupportedIdes,
  getMcpServerConfig,
  IDE_MCP_CONFIGS,
} from '../src/lib/mcp-config.js';

const TEST_HOME = '/tmp/omp-test-mcp-home';

describe('mcp-config', () => {
  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
    mkdirSync(TEST_HOME, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('getSupportedIdes', () => {
    it('should return list of supported IDEs', () => {
      const ides = getSupportedIdes();
      expect(ides).toContain('augment');
      expect(ides).toContain('claude'); // Claude Code CLI
      expect(ides).toContain('claude-desktop'); // Claude Desktop app
      expect(ides).toContain('cursor');
      expect(ides).toContain('gemini');
    });
  });

  describe('getMcpServerConfig', () => {
    it('should return MCP server configuration', () => {
      const config = getMcpServerConfig();
      expect(config.command).toBe('npx');
      expect(config.args).toContain('openmemory-mcp');
      expect(config.env.USER_ID).toBe('default'); // Required field
      expect(config.env.MEM0_EMBEDDING_MODEL).toBe('bge-m3');
      expect(config.env.MEM0_EMBEDDING_PROVIDER).toBe('ollama');
    });
  });

  describe('configureMcpForIde', () => {
    it('should return error for unknown IDE', () => {
      const result = configureMcpForIde('unknown_ide');
      expect(result.success).toBe(false);
      expect(result.error).toContain('未知的 IDE');
    });

    it('should create new config file for augment', () => {
      const result = configureMcpForIde('augment');
      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      
      // Verify file was created
      expect(existsSync(result.path)).toBe(true);
      
      // Verify content
      const content = JSON.parse(readFileSync(result.path, 'utf-8'));
      expect(content.mcpServers).toBeDefined();
      expect(content.mcpServers.openmemory).toBeDefined();
      expect(content.mcpServers.openmemory.command).toBe('npx');
    });

    it('should merge into existing config file', () => {
      // Create existing config
      const configPath = IDE_MCP_CONFIGS.augment.getConfigPath();
      mkdirSync(join(TEST_HOME, '.augment'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({
        someExistingSetting: true,
        mcpServers: {
          existingServer: { command: 'test' }
        }
      }, null, 2));

      const result = configureMcpForIde('augment');
      expect(result.success).toBe(true);
      
      // Verify content was merged
      const content = JSON.parse(readFileSync(result.path, 'utf-8'));
      expect(content.someExistingSetting).toBe(true);
      expect(content.mcpServers.existingServer).toBeDefined();
      expect(content.mcpServers.openmemory).toBeDefined();
    });

    it('should not overwrite existing openmemory config without force', () => {
      // Create existing config with openmemory
      const configPath = IDE_MCP_CONFIGS.augment.getConfigPath();
      mkdirSync(join(TEST_HOME, '.augment'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({
        mcpServers: {
          openmemory: { command: 'existing' }
        }
      }, null, 2));

      const result = configureMcpForIde('augment', false);
      expect(result.success).toBe(true);
      expect(result.updated).toBe(false);
      
      // Content should not be changed
      const content = JSON.parse(readFileSync(result.path, 'utf-8'));
      expect(content.mcpServers.openmemory.command).toBe('existing');
    });

    it('should overwrite existing openmemory config with force', () => {
      // Create existing config with openmemory
      const configPath = IDE_MCP_CONFIGS.augment.getConfigPath();
      mkdirSync(join(TEST_HOME, '.augment'), { recursive: true });
      writeFileSync(configPath, JSON.stringify({
        mcpServers: {
          openmemory: { command: 'existing' }
        }
      }, null, 2));

      const result = configureMcpForIde('augment', true);
      expect(result.success).toBe(true);
      
      // Content should be updated
      const content = JSON.parse(readFileSync(result.path, 'utf-8'));
      expect(content.mcpServers.openmemory.command).toBe('npx');
    });
  });

  describe('checkMcpConfigured', () => {
    it('should return false for unconfigured IDE', () => {
      const { configured } = checkMcpConfigured('augment');
      expect(configured).toBe(false);
    });

    it('should return true for configured IDE', () => {
      configureMcpForIde('augment');
      const { configured, path } = checkMcpConfigured('augment');
      expect(configured).toBe(true);
      expect(path).toContain('.augment');
    });

    it('should return false for unknown IDE', () => {
      const { configured, path } = checkMcpConfigured('unknown_ide');
      expect(configured).toBe(false);
      expect(path).toBe('');
    });
  });

  describe('configureMcpForIdes', () => {
    it('should configure multiple IDEs', async () => {
      const { configureMcpForIdes } = await import('../src/lib/mcp-config.js');
      const results = configureMcpForIdes(['augment', 'cursor']);

      expect(results.size).toBe(2);
      expect(results.get('augment')?.success).toBe(true);
      expect(results.get('cursor')?.success).toBe(true);
    });

    it('should handle mixed valid and invalid IDEs', async () => {
      const { configureMcpForIdes } = await import('../src/lib/mcp-config.js');
      const results = configureMcpForIdes(['augment', 'invalid_ide']);

      expect(results.size).toBe(2);
      expect(results.get('augment')?.success).toBe(true);
      expect(results.get('invalid_ide')?.success).toBe(false);
    });
  });

  describe('IDE config paths', () => {
    it('should return correct path for cursor', () => {
      const cursorConfig = IDE_MCP_CONFIGS.cursor;
      expect(cursorConfig.getConfigPath()).toContain('.cursor');
      expect(cursorConfig.getConfigPath()).toContain('mcp.json');
    });

    it('should return correct path for claude (CLI)', () => {
      const claudeConfig = IDE_MCP_CONFIGS.claude;
      expect(claudeConfig.getConfigPath()).toContain('.claude.json');
    });

    it('should return correct path for claude-desktop on darwin', () => {
      const claudeDesktopConfig = IDE_MCP_CONFIGS['claude-desktop'];
      const path = claudeDesktopConfig.getConfigPath();
      // On darwin (mocked), should be in Library/Application Support
      expect(path).toContain('claude_desktop_config.json');
    });

    it('should return correct path for gemini on darwin', () => {
      const geminiConfig = IDE_MCP_CONFIGS.gemini;
      const path = geminiConfig.getConfigPath();
      expect(path).toContain('gemini');
      expect(path).toContain('gemini_mcp_settings.json');
    });
  });

  describe('configureMcpForIde edge cases', () => {
    it('should handle invalid JSON in existing config', () => {
      const configPath = IDE_MCP_CONFIGS.augment.getConfigPath();
      mkdirSync(join(TEST_HOME, '.augment'), { recursive: true });
      writeFileSync(configPath, 'invalid json content');

      const result = configureMcpForIde('augment');
      // Should create new config since existing is invalid
      expect(result.success).toBe(true);
    });

    it('should create cursor config in correct location', () => {
      const result = configureMcpForIde('cursor');
      expect(result.success).toBe(true);
      expect(result.path).toContain('.cursor');
      expect(existsSync(result.path)).toBe(true);
    });
  });
});

