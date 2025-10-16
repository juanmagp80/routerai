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

        if (!email) {
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Buscar usuario existente por email
        const { data: existingUser, error: findError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (findError || !existingUser) {
            return NextResponse.json({
                error: 'User not found in database',
                details: findError
            }, { status: 404 });
        }

        // Vincular con Clerk si no está vinculado
        const updateData: Record<string, string | boolean> = {};

        if (!existingUser.clerk_user_id) {
            updateData.clerk_user_id = clerkUser.id;
        }

        // Actualizar nombre si es diferente
        const currentName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        if (currentName && existingUser.name !== currentName) {
            updateData.name = currentName;
        }

        // Actualizar verificación de email
        const emailVerified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
        if (existingUser.email_verified !== emailVerified) {
            updateData.email_verified = emailVerified;
        }

        let updatedUser = existingUser;

        if (Object.keys(updateData).length > 0) {
            const { data, error: updateError } = await supabaseAdmin
                .from('users')
                .update(updateData)
                .eq('id', existingUser.id)
                .select('*')
                .single();

            if (updateError) {
                return NextResponse.json({
                    error: 'Failed to update user',
                    details: updateError
                }, { status: 500 });
            }

            updatedUser = data;
        }

        return NextResponse.json({
            success: true,
            message: 'User synchronized successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                plan: updatedUser.plan,
                clerk_user_id: (updatedUser as { clerk_user_id?: string }).clerk_user_id,
                api_key_limit: updatedUser.api_key_limit
            },
            changes: updateData
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}