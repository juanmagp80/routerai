import { auth } from '@clerk/nextjs/server';
import { NotificationService } from '@/lib/notification-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create some example notifications for testing
    const sampleNotifications = [
      {
        userId,
        type: 'limit_warning' as const,
        title: 'Usage Limit Warning',
        message: 'You have used 80% of your monthly API quota. Consider upgrading your plan to avoid service interruption.',
        metadata: { usage_percentage: 80, plan: 'starter' }
      },
      {
        userId,
        type: 'upgrade_suggestion' as const,
        title: 'Upgrade Recommendation',
        message: 'Based on your usage patterns, upgrading to Pro plan could save you money and provide better performance.',
        metadata: { suggested_plan: 'pro', potential_savings: 25 }
      },
      {
        userId,
        type: 'trial_expiring' as const,
        title: 'Trial Ending Soon',
        message: 'Your free trial expires in 3 days. Upgrade now to continue using Roulix without interruption.',
        metadata: { days_remaining: 3 }
      }
    ];

    // Send each notification
    const results = await Promise.all(
      sampleNotifications.map(notification => 
        NotificationService.sendNotification(notification)
      )
    );

    const successful = results.filter(result => result).length;

    return NextResponse.json({ 
      success: true, 
      message: `Created ${successful} sample notifications` 
    });
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}