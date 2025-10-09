import { AIProvider, ModelConfig } from '@/types/ai';

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    costPer1kTokens: {
      input: 0.03,
      output: 0.06
    },
    maxTokens: 4096,
    available: !!process.env.OPENAI_API_KEY
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    costPer1kTokens: {
      input: 0.015,
      output: 0.075
    },
    maxTokens: 4096,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-1.0-pro', 'gemini-1.0-pro-vision'],
    costPer1kTokens: {
      input: 0.0005,
      output: 0.0015
    },
    maxTokens: 2048,
    available: !!process.env.GEMINI_API_KEY
  },
  grok: {
    name: 'Grok',
    baseUrl: 'https://api.x.ai/v1',
    models: ['grok-3'],
    costPer1kTokens: {
      input: 0.01,
      output: 0.02
    },
    maxTokens: 8192,
    available: !!process.env.GROK_API_KEY
  }
};

export const MODEL_CONFIGS: ModelConfig[] = [
  // OpenAI Models
  {
    name: 'gpt-4',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.03, output: 0.06 },
    priority: 1,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    priority: 2,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.001, output: 0.002 },
    priority: 5,
    available: !!process.env.OPENAI_API_KEY
  },
  
  // Anthropic Models
  {
    name: 'claude-3-opus',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    priority: 2,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3-sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    priority: 3,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3-haiku',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    priority: 4,
    available: !!process.env.ANTHROPIC_API_KEY
  },

  // Google Models
  {
    name: 'gemini-1.0-pro',
    provider: 'google',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    priority: 5,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-1.0-pro-vision',
    provider: 'google',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    priority: 6,
    available: !!process.env.GEMINI_API_KEY
  },

  // Grok Models
  {
    name: 'grok-3',
    provider: 'grok',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.01, output: 0.02 },
    priority: 3,
    available: !!process.env.GROK_API_KEY
  }
];

export function getAvailableModels(): ModelConfig[] {
  return MODEL_CONFIGS.filter(model => model.available).sort((a, b) => a.priority - b.priority);
}

export function getModelConfig(modelName: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find(model => model.name === modelName);
}

export function getProviderModels(providerName: string): ModelConfig[] {
  return MODEL_CONFIGS.filter(model => model.provider === providerName && model.available);
}

export function getProviders(): AIProvider[] {
  return Object.values(AI_PROVIDERS);
}