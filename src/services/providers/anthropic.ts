import Anthropic from '@anthropic-ai/sdk';
import { AIRequest, AIResponse } from '@/types/ai';

export class AnthropicProvider {
  private client: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const messages = [{
        role: 'user' as const,
        content: request.message
      }];

      const createParams = {
        model: request.model || 'claude-3-haiku-20240307',
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
        messages: messages,
        ...(request.systemPrompt && { system: request.systemPrompt })
      };

      const completion = await this.client.messages.create(createParams);

      const responseTime = Date.now() - startTime;
      const usage = completion.usage;
      
      // Calculate cost based on model
      let inputCost = 0.00025; // Default for Claude 3 Haiku
      let outputCost = 0.00125;
      
      if (request.model?.includes('opus')) {
        inputCost = 0.015;
        outputCost = 0.075;
      } else if (request.model?.includes('sonnet')) {
        inputCost = 0.003;
        outputCost = 0.015;
      }
      
      const cost = (usage.input_tokens * inputCost + usage.output_tokens * outputCost) / 1000;

      const content = completion.content[0];
      const responseText = content.type === 'text' ? content.text : '';

      return {
        content: responseText,
        model: completion.model,
        provider: 'anthropic',
        tokensUsed: {
          input: usage.input_tokens,
          output: usage.output_tokens,
          total: usage.input_tokens + usage.output_tokens
        },
        cost,
        responseTime,
        success: true
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for credit/billing issues
      if (errorMessage.includes('credit balance') || 
          errorMessage.includes('billing')) {
        errorMessage = 'Anthropic API: Insufficient credits. Please check your billing.';
      }
      
      return {
        content: '',
        model: request.model || 'claude-3-haiku-20240307',
        provider: 'anthropic',
        tokensUsed: { input: 0, output: 0, total: 0 },
        cost: 0,
        responseTime,
        success: false,
        error: errorMessage
      };
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return false;
      }

      // Try a minimal API call to check if the service is available
      const testMessage = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });

      return !!testMessage;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Anthropic health check failed:', errorMessage);
      
      // Check for specific error types that indicate unavailability
      if (errorMessage.includes('credit balance') || 
          errorMessage.includes('billing')) {
        return false;
      }
      
      return false;
    }
  }
}