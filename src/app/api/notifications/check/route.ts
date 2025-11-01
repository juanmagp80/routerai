import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NotificationService } from '@/services/NotificationService';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ Unauthorized request to check notifications');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user email from Clerk
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';

    console.log(`🔍 Checking notifications for user: ${userEmail} (${userId})`);

    // Check and create notifications based on actual usage
    await NotificationService.checkAndCreateUsageNotifications(userId, userEmail);

    // Clean up old notifications
    await NotificationService.cleanupOldNotifications(30);

    return NextResponse.json({ 
      success: true,
      message: 'Notification check completed'
    });

  } catch (error) {
    console.error('❌ Error in notification check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}