import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, clerkUserId } = await request.json();

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        if (!email || !clerkUserId) {
            return NextResponse.json({
                error: 'Email and clerkUserId are required'
            }, { status: 400 });
        }

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

        // Actualizar clerk_user_id
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({ clerk_user_id: clerkUserId })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({
                error: 'Failed to update user',
                details: updateError
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'User linked successfully',
            before: {
                clerk_user_id: user.clerk_user_id
            },
            after: {
                clerk_user_id: updatedUser.clerk_user_id
            }
        });
    } catch (error) {
        console.error('Error linking user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}