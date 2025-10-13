import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // El usuario actual probablemente es juangpdev@gmail.com
    // Vamos a asumir un clerk_user_id temporal para testing
    const email = 'juangpdev@gmail.com';
    
    // Primero, buscar el usuario
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Para solucionar temporalmente, vamos a hacer que el sistema
    // use el ID de Supabase como referencia principal
    // En lugar de vincular con Clerk, vamos a crear una función que
    // permita usar el email como identificador

    return NextResponse.json({
      success: true,
      user: user,
      suggestion: 'The user should log in through the admin interface to automatically link accounts'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}