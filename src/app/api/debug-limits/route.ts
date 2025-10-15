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
        const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(userId);
        const canCreate = await PlanLimitsService.canCreateApiKey(userId);

        return NextResponse.json({
            clerkUserId: userId,
            limitsAndUsage,
            canCreateApiKey: canCreate,
            debug: {
                hasLimits: !!limitsAndUsage,
                apiKeysAllowed: limitsAndUsage?.usage.apiKeys.allowed,
                apiKeysCurrent: limitsAndUsage?.usage.apiKeys.current,
                apiKeysLimit: limitsAndUsage?.usage.apiKeys.limit,
                userPlan: limitsAndUsage?.user.plan,
                isActive: limitsAndUsage?.user.isActive
            }
        })

    } catch (error) {
        console.error('Error in debug limits:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        )
    }
}