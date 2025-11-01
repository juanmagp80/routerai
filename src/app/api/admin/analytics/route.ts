import { requireSaasDataAccess } from '@/lib/auth-restrictions';
import { PlanLimitsService } from '@/lib/plan-limits-service';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Siempre retornar datos personales del usuario logueado
        return await getUserAnalytics(userId);
    } catch (error) {
        console.error('Error in analytics API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function getUserAnalytics(clerkUserId: string) {
    try {
        console.log('🔍 Getting analytics for Clerk User ID:', clerkUserId);

        // Obtener datos del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, plan, created_at, name')
            .eq('clerk_user_id', clerkUserId)
            .single();

        if (userError || !userData) {
            console.error('User not found:', userError);
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        console.log('✅ Found user:', userData.email, 'Plan:', userData.plan);

        // Obtener límites del plan
        const { data: planLimits } = await supabase
            .from('plan_limits')
            .select('*')
            .eq('plan_name', userData.plan)
            .single();

        console.log('📋 Plan limits:', planLimits);

        // Calcular fecha de inicio del mes actual
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        console.log('📅 Searching from:', startOfMonth);
        console.log('🔍 Searching with Clerk ID:', clerkUserId);
        console.log('🔍 Searching with Database ID:', userData.id);

        // Buscar usage_records con ambos IDs posibles (Clerk ID y Database ID)
        const [usageWithClerkId, usageWithDbId] = await Promise.all([
            supabase
                .from('usage_records')
                .select('*')
                .eq('user_id', clerkUserId)
                .gte('created_at', startOfMonth),
            supabase
                .from('usage_records')
                .select('*')
                .eq('user_id', userData.id)
                .gte('created_at', startOfMonth)
        ]);

        console.log('📊 Usage with Clerk ID:', usageWithClerkId.data?.length || 0, 'records');
        console.log('📊 Usage with Database ID:', usageWithDbId.data?.length || 0, 'records');

        // Usar los datos que contengan registros, si no hay del mes actual, usar todos los registros
        let finalUsageData = usageWithClerkId.data?.length ? usageWithClerkId.data : usageWithDbId.data;
        
        // Si no encontramos datos del mes actual, buscar TODOS los registros del usuario
        if (!finalUsageData?.length) {
            console.log('⚠️ No data for current month, searching ALL records...');
            const [allUsageClerk, allUsageDb] = await Promise.all([
                supabase
                    .from('usage_records')
                    .select('*')
                    .eq('user_id', clerkUserId)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('usage_records')
                    .select('*')
                    .eq('user_id', userData.id)
                    .order('created_at', { ascending: false })
            ]);
            
            finalUsageData = allUsageClerk.data?.length ? allUsageClerk.data : allUsageDb.data;
            console.log('📊 Using historical records:', finalUsageData?.length || 0);
            
            if (finalUsageData?.length) {
                console.log('📅 Date range of records:');
                console.log('   Oldest:', finalUsageData[finalUsageData.length - 1]?.created_at);
                console.log('   Newest:', finalUsageData[0]?.created_at);
            }
        } else {
            console.log('✅ Using current month data:', finalUsageData.length, 'records');
        }

        // Obtener API keys del usuario
        const { data: apiKeysData, count: apiKeysCount } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact' })
            .eq('user_id', userData.id)
            .eq('is_active', true);

        console.log('🔑 Found API keys:', apiKeysCount || 0);

        const totalRequests = finalUsageData?.length || 0;
        const totalApiKeys = apiKeysCount || 0;

        // Calcular el costo total real
        const totalCost = finalUsageData?.reduce((sum: number, record: any) => {
            const cost = parseFloat(record.cost?.toString() || '0') || 0;
            return sum + cost;
        }, 0) || 0;

        console.log('💰 Total cost calculated:', totalCost);

        // Top modelos del usuario
        const modelRequestsMap = new Map();
        finalUsageData?.forEach((record: any) => {
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
        const recentActivity = finalUsageData?.slice(0, 10).map((usage: any) => ({
            timestamp: usage.created_at,
            userId: userData.id,
            email: userData.email,
            action: 'API Usage',
            details: `Used ${usage.model_used || 'unknown model'} - Cost: $${usage.cost || 0}`
        })) || [];

        const userAnalytics = {
            totalRequests,
            totalUsers: 1,
            totalApiKeys,
            totalRevenue: totalCost,
            totalCost,
            requestsGrowth: 0, // TODO: Calcular crecimiento real
            usersGrowth: 0,
            revenueGrowth: 0,
            apiKeysGrowth: 0,
            userPlan: userData.plan,
            userEmail: userData.email,
            topUsers: [{
                userId: userData.id,
                email: userData.email,
                plan: userData.plan,
                requests: totalRequests
            }],
            topModels,
            recentActivity,
            planLimits: planLimits ? {
                monthlyRequestLimit: planLimits.monthly_request_limit,
                apiKeyLimit: planLimits.api_key_limit,
                allowedModels: planLimits.allowed_models
            } : null
        };

        console.log('📈 Analytics result:', {
            totalRequests: userAnalytics.totalRequests,
            totalCost: userAnalytics.totalCost,
            totalApiKeys: userAnalytics.totalApiKeys,
            userPlan: userAnalytics.userPlan
        });

        return NextResponse.json(userAnalytics);
    } catch (error) {
        console.error('❌ Error getting user analytics:', error);
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
