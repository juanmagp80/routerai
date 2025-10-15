import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const unreadOnly = url.searchParams.get('unread') === 'true';

        // Build query
        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        const { data: notifications, error } = await query;

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json(
                { error: 'Failed to fetch notifications' },
                { status: 500 }
            );
        }

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Error in notifications GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, notificationId, notificationIds } = body;

        if (action === 'mark_read') {
            if (notificationId) {
                // Mark single notification as read
                const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', notificationId)
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error marking notification as read:', error);
                    return NextResponse.json(
                        { error: 'Failed to mark notification as read' },
                        { status: 500 }
                    );
                }
            } else if (notificationIds && Array.isArray(notificationIds)) {
                // Mark multiple notifications as read
                const { error } = await supabase
                    .from('notifications')
                    .update({ read: true })
                    .in('id', notificationIds)
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error marking notifications as read:', error);
                    return NextResponse.json(
                        { error: 'Failed to mark notifications as read' },
                        { status: 500 }
                    );
                }
            }
        } else if (action === 'mark_all_read') {
            // Mark all notifications as read
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', userId)
                .eq('read', false);

            if (error) {
                console.error('Error marking all notifications as read:', error);
                return NextResponse.json(
                    { error: 'Failed to mark all notifications as read' },
                    { status: 500 }
                );
            }
        } else if (action === 'delete') {
            if (notificationId) {
                // Delete single notification
                const { error } = await supabase
                    .from('notifications')
                    .delete()
                    .eq('id', notificationId)
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error deleting notification:', error);
                    return NextResponse.json(
                        { error: 'Failed to delete notification' },
                        { status: 500 }
                    );
                }
            } else if (notificationIds && Array.isArray(notificationIds)) {
                // Delete multiple notifications
                const { error } = await supabase
                    .from('notifications')
                    .delete()
                    .in('id', notificationIds)
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error deleting notifications:', error);
                    return NextResponse.json(
                        { error: 'Failed to delete notifications' },
                        { status: 500 }
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in notifications POST:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}