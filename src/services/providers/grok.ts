import OpenAI from 'openai';
import { AIRequest, AIResponse } from '@/types/ai';

export class GrokProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.GROK_API_KEY) {
      throw new Error('Grok API key not configured');
    }
    
    // Grok uses OpenAI-compatible API
    this.client = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: request.message
      });

      const completion = await this.client.chat.completions.create({
        model: request.model || 'grok-3',
        messages,
        max_tokens: request.maxTokens || 8192,
        temperature: request.temperature || 0.7,
      });

      const responseTime = Date.now() - startTime;
      const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
      
      // Calculate cost for Grok
      const inputCost = 0.01;
      const outputCost = 0.02;
      const cost = (usage.prompt_tokens * inputCost + usage.completion_tokens * outputCost) / 1000;

      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model,
        provider: 'grok',
        tokensUsed: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          total: usage.total_tokens
        },
        cost,
        responseTime,
        success: true
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        content: '',
        model: request.model || 'grok-3',
        provider: 'grok',
        tokensUsed: { input: 0, output: 0, total: 0 },
        cost: 0,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!process.env.GROK_API_KEY) {
        console.log('❌ Grok: No API key configured');
        return false;
      }
      console.log('✅ Grok: API key found, assuming healthy');
      return true;
    } catch (error) {
      console.error('❌ Grok health check error:', error);
      return false;
    }
  }
}