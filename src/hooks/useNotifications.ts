import { useEffect, useState } from 'react';

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
    read: boolean;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications
    const fetchNotifications = async (unreadOnly = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (unreadOnly) {
                params.append('unread', 'true');
            }

            const response = await fetch(`/api/notifications?${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data.notifications || []);

            // Update unread count
            const unread = data.notifications?.filter((n: Notification) => !n.read).length || 0;
            setUnreadCount(unread);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Mark notification(s) as read
    const markAsRead = async (notificationId?: string, notificationIds?: string[]) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'mark_read',
                    notificationId,
                    notificationIds,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }

            // Update local state
            setNotifications(prev =>
                prev.map(notification => {
                    if (notificationId && notification.id === notificationId) {
                        return { ...notification, read: true };
                    }
                    if (notificationIds && notificationIds.includes(notification.id)) {
                        return { ...notification, read: true };
                    }
                    return notification;
                })
            );

            // Update unread count
            if (notificationId) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else if (notificationIds) {
                setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark as read');
            console.error('Error marking notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'mark_all_read',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }

            // Update local state
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark all as read');
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Delete notification(s)
    const deleteNotification = async (notificationId?: string, notificationIds?: string[]) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'delete',
                    notificationId,
                    notificationIds,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            // Update local state
            setNotifications(prev => {
                const filtered = prev.filter(notification => {
                    if (notificationId && notification.id === notificationId) {
                        return false;
                    }
                    if (notificationIds && notificationIds.includes(notification.id)) {
                        return false;
                    }
                    return true;
                });

                // Update unread count
                const deletedUnreadCount = prev.filter(notification => {
                    const shouldDelete = (notificationId && notification.id === notificationId) ||
                        (notificationIds && notificationIds.includes(notification.id));
                    return shouldDelete && !notification.read;
                }).length;

                setUnreadCount(prevCount => Math.max(0, prevCount - deletedUnreadCount));

                return filtered;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete notification');
            console.error('Error deleting notification:', err);
        }
    };

    // Get recent notifications (for dropdown)
    const getRecentNotifications = (limit = 5) => {
        return notifications.slice(0, limit);
    };

    // Auto-refresh notifications every 30 seconds
    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        getRecentNotifications,
        refresh: fetchNotifications,
    };
}