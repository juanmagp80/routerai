import { PlanLimitsService } from '@/lib/plan-limits-service'
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

        // Obtener límites y uso del usuario
        const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(userId)

        if (!limitsAndUsage) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Obtener información completa del plan para incluir modelos permitidos
        const planLimits = await PlanLimitsService.getPlanLimits(limitsAndUsage.user.plan);

        return NextResponse.json({
            success: true,
            plan: limitsAndUsage.user.plan,
            currentPlan: limitsAndUsage.user.plan,
            allowedModels: planLimits?.allowed_models || [],
            apiKeysUsed: limitsAndUsage.usage.apiKeys.current,
            apiKeysLimit: limitsAndUsage.usage.apiKeys.limit,
            requestsUsed: limitsAndUsage.usage.requests.current,
            requestsLimit: limitsAndUsage.usage.requests.limit,
            trialEndsAt: limitsAndUsage.user.trialDaysRemaining ?
                new Date(Date.now() + limitsAndUsage.user.trialDaysRemaining * 24 * 60 * 60 * 1000).toISOString() :
                null
        })

    } catch (error) {
        console.error('Error getting user limits:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}