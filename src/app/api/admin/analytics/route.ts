import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Obtener el ID del usuario en la base de datos usando el clerk_user_id
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_user_id', userId)
            .single()

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        const dbUserId = userData.id

        // Obtener métricas básicas del usuario específico
        const [
            totalRequestsResult,
            totalApiKeysResult,
            topModelsResult,
            recentApiKeysResult,
            recentUsageResult,
            userDataResult
        ] = await Promise.all([
            // Total requests del usuario este mes
            supabase
                .from('usage_records')
                .select('requests_count')
                .eq('user_id', dbUserId)
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
                .select('model_used, requests_count')
                .eq('user_id', dbUserId)
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // API Keys del usuario (actividad reciente)
            supabase
                .from('api_keys')
                .select('created_at, name')
                .eq('user_id', dbUserId)
                .order('created_at', { ascending: false })
                .limit(10),

            // Uso de la API del usuario (actividad reciente)
            supabase
                .from('usage_records')
                .select('created_at, model_used, requests_count')
                .eq('user_id', dbUserId)
                .order('created_at', { ascending: false })
                .limit(10),

            // Datos del usuario actual
            supabase
                .from('users')
                .select('email, current_plan, created_at')
                .eq('id', dbUserId)
                .single()
        ])

        // Calcular totales del usuario
        const totalRequests = totalRequestsResult.data?.reduce((sum, record) => sum + (record.requests_count || 0), 0) || 0
        const totalApiKeys = totalApiKeysResult.count || 0
        const userEmail = userDataResult.data?.email || 'Unknown'
        const userPlan = userDataResult.data?.current_plan || 'free'
        const userCreatedAt = userDataResult.data?.created_at || new Date().toISOString()

        // Para un usuario individual, no hay "top usuarios" - solo mostramos su información
        const topUsers = [{
            userId: dbUserId.toString(),
            email: userEmail,
            plan: userPlan,
            requests: totalRequests
        }]

        // Procesar top modelos
        const modelRequestsMap = new Map()
        topModelsResult.data?.forEach(record => {
            const model = record.model_used || 'unknown'
            const existing = modelRequestsMap.get(model) || 0
            modelRequestsMap.set(model, existing + (record.requests_count || 0))
        })

        const topModels = Array.from(modelRequestsMap.entries())
            .map(([model, requests]) => ({
                model: model === 'unknown' ? 'Model not specified' : model,
                requests,
                percentage: totalRequests > 0 ? Math.round((requests / totalRequests) * 100 * 100) / 100 : 0
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5)

        // Procesar actividad reciente del usuario
        const allActivity: any[] = []

        // Agregar actividad de API Keys del usuario
        recentApiKeysResult.data?.forEach(apiKey => {
            allActivity.push({
                timestamp: apiKey.created_at,
                userId: dbUserId.toString(),
                email: userEmail,
                action: 'API Key Created',
                details: `Created API key: ${apiKey.name}`
            })
        })

        // Agregar actividad de uso de API del usuario
        recentUsageResult.data?.forEach(usage => {
            allActivity.push({
                timestamp: usage.created_at,
                userId: dbUserId.toString(),
                email: userEmail,
                action: 'API Usage',
                details: `Made ${usage.requests_count} requests using ${usage.model_used}`
            })
        })

        // Ordenar toda la actividad por timestamp y tomar los 20 más recientes
        const recentActivity = allActivity
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20)

        // Calcular métricas de crecimiento del usuario
        const currentMonth = new Date()
        const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)
        
        // Obtener datos del mes anterior del usuario para comparación
        const [
            lastMonthRequestsResult,
            lastMonthApiKeysResult
        ] = await Promise.all([
            supabase
                .from('usage_records')
                .select('requests_count')
                .eq('user_id', dbUserId)
                .gte('created_at', lastMonth.toISOString())
                .lte('created_at', lastMonthEnd.toISOString()),
            
            supabase
                .from('api_keys')
                .select('id', { count: 'exact' })
                .eq('user_id', dbUserId)
                .eq('is_active', true)
                .lte('created_at', lastMonthEnd.toISOString())
        ])

        const lastMonthRequests = lastMonthRequestsResult.data?.reduce((sum, record) => sum + (record.requests_count || 0), 0) || 0
        const lastMonthApiKeys = lastMonthApiKeysResult.count || 0
        
        // Calcular crecimiento real del usuario
        const requestsGrowth = lastMonthRequests > 0 ? Math.round(((totalRequests - lastMonthRequests) / lastMonthRequests) * 100 * 100) / 100 : 0
        const apiKeysGrowth = lastMonthApiKeys > 0 ? Math.round(((totalApiKeys - lastMonthApiKeys) / lastMonthApiKeys) * 100 * 100) / 100 : 0
        
        // Para un usuario individual, no calculamos revenue global
        // En su lugar, mostramos si es usuario premium o no
        const userRevenue = userPlan !== 'free' ? 29 : 0 // $29 si es premium, $0 si es free
        const planUpgradeDate = userPlan !== 'free' ? userCreatedAt : null
        
        const analyticsData = {
            totalRequests,
            totalUsers: 1, // Solo cuenta el usuario actual
            totalApiKeys,
            totalRevenue: userRevenue,
            requestsGrowth,
            usersGrowth: 0, // No aplica para usuario individual
            revenueGrowth: 0, // Simplificado para vista de usuario
            apiKeysGrowth,
            userPlan,
            userEmail,
            planUpgradeDate,
            topUsers,
            topModels,
            recentActivity
        }

        return NextResponse.json(analyticsData)

    } catch (error) {
        console.error('Error fetching analytics:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}