import { NotificationService } from '@/lib/notification-service';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Endpoint para verificar hitos automáticamente
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener el conteo actual de requests del usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('monthly_requests_used')
      .or(`clerk_user_id.eq.${userId},id.eq.${userId}`)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentUsage = user.monthly_requests_used || 0;
    
    // Verificar hitos específicos
    const milestones = [100, 1000, 10000, 100000];
    const triggeredMilestones = [];

    for (const milestone of milestones) {
      if (currentUsage >= milestone) {
        // Verificar si ya hemos enviado notificación para este hito
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'milestone')
          .contains('metadata', { milestone: milestone })
          .single();

        if (!existingNotification) {
          // Enviar notificación de hito
          const success = await NotificationService.notifyUsageMilestone(userId, milestone);
          if (success) {
            triggeredMilestones.push(milestone);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      triggeredMilestones,
      currentUsage 
    });
  } catch (error) {
    console.error('Error checking milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}