// Utility functions for notification actions
export interface NotificationAction {
    label: string;
    href: string;
    variant: 'default' | 'outline' | 'destructive';
    icon?: string;
}

export function getNotificationAction(type: string, metadata?: Record<string, unknown>): NotificationAction | null {
    switch (type) {
        case 'limit_warning':
        case 'limit_reached':
            return {
                label: 'View Usage',
                href: '/admin/analytics',
                variant: 'outline',
                icon: '📊'
            };

        case 'upgrade_suggestion':
            return {
                label: 'Upgrade Plan',
                href: '/admin/billing',
                variant: 'default',
                icon: '⬆️'
            };

        case 'welcome':
            return {
                label: 'View Docs',
                href: '/docs',
                variant: 'default',
                icon: '📚'
            };

        case 'milestone':
            return {
                label: 'View Analytics',
                href: '/admin/analytics',
                variant: 'outline',
                icon: '🎯'
            };

        case 'api_error':
            return {
                label: 'API Console',
                href: '/admin/chat',
                variant: 'outline',
                icon: '🔧'
            };

        case 'trial_expiring':
        case 'trial_expired':
            return {
                label: 'Choose Plan',
                href: '/admin/billing',
                variant: 'default',
                icon: '💳'
            };

        default:
            return null;
    }
}

export function getNotificationActionSecondary(type: string): NotificationAction | null {
    switch (type) {
        case 'limit_warning':
        case 'limit_reached':
            return {
                label: 'Upgrade',
                href: '/admin/billing',
                variant: 'default',
                icon: '⬆️'
            };

        case 'upgrade_suggestion':
            return {
                label: 'View Usage',
                href: '/admin/analytics',
                variant: 'outline',
                icon: '📊'
            };

        case 'welcome':
            return {
                label: 'Create API Key',
                href: '/admin/keys',
                variant: 'outline',
                icon: '🔑'
            };

        case 'api_error':
            return {
                label: 'View Logs',
                href: '/admin/analytics',
                variant: 'outline',
                icon: '📋'
            };

        default:
            return null;
    }
}