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

        // Obtener datos del usuario
        const { data: userData } = await supabase
            .from('users')
            .select('id, email, monthly_requests_used')
            .eq('clerk_user_id', userId)
            .single()

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Obtener registros de uso
        const { data: usageRecords } = await supabase
            .from('usage_records')
            .select('id, user_id, model_name, provider, total_tokens, cost_usd, created_at')
            .eq('user_id', userData.id)
            .order('created_at', { ascending: false })
            .limit(10)

        // Obtener API keys
        const { data: apiKeys } = await supabase
            .from('api_keys')
            .select('id, name, created_at, last_used_at')
            .eq('user_id', userData.id)
            .eq('is_active', true)

        return NextResponse.json({
            user: {
                id: userData.id,
                email: userData.email,
                monthlyRequestsUsed: userData.monthly_requests_used
            },
            usageRecords: usageRecords || [],
            apiKeys: apiKeys || [],
            debug: {
                clerkUserId: userId,
                dbUserId: userData.id,
                totalUsageRecords: usageRecords?.length || 0
            }
        })

    } catch (error) {
        console.error('Error fetching test usage:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}