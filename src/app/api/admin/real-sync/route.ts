import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
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

        // Buscar usuario por email y actualizar con el Clerk ID correcto
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

        // Actualizar con el Clerk ID real
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                clerk_user_id: clerkUser.id,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name,
                email_verified: clerkUser.emailAddresses[0]?.verification?.status === 'verified'
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
            message: 'User synchronized with real Clerk ID',
            clerkId: clerkUser.id,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error syncing with real Clerk ID:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}