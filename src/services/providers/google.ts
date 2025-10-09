import { AIRequest, AIResponse } from '@/types/ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GoogleProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured');
    }

    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: request.model || 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: request.maxTokens || 8192,
          temperature: request.temperature || 0.7,
        }
      });

      let prompt = request.message;
      if (request.systemPrompt) {
        prompt = `${request.systemPrompt}\n\n${request.message}`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const responseTime = Date.now() - startTime;

      // Google doesn't provide token usage in the free tier, so we estimate
      const estimatedInputTokens = Math.ceil(prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(text.length / 4);
      const totalTokens = estimatedInputTokens + estimatedOutputTokens;

      // Calculate cost (very low for Gemini)
      const inputCost = 0.0005;
      const outputCost = 0.0015;
      const cost = (estimatedInputTokens * inputCost + estimatedOutputTokens * outputCost) / 1000;

      return {
        content: text,
        model: request.model || 'gemini-2.5-flash',
        provider: 'google',
        tokensUsed: {
          input: estimatedInputTokens,
          output: estimatedOutputTokens,
          total: totalTokens
        },
        cost,
        responseTime,
        success: true
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        content: '',
        model: request.model || 'gemini-2.5-flash',
        provider: 'google',
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
      if (!process.env.GEMINI_API_KEY) {
        console.log('❌ Google: No API key configured');
        return false;
      }

      // Just check if we can create the client (don't make actual API calls)
      console.log('✅ Google: API key found, assuming healthy');
      return true;
    } catch (error) {
      console.error('❌ Google health check error:', error);
      return false;
    }
  }
}