import { requireSaasDataAccess } from '@/lib/auth-restrictions';
import { supabase } from '@/lib/supabase';
import { COST_PROTECTION_CONFIG } from '@/lib/cost-protection';
import { CacheHelpers } from '@/lib/cache-service';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Solo usuarios autorizados pueden ver el monitoreo global
        await requireSaasDataAccess();

        // Obtener estadísticas globales del día
        const today = new Date().toISOString().split('T')[0];
        
        // Costo global del día
        const { data: todayRecords } = await supabase
            .from('usage_records')
            .select('cost, user_id')
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lt('created_at', `${today}T23:59:59.999Z`);

        const dailyCost = todayRecords?.reduce((sum, record) => 
            sum + (parseFloat(record.cost?.toString() || '0') || 0), 0) || 0;

        const requestsToday = todayRecords?.length || 0;
        const uniqueUsersToday = new Set(todayRecords?.map(r => r.user_id) || []).size;
        const dailyLimit = COST_PROTECTION_CONFIG.emergencyShutoff.dailyGlobalLimit;
        const percentage = (dailyCost / dailyLimit) * 100;

        // Top usuarios por costo diario
        const userCosts: { [userId: string]: { cost: number; requests: number } } = {};
        todayRecords?.forEach(record => {
            if (!userCosts[record.user_id]) {
                userCosts[record.user_id] = { cost: 0, requests: 0 };
            }
            userCosts[record.user_id].cost += parseFloat(record.cost?.toString() || '0') || 0;
            userCosts[record.user_id].requests += 1;
        });

        // Obtener información de usuarios y sus planes
        const userIds = Object.keys(userCosts);
        const { data: users } = await supabase
            .from('users')
            .select('clerk_user_id, email, plan')
            .in('clerk_user_id', userIds);

        const topUsers = Object.entries(userCosts)
            .map(([userId, stats]) => {
                const user = users?.find(u => u.clerk_user_id === userId);
                const userPlan = (user?.plan || 'free') as keyof typeof COST_PROTECTION_CONFIG.dailyCostLimits;
                const dailyLimit = COST_PROTECTION_CONFIG.dailyCostLimits[userPlan];
                
                return {
                    userId,
                    email: user?.email || 'Unknown',
                    dailyCost: stats.cost,
                    dailyLimit,
                    percentage: (stats.cost / dailyLimit) * 100,
                    requests: stats.requests,
                    plan: user?.plan || 'free'
                };
            })
            .sort((a, b) => b.dailyCost - a.dailyCost)
            .slice(0, 10);

        // Obtener alertas recientes
        const { data: alerts } = await supabase
            .from('cost_alerts')
            .select('*')
            .gte('created_at', `${today}T00:00:00.000Z`)
            .is('acknowledged_at', null)
            .order('created_at', { ascending: false })
            .limit(20);

        // Estadísticas del cache
        const cacheStats = CacheHelpers.getStats();

        // Métricas de protección (simuladas por ahora)
        // En producción, estas deberían venir de logs/métricas reales
        const protectionMetrics = {
            blockedRequests: Math.floor(Math.random() * 50), // Simulated
            rateLimitHits: Math.floor(Math.random() * 100),  // Simulated
            spikeDetections: Math.floor(Math.random() * 10), // Simulated
            emergencyShutoffs: 0 // Simulated
        };

        const monitoringData = {
            globalStats: {
                dailyCost,
                dailyLimit,
                percentage,
                requestsToday,
                uniqueUsersToday
            },
            topUsers,
            alerts: alerts?.map(alert => ({
                id: alert.id,
                userId: alert.user_id,
                alertType: alert.alert_type,
                message: alert.message,
                severity: alert.severity,
                createdAt: alert.created_at
            })) || [],
            cacheStats,
            protectionMetrics
        };

        return NextResponse.json(monitoringData);

    } catch (error) {
        console.error('Error in cost monitoring API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}