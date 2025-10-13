import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Obtener usuario actual de Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Buscar usuario en Supabase por email
    const { data: supabaseUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', clerkUser.primaryEmailAddress?.emailAddress)
      .single();

    return NextResponse.json({
      clerk: {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      },
      supabase: supabaseUser,
      supabaseError: error,
      linkStatus: supabaseUser?.clerk_user_id === clerkUser.id ? 'linked' : 'not_linked'
    });
  } catch (error) {
    console.error('Error checking user link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}