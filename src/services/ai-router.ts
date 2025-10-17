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

    if (process.env.TOGETHER_API_KEY) {
      this.providers.set('meta', new TogetherProvider());
      console.log('✅ Together provider initialized');
    } else {
      console.log('❌ Together API key not found');
    }

    if (process.env.MISTRAL_API_KEY) {
      this.providers.set('mistral', new MistralProvider());
      console.log('✅ Mistral provider initialized');
    } else {
      console.log('❌ Mistral API key not found');
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

    console.log('🔍 Total models:', allModels.length);
    console.log('🔍 Failed providers:', Array.from(this.failedProviders));
    console.log('🔍 Available providers:', Array.from(this.providers.keys()));
    console.log('🔍 Filtered available models:', availableModels.map(m => `${m.name} (${m.provider})`));

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
            console.log('🎯 Filtered by preferred providers:', preferredProviders);
            console.log('🎯 Models after provider filter:', availableModels.map(m => `${m.name} (${m.provider})`));
          } else {
            console.log('⚠️ No models available from preferred providers, using all available models');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not load user preferences:', error);
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

    // Si no hay modelo específico, primero intentar usar las preferencias del usuario
    if (!request.model && request.userId) {
      try {
        console.log('🔍 Loading user preferences for model selection...');
        console.log('🔍 User ID:', request.userId);
        
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', request.userId)
          .single();

        if (settingsError) {
          console.log('⚠️ Error loading user settings:', settingsError);
        }

        console.log('📋 Raw settings data:', settingsData);

        const userSettings = settingsData?.settings || {};
        const defaultModel = userSettings.defaultModel;
        const preferredProviders = userSettings.preferredProviders || [];

        console.log('👤 User settings loaded:', { defaultModel, preferredProviders });
        console.log('👤 Available models before filtering:', availableModels.map(m => `${m.name} (${m.provider})`));

        // Si el usuario tiene un modelo por defecto, intentar usarlo
        if (defaultModel) {
          const preferredModel = availableModels.find(m => m.name === defaultModel);
          if (preferredModel) {
            console.log('🎯 Using user default model preference:', defaultModel);
            return preferredModel;
          } else {
            console.log('⚠️ User preferred model not available:', defaultModel);
          }
        }

        // Si no tiene modelo por defecto pero tiene proveedores preferidos, 
        // usar el mejor modelo de esos proveedores
        if (preferredProviders.length > 0) {
          const providerModels = availableModels.filter(m => 
            preferredProviders.includes(m.provider)
          );
          if (providerModels.length > 0) {
            // Usar el primer modelo disponible del proveedor preferido
            console.log('🎯 Using model from preferred provider:', providerModels[0].name);
            return providerModels[0];
          }
        }
      } catch (error) {
        console.log('⚠️ Could not load user preferences:', error);
      }
    }

    // Use adaptive learning system if user is provided
    if (request.userId) {
      try {
        console.log('🧠 Using adaptive learning system for model selection');

        // Analyze task context
        const taskContext = AdaptiveLearningService.analyzeTaskContext(request.message);
        console.log('🔍 Task context:', taskContext);

        // Get personalized scores for available models
        const modelScores = await AdaptiveLearningService.calculatePersonalizedScores(
          request.userId,
          availableModels.map(m => ({ name: m.name, provider: m.provider })),
          taskContext
        );

        console.log('📊 Model scores:', modelScores.map(s => `${s.modelName}: ${s.score.toFixed(3)} (confidence: ${s.confidence.toFixed(2)})`));

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
              console.log('🏆 Selected adaptive model:', selectedModel.name, 'with score:', bestModel.score.toFixed(3));
              console.log('💡 Reasoning:', bestModel.reasoning.join(', '));

              // Store task context for later use in logging
              Object.assign(request, { taskContext }); return selectedModel;
            }
          } else {
            console.log('🎲 Adaptive learning confidence too low or scores too similar, using fallback strategy');
          }
        }
      } catch (error) {
        console.error('❌ Error in adaptive learning selection, falling back to strategy-based selection:', error);
      }
    }

    // Fallback to traditional strategy-based selection
    const strategy = request.routingStrategy || 'auto';
    console.log('🎯 Using fallback routing strategy:', strategy);

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
        // Smart model selection with more variety and intelligence
        const messageLength = request.message.length;
        const isComplexTask = this.isComplexTask(request.message);
        const isCodeTask = this.isCodeTask(request.message);
        const isCreativeTask = this.isCreativeTask(request.message);

        // For code tasks, prefer models good at programming
        if (isCodeTask) {
          const codeModels = availableModels.filter(m =>
            m.name.includes('gpt-4') || m.name.includes('claude-3.5-sonnet') || m.name.includes('o1-')
          );
          if (codeModels.length > 0) {
            console.log('💻 Selected code task model:', codeModels[0].name);
            return codeModels[0];
          }
        }

        // For creative tasks, prefer Claude or GPT-4
        if (isCreativeTask) {
          const creativeModels = availableModels.filter(m =>
            m.name.includes('claude-3.5-sonnet') || m.name.includes('gpt-4o') || m.name.includes('opus')
          );
          if (creativeModels.length > 0) {
            console.log('🎨 Selected creative task model:', creativeModels[0].name);
            return creativeModels[0];
          }
        }

        // For complex tasks, prefer high-quality models
        if (isComplexTask) {
          const complexModels = availableModels.filter(m =>
            m.name.includes('gpt-4') || m.name.includes('opus') || m.name.includes('claude-3.5-sonnet')
          );
          if (complexModels.length > 0) {
            console.log('🧠 Selected complex task model:', complexModels[0].name);
            return complexModels[0];
          }
        }

        // For medium messages (200-500 chars), prefer balanced models
        if (messageLength >= 200 && messageLength <= 500) {
          const balancedModels = availableModels.filter(m =>
            m.name.includes('claude-3-sonnet') || m.name.includes('gpt-4o') || m.name.includes('gemini-1.5-pro')
          );
          if (balancedModels.length > 0) {
            console.log('⚖️ Selected balanced model for medium message:', balancedModels[0].name);
            return balancedModels[0];
          }
        }

        // For short messages, use a variety of fast models (not always the same)
        if (messageLength < 200) {
          const quickModels = availableModels.filter(m =>
            m.name.includes('gpt-3.5') || m.name.includes('haiku') ||
            m.name.includes('gemini-2.0-flash') || m.name.includes('gpt-4o-mini') ||
            m.name.includes('claude-3-sonnet')
          );

          if (quickModels.length > 1) {
            // Add some randomness to avoid always picking the same model
            const randomIndex = Math.floor(Math.random() * Math.min(3, quickModels.length));
            console.log('🏃 Selected varied quick model:', quickModels[randomIndex].name);
            return quickModels[randomIndex];
          } else if (quickModels.length > 0) {
            console.log('🏃 Selected quick model:', quickModels[0].name);
            return quickModels[0];
          }
        }

        // Default: prefer a good balanced model over just the cheapest
        const preferredModels = availableModels.filter(m =>
          m.name.includes('claude-3-sonnet') || m.name.includes('gpt-4o') ||
          m.name.includes('gemini-1.5-pro') || m.name.includes('gpt-3.5-turbo')
        );

        if (preferredModels.length > 0) {
          console.log('🎯 Selected preferred default model:', preferredModels[0].name);
          return preferredModels[0];
        }

        // Last resort: return first available model
        console.log('🎲 Selected fallback model:', availableModels[0]?.name);
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
          await this.logUsage(request.userId, response, request.apiKeyId, request);

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

        console.log('📚 Updated adaptive learning data for model:', response.model);
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