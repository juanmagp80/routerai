import { AIRequest, AIResponse } from '@/types/ai';
import OpenAI from 'openai';

export class OpenAIProvider {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
        model: request.model || 'gpt-3.5-turbo',
        messages,
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
      });

      const responseTime = Date.now() - startTime;
      const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

      // Calculate cost based on model
      let inputCost = 0.001; // Default for gpt-3.5-turbo
      let outputCost = 0.002;

      if (request.model?.includes('gpt-4-turbo')) {
        inputCost = 0.01;
        outputCost = 0.03;
      } else if (request.model?.includes('gpt-4')) {
        inputCost = 0.03;
        outputCost = 0.06;
      }

      const cost = (usage.prompt_tokens * inputCost + usage.completion_tokens * outputCost) / 1000;

      return {
        content: completion.choices[0]?.message?.content || '',
        model: request.model || 'gpt-3.5-turbo', // Use the model we requested, not what OpenAI returns
        provider: 'openai',
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
        model: request.model || 'gpt-3.5-turbo',
        provider: 'openai',
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
      if (!process.env.OPENAI_API_KEY) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ OpenAI health check error:', error);
      return false;
    }
  }
}