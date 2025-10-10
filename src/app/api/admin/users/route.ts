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

        // Get users with API key counts from your actual table structure
        const { data: users, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .select(`
        *,
        api_keys_count:api_keys(count)
      `)
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

        return NextResponse.json({
            success: true,
            users: transformedUsers,
            total: transformedUsers.length,
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

        // Generate a unique ID (you might want to use UUID in production)
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create new user with your table structure
        const { data: newUser, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .insert({
                id: userId,
                name,
                email,
                role,
                status: sendInvite ? 'inactive' : 'active', // Map pending to inactive
                department: department || null,
                plan: role === 'admin' ? 'enterprise' : role === 'developer' ? 'pro' : 'free',
                is_active: !sendInvite,
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
            message: sendInvite ? 'User created and invitation sent' : 'User created successfully',
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}