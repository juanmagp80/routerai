import { getAvailableModels, getModelConfig } from '@/config/ai-providers';
import { AdaptiveLearningService, TaskContext } from '@/lib/adaptive-learning-service';
import { supabase } from '@/lib/supabase';
import { AIRequest, AIResponse, ModelConfig } from '@/types/ai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { GrokProvider } from './providers/grok';
import { MistralProvider } from './providers/mistral';
import { OpenAIProvider } from './providers/openai';
import { TogetherProvider } from './providers/together';

type AIProviderInstance = OpenAIProvider | AnthropicProvider | GoogleProvider | GrokProvider | TogetherProvider | MistralProvider;

export class AIRouterService {
  private providers = new Map<string, AIProviderInstance>();
  private failedProviders = new Set<string>(); // Track providers with billing/credit issues
  private initialized = false;

  constructor() {
    // Initialize available providers

    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', new OpenAIProvider());
    } else {
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', new AnthropicProvider());
    } else {
    }

    if (process.env.GEMINI_API_KEY) {
      this.providers.set('google', new GoogleProvider());
    } else {
    }

    if (process.env.GROK_API_KEY) {
      this.providers.set('grok', new GrokProvider());
    } else {
    }

    if (process.env.TOGETHER_API_KEY) {
      this.providers.set('meta', new TogetherProvider());
    } else {
    }

    if (process.env.MISTRAL_API_KEY) {
      this.providers.set('mistral', new MistralProvider());
    } else {
    }

  }

  private async ensureInitialized() {
    if (this.initialized) return;

    try {
      await this.getProviderHealth();
      this.initialized = true;
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

      // Get the best model for this request
      selectedModel = await this.selectBestModel(request);

      if (!selectedModel) {
        console.error('❌ No available models for this request');
        throw new Error('No available models for this request');
      }
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
      await this.logUsage(request.userId, response, request.apiKeyId, request);

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
    // Apply user preferences if userId is provided
    if (request.userId) {
      try {
        // Get user settings for model preferences
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', request.userId)
          .single();

        const userSettings = settingsData?.settings || {};
        const preferredProviders = userSettings.preferredProviders || [];

        // Filter by preferred providers FIRST if specified
        if (preferredProviders.length > 0) {
          const providerFilteredModels = availableModels.filter(model =>
            preferredProviders.includes(model.provider)
          );

          if (providerFilteredModels.length > 0) {
            availableModels = providerFilteredModels;
          } else {
          }
        }
      } catch (error) {
      }
    }

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
        return requestedModel;
      } else {
      }
    }

    // Si no hay modelo específico, primero intentar usar las preferencias del usuario
    if (!request.model && request.userId) {
      try {

        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', request.userId)
          .single();

        if (settingsError) {
        }
        const userSettings = settingsData?.settings || {};
        const defaultModel = userSettings.defaultModel;
        const preferredProviders = userSettings.preferredProviders || [];
        // Si el usuario tiene un modelo por defecto específico (no "auto"), usarlo solo 40% del tiempo para dar variedad
        const useDefaultModel = Math.random() < 0.4;

        if (defaultModel && defaultModel !== 'auto' && useDefaultModel) {
          const preferredModel = availableModels.find(m => m.name === defaultModel);
          if (preferredModel) {
            return preferredModel;
          } else {
          }
        } else if (defaultModel && defaultModel !== 'auto') {
        } else if (defaultModel === 'auto') {
        }

        // Si no tiene modelo por defecto pero tiene proveedores preferidos, 
        // usar el mejor modelo de esos proveedores
        if (preferredProviders.length > 0) {
          const providerModels = availableModels.filter(m =>
            preferredProviders.includes(m.provider)
          );
          if (providerModels.length > 0) {
            // Usar el primer modelo disponible del proveedor preferido
            return providerModels[0];
          }
        }
      } catch (error) {
      }
    }

    // Use adaptive learning system if user is provided
    if (request.userId) {
      try {

        // Analyze task context
        const taskContext = AdaptiveLearningService.analyzeTaskContext(request.message);

        // Get personalized scores for available models
        const modelScores = await AdaptiveLearningService.calculatePersonalizedScores(
          request.userId,
          availableModels.map(m => ({ name: m.name, provider: m.provider })),
          taskContext
        );
        // Only use adaptive learning if confidence is high and scores are diverse
        if (modelScores.length > 0) {
          const bestModel = modelScores[0];
          const secondBestScore = modelScores[1]?.score || 0;
          const scoreDifference = bestModel.score - secondBestScore;

          // Use adaptive learning only if:
          // 1. Confidence is reasonably high (> 0.3)
          // 2. There's a meaningful difference between top models (> 0.1)
          // 3. The best model isn't always the cheapest one (add variety)
          if (bestModel.confidence > 0.3 && scoreDifference > 0.1) {
            const selectedModel = getModelConfig(bestModel.modelName);

            if (selectedModel) {

              // Store task context for later use in logging
              Object.assign(request, { taskContext }); return selectedModel;
            }
          } else {
          }
        }
      } catch (error) {
        console.error('❌ Error in adaptive learning selection, falling back to strategy-based selection:', error);
      }
    }

    // Fallback to traditional strategy-based selection
    const strategy = request.routingStrategy || 'auto';

    switch (strategy) {
      case 'cost':
        // Prefer cheapest models
        const cheapModels = [...availableModels].sort((a, b) => {
          const aCost = (a.costPer1kTokens.input + a.costPer1kTokens.output) / 2;
          const bCost = (b.costPer1kTokens.input + b.costPer1kTokens.output) / 2;
          return aCost - bCost;
        });
        return cheapModels[0] || null;

      case 'speed':
        // Prefer fastest models (usually smaller ones)
        const fastModels = availableModels.filter(m =>
          m.name.includes('gpt-3.5') || m.name.includes('haiku') || m.name.includes('gemini-2.5-flash') || m.name.includes('gemini-2.0-flash')
        );
        return fastModels[0] || availableModels[0];

      case 'quality':
        // Prefer highest quality models
        const qualityModels = availableModels.filter(m =>
          m.name.includes('gpt-4') || m.name.includes('opus') || m.name.includes('sonnet')
        );
        return qualityModels[0] || availableModels[0];

      case 'balanced':
        // Balance between cost, speed, and quality
        const balancedModels = availableModels.filter(m =>
          m.name.includes('gpt-3.5') || m.name.includes('sonnet') || m.name.includes('gemini-2.5-flash')
        );
        return balancedModels[0] || availableModels[0];

      case 'auto':
      default:
        // Smart model selection with more variety and intelligence
        const messageLength = request.message.length;
        const isComplexTask = this.isComplexTask(request.message);
        const isCodeTask = this.isCodeTask(request.message);
        const isCreativeTask = this.isCreativeTask(request.message);

        // For code tasks, prefer models good at programming with variety
        if (isCodeTask) {
          const codeModels = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('gpt-4') ||
            m.name.includes('codestral')
          );
          if (codeModels.length > 0) {
            // Add variety - rotate between good coding models
            const selectedIndex = Math.floor(Math.random() * Math.min(2, codeModels.length));
            return codeModels[selectedIndex];
          }
        }

        // For creative tasks, prefer Claude or diverse creative models
        if (isCreativeTask) {
          const creativeModels = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('opus') ||
            m.name.includes('gemini-1.5-pro') || m.name.includes('gpt-4o')
          );
          if (creativeModels.length > 0) {
            const selectedIndex = Math.floor(Math.random() * Math.min(2, creativeModels.length));
            return creativeModels[selectedIndex];
          }
        }

        // For complex tasks, prefer high-quality models with variety
        if (isComplexTask) {
          const complexModels = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('opus') ||
            m.name.includes('gemini-1.5-pro') || m.name.includes('gpt-4')
          );
          if (complexModels.length > 0) {
            const selectedIndex = Math.floor(Math.random() * Math.min(2, complexModels.length));
            return complexModels[selectedIndex];
          }
        }

        // For medium messages (200-500 chars), prefer balanced models with variety
        if (messageLength >= 200 && messageLength <= 500) {
          const balancedModels = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('gpt-4o') ||
            m.name.includes('gemini-1.5-pro') || m.name.includes('claude-3-sonnet') ||
            m.name.includes('gemini-2.0-flash')
          );
          if (balancedModels.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(3, balancedModels.length));
            return balancedModels[randomIndex];
          }
        }

        // For short messages, use a variety of fast models with better diversity
        if (messageLength < 200) {
          // Prioritize variety and avoid always using the same model
          const fastHighQuality = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('gemini-2.0-flash') ||
            m.name.includes('claude-3-sonnet')
          );

          const fastBudget = availableModels.filter(m =>
            m.name.includes('gpt-4o-mini') || m.name.includes('gpt-3.5') ||
            m.name.includes('haiku') || m.name.includes('gemini-2.5-flash')
          );

          // 60% chance for high quality, 40% for budget (better variety)
          const useHighQuality = Math.random() < 0.6;
          const candidateModels = useHighQuality && fastHighQuality.length > 0 ? fastHighQuality : fastBudget;

          if (candidateModels.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidateModels.length);
            return candidateModels[randomIndex];
          }
        }

        // Default: Smart selection with real variety, avoid always picking the same model
        const topTierModels = availableModels.filter(m =>
          m.name.includes('claude-3.5-sonnet') || m.name.includes('gpt-4o') ||
          m.name.includes('gemini-1.5-pro')
        );

        const midTierModels = availableModels.filter(m =>
          m.name.includes('claude-3-sonnet') || m.name.includes('gemini-2.0-flash') ||
          m.name.includes('gpt-4-turbo') || m.name.includes('gemini-2.5-pro')
        );

        const budgetModels = availableModels.filter(m =>
          m.name.includes('gpt-4o-mini') || m.name.includes('gpt-3.5-turbo') ||
          m.name.includes('haiku') || m.name.includes('gemini-2.5-flash')
        );

        // Weighted selection: 50% top-tier, 30% mid-tier, 20% budget
        const random = Math.random();
        let selectedModels, tier;

        if (random < 0.5 && topTierModels.length > 0) {
          selectedModels = topTierModels;
          tier = 'top-tier';
        } else if (random < 0.8 && midTierModels.length > 0) {
          selectedModels = midTierModels;
          tier = 'mid-tier';
        } else if (budgetModels.length > 0) {
          selectedModels = budgetModels;
          tier = 'budget';
        } else {
          // Fallback to any available model
          selectedModels = availableModels;
          tier = 'fallback';
        }

        if (selectedModels.length > 0) {
          const randomIndex = Math.floor(Math.random() * selectedModels.length);
          return selectedModels[randomIndex];
        }

        // Last resort: return first available model
        return availableModels[0];
    }
  }

  private isComplexTask(message: string): boolean {
    const complexKeywords = [
      'analyze', 'explain', 'complex', 'detailed', 'comprehensive',
      'technical', 'research', 'compare', 'evaluate', 'strategy',
      'architecture', 'system', 'framework', 'methodology'
    ];

    const lowerMessage = message.toLowerCase();
    return complexKeywords.some(keyword => lowerMessage.includes(keyword)) ||
      message.length > 500;
  }

  private isCodeTask(message: string): boolean {
    const codeKeywords = [
      'code', 'programming', 'algorithm', 'function', 'class',
      'variable', 'debug', 'error', 'syntax', 'compile',
      'javascript', 'python', 'typescript', 'react', 'html',
      'css', 'sql', 'api', 'database', 'server'
    ];

    const lowerMessage = message.toLowerCase();
    return codeKeywords.some(keyword => lowerMessage.includes(keyword)) ||
      message.includes('```') || message.includes('function') || message.includes('const ');
  }

  private isCreativeTask(message: string): boolean {
    const creativeKeywords = [
      'write a story', 'create a', 'imagine', 'creative', 'brainstorm',
      'story', 'poem', 'novel', 'character', 'plot', 'narrative',
      'artistic', 'design idea', 'concept', 'innovative', 'original'
    ];

    const lowerMessage = message.toLowerCase();
    return creativeKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async handleFallback(request: AIRequest, originalError: Error): Promise<AIResponse | null> {
    const availableModels = getAvailableModels().filter(model =>
      !this.failedProviders.has(model.provider)
    );
    // Try alternative models (excluding the one that failed)
    const alternativeModels = availableModels.filter(model =>
      model.name !== request.model
    );

    for (const model of alternativeModels.slice(0, 2)) { // Try max 2 alternatives
      try {
        const provider = this.providers.get(model.provider);
        if (!provider) {
          continue;
        }

        const fallbackRequest: AIRequest = {
          ...request,
          model: model.name
        };

        const response = await provider.generateResponse(fallbackRequest);

        if (response.success) {
          // Add fallback info to response
          response.error = `Primary model failed (${originalError.message}), used fallback: ${model.name}`;

          // Log usage
          await this.logUsage(request.userId, response, request.apiKeyId, request);

          return response;
        } else {
        }
      } catch (error) {
        console.error(`❌ Fallback model ${model.name} also failed:`, error);
        continue;
      }
    }

    return null;
  }

  private async logUsage(userId: string, response: AIResponse, apiKeyId?: string, request?: AIRequest): Promise<void> {
    try {
      // Log usage in the traditional way
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

      // Log adaptive learning data if we have task context
      const requestWithContext = request as AIRequest & { taskContext?: TaskContext };
      if (request && requestWithContext.taskContext) {
        const taskContext: TaskContext = requestWithContext.taskContext;
        const wasManualSelection = !!request.model; // If model was explicitly requested

        await AdaptiveLearningService.updateModelUsage(
          userId,
          response.model,
          response.provider,
          taskContext,
          response.tokensUsed.total,
          response.cost,
          response.responseTime,
          wasManualSelection,
          response.success
        );

      }
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