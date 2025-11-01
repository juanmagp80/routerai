import { supabase } from '@/lib/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';

    console.log(`📊 Getting account info for user: ${userEmail} (${userId})`);

    // Obtener información del usuario y su plan
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan, created_at')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !userData) {
      console.error('User not found in database:', userError);
      return NextResponse.json({
        plan: 'free',
        usage: 0,
        limit: 0,
        apiKeys: 0,
        error: 'User not found in database'
      });
    }

    // Obtener límites del plan
    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('monthly_request_limit')
      .eq('plan_name', userData.plan)
      .single();

    // Contar usage del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usageRecords } = await supabase
      .from('usage_records')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    // Contar API keys activas
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    const accountInfo = {
      plan: userData.plan || 'free',
      usage: usageRecords?.length || 0,
      limit: planLimits?.monthly_request_limit || 0,
      apiKeys: apiKeys?.length || 0,
      memberSince: userData.created_at
    };

    console.log('📊 Account info result:', accountInfo);

    return NextResponse.json(accountInfo);

  } catch (error) {
    console.error('❌ Error getting account info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}