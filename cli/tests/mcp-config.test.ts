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
      expect(ides).toContain('claude');
      expect(ides).toContain('cursor');
      expect(ides).toContain('gemini');
    });
  });

  describe('getMcpServerConfig', () => {
    it('should return MCP server configuration', () => {
      const config = getMcpServerConfig();
      expect(config.command).toBe('npx');
      expect(config.args).toContain('openmemory-mcp');
      expect(config.env.MEM0_EMBEDDING_MODEL).toBe('bge-m3');
      expect(config.env.MEM0_EMBEDDING_PROVIDER).toBe('ollama');
    });
  });

  describe('configureMcpForIde', () => {
    it('should return error for unknown IDE', () => {
      const result = configureMcpForIde('unknown_ide');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown IDE');
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
  });
});

