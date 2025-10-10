import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin, TABLES } from '@/lib/supabase';

// GET /api/admin/system-status - Verificar estado del sistema de administración
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Verificar si el usuario actual es admin
    const { data: dbUser } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('role')
      .eq('email', user.emailAddresses[0]?.emailAddress)
      .single();

    if (!dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Obtener estadísticas de usuarios
    const { data: userStats } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('role')
      .eq('is_active', true);

    const roleStats = userStats?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Verificar configuración de variables de entorno
    const envStatus = {
      clerkWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // Verificar configuración de administración
    const adminConfig = {
      autoAdminAssignment: true, // Todos los usuarios registrados son admin
      manualUserCreation: true,  // Los admin pueden crear usuarios con roles específicos
    };

    // Obtener usuarios admin actuales
    const { data: adminUsers } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('email, first_name, last_name, created_at')
      .eq('role', 'admin')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      status: 'healthy',
      currentUser: {
        email: user.emailAddresses[0]?.emailAddress,
        role: dbUser.role,
      },
      statistics: {
        totalActiveUsers: userStats?.length || 0,
        roleDistribution: roleStats,
      },
      configuration: {
        environment: envStatus,
        adminConfig,
      },
      adminUsers: adminUsers || [],
    });

  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { error: 'Failed to check system status' },
      { status: 500 }
    );
  }
}