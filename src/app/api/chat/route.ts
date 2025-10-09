import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIRouterService } from '@/services/ai-router';
import { AIRequest } from '@/types/ai';

// Use singleton pattern to maintain state between requests
let aiRouterInstance: AIRouterService | null = null;

function getAIRouter(): AIRouterService {
  if (!aiRouterInstance) {
    aiRouterInstance = new AIRouterService();
  }
  return aiRouterInstance;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare AI request
    const aiRequest: AIRequest = {
      userId,
      message: body.message,
      model: body.model,
      systemPrompt: body.systemPrompt,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      apiKeyId: body.apiKeyId,
      routingStrategy: body.routingStrategy
    };

    // Route the request through our AI service
    const aiRouter = getAIRouter();
    const response = await aiRouter.generateResponse(aiRequest);

    if (!response) {
      return NextResponse.json(
        { error: 'No AI providers available' },
        { status: 503 }
      );
    }

    if (!response.success) {
      console.error('AI Router failed:', response.error);
      return NextResponse.json(
        { error: response.error || 'All AI providers failed' },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      response: response.content,
      model: response.model,
      provider: response.provider,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      responseTime: response.responseTime
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}