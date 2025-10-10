import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Obtener datos del usuario actual
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user:', error)
            return NextResponse.json({
                error: 'User not found',
                details: error.message
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            user: user,
            currentPlan: user.plan,
            apiKeyLimit: user.api_key_limit,
            stripeSubscriptionId: user.stripe_subscription_id
        })

    } catch (error) {
        console.error('Error checking user status:', error)
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}