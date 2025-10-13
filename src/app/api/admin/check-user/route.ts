import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const email = 'juangpdev@gmail.com';

    // Buscar el usuario específico
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: userError,
        searchedEmail: email 
      }, { status: 404 });
    }

    // Buscar las API keys existentes para este usuario
    const { data: apiKeys, error: keysError } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id);

    if (keysError) {
      console.error('Error fetching API keys:', keysError);
    }

    // Obtener límites del plan
    const { data: planLimits, error: planError } = await supabaseAdmin
      .from('plan_limits')
      .select('*')
      .eq('plan_name', user.plan)
      .single();

    return NextResponse.json({
      success: true,
      user: user,
      apiKeys: apiKeys || [],
      apiKeyCount: apiKeys?.length || 0,
      planLimits: planLimits,
      planError: planError,
      canCreateMore: planLimits ? (apiKeys?.length || 0) < planLimits.api_key_limit : false
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}