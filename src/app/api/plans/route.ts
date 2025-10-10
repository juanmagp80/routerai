import { PlanLimitsService } from '@/lib/plan-limits-service'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const allPlans = await PlanLimitsService.getAllPlans()

        return NextResponse.json({
            success: true,
            plans: allPlans
        })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to fetch plans',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}