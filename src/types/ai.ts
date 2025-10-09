// AI Provider types and interfaces
export interface AIProvider {
  name: string;
  baseUrl?: string;
  models: string[];
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxTokens: number;
  available: boolean;
}

export interface AIRequest {
  message: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userId: string;
  apiKeyId?: string;
  routingStrategy?: 'auto' | 'cost' | 'speed' | 'quality' | 'balanced';
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export interface ModelConfig {
  name: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  priority: number; // Lower number = higher priority
  available: boolean;
}