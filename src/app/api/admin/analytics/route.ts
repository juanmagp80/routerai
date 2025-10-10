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

        // Verificar que el usuario es admin (esto deberías implementarlo según tu lógica)
        // Por ahora permitimos a todos los usuarios autenticados

        // Obtener métricas básicas
        const [
            totalRequestsResult,
            totalUsersResult,
            totalApiKeysResult,
            topUsersResult,
            topModelsResult,
            recentActivityResult
        ] = await Promise.all([
            // Total requests este mes
            supabase
                .from('usage_records')
                .select('requests_count')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // Total usuarios
            supabase
                .from('users')
                .select('id', { count: 'exact' }),

            // Total API keys activas
            supabase
                .from('api_keys')
                .select('id', { count: 'exact' })
                .eq('is_active', true),

            // Top usuarios por requests este mes
            supabase
                .from('usage_records')
                .select(`
          user_id,
          requests_count,
          users!inner(email, current_plan)
        `)
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
                .order('requests_count', { ascending: false })
                .limit(10),

            // Top modelos (simulado por ahora)
            supabase
                .from('usage_records')
                .select('model_used, requests_count')
                .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

            // Actividad reciente
            supabase
                .from('api_keys')
                .select(`
          created_at,
          user_id,
          name,
          users!inner(email)
        `)
                .order('created_at', { ascending: false })
                .limit(20)
        ])

        // Calcular totales
        const totalRequests = totalRequestsResult.data?.reduce((sum, record) => sum + (record.requests_count || 0), 0) || 0
        const totalUsers = totalUsersResult.count || 0
        const totalApiKeys = totalApiKeysResult.count || 0

        // Procesar top usuarios
        const userRequestsMap = new Map()
        topUsersResult.data?.forEach(record => {
            const userId = record.user_id
            const user = Array.isArray(record.users) ? record.users[0] : record.users
            const existing = userRequestsMap.get(userId) || {
                userId,
                email: user?.email || 'Unknown',
                plan: user?.current_plan || 'free',
                requests: 0
            }
            existing.requests += record.requests_count || 0
            userRequestsMap.set(userId, existing)
        })

        const topUsers = Array.from(userRequestsMap.values())
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5)

        // Procesar top modelos
        const modelRequestsMap = new Map()
        topModelsResult.data?.forEach(record => {
            const model = record.model_used || 'gpt-3.5-turbo'
            const existing = modelRequestsMap.get(model) || 0
            modelRequestsMap.set(model, existing + (record.requests_count || 0))
        })

        const topModels = Array.from(modelRequestsMap.entries())
            .map(([model, requests]) => ({
                model,
                requests,
                percentage: totalRequests > 0 ? (requests / totalRequests) * 100 : 0
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 5)

        // Procesar actividad reciente
        const recentActivity = recentActivityResult.data?.map(apiKey => {
            const user = Array.isArray(apiKey.users) ? apiKey.users[0] : apiKey.users
            return {
                timestamp: apiKey.created_at,
                userId: apiKey.user_id,
                email: user?.email || 'Unknown',
                action: 'API Key Created',
                details: `Created API key: ${apiKey.name}`
            }
        }) || []

        // Calcular métricas de crecimiento (simuladas)
        const requestsGrowth = Math.random() * 20 - 5 // -5% a +15%
        const usersGrowth = Math.random() * 15 + 2 // +2% a +17%
        const revenueGrowth = Math.random() * 25 - 5 // -5% a +20%

        // Calcular revenue aproximado (simulado)
        const totalRevenue = (totalUsers * 29) + (Math.random() * 1000) // Simulado

        const analyticsData = {
            totalRequests,
            totalUsers,
            totalApiKeys,
            totalRevenue,
            requestsGrowth,
            usersGrowth,
            revenueGrowth,
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