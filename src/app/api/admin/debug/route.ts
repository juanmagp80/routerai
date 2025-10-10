import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Debug endpoint para verificar autenticación y permisos
export async function GET() {
    try {
        // 1. Verificar usuario de Clerk
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return NextResponse.json({
                error: 'No Clerk user found',
                debug: { clerkUser: null }
            }, { status: 401 });
        }

        // 2. Verificar conexión a Supabase
        if (!supabaseAdmin) {
            return NextResponse.json({
                error: 'Supabase not configured',
                debug: {
                    clerkUser: {
                        id: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress
                    },
                    supabaseAdmin: null
                }
            }, { status: 500 });
        }

        // 3. Buscar usuario en la base de datos
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        const { data: dbUser, error: dbError } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('*')
            .eq('email', userEmail)
            .single();

        // 4. Contar usuarios totales
        const { data: allUsers, error: countError } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id, email, role')
            .limit(5);

        return NextResponse.json({
            success: true,
            debug: {
                clerkUser: {
                    id: clerkUser.id,
                    email: userEmail,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName
                },
                dbUser: dbUser || null,
                dbError: dbError?.message || null,
                sampleUsers: allUsers || [],
                countError: countError?.message || null,
                supabaseConnected: !!supabaseAdmin,
                env: {
                    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
                }
            }
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            debug: { message: error instanceof Error ? error.message : 'Unknown error' }
        }, { status: 500 });
    }
}