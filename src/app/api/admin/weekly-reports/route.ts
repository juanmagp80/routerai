import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {

    // Get all users with weekly reports enabled
    const { data: usersWithReports, error: usersError } = await supabase
      .from('user_settings')
      .select(`
        user_id,
        settings,
        users!inner(clerk_user_id, email, plan)
      `)
      .not('settings->weeklyReports', 'is', null)
      .eq('settings->weeklyReports', true);

    if (usersError) {
      console.error('❌ Error fetching users with weekly reports:', usersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!usersWithReports || usersWithReports.length === 0) {
      return NextResponse.json({ message: 'No users with weekly reports enabled', count: 0 });
    }
    const results = [];

    for (const userSetting of usersWithReports) {
      try {
        const userId = userSetting.user_id;
        const user = (userSetting as any).users;

        // Calculate weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get usage from last week
        const { data: weeklyUsage } = await supabase
          .from('usage_records')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', weekAgo.toISOString());

        // Get monthly usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: monthlyUsage } = await supabase
          .from('usage_records')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', startOfMonth.toISOString());

        // Calculate costs
        const weeklyCost = weeklyUsage?.reduce((sum, record) => sum + (record.cost || 0), 0) || 0;
        const monthlyCost = monthlyUsage?.reduce((sum, record) => sum + (record.cost || 0), 0) || 0;

        // Get plan limits
        const { data: planLimits } = await supabase
          .from('plan_limits')
          .select('monthly_request_limit')
          .eq('plan_name', user.plan)
          .single();

        const weeklyStats = {
          weeklyRequests: weeklyUsage?.length || 0,
          monthlyRequests: monthlyUsage?.length || 0,
          weeklyCost: weeklyCost,
          monthlyCost: monthlyCost,
          monthlyLimit: planLimits?.monthly_request_limit || 0,
          usagePercentage: planLimits?.monthly_request_limit
            ? ((monthlyUsage?.length || 0) / planLimits.monthly_request_limit * 100)
            : 0
        };

        // Send weekly report email
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: 'Weekly Usage Report',
            message: `
              <h3>Your Weekly API Usage Summary</h3>
              <ul>
                <li><strong>This Week:</strong> ${weeklyStats.weeklyRequests.toLocaleString()} requests (€${weeklyStats.weeklyCost.toFixed(4)})</li>
                <li><strong>This Month:</strong> ${weeklyStats.monthlyRequests.toLocaleString()} / ${weeklyStats.monthlyLimit.toLocaleString()} requests (${weeklyStats.usagePercentage.toFixed(1)}%)</li>
                <li><strong>Monthly Cost:</strong> €${weeklyStats.monthlyCost.toFixed(4)}</li>
                <li><strong>Current Plan:</strong> ${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</li>
              </ul>
              <p>Keep up the great work with your API usage! 🚀</p>
            `
          })
        });

        const emailResult = await emailResponse.json();
        results.push({
          email: user.email,
          stats: weeklyStats,
          emailSent: emailResult.success
        });
      } catch (error) {
        console.error(`❌ Error generating report for user ${userSetting.user_id}:`, error);
        results.push({
          email: (userSetting as any).users?.email || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    return NextResponse.json({
      message: 'Weekly reports generated',
      totalUsers: usersWithReports.length,
      results: results
    });

  } catch (error) {
    console.error('❌ Error in weekly reports generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}