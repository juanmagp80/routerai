import { PlanLimitsService } from '@/lib/plan-limits-service';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { requireSaasDataAccess } from '@/lib/auth-restrictions';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Obtener el email del usuario desde los parámetros de la URL
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail');
        
        // Determinar si es el usuario autorizado para ver datos globales del SaaS
        const isAuthorizedForSaasData = userEmail === 'agentroutermcp@gmail.com';

        if (isAuthorizedForSaasData) {
            // Retornar datos globales del SaaS
            return await getSaasAnalytics();
        } else {
            // Retornar datos personales del usuario
            return await getUserAnalytics(userId);
        }
    } catch (error) {
        console.error('Error in analytics API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function getUserAnalytics(userId: string) {
    try {
        // Obtener datos del usuario usando el mismo servicio que Billing
        const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(userId);

        if (!limitsAndUsage) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Obtener el ID del usuario en la base de datos
        const { data: userData } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('clerk_user_id', userId)
            .single();

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        const dbUserId = userData.id;
        const userIdForRecords = userId;

        // Obtener métricas del usuario específico
        const [
            totalRequestsResult,
            totalApiKeysResult,
            topModelsResult,
            recentUsageResult
        ] = await Promise.all([
            // Total requests del usuario este mes
            supabase
                .from('usage_records')
                .select('*')
                .eq('user_id', userIdForRecords)
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // API keys del usuario
            supabase
                .from('api_keys')
                .select('*', { count: 'exact' })
                .eq('user_id', dbUserId)
                .eq('is_active', true),

            // Modelos utilizados por el usuario
            supabase
                .from('usage_records')
                .select('model_used')
                .eq('user_id', userIdForRecords)
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // Uso reciente de la API del usuario
            supabase
                .from('usage_records')
                .select('created_at, model_used')
                .eq('user_id', userIdForRecords)
                .order('created_at', { ascending: false })
                .limit(10)
        ]);

        const totalRequests = totalRequestsResult.data?.length || 0;
        const totalApiKeys = totalApiKeysResult.count || 0;
        const userEmail = userData.email || 'Unknown';
        const userPlan = limitsAndUsage.user.plan;

        // Top modelos del usuario
        const modelRequestsMap = new Map();
        topModelsResult.data?.forEach(record => {
            const model = record.model_used || 'unknown';
            const existing = modelRequestsMap.get(model) || 0;
            modelRequestsMap.set(model, existing + 1);
        });

        const topModels = Array.from(modelRequestsMap.entries())
            .map(([model, requests]) => ({
                model: model === 'unknown' ? 'Model not specified' : model,
                requests,
                percentage: totalRequests > 0 ? Math.round((requests / totalRequests) * 100 * 100) / 100 : 0
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5);

        // Actividad reciente del usuario
        const recentActivity = recentUsageResult.data?.map(usage => ({
            timestamp: usage.created_at,
            userId: dbUserId.toString(),
            email: userEmail,
            action: 'API Usage',
            details: `Made API request using ${usage.model_used}`
        })) || [];

        const userAnalytics = {
            totalRequests,
            totalUsers: 1,
            totalApiKeys,
            totalRevenue: 0, // No mostramos revenue para usuarios individuales
            requestsGrowth: 0,
            usersGrowth: 0,
            revenueGrowth: 0,
            apiKeysGrowth: 0,
            userPlan,
            userEmail,
            topUsers: [{
                userId: dbUserId.toString(),
                email: userEmail,
                plan: userPlan,
                requests: totalRequests
            }],
            topModels,
            recentActivity: recentActivity.slice(0, 20),
            planLimits: limitsAndUsage.limits
        };

        return NextResponse.json(userAnalytics);
    } catch (error) {
        console.error('Error getting user analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function getSaasAnalytics() {
    try {
        // Verificar autorización para datos del SaaS
        await requireSaasDataAccess();

        // Obtener métricas globales del SaaS
        const [
            totalUsersResult,
            totalRequestsResult,
            totalApiKeysResult,
            allUsersResult,
            allModelsResult,
            recentActivityResult
        ] = await Promise.all([
            // Total de usuarios únicos
            supabase
                .from('users')
                .select('id', { count: 'exact' }),

            // Total de requests de todos los usuarios este mes
            supabase
                .from('usage_records')
                .select('*')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // Total de API keys activas
            supabase
                .from('api_keys')
                .select('*', { count: 'exact' })
                .eq('is_active', true),

            // Top usuarios por requests
            supabase
                .from('users')
                .select('id, email, plan, clerk_user_id')
                .limit(10),

            // Todos los modelos usados este mes
            supabase
                .from('usage_records')
                .select('model_used')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // Actividad reciente global
            supabase
                .from('usage_records')
                .select('created_at, model_used, user_id')
                .order('created_at', { ascending: false })
                .limit(20)
        ]);

        const totalUsers = totalUsersResult.count || 0;
        const totalRequests = totalRequestsResult.data?.length || 0;
        const totalApiKeys = totalApiKeysResult.count || 0;

        // Procesar top usuarios
        const userRequestsMap = new Map();
        totalRequestsResult.data?.forEach(record => {
            const userId = record.user_id;
            const existing = userRequestsMap.get(userId) || 0;
            userRequestsMap.set(userId, existing + 1);
        });

        const topUsers = allUsersResult.data?.map(user => ({
            userId: user.id.toString(),
            email: user.email,
            plan: user.plan || 'free',
            requests: userRequestsMap.get(user.clerk_user_id) || 0
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 5) || [];

        // Top modelos
        const modelRequestsMap = new Map();
        allModelsResult.data?.forEach(record => {
            const model = record.model_used || 'unknown';
            const existing = modelRequestsMap.get(model) || 0;
            modelRequestsMap.set(model, existing + 1);
        });

        const topModels = Array.from(modelRequestsMap.entries())
            .map(([model, requests]) => ({
                model: model === 'unknown' ? 'Model not specified' : model,
                requests,
                percentage: totalRequests > 0 ? Math.round((requests / totalRequests) * 100 * 100) / 100 : 0
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5);

        // Actividad reciente global
        const recentActivity = recentActivityResult.data?.map(usage => ({
            timestamp: usage.created_at,
            userId: usage.user_id,
            email: 'System User',
            action: 'API Usage',
            details: `API request using ${usage.model_used}`
        })) || [];

        const saasAnalytics = {
            totalRequests,
            totalUsers,
            totalApiKeys,
            totalRevenue: totalUsers * 29, // Estimado
            requestsGrowth: 0,
            usersGrowth: 0,
            revenueGrowth: 0,
            apiKeysGrowth: 0,
            topUsers,
            topModels,
            recentActivity
        };

        return NextResponse.json(saasAnalytics);
    } catch (error) {
        console.error('Error getting SaaS analytics:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
