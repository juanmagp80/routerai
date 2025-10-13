import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const email = 'juangpdev@gmail.com';
    
    // Buscar usuario por email
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return NextResponse.json({ 
        error: 'User not found',
        details: findError 
      }, { status: 404 });
    }

    // El usuario necesita tener un clerk_user_id para que funcione el sistema
    // Vamos a generar uno temporal basado en su ID actual
    const temporaryClerkId = `user_clerk_${user.id}`;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        clerk_user_id: temporaryClerkId,
        is_active: true,
        status: 'active'
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update user',
        details: updateError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated with temporary Clerk ID',
      before: user,
      after: updatedUser,
      note: 'The user should now be able to access the API keys page'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}