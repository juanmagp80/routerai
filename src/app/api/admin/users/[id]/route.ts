import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users/[id] - Get user by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const { data: userData, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .select(`
        *,
        api_keys_count:api_keys(count)
      `)
            .eq('id', params.id)
            .single();

        if (error || !userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Transform the data
        const transformedUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'viewer',
            status: userData.status || 'active',
            department: userData.department,
            plan: userData.plan,
            company: userData.company,
            apiKeysCount: userData.api_keys_count?.[0]?.count || 0,
            totalRequests: userData.monthly_requests_used || 0,
            lastActive: userData.last_active ? new Date(userData.last_active) : new Date(userData.updated_at || userData.created_at),
            joinedAt: new Date(userData.created_at || Date.now()),
            isActive: userData.is_active,
            emailVerified: userData.email_verified,
        };

        return NextResponse.json({
            success: true,
            user: transformedUser,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { name, email, role, status, department } = body;

        // Validate required fields
        if (!name || !email || !role || !status) {
            return NextResponse.json(
                { error: 'Name, email, role, and status are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id, email')
            .eq('id', params.id)
            .single();

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is already taken by another user
        if (email !== existingUser.email) {
            const { data: emailCheck } = await supabaseAdmin
                .from(TABLES.USERS)
                .select('id')
                .eq('email', email)
                .neq('id', params.id)
                .single();

            if (emailCheck) {
                return NextResponse.json(
                    { error: 'Email is already taken by another user' },
                    { status: 400 }
                );
            }
        }

        // Update user - map status values to your database
        const dbStatus = status === 'pending' ? 'inactive' : status;
        const dbPlan = role === 'admin' ? 'enterprise' : role === 'developer' ? 'pro' : 'free';

        const { data: updatedUser, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .update({
                name,
                email,
                role,
                status: dbStatus,
                department: department || null,
                plan: dbPlan,
                is_active: status === 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id)
            .select(`
        *,
        api_keys_count:api_keys(count)
      `)
            .single();

        if (error) {
            console.error('Error updating user:', error);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }

        // Transform the data
        const transformedUser = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            department: updatedUser.department,
            plan: updatedUser.plan,
            apiKeysCount: updatedUser.api_keys_count?.[0]?.count || 0,
            totalRequests: updatedUser.monthly_requests_used || 0,
            lastActive: updatedUser.last_active ? new Date(updatedUser.last_active) : new Date(updatedUser.updated_at),
            joinedAt: new Date(updatedUser.created_at),
            isActive: updatedUser.is_active,
            emailVerified: updatedUser.email_verified,
        };

        return NextResponse.json({
            success: true,
            user: transformedUser,
            message: 'User updated successfully',
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id, name, email')
            .eq('id', params.id)
            .single();

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user has active API keys
        const { data: apiKeys } = await supabaseAdmin
            .from(TABLES.API_KEYS)
            .select('id')
            .eq('user_id', params.id)
            .eq('status', 'active');

        if (apiKeys && apiKeys.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete user with active API keys. Please deactivate all API keys first.' },
                { status: 400 }
            );
        }

        // Soft delete by setting status to inactive instead of hard delete
        const { error } = await supabaseAdmin
            .from(TABLES.USERS)
            .update({
                status: 'inactive',
                is_active: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', params.id);

        if (error) {
            console.error('Error deleting user:', error);
            return NextResponse.json(
                { error: 'Failed to delete user' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `User ${existingUser.name} deactivated successfully`,
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}