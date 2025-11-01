'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserSync } from "@/hooks/useUserSync";
import { StatsService, UserStats } from "@/lib/stats-service";
import { Activity, BarChart3, DollarSign, Key, TrendingUp, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserProfile() {
  const router = useRouter();
  const { dbUser, clerkUser, isLoading: userLoading, error: userError } = useUserSync();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [subscriptionCanceled, setSubscriptionCanceled] = useState(false);

  useEffect(() => {
    async function loadUserStats() {
      if (!dbUser?.id) return;

      try {
        setIsLoadingStats(true);
        const [stats, subscriptionStatus] = await Promise.all([
          StatsService.getUserStats(dbUser.id),
          fetch('/api/stripe/subscription-status').then(res => res.json()).catch(() => null)
        ]);

        setUserStats(stats);

        // Verificar si la suscripción ya está programada para cancelación
        if (subscriptionStatus?.cancelAtPeriodEnd) {
          setSubscriptionCanceled(true);
        }
      } catch (error) {
        console.error('Error loading user statistics:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadUserStats();
  }, [dbUser]);

  if (userLoading || isLoadingStats) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userError || !dbUser) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {userError || 'User not found'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action will take effect at the end of your current billing period.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Your subscription has been scheduled for cancellation. You will retain access until the end of your current billing period.');
        setSubscriptionCanceled(true);
      } else {
        alert(`Error: ${data.error || 'Failed to cancel subscription'}`);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleManageApiKeys = () => {
    router.push('/admin/keys');
  };

  const handleViewDetailedStatistics = () => {
    router.push('/admin/analytics');
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={clerkUser?.imageUrl} alt={dbUser.name} />
          <AvatarFallback className="text-lg">
            {getInitials(dbUser.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{dbUser.name}</h1>
          <p className="text-muted-foreground">{dbUser.email}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={dbUser.is_active ? "default" : "secondary"}>
              {dbUser.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline">{dbUser.plan}</Badge>
            {dbUser.email_verified && (
              <Badge variant="secondary" className="text-green-600">
                Email Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total_api_calls.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              calls made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.active_api_keys || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {dbUser.api_key_limit} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${userStats?.total_cost.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              cumulative spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.success_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Plan:</span>
              <Badge variant="outline">{dbUser.plan}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">API Keys Limit:</span>
              <span className="text-sm">{dbUser.api_key_limit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Registration Date:</span>
              <span className="text-sm">{formatDate(dbUser.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Updated:</span>
              <span className="text-sm">{formatDate(dbUser.updated_at)}</span>
            </div>
            {dbUser.company && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Company:</span>
                <span className="text-sm">{dbUser.company}</span>
              </div>
            )}

            {/* Subscription Management */}
            {dbUser.plan !== 'free' && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">Subscription:</span>
                    {subscriptionCanceled ? (
                      <p className="text-xs text-amber-600 mt-1 font-medium">
                        ⚠️ Cancellation scheduled - Access until billing period ends
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        Cancel your subscription at any time
                      </p>
                    )}
                  </div>
                  {!subscriptionCanceled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelSubscription}
                      disabled={isCanceling}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      {isCanceling ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                          Canceling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Plan
                        </>
                      )}
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      Cancellation Scheduled
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your most recent API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats?.last_api_call ? (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last API Call</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(userStats.last_api_call)}
                      </p>
                    </div>
                  </div>
                  {userStats.favorite_model && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Favorite Model</p>
                        <p className="text-xs text-muted-foreground">
                          {userStats.favorite_model}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">Make your first API call</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 sm:space-y-0">
        <Button onClick={handleManageApiKeys} className="w-full sm:w-auto">
          <Key className="mr-2 h-4 w-4" />
          Manage API Keys
        </Button>
        <Button variant="outline" onClick={handleViewDetailedStatistics} className="w-full sm:w-auto">
          <BarChart3 className="mr-2 h-4 w-4" />
          View Detailed Statistics
        </Button>
      </div>
    </div>
  );
}