/**
 * LLM Provider Configuration
 * 支持多种 LLM Provider 用于记忆分类功能
 */

export interface LlmProvider {
  name: string;
  displayName: string;
  baseUrl: string;
  defaultModel: string;
  envKey: string;
  supportsStructuredOutput: boolean;
  description: string;
}

export const LLM_PROVIDERS: Record<string, LlmProvider> = {
  deepseek: {
    name: 'deepseek',
    displayName: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    envKey: 'DEEPSEEK_API_KEY',
    supportsStructuredOutput: false,
    description: '性价比高，中文能力强',
  },
  minimax: {
    name: 'minimax',
    displayName: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5s-chat',
    envKey: 'MINIMAX_API_KEY',
    supportsStructuredOutput: false,
    description: '国产大模型，响应快速',
  },
  zhipu: {
    name: 'zhipu',
    displayName: '智谱 AI (ZhiPu)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    envKey: 'ZHIPU_API_KEY',
    supportsStructuredOutput: false,
    description: 'GLM 系列，学术背景',
  },
  qwen: {
    name: 'qwen',
    displayName: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-turbo',
    envKey: 'DASHSCOPE_API_KEY',
    supportsStructuredOutput: false,
    description: '阿里云，生态完善',
  },
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    envKey: 'OPENAI_API_KEY',
    supportsStructuredOutput: true,
    description: '原版 GPT，功能最全',
  },
  ollama: {
    name: 'ollama',
    displayName: 'Ollama (本地)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'qwen2.5:7b',
    envKey: '',
    supportsStructuredOutput: false,
    description: '本地运行，无需 API Key',
  },
};

// Provider icons for display
const PROVIDER_ICONS: Record<string, string> = {
  deepseek: '🚀',
  minimax: '🤖',
  zhipu: '🧠',
  qwen: '☁️',
  openai: '🌐',
  ollama: '💻',
};

// L1 Fix: Auto-generate PROVIDER_CHOICES from LLM_PROVIDERS
export const PROVIDER_CHOICES = Object.entries(LLM_PROVIDERS).map(([key, provider]) => {
  const icon = PROVIDER_ICONS[key] || '📦';
  const recommended = key === 'deepseek' ? ' (推荐)' : '';
  return {
    name: `${icon} ${provider.displayName}${recommended} - ${provider.description}`,
    value: key,
  };
});

/**
 * 生成 Provider 的环境变量配置
 */
export function generateProviderEnv(
  providerName: string,
  apiKey?: string
): Record<string, string> {
  const provider = LLM_PROVIDERS[providerName];
  if (!provider) return {};

  const env: Record<string, string> = {};

  // 添加 API Key (如果有)
  if (provider.envKey && apiKey) {
    env[provider.envKey] = apiKey;
  }

  // 添加 base URL (如果不是默认的 OpenAI，且有 envKey)
  // H4 Fix: 跳过 Ollama (envKey 为空)
  if (provider.baseUrl && providerName !== 'openai' && provider.envKey) {
    const baseUrlKey = provider.envKey.replace('_API_KEY', '_BASE_URL');
    env[baseUrlKey] = provider.baseUrl;
  }

  // 添加模型配置
  env['LLM_MODEL'] = provider.defaultModel;
  env['LLM_PROVIDER'] = providerName;

  return env;
}

/**
 * 获取 MCP 配置中需要的环境变量
 */
export function getMcpEnvForProvider(
  providerName: string,
  apiKey?: string
): Record<string, string> {
  const provider = LLM_PROVIDERS[providerName];
  if (!provider) return {};

  const env: Record<string, string> = {
    MEM0_EMBEDDING_MODEL: 'bge-m3',
    MEM0_EMBEDDING_PROVIDER: 'ollama',
    OLLAMA_HOST: 'http://localhost:11434',
    QDRANT_HOST: 'localhost',
    QDRANT_PORT: '6333',
  };

  if (provider.envKey && apiKey) {
    env[provider.envKey] = apiKey;
  }

  if (provider.baseUrl && providerName !== 'openai') {
    // 使用 OPENAI_BASE_URL 作为通用的 base URL 配置
    env['OPENAI_BASE_URL'] = provider.baseUrl;
    // 同时设置 provider 特定的 key
    if (apiKey) {
      env['OPENAI_API_KEY'] = apiKey;
    }
  }

  return env;
}

/**
 * L2 Fix: Validate API Key by making a test request
 * Returns { valid: true } or { valid: false, error: string }
 */
export async function validateApiKey(
  providerName: string,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  const provider = LLM_PROVIDERS[providerName];
  if (!provider) {
    return { valid: false, error: '未知的 Provider' };
  }

  // Ollama doesn't need API key validation
  if (providerName === 'ollama') {
    return { valid: true };
  }

  try {
    const baseUrl = provider.baseUrl || 'https://api.openai.com/v1';
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      return { valid: true };
    }

    // Handle common error codes
    if (response.status === 401) {
      return { valid: false, error: 'API Key 无效或已过期' };
    }
    if (response.status === 403) {
      return { valid: false, error: 'API Key 权限不足' };
    }
    if (response.status === 429) {
      // Rate limited but key is valid
      return { valid: true };
    }

    return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('timeout') || message.includes('TimeoutError')) {
      return { valid: false, error: '连接超时，请检查网络' };
    }
    if (message.includes('fetch') || message.includes('network')) {
      return { valid: false, error: '网络错误，无法连接到 API' };
    }
    return { valid: false, error: message };
  }
}
