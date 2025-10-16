import { AdaptiveLearningService } from '@/lib/adaptive-learning-service';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            usageRecordId,
            modelName,
            provider,
            rating,
            feedbackText,
            categories,
            taskContext
        } = body;

        // Validar datos requeridos
        if (!usageRecordId || !modelName || !provider || !rating) {
            return NextResponse.json({
                error: 'Missing required fields: usageRecordId, modelName, provider, rating'
            }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({
                error: 'Rating must be between 1 and 5'
            }, { status: 400 });
        }

        // Registrar feedback
        await AdaptiveLearningService.recordUserFeedback(
            userId,
            usageRecordId,
            modelName,
            provider,
            rating,
            feedbackText,
            categories,
            taskContext
        );

        return NextResponse.json({
            success: true,
            message: 'Feedback recorded successfully'
        });

    } catch (error) {
        console.error('Error recording feedback:', error);
        return NextResponse.json({
            error: 'Failed to record feedback'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        switch (action) {
            case 'preferences':
                // Obtener preferencias del usuario
                const preferences = await AdaptiveLearningService.getUserPreferences(userId);
                return NextResponse.json({ preferences });

            case 'recommendations':
                // Obtener recomendaciones de modelos
                const message = url.searchParams.get('message') || '';
                const availableModelsParam = url.searchParams.get('availableModels');

                if (!availableModelsParam) {
                    return NextResponse.json({
                        error: 'availableModels parameter is required'
                    }, { status: 400 });
                }

                const availableModels = JSON.parse(availableModelsParam);
                const taskContext = AdaptiveLearningService.analyzeTaskContext(message);
                const recommendations = await AdaptiveLearningService.getModelRecommendations(
                    userId,
                    taskContext,
                    availableModels,
                    5
                );

                return NextResponse.json({
                    recommendations,
                    taskContext
                });

            default:
                return NextResponse.json({
                    error: 'Invalid action. Use: preferences, recommendations'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Error in adaptive learning API:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}