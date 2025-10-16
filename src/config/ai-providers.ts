import { AIProvider, ModelConfig } from '@/types/ai';

export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4-32k', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-vision', 'o1-preview', 'o1-mini'],
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
    models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'claude-3.5-sonnet', 'claude-3.5-opus'],
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
    models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-ultra'],
    costPer1kTokens: {
      input: 0.000075,
      output: 0.0003
    },
    maxTokens: 8192,
    available: !!process.env.GEMINI_API_KEY
  },
  grok: {
    name: 'xAI (Grok)',
    baseUrl: 'https://api.x.ai/v1',
    models: ['grok-beta', 'grok-2'],
    costPer1kTokens: {
      input: 0.01,
      output: 0.02
    },
    maxTokens: 8192,
    available: !!process.env.GROK_API_KEY
  },
  meta: {
    name: 'Meta (Llama)',
    baseUrl: 'https://api.together.xyz/v1',
    models: ['llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b', 'llama-3.2-3b', 'llama-3.2-90b'],
    costPer1kTokens: {
      input: 0.0002,
      output: 0.0006
    },
    maxTokens: 8192,
    available: !!process.env.TOGETHER_API_KEY
  },
  mistral: {
    name: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-7b', 'mistral-small', 'mixtral-8x7b', 'codestral'],
    costPer1kTokens: {
      input: 0.0002,
      output: 0.0006
    },
    maxTokens: 8192,
    available: !!process.env.MISTRAL_API_KEY
  },
  cohere: {
    name: 'Cohere',
    baseUrl: 'https://api.cohere.ai/v1',
    models: ['command-r', 'command-r-plus'],
    costPer1kTokens: {
      input: 0.0015,
      output: 0.002
    },
    maxTokens: 4096,
    available: !!process.env.COHERE_API_KEY
  },
  perplexity: {
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    models: ['pplx-7b-online', 'pplx-70b-online'],
    costPer1kTokens: {
      input: 0.0002,
      output: 0.0006
    },
    maxTokens: 4096,
    available: !!process.env.PERPLEXITY_API_KEY
  },
  huggingface: {
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: ['codellama-34b', 'deepseek-coder', 'starcoder2', 'stable-beluga', 'stable-code', 'zephyr-7b', 'falcon-180b'],
    costPer1kTokens: {
      input: 0.0001,
      output: 0.0003
    },
    maxTokens: 4096,
    available: !!process.env.HUGGINGFACE_API_KEY
  }
};

export const MODEL_CONFIGS: ModelConfig[] = [
  // OpenAI Models
  {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.001, output: 0.002 },
    priority: 10,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4o-mini',
    provider: 'openai',
    maxTokens: 16384,
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
    priority: 9,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4o',
    provider: 'openai',
    maxTokens: 16384,
    costPer1kTokens: { input: 0.005, output: 0.015 },
    priority: 4,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.03, output: 0.06 },
    priority: 3,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4-turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    priority: 4,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4-32k',
    provider: 'openai',
    maxTokens: 32768,
    costPer1kTokens: { input: 0.06, output: 0.12 },
    priority: 2,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'gpt-4-vision',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.01, output: 0.03 },
    priority: 5,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'o1-preview',
    provider: 'openai',
    maxTokens: 32768,
    costPer1kTokens: { input: 0.015, output: 0.06 },
    priority: 1,
    available: !!process.env.OPENAI_API_KEY
  },
  {
    name: 'o1-mini',
    provider: 'openai',
    maxTokens: 16384,
    costPer1kTokens: { input: 0.003, output: 0.012 },
    priority: 6,
    available: !!process.env.OPENAI_API_KEY
  },

  // Anthropic Models
  {
    name: 'claude-3-haiku',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.00025, output: 0.00125 },
    priority: 8,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3-sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    priority: 5,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3.5-sonnet',
    provider: 'anthropic',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    priority: 4,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3-opus',
    provider: 'anthropic',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    priority: 2,
    available: !!process.env.ANTHROPIC_API_KEY
  },
  {
    name: 'claude-3.5-opus',
    provider: 'anthropic',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.015, output: 0.075 },
    priority: 1,
    available: !!process.env.ANTHROPIC_API_KEY
  },

  // Google Models
  {
    name: 'gemini-1.5-flash',
    provider: 'google',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.000075, output: 0.0003 },
    priority: 10,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-2.0-flash',
    provider: 'google',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.000075, output: 0.0003 },
    priority: 9,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-2.5-flash',
    provider: 'google',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.000075, output: 0.0003 },
    priority: 8,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-pro',
    provider: 'google',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    priority: 6,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-1.5-pro',
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: { input: 0.00125, output: 0.005 },
    priority: 4,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-2.5-pro',
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: { input: 0.00125, output: 0.005 },
    priority: 3,
    available: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'gemini-ultra',
    provider: 'google',
    maxTokens: 32768,
    costPer1kTokens: { input: 0.0125, output: 0.0375 },
    priority: 1,
    available: !!process.env.GEMINI_API_KEY
  },

  // Meta Llama Models
  {
    name: 'llama-3.1-8b',
    provider: 'meta',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0002, output: 0.0006 },
    priority: 9,
    available: !!process.env.TOGETHER_API_KEY
  },
  {
    name: 'llama-3.2-3b',
    provider: 'meta',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 10,
    available: !!process.env.TOGETHER_API_KEY
  },
  {
    name: 'llama-3.1-70b',
    provider: 'meta',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0009, output: 0.0009 },
    priority: 5,
    available: !!process.env.TOGETHER_API_KEY
  },
  {
    name: 'llama-3.2-90b',
    provider: 'meta',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.001, output: 0.001 },
    priority: 4,
    available: !!process.env.TOGETHER_API_KEY
  },
  {
    name: 'llama-3.1-405b',
    provider: 'meta',
    maxTokens: 16384,
    costPer1kTokens: { input: 0.005, output: 0.005 },
    priority: 2,
    available: !!process.env.TOGETHER_API_KEY
  },

  // Mistral Models
  {
    name: 'mistral-7b',
    provider: 'mistral',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0002, output: 0.0006 },
    priority: 9,
    available: !!process.env.MISTRAL_API_KEY
  },
  {
    name: 'mistral-small',
    provider: 'mistral',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.002, output: 0.006 },
    priority: 6,
    available: !!process.env.MISTRAL_API_KEY
  },
  {
    name: 'mixtral-8x7b',
    provider: 'mistral',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.0007, output: 0.0007 },
    priority: 5,
    available: !!process.env.MISTRAL_API_KEY
  },
  {
    name: 'codestral',
    provider: 'mistral',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.001, output: 0.003 },
    priority: 7,
    available: !!process.env.MISTRAL_API_KEY
  },

  // xAI Grok Models
  {
    name: 'grok-beta',
    provider: 'grok',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.01, output: 0.02 },
    priority: 4,
    available: !!process.env.GROK_API_KEY
  },
  {
    name: 'grok-2',
    provider: 'grok',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.015, output: 0.03 },
    priority: 3,
    available: !!process.env.GROK_API_KEY
  },

  // Cohere Models
  {
    name: 'command-r',
    provider: 'cohere',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0015, output: 0.002 },
    priority: 6,
    available: !!process.env.COHERE_API_KEY
  },
  {
    name: 'command-r-plus',
    provider: 'cohere',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    priority: 4,
    available: !!process.env.COHERE_API_KEY
  },

  // Perplexity Models
  {
    name: 'pplx-7b-online',
    provider: 'perplexity',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0002, output: 0.0006 },
    priority: 8,
    available: !!process.env.PERPLEXITY_API_KEY
  },
  {
    name: 'pplx-70b-online',
    provider: 'perplexity',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.001, output: 0.001 },
    priority: 5,
    available: !!process.env.PERPLEXITY_API_KEY
  },

  // Hugging Face / Specialized Models
  {
    name: 'codellama-34b',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 7,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'deepseek-coder',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 8,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'starcoder2',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 8,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'stable-beluga',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 9,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'stable-code',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 9,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'zephyr-7b',
    provider: 'huggingface',
    maxTokens: 4096,
    costPer1kTokens: { input: 0.0001, output: 0.0003 },
    priority: 9,
    available: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'falcon-180b',
    provider: 'huggingface',
    maxTokens: 8192,
    costPer1kTokens: { input: 0.002, output: 0.002 },
    priority: 3,
    available: !!process.env.HUGGINGFACE_API_KEY
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

// Nueva función para obtener modelos según el plan del usuario
export function getModelsForPlan(userPlan: string, allowedModels: string[]): ModelConfig[] {
  return MODEL_CONFIGS.filter(model =>
    model.available &&
    allowedModels.includes(model.name)
  ).sort((a, b) => a.priority - b.priority);
}

// Función para verificar si un modelo está disponible para un plan
export function isModelAllowedForPlan(modelName: string, allowedModels: string[]): boolean {
  return allowedModels.includes(modelName);
}

// Función para obtener modelos por categoría de precio (para UI)
export function getModelsByPriceCategory(): {
  free: ModelConfig[];
  starter: ModelConfig[];
  pro: ModelConfig[];
  enterprise: ModelConfig[];
} {
  const freeModels = ['gpt-3.5-turbo', 'gpt-4o-mini', 'claude-3-haiku', 'claude-3.5-sonnet', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'llama-3.1-8b', 'mistral-7b'];

  const starterModels = [...freeModels, 'gpt-4', 'gpt-4o', 'gpt-4-vision', 'claude-3-sonnet', 'gemini-pro', 'gemini-1.5-pro', 'gemini-2.5-pro', 'llama-3.1-70b', 'mixtral-8x7b', 'codestral'];

  const proModels = [...starterModels, 'gpt-4-turbo', 'gpt-4-32k', 'o1-preview', 'o1-mini', 'claude-3-opus', 'claude-3.5-opus', 'gemini-ultra', 'llama-3.1-405b', 'grok-beta', 'grok-2', 'command-r', 'command-r-plus'];

  const enterpriseModels = [...proModels, 'llama-3.2-3b', 'llama-3.2-90b', 'mistral-small', 'codellama-34b', 'deepseek-coder', 'starcoder2', 'pplx-7b-online', 'pplx-70b-online', 'stable-beluga', 'stable-code', 'zephyr-7b', 'falcon-180b'];

  return {
    free: MODEL_CONFIGS.filter(model => model.available && freeModels.includes(model.name)).sort((a, b) => a.priority - b.priority),
    starter: MODEL_CONFIGS.filter(model => model.available && starterModels.includes(model.name)).sort((a, b) => a.priority - b.priority),
    pro: MODEL_CONFIGS.filter(model => model.available && proModels.includes(model.name)).sort((a, b) => a.priority - b.priority),
    enterprise: MODEL_CONFIGS.filter(model => model.available && enterpriseModels.includes(model.name)).sort((a, b) => a.priority - b.priority)
  };
}