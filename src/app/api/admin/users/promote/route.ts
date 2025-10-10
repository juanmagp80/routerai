import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Endpoint para promover un usuario a admin
export async function POST(request: NextRequest) {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Verificar que el usuario actual es admin
        const { data: currentUserData } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('role')
            .eq('email', clerkUser.emailAddresses[0]?.emailAddress)
            .single();

        if (currentUserData?.role !== 'admin') {
            return NextResponse.json({
                error: 'Only admins can promote users'
            }, { status: 403 });
        }

        const { userId, action } = await request.json();

        if (!userId || !action) {
            return NextResponse.json({
                error: 'userId and action are required'
            }, { status: 400 });
        }

        // Actualizar rol del usuario
        const newRole = action === 'promote' ? 'admin' :
            action === 'demote' ? 'developer' :
                action === 'make_viewer' ? 'viewer' : null;

        if (!newRole) {
            return NextResponse.json({
                error: 'Invalid action. Use: promote, demote, or make_viewer'
            }, { status: 400 });
        }

        const { data: updatedUser, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .update({
                role: newRole,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({
                error: 'Failed to update user role'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
            message: `User ${action}d successfully`
        });

    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}