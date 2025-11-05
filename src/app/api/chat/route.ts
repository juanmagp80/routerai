import { ApiMiddleware } from '@/lib/api-middleware';
import { NotificationService } from '@/lib/notification-service';
import { AIRouterService } from '@/services/ai-router';
import { AIRequest } from '@/types/ai';
import { NextRequest, NextResponse } from 'next/server';

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
    // Primero necesitamos leer el body para obtener el modelo para validación
    const body = await request.json();

    // Extraer mensaje para validaciones de demo
    let messageForValidation = body.message;
    if (!messageForValidation && body.messages && Array.isArray(body.messages)) {
      const userMessages = body.messages.filter((msg: { role: string; content: string }) => msg.role === 'user');
      messageForValidation = userMessages[userMessages.length - 1]?.content || '';
    }

    // Usar el nuevo middleware para validar API key y límites
    return await ApiMiddleware.handleApiRequest(request, async (userId: string) => {
      try {
        // Validate required fields
        if (!body.message && !body.messages) {
          return NextResponse.json(
            { error: { message: 'Message or messages array is required', type: 'validation_error', code: 400 } },
            { status: 400 }
          );
        }

        // El modelo es opcional si se usa routing automático
        const useAutoRouting = !body.model || body.model === 'auto';

        // Convertir messages array a un solo message si es necesario
        let message = body.message;
        if (!message && body.messages && Array.isArray(body.messages)) {
          // Tomar el último mensaje del usuario
          const userMessages = body.messages.filter((msg: { role: string; content: string }) => msg.role === 'user');
          message = userMessages[userMessages.length - 1]?.content || '';
        }

        if (!message) {
          return NextResponse.json(
            { error: { message: 'Valid message content is required', type: 'validation_error', code: 400 } },
            { status: 400 }
          );
        }

        // Prepare AI request
        const aiRequest: AIRequest = {
          message: message,
          model: useAutoRouting ? undefined : body.model,
          temperature: body.temperature || 0.7,
          maxTokens: body.max_tokens || body.maxTokens || 1000,
          systemPrompt: body.systemPrompt,
          userId: userId,
          routingStrategy: body.routingStrategy || 'auto' // Soporte para routing strategy
        };

        console.log('🚀 Chat request details:', {
          model: aiRequest.model,
          routingStrategy: aiRequest.routingStrategy,
          userId: userId,
          useAutoRouting: useAutoRouting,
          messageLength: aiRequest.message.length
        });
        // Get AI router and route the request
        const aiRouter = getAIRouter();
        const response = await aiRouter.generateResponse(aiRequest);

        // Registrar el modelo real usado para analytics (fire and forget)
        if (response.success && response.model) {
          const { PlanLimitsService } = await import('@/lib/plan-limits-service');
          PlanLimitsService.recordModelUsage(userId, response.model).catch(error =>
            console.error('Error recording model usage:', error)
          );
        }

        if (!response.success) {
          // Track API errors for notification purposes (fire and forget)
          NotificationService.notifyApiErrors(userId, 1, 'ai_request_failure').catch(error =>
            console.error('Error tracking API errors:', error)
          );

          return NextResponse.json(
            {
              error: {
                message: response.error || 'AI request failed',
                type: 'ai_error',
                code: 500
              }
            },
            { status: 500 }
          );
        }

        // Trigger automatic notifications (no await - fire and forget)
        NotificationService.checkAndNotifyUsageLimits(userId).catch(error =>
          console.error('Error checking usage limits:', error)
        );
        NotificationService.checkAndSuggestUpgrade(userId).catch(error =>
          console.error('Error checking upgrade suggestions:', error)
        );

        // Check for milestones (fire and forget)
        fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/milestones`, {
          method: 'POST',
          headers: {
            'Cookie': request.headers.get('Cookie') || ''
          }
        }).catch(error => console.error('Error checking milestones:', error));

        // Return successful response compatible with console
        return NextResponse.json({
          success: true,
          response: response.content,
          model: response.model || aiRequest.model,
          provider: response.provider,
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: response.content
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: response.tokensUsed?.input || 0,
            completion_tokens: response.tokensUsed?.output || 0,
            total_tokens: response.tokensUsed?.total || 0
          },
          metadata: {
            provider: response.provider,
            processing_time: response.responseTime,
            cost: response.cost,
            routing_strategy: aiRequest.routingStrategy
          }
        });

      } catch (error) {
        console.error('Error processing chat request:', error);
        return NextResponse.json(
          {
            error: {
              message: 'Internal server error',
              type: 'internal_error',
              code: 500
            }
          },
          { status: 500 }
        );
      }
    }, body?.model || 'auto', messageForValidation); // Pasar el modelo y mensaje para validación

  } catch (parseError) {
    console.error('Error parsing request body:', parseError);
    return NextResponse.json(
      {
        error: {
          message: 'Invalid JSON in request body',
          type: 'validation_error',
          code: 400
        }
      },
      { status: 400 }
    );
  }
}