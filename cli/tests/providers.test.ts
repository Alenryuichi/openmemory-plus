import { describe, it, expect, vi } from 'vitest';
import {
  LLM_PROVIDERS,
  PROVIDER_CHOICES,
  generateProviderEnv,
  getMcpEnvForProvider,
  validateApiKey,
  type LlmProvider,
} from '../src/lib/providers.js';

describe('LLM Providers Configuration', () => {
  describe('LLM_PROVIDERS', () => {
    it('should have all expected providers', () => {
      const expectedProviders = ['deepseek', 'minimax', 'zhipu', 'qwen', 'openai', 'ollama'];
      expect(Object.keys(LLM_PROVIDERS)).toEqual(expectedProviders);
    });

    it('should have valid structure for each provider', () => {
      for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        expect(provider.name).toBe(key);
        expect(provider.displayName).toBeTruthy();
        expect(provider.baseUrl).toBeTruthy();
        expect(provider.defaultModel).toBeTruthy();
        expect(typeof provider.supportsStructuredOutput).toBe('boolean');
        expect(provider.description).toBeTruthy();
      }
    });

    it('should have envKey for all providers except ollama', () => {
      for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        if (key === 'ollama') {
          expect(provider.envKey).toBe('');
        } else {
          expect(provider.envKey).toMatch(/_API_KEY$/);
        }
      }
    });

    it('should only have OpenAI supporting structured output', () => {
      expect(LLM_PROVIDERS.openai.supportsStructuredOutput).toBe(true);
      for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        if (key !== 'openai') {
          expect(provider.supportsStructuredOutput).toBe(false);
        }
      }
    });
  });

  describe('PROVIDER_CHOICES', () => {
    it('should have same number of choices as providers', () => {
      expect(PROVIDER_CHOICES.length).toBe(Object.keys(LLM_PROVIDERS).length);
    });

    it('should have valid choice structure', () => {
      for (const choice of PROVIDER_CHOICES) {
        expect(choice.name).toBeTruthy();
        expect(choice.value).toBeTruthy();
        expect(LLM_PROVIDERS[choice.value]).toBeDefined();
      }
    });
  });

  describe('generateProviderEnv', () => {
    it('should return empty object for unknown provider', () => {
      const result = generateProviderEnv('unknown');
      expect(result).toEqual({});
    });

    it('should generate env for deepseek with API key', () => {
      const result = generateProviderEnv('deepseek', 'test-key');
      expect(result).toEqual({
        DEEPSEEK_API_KEY: 'test-key',
        DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
        LLM_MODEL: 'deepseek-chat',
        LLM_PROVIDER: 'deepseek',
      });
    });

    it('should not include base URL for openai', () => {
      const result = generateProviderEnv('openai', 'test-key');
      expect(result.OPENAI_API_KEY).toBe('test-key');
      expect(result.OPENAI_BASE_URL).toBeUndefined();
      expect(result.LLM_MODEL).toBe('gpt-4o-mini');
    });

    it('should handle ollama without API key', () => {
      const result = generateProviderEnv('ollama');
      expect(result.LLM_MODEL).toBe('qwen2.5:7b');
      expect(result.LLM_PROVIDER).toBe('ollama');
      // Should not have invalid _BASE_URL key
      expect(result['_BASE_URL']).toBeUndefined();
    });

    it('should not include API key if not provided', () => {
      const result = generateProviderEnv('deepseek');
      expect(result.DEEPSEEK_API_KEY).toBeUndefined();
    });
  });

  describe('getMcpEnvForProvider', () => {
    it('should return empty object for unknown provider', () => {
      const result = getMcpEnvForProvider('unknown');
      expect(result).toEqual({});
    });

    it('should include base MCP config', () => {
      const result = getMcpEnvForProvider('deepseek', 'test-key');
      expect(result.MEM0_EMBEDDING_MODEL).toBe('bge-m3');
      expect(result.MEM0_EMBEDDING_PROVIDER).toBe('ollama');
      expect(result.OLLAMA_HOST).toBe('http://localhost:11434');
      expect(result.QDRANT_HOST).toBe('localhost');
      expect(result.QDRANT_PORT).toBe('6333');
    });

    it('should set OPENAI_BASE_URL for non-openai providers', () => {
      const result = getMcpEnvForProvider('deepseek', 'test-key');
      expect(result.OPENAI_BASE_URL).toBe('https://api.deepseek.com');
      expect(result.OPENAI_API_KEY).toBe('test-key');
      expect(result.DEEPSEEK_API_KEY).toBe('test-key');
    });

    it('should not set OPENAI_BASE_URL for openai provider', () => {
      const result = getMcpEnvForProvider('openai', 'test-key');
      expect(result.OPENAI_BASE_URL).toBeUndefined();
      expect(result.OPENAI_API_KEY).toBe('test-key');
    });

    it('should handle ollama without API key', () => {
      const result = getMcpEnvForProvider('ollama');
      expect(result.MEM0_EMBEDDING_MODEL).toBe('bge-m3');
      // Should not have invalid keys
      expect(result['']).toBeUndefined();
    });
  });

  describe('validateApiKey', () => {
    it('should return valid for unknown provider', async () => {
      const result = await validateApiKey('unknown', 'test-key');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('未知的 Provider');
    });

    it('should return valid for ollama without validation', async () => {
      const result = await validateApiKey('ollama', '');
      expect(result.valid).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      // Mock fetch to simulate network error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('network error'));

      const result = await validateApiKey('deepseek', 'invalid-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('网络错误');

      global.fetch = originalFetch;
    });

    it('should handle 401 unauthorized', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await validateApiKey('openai', 'invalid-key');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('无效或已过期');

      global.fetch = originalFetch;
    });

    it('should return valid for successful response', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await validateApiKey('openai', 'valid-key');
      expect(result.valid).toBe(true);

      global.fetch = originalFetch;
    });

    it('should treat rate limit (429) as valid key', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      const result = await validateApiKey('deepseek', 'valid-key');
      expect(result.valid).toBe(true);

      global.fetch = originalFetch;
    });
  });
});
