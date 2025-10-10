/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users - List all users
export async function GET() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Find the caller in our users table to determine their company and role
        const { data: callerRows, error: callerError } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id,company,role,email,clerk_user_id')
            .eq('clerk_user_id', user.id)
            .maybeSingle();

        if (callerError) {
            console.error('Error finding caller user:', callerError);
            return NextResponse.json({ error: 'Failed to verify caller' }, { status: 500 });
        }

        const caller = callerRows as any;
        if (!caller) {
            // If the caller isn't mapped to a users row, deny access
            return NextResponse.json({ error: 'Forbidden: user not found in application database' }, { status: 403 });
        }

        // Only list users within the same company as the caller (multi-tenant isolation)
        const { data: users, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .select(`*, api_keys_count:api_keys(count)`)
            .eq('company', caller.company)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users from database:', error);
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        // Transform the data to match our UI expectations
        const transformedUsers = users?.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'viewer', // Default to viewer if role is missing
            status: user.status || 'active',
            department: user.department,
            clerk_user_id: user.clerk_user_id,
            plan: user.plan,
            company: user.company,
            apiKeysCount: user.api_keys_count?.[0]?.count || 0,
            totalRequests: user.monthly_requests_used || 0,
            lastActive: user.last_active ? new Date(user.last_active) : new Date(user.updated_at || user.created_at),
            joinedAt: new Date(user.created_at || Date.now()),
            isActive: user.is_active,
            emailVerified: user.email_verified,
        })) || [];
        // Optional debug information: detect demo/sample users (seeded API keys or recent seed usage)
        const debug_active_users: Array<{ id: string; email?: string; name?: string; source?: string }> = [];
        try {
            if (process.env.NEXT_PUBLIC_STATS_DEBUG === 'true') {
                // Find api_keys matching common seed patterns within the same company
                const { data: candidateKeys } = await supabaseAdmin
                    .from('api_keys')
                    .select('id,user_id,name,key_hash,key_prefix')
                    .eq('company', caller.company)
                    .or(`key_hash.ilike.rtr\_% , key_prefix.ilike.rtr\_% , name.eq.Clave Principal`)
                    .limit(1000);

                const keyUserIds = new Set((candidateKeys || []).map((k: any) => k.user_id).filter(Boolean));

                // Also check usage_records by recent model names used in seeders
                const { data: recentUsage } = await supabaseAdmin
                    .from('usage_records')
                    .select('user_id')
                    .eq('company', caller.company)
                    .in('model_name', ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku'])
                    .gte('created_at', new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString())
                    .limit(1000);

                const usageUserIds = new Set((recentUsage || []).map((u: any) => u.user_id).filter(Boolean));

                const combinedIds = Array.from(new Set([...Array.from(keyUserIds), ...Array.from(usageUserIds)]));

                if (combinedIds.length > 0) {
                    const { data: detectedUsers } = await supabaseAdmin
                        .from(TABLES.USERS)
                        .select('id,email,name')
                        .in('id', combinedIds)
                        .eq('company', caller.company)
                        .limit(1000);

                    for (const u of (detectedUsers || [])) {
                        const src = keyUserIds.has((u as any).id) ? 'api_key' : usageUserIds.has((u as any).id) ? 'usage' : 'unknown';
                        (debug_active_users as Array<any>).push({ id: (u as any).id, email: (u as any).email, name: (u as any).name, source: src });
                    }
                }
            }
        } catch (dbgErr) {
            console.error('Error building debug_active_users:', dbgErr);
        }

        return NextResponse.json({
            success: true,
            users: transformedUsers,
            total: transformedUsers.length,
            debug_active_users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { name, email, role, department, sendInvite } = body;

        // Ensure the caller exists in our users table to get their company
        const { data: callerRows } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id,company,role')
            .eq('clerk_user_id', user.id)
            .maybeSingle();

        if (!callerRows) {
            return NextResponse.json({ error: 'Forbidden: caller not registered in app database' }, { status: 403 });
        }

        const caller = callerRows as any;

        // Validate required fields
        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Name, email, and role are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const { data: existingUser } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        if (sendInvite) {
            // Create invitation record and send email
            try {
                const { data: inv } = await supabaseAdmin
                    .from('invitations')
                    .insert([{ email, name, created_by: caller.id }])
                    .select()
                    .single();

                // Try sending email via server helper (best-effort)
                try {
                    const { EmailService } = await import('@/lib/email-service');
                    await EmailService.sendInvite(email, name || '', inv.token, caller.name || undefined);
                } catch (e) {
                    console.warn('Failed to send invite email:', e);
                }

                return NextResponse.json({ success: true, invitation: inv, message: 'Invitation created' });
            } catch (e) {
                console.error('Error creating invitation:', e);
                return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
            }
        }

        // If not sending invite, proceed to directly create user (existing flow)
        // Generate a unique ID (you might want to use UUID in production)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create new user with your table structure
        // Force the new user to belong to the caller's company (multi-tenant safety)
        const { data: newUser, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .insert({
                id: userId,
                name,
                email,
                role,
                status: 'active',
                department: department || null,
                company: caller.company,
                plan: role === 'admin' ? 'enterprise' : role === 'developer' ? 'pro' : 'free',
                is_active: true,
                email_verified: false,
                clerk_user_id: null, // Will be set when user accepts invitation
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Transform response
        const transformedUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            department: newUser.department,
            plan: newUser.plan,
            apiKeysCount: 0,
            totalRequests: 0,
            lastActive: new Date(newUser.created_at),
            joinedAt: new Date(newUser.created_at),
            isActive: newUser.is_active,
            emailVerified: newUser.email_verified,
        };

        return NextResponse.json({
            success: true,
            user: transformedUser,
            message: 'User created successfully',
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}