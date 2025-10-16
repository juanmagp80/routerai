import { AIRequest, AIResponse } from '@/types/ai';

export class TogetherProvider {
    private baseUrl = 'https://api.together.xyz/v1';

    constructor() {
        if (!process.env.TOGETHER_API_KEY) {
            throw new Error('Together API key not configured');
        }
    }

    async generateResponse(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: request.model || 'meta-llama/Llama-3-8b-chat-hf',
                    messages: [
                        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
                        { role: 'user', content: request.message }
                    ],
                    max_tokens: request.maxTokens || 8192,
                    temperature: request.temperature || 0.7,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Together API error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            const content = data.choices[0]?.message?.content || '';
            const usage = data.usage || {};

            // Calculate cost (Together pricing is around $0.0002/1k input, $0.0006/1k output)
            const inputTokens = usage.prompt_tokens || 0;
            const outputTokens = usage.completion_tokens || 0;
            const cost = (inputTokens * 0.0002 + outputTokens * 0.0006) / 1000;

            return {
                content,
                model: request.model || 'llama-3.1-8b',
                tokensUsed: {
                    input: inputTokens,
                    output: outputTokens,
                    total: usage.total_tokens || (inputTokens + outputTokens)
                },
                cost,
                responseTime,
                provider: 'together',
                success: true
            };

        } catch (error) {
            console.error('Together Provider error:', error);
            throw new Error(`Together provider failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            if (!process.env.TOGETHER_API_KEY) {
                console.log('❌ Together: No API key configured');
                return false;
            }

            // Simple health check - just verify API key format
            const apiKey = process.env.TOGETHER_API_KEY;
            if (apiKey && apiKey.length > 10) {
                console.log('✅ Together: API key found, assuming healthy');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ Together health check error:', error);
            return false;
        }
    }
}