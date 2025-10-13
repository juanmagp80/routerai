import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const email = 'juangpdev@gmail.com';

    // Buscar el usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Obtener los límites correctos del plan FREE
    const { data: planLimits, error: planError } = await supabaseAdmin
      .from('plan_limits')
      .select('*')
      .eq('plan_name', 'free')
      .single();

    if (planError || !planLimits) {
      return NextResponse.json({ error: 'Free plan limits not found' }, { status: 404 });
    }

    // Corregir la configuración del usuario para plan FREE
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        plan: 'free',
        api_key_limit: planLimits.api_key_limit, // Debería ser 3 para free
        is_active: true,
        status: 'active'
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update user', details: updateError }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User corrected to FREE plan',
      before: {
        plan: user.plan,
        api_key_limit: user.api_key_limit,
        is_active: user.is_active,
        status: user.status
      },
      after: {
        plan: updatedUser.plan,
        api_key_limit: updatedUser.api_key_limit,
        is_active: updatedUser.is_active,
        status: updatedUser.status
      },
      planLimits: planLimits
    });
  } catch (error) {
    console.error('Error fixing user to free:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}