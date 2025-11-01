import { NextRequest, NextResponse } from 'next/server';
import { DemoLimitManager } from '@/lib/demo-limit-manager';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Check if demo mode is active
    if (!DemoLimitManager.isDemoMode()) {
      return NextResponse.json({
        isDemoMode: false,
        message: 'Demo mode not active'
      });
    }

    // Get user ID from auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get usage stats for the user
    const usageStats = await DemoLimitManager.getUserUsageStats(userId);
    
    if (!usageStats) {
      return NextResponse.json({
        requestsToday: 0,
        remainingRequests: 10,
        totalCostToday: 0,
        resetTime: new Date().toISOString().split('T')[0] + 'T00:00:00Z'
      });
    }

    return NextResponse.json(usageStats);
    
  } catch (error) {
    console.error('Error getting demo usage stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}