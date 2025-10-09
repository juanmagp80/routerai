import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AIRouterService } from '@/services/ai-router';
import { getAvailableModels, getProviders } from '@/config/ai-providers';

// Use singleton pattern to maintain state between requests
let aiRouterInstance: AIRouterService | null = null;

function getAIRouter(): AIRouterService {
  if (!aiRouterInstance) {
    aiRouterInstance = new AIRouterService();
  }
  return aiRouterInstance;
}

export async function GET() {
  try {
    // Verify authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get available models and providers
    const models = getAvailableModels();
    const providers = getProviders();
    
    // Get provider health status
    const aiRouter = getAIRouter();
    const providerHealth = await aiRouter.getProviderHealth();

    // Filter models by healthy providers
    const availableModels = models.filter(model => 
      providerHealth[model.provider] === true
    );

    return NextResponse.json({
      success: true,
      models: availableModels,
      providers: providers.map((provider) => ({
        ...provider,
        healthy: providerHealth[provider.name] || false
      })),
      totalModels: models.length,
      availableModels: availableModels.length
    });

  } catch (error) {
    console.error('Models API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}