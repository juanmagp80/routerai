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

    const email = clerkUser.primaryEmailAddress?.emailAddress;

    // Buscar usuarios en Supabase por email
    const { data: usersByEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email);

    // Buscar usuarios en Supabase por clerk_user_id
    const { data: usersByClerkId, error: clerkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUser.id);

    return NextResponse.json({
      success: true,
      clerk: {
        id: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      },
      supabase: {
        usersByEmail: usersByEmail || [],
        usersByClerkId: usersByClerkId || [],
        emailError: emailError,
        clerkError: clerkError
      },
      analysis: {
        hasEmailMatch: (usersByEmail?.length || 0) > 0,
        hasClerkIdMatch: (usersByClerkId?.length || 0) > 0,
        totalMatches: (usersByEmail?.length || 0) + (usersByClerkId?.length || 0)
      }
    });
  } catch (error) {
    console.error('Error checking user link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}