import { PlanLimitsService } from '@/lib/plan-limits-service';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const clerkUserId = clerkUser.id;

        // Probar si el servicio puede encontrar al usuario
        const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(clerkUserId);

        return NextResponse.json({
            success: true,
            clerkUserId: clerkUserId,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            limitsAndUsage: limitsAndUsage,
            canCreateApiKey: limitsAndUsage?.usage.apiKeys.allowed || false
        });
    } catch (error) {
        console.error('Error testing limits:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}