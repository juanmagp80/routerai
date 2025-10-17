import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { requireSaasDataAccess } from '@/lib/auth-restrictions';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is authorized to access SaaS data
        try {
            await requireSaasDataAccess();
        } catch {
            return NextResponse.json({ 
                error: 'Access denied', 
                details: 'This endpoint is restricted to authorized administrators only.' 
            }, { status: 403 });
        }

        console.log('🔍 Learning stats API called for user:', userId);

        let stats, recommendations;

        // Intentar usar funciones SQL optimizadas primero
        try {
            console.log('🔧 Trying to use SQL functions...');

            const { data: statsData, error: statsError } = await supabase
                .rpc('get_user_learning_stats', { p_user_id: userId });

            if (!statsError && statsData) {
                stats = statsData;
                console.log('✅ Stats fetched using SQL function');

                // También obtener recomendaciones
                const { data: recsData, error: recsError } = await supabase
                    .rpc('get_recommended_models', {
                        p_user_id: userId,
                        p_limit: 5
                    });

                if (!recsError && recsData) {
                    recommendations = recsData;
                    console.log('✅ Recommendations fetched using SQL function');
                }
            }
        } catch (error) {
            console.log('⚠️ SQL functions not available, falling back to direct queries', error);
        }

        // Fallback: usar consultas directas si las funciones no están disponibles
        if (!stats || !recommendations) {
            console.log('📊 Using direct queries fallback...');

            const { data: userPrefs, error: prefsError } = await supabase
                .from('user_model_preferences')
                .select('*')
                .eq('user_id', userId);

            if (prefsError) {
                console.error('❌ Error fetching user preferences:', prefsError);
                return NextResponse.json({
                    error: 'Failed to fetch preferences',
                    details: prefsError.message
                }, { status: 500 });
            }

            console.log('✅ User preferences fetched:', userPrefs?.length || 0);

            // Calcular estadísticas manualmente
            stats = userPrefs && userPrefs.length > 0 ? {
                total_models_used: userPrefs.length,
                total_usage_count: userPrefs.reduce((sum, p) => sum + p.usage_count, 0),
                total_tokens_used: userPrefs.reduce((sum, p) => sum + p.total_tokens_used, 0),
                total_cost: userPrefs.reduce((sum, p) => sum + p.total_cost, 0),
                average_success_rate: userPrefs.reduce((sum, p) => sum + p.success_rate, 0) / userPrefs.length,
                models_by_usage: userPrefs
                    .sort((a, b) => b.usage_count - a.usage_count)
                    .map(p => ({
                        model_name: p.model_name,
                        provider: p.provider,
                        usage_count: p.usage_count,
                        success_rate: p.success_rate,
                        total_cost: p.total_cost,
                        average_response_time: p.average_response_time
                    }))
            } : {
                total_models_used: 0,
                total_usage_count: 0,
                total_tokens_used: 0,
                total_cost: 0,
                average_success_rate: 0,
                models_by_usage: []
            };

            // Crear recomendaciones simples
            recommendations = userPrefs && userPrefs.length > 0
                ? userPrefs
                    .map(p => ({
                        model_name: p.model_name,
                        provider: p.provider,
                        usage_count: p.usage_count,
                        success_rate: p.success_rate,
                        average_response_time: p.average_response_time,
                        total_cost: p.total_cost,
                        recommendation_score:
                            (p.usage_count * 0.3) +
                            (p.success_rate * 100 * 0.4) +
                            (p.average_response_time > 0 ? (10000.0 / p.average_response_time) * 0.2 : 0) +
                            (p.total_cost > 0 ? (1.0 / p.total_cost) * 0.1 : 10)
                    }))
                    .sort((a, b) => b.recommendation_score - a.recommendation_score)
                    .slice(0, 5)
                : [];
        }

        console.log('✅ Recommendations calculated:', recommendations?.length || 0);

        // Obtener feedback reciente
        const { data: recentFeedback, error: feedbackError } = await supabase
            .from('user_model_feedback')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (feedbackError) {
            console.error('Error fetching feedback:', feedbackError);
            return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
        }

        // Obtener tendencias de uso por modelo
        const { data: usageTrends, error: trendsError } = await supabase
            .from('user_model_preferences')
            .select('model_name, provider, usage_count, user_rating_sum, user_rating_count, success_rate, task_types, last_used_at')
            .eq('user_id', userId)
            .order('usage_count', { ascending: false })
            .limit(10);

        if (trendsError) {
            console.error('Error fetching usage trends:', trendsError);
            return NextResponse.json({ error: 'Failed to fetch usage trends' }, { status: 500 });
        }

        const result = {
            stats: stats || {},
            recommendations: recommendations || [],
            recentFeedback: recentFeedback || [],
            usageTrends: usageTrends || []
        };

        console.log('✅ Returning learning stats result');
        return NextResponse.json(result);

    } catch (error) {
        console.error('❌ Error in learning stats API:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}