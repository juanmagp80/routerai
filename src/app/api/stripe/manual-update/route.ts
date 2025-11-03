import { StripeService } from '@/lib/stripe-service'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { userEmail, planName } = await request.json()

        if (!userEmail || !planName) {
            return NextResponse.json({ error: 'Missing userEmail or planName' }, { status: 400 })
        }

        if (!['starter', 'pro', 'enterprise'].includes(planName)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Buscar usuario por email (temporal para debug)
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, plan')
            .eq('email', userEmail)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        // Simular actualización manual del plan
        const success = await StripeService.updateUserPlan(user.id, planName, 'manual_update_' + Date.now())

        if (success) {
            return NextResponse.json({
                success: true,
                message: `User ${userEmail} plan updated to ${planName}`,
                userId: user.id,
                previousPlan: user.plan
            })
        } else {
            return NextResponse.json({
                error: 'Failed to update user plan'
            }, { status: 500 })
        }

    } catch (error) {
        console.error('Error in manual plan update:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}