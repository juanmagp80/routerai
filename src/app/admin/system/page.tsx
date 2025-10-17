'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import {
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Settings,
    Shield,
    Users,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemStatus {
    status: string;
    currentUser: {
        email: string;
        role: string;
    };
    statistics: {
        totalActiveUsers: number;
        roleDistribution: Record<string, number>;
    };
    configuration: {
        environment: Record<string, boolean>;
        adminConfig: {
            adminEmails: number;
            adminDomains: number;
        };
    };
    adminUsers: Array<{
        email: string;
        first_name: string;
        last_name: string;
        created_at: string;
    }>;
}

export default function SystemStatusPage() {
    const { user, isLoaded } = useUser();
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setIsAuthorized] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/system-status');

            if (!response.ok) {
                throw new Error('Failed to fetch system status');
            }

            const data = await response.json();
            setStatus(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && user) {
            // Check if user is authorized to view system data
            const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
            const userEmail = primaryEmail?.emailAddress;

            if (userEmail === 'agentroutermcp@gmail.com') {
                setIsAuthorized(true);
                fetchStatus();
            } else {
                setIsAuthorized(false);
                setLoading(false);
                setAuthError('Access denied: System status is restricted to authorized administrators only.');
            }
        }
    }, [isLoaded, user]);

    // Check if user is not authorized
    if (!isLoaded || !user) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <p className="text-red-700">Please sign in to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (authError) {
        // Redirigir silenciosamente al dashboard
        if (typeof window !== 'undefined') {
            window.location.href = '/admin';
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-lg">Loading system status...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-semibold text-red-600">Error Loading System Status</h2>
                <p className="text-gray-600">{error}</p>
                <Button onClick={fetchStatus} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    if (!status) return null;

    const StatusIcon = ({ condition }: { condition: boolean }) =>
        condition ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
            <XCircle className="h-5 w-5 text-red-500" />
        );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
                    <p className="text-muted-foreground">
                        Monitor your admin system health and configuration
                    </p>
                </div>
                <Button onClick={fetchStatus} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* System Health */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            System Health
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Badge
                                variant={status.status === 'healthy' ? 'default' : 'destructive'}
                                className="text-xs"
                            >
                                {status.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Active Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {status.statistics.totalActiveUsers}
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Admin Users
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {status.statistics.roleDistribution.admin || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Environment Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <span>Environment Configuration</span>
                        </CardTitle>
                        <CardDescription>
                            Required environment variables status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(status.configuration.environment).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm font-medium capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <StatusIcon condition={value} />
                                    <Badge variant={value ? 'default' : 'destructive'} className="text-xs">
                                        {value ? 'Configured' : 'Missing'}
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {/* Admin Configuration */}
                        <div className="pt-3 border-t">
                            <h4 className="text-sm font-medium mb-2">Admin Configuration</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Auto Admin Assignment</span>
                                    <Badge variant="default" className="text-xs">
                                        Enabled
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Manual User Creation</span>
                                    <Badge variant="default" className="text-xs">
                                        Available
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Role Distribution</span>
                        </CardTitle>
                        <CardDescription>
                            Current user roles breakdown
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(status.statistics.roleDistribution).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between">
                                <span className="text-sm font-medium capitalize">{role}</span>
                                <Badge variant="outline" className="text-xs">
                                    {count} users
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Admin Users List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Admin Users</span>
                    </CardTitle>
                    <CardDescription>
                        Users with administrator privileges
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status.adminUsers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                            No admin users found
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {status.adminUsers.map((admin, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">
                                            {admin.first_name} {admin.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {admin.email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="default" className="text-xs">
                                            Admin
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Since {new Date(admin.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current User Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Session</CardTitle>
                    <CardDescription>
                        Your current user information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{status.currentUser.email}</p>
                            <p className="text-sm text-muted-foreground">
                                Logged in as {status.currentUser.role}
                            </p>
                        </div>
                        <Badge variant="default" className="capitalize">
                            {status.currentUser.role}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}