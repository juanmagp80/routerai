import { getAvailableModels, getModelConfig } from '@/config/ai-providers';
import { supabase } from '@/lib/supabase';
import { AIRequest, AIResponse, ModelConfig } from '@/types/ai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { GrokProvider } from './providers/grok';
import { OpenAIProvider } from './providers/openai';

type AIProviderInstance = OpenAIProvider | AnthropicProvider | GoogleProvider | GrokProvider;

export class AIRouterService {
  private providers = new Map<string, AIProviderInstance>();
  private failedProviders = new Set<string>(); // Track providers with billing/credit issues
  private initialized = false;

  constructor() {
    // Initialize available providers
    console.log('🔧 Initializing AI Router with providers:');

    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
      console.log('✅ OpenAI provider initialized');
    } else {
      console.log('❌ OpenAI API key not found');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider());
      console.log('✅ Anthropic provider initialized');
    } else {
      console.log('❌ Anthropic API key not found');
    }

    if (process.env.GEMINI_API_KEY) {
      this.providers.set('google', new GoogleProvider());
      console.log('✅ Google provider initialized');
    } else {
      console.log('❌ Google API key not found');
    }

    if (process.env.GROK_API_KEY) {
      this.providers.set('grok', new GrokProvider());
      console.log('✅ Grok provider initialized');
    } else {
      console.log('❌ Grok API key not found');
    }

    console.log(`🎯 Total providers initialized: ${this.providers.size}`);
  }

  private async ensureInitialized() {
    if (this.initialized) return;

    console.log('🏥 Running initial health check...');
    try {
      await this.getProviderHealth();
      this.initialized = true;
      console.log('✅ Initial health check completed');
      console.log('🚫 Failed providers after health check:', Array.from(this.failedProviders));
    } catch (error) {
      console.error('❌ Initial health check failed:', error);
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    let selectedModel: ModelConfig | null = null;

    // Ensure health check has run
    await this.ensureInitialized();

    try {
      console.log('🤖 AI Router: Starting request processing');
      console.log('🚫 Failed providers:', Array.from(this.failedProviders));

      // Get the best model for this request
      selectedModel = await this.selectBestModel(request);

      if (!selectedModel) {
        console.error('❌ No available models for this request');
        throw new Error('No available models for this request');
      }

      console.log('✅ Selected model:', selectedModel.name, 'from provider:', selectedModel.provider);

      // Get the provider for this model
      const provider = this.providers.get(selectedModel.provider);
      if (!provider) {
        throw new Error(`Provider ${selectedModel.provider} not available`);
      }

      // Update request with selected model
      const modelRequest: AIRequest = {
        ...request,
        model: selectedModel.name
      };

      // Generate response
      const response = await provider.generateResponse(modelRequest);

      // Log usage to database
      await this.logUsage(request.userId, response, request.apiKeyId);

      return response;

    } catch (error) {
      // Check if this is a billing/credit error and mark provider as failed
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('credit balance') ||
        errorMessage.includes('billing') ||
        errorMessage.includes('insufficient')) {
        console.warn(`🚫 Marking provider as failed due to billing issues`);
        if (selectedModel) {
          this.failedProviders.add(selectedModel.provider);
        }
      }

      // Fallback mechanism - try alternative models
      const fallbackResponse = await this.handleFallback(request, error as Error);
      if (fallbackResponse) {
        return fallbackResponse;
      }

      // If all fails, return error
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        content: '',
        model: request.model || 'unknown',
        provider: 'unknown',
        tokensUsed: { input: 0, output: 0, total: 0 },
        cost: 0,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async selectBestModel(request: AIRequest): Promise<ModelConfig | null> {
    const allModels = getAvailableModels();
    let availableModels = allModels.filter(model =>
      !this.failedProviders.has(model.provider) && this.providers.has(model.provider)
    );

    console.log('🔍 Total models:', allModels.length);
    console.log('🔍 Failed providers:', Array.from(this.failedProviders));
    console.log('🔍 Available providers:', Array.from(this.providers.keys()));
    console.log('🔍 Filtered available models:', availableModels.map(m => `${m.name} (${m.provider})`));

    // Filter by user plan permissions if userId is provided
    if (request.userId) {
      try {
        const { PlanLimitsService } = await import('@/lib/plan-limits-service');
        const userLimitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(request.userId);
        
        if (userLimitsAndUsage) {
          const allowedModels = userLimitsAndUsage.limits.allowed_models;
          const planFilteredModels = availableModels.filter(model => 
            allowedModels.includes(model.name)
          );
          
          console.log('🔒 User plan:', userLimitsAndUsage.user.plan);
          console.log('🔒 Allowed models for plan:', allowedModels);
          console.log('🔒 Plan-filtered available models:', planFilteredModels.map(m => `${m.name} (${m.provider})`));
          
          availableModels = planFilteredModels;
        }
      } catch (error) {
        console.error('❌ Error filtering models by plan:', error);
        // Continue with all available models if plan filtering fails
      }
    }

    if (availableModels.length === 0) {
      console.error('❌ No models available after filtering');
      return null;
    }

    // If specific model requested, try to use it (but not if provider failed)
    if (request.model) {
      const requestedModel = getModelConfig(request.model);
      if (requestedModel && requestedModel.available && !this.failedProviders.has(requestedModel.provider)) {
        console.log('✅ Using requested model:', requestedModel.name);
        return requestedModel;
      } else {
        console.log('⚠️ Requested model unavailable, selecting alternative');
      }
    }

    // Apply routing strategy
    const strategy = request.routingStrategy || 'auto';
    console.log('🎯 Using routing strategy:', strategy);

    switch (strategy) {
      case 'cost':
        // Prefer cheapest models
        const cheapModels = [...availableModels].sort((a, b) => {
          const aCost = (a.costPer1kTokens.input + a.costPer1kTokens.output) / 2;
          const bCost = (b.costPer1kTokens.input + b.costPer1kTokens.output) / 2;
          return aCost - bCost;
        });
        console.log('💰 Selected cheapest model:', cheapModels[0]?.name);
        return cheapModels[0] || null;

      case 'speed':
        // Prefer fastest models (usually smaller ones)
        const fastModels = availableModels.filter(m =>
          m.name.includes('gpt-3.5') || m.name.includes('haiku') || m.name.includes('gemini-2.5-flash') || m.name.includes('gemini-2.0-flash')
        );
        console.log('⚡ Selected fastest model:', fastModels[0]?.name || availableModels[0]?.name);
        return fastModels[0] || availableModels[0];

      case 'quality':
        // Prefer highest quality models
        const qualityModels = availableModels.filter(m =>
          m.name.includes('gpt-4') || m.name.includes('opus') || m.name.includes('sonnet')
        );
        console.log('🌟 Selected quality model:', qualityModels[0]?.name || availableModels[0]?.name);
        return qualityModels[0] || availableModels[0];

      case 'balanced':
        // Balance between cost, speed, and quality
        const balancedModels = availableModels.filter(m =>
          m.name.includes('gpt-3.5') || m.name.includes('sonnet') || m.name.includes('gemini-2.5-flash')
        );
        console.log('⚖️ Selected balanced model:', balancedModels[0]?.name || availableModels[0]?.name);
        return balancedModels[0] || availableModels[0];

      case 'auto':
      default:
        // Smart model selection based on request characteristics
        const messageLength = request.message.length;
        const isComplexTask = this.isComplexTask(request.message);

        // For complex tasks, prefer GPT-4 or Claude-3-Opus
        if (isComplexTask) {
          const complexModels = availableModels.filter(m =>
            m.name.includes('gpt-4') || m.name.includes('opus')
          );
          if (complexModels.length > 0) {
            console.log('🧠 Selected complex task model:', complexModels[0].name);
            return complexModels[0];
          }
        }

        // For short messages, prefer faster/cheaper models
        if (messageLength < 200) {
          const quickModels = availableModels.filter(m =>
            m.name.includes('gpt-3.5') || m.name.includes('haiku') || m.name.includes('gemini-2.5-flash') || m.name.includes('gemini-2.0-flash')
          );
          if (quickModels.length > 0) {
            console.log('🏃 Selected quick model:', quickModels[0].name);
            return quickModels[0];
          }
        }

        // Default: return highest priority available model
        console.log('🎲 Selected default model:', availableModels[0]?.name);
        return availableModels[0];
    }
  }

  private isComplexTask(message: string): boolean {
    const complexKeywords = [
      'analyze', 'explain', 'complex', 'detailed', 'comprehensive',
      'code', 'programming', 'algorithm', 'technical', 'research',
      'write a', 'create a', 'design', 'plan'
    ];

    const lowerMessage = message.toLowerCase();
    return complexKeywords.some(keyword => lowerMessage.includes(keyword)) ||
      message.length > 500;
  }

  private async handleFallback(request: AIRequest, originalError: Error): Promise<AIResponse | null> {
    console.log('🔄 Starting fallback mechanism');
    const availableModels = getAvailableModels().filter(model =>
      !this.failedProviders.has(model.provider)
    );

    console.log('📋 Available models for fallback:', availableModels.map(m => `${m.name} (${m.provider})`));

    // Try alternative models (excluding the one that failed)
    const alternativeModels = availableModels.filter(model =>
      model.name !== request.model
    );

    for (const model of alternativeModels.slice(0, 2)) { // Try max 2 alternatives
      try {
        console.log(`🔄 Trying fallback to ${model.name} (${model.provider})`);
        const provider = this.providers.get(model.provider);
        if (!provider) {
          console.log(`❌ Provider ${model.provider} not found`);
          continue;
        }

        const fallbackRequest: AIRequest = {
          ...request,
          model: model.name
        };

        const response = await provider.generateResponse(fallbackRequest);

        if (response.success) {
          console.log(`✅ Fallback successful with ${model.name}`);
          // Add fallback info to response
          response.error = `Primary model failed (${originalError.message}), used fallback: ${model.name}`;

          // Log usage
          await this.logUsage(request.userId, response, request.apiKeyId);

          return response;
        } else {
          console.log(`❌ Fallback ${model.name} failed:`, response.error);
        }
      } catch (error) {
        console.error(`❌ Fallback model ${model.name} also failed:`, error);
        continue;
      }
    }

    return null;
  }

  private async logUsage(userId: string, response: AIResponse, apiKeyId?: string): Promise<void> {
    try {
      await supabase.from('usage_records').insert({
        user_id: userId,
        api_key_id: apiKeyId || null,
        model: response.model,
        provider: response.provider,
        tokens_used: response.tokensUsed.total,
        cost: response.cost,
        response_time: response.responseTime,
        status: response.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Failed to log usage:', error);
    }
  }

  async getProviderHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    const providerEntries = Array.from(this.providers.entries());
    for (const [providerName, provider] of providerEntries) {
      try {
        const isHealthy = await provider.isHealthy();
        healthStatus[providerName] = isHealthy;

        // If provider is not healthy, mark it as failed
        if (!isHealthy) {
          console.warn(`🚫 Marking ${providerName} as failed due to health check`);
          this.failedProviders.add(providerName);
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${providerName}:`, error);
        healthStatus[providerName] = false;
        this.failedProviders.add(providerName);
      }
    }

    return healthStatus;
  }
}