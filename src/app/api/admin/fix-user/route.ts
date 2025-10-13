import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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

        // Obtener los límites correctos del plan pro
        const { data: planLimits, error: planError } = await supabaseAdmin
            .from('plan_limits')
            .select('*')
            .eq('plan_name', 'pro')
            .single();

        if (planError || !planLimits) {
            return NextResponse.json({ error: 'Plan limits not found' }, { status: 404 });
        }

        // Corregir la configuración del usuario
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                api_key_limit: planLimits.api_key_limit, // Debería ser 25 para pro
                is_active: true,
                status: 'active',
                plan: 'pro' // Asegurar que el plan sea correcto
            })
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update user', details: updateError }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'User configuration fixed',
            before: {
                api_key_limit: user.api_key_limit,
                is_active: user.is_active,
                status: user.status,
                plan: user.plan
            },
            after: {
                api_key_limit: updatedUser.api_key_limit,
                is_active: updatedUser.is_active,
                status: updatedUser.status,
                plan: updatedUser.plan
            },
            planLimits: planLimits
        });
    } catch (error) {
        console.error('Error fixing user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}