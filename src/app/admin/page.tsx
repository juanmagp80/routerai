'use client';

import { DemoModeWarning } from "@/components/DemoModeWarning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserSync } from "@/hooks/useUserSync";
import { DashboardStats, StatsService } from "@/lib/stats-service";
import { showError, showSuccess } from "@/lib/toast-helpers";
import { useUser } from "@clerk/nextjs";
import { Activity, BarChart3, Clock, Cpu, Eye, Key, Plus, Settings, TrendingUp, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';

interface UsageData {
  currentPlan: string;
  apiKeysUsed: number;
  apiKeysLimit: number;
  requestsUsed: number;
  requestsLimit: number;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const { dbUser, isLoading: userLoading, error: userError } = useUserSync();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const dashboardStats = await StatsService.getDashboardStats(
          (dbUser as unknown as { company?: string })?.company,
          user?.id // Pasar el Clerk ID del usuario logueado
        );
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (dbUser && user?.id) {
      // Load user-specific stats for any authenticated user
      loadStats();
    }
  }, [dbUser, user?.id]);

  // Funciones de navegación para acciones rápidas
  const handleConfigureModels = () => {
    router.push('/admin/settings');
  };

  const handleManageKeys = () => {
    router.push('/admin/keys');
  };

  const handleBilling = () => {
    router.push('/admin/billing');
  };

  const handleApiTesting = () => {
    router.push('/admin/chat');
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showSuccess(`✅ Notificación de prueba enviada a ${result.notification?.userEmail}`);

        if (result.email?.sent) {
          toast.success(`📧 Email enviado correctamente (ID: ${result.email.messageId})`);
        } else if (result.email?.error) {
          toast.error(`❌ Error enviando email: ${result.email.error}`);
        }
      } else {
        showError(result.message || 'Error creando notificación de prueba');
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      showError('Error enviando notificación de prueba');
    }
  };

  const handleCreateApiKey = async () => {
    try {
      setIsCreatingApiKey(true);
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `API Key ${new Date().toLocaleDateString()}`
        })
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess('API key created successfully!');
        // Redirigir a la página de keys para ver la nueva clave
        router.push('/admin/keys?highlight=' + result.apiKey.id);
      } else {
        console.error('Error creating API key:', result.error);
        showError(result.error || 'Error creating API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      showError('Error creating API key');
    } finally {
      setIsCreatingApiKey(false);
    }
  };

  const handleQuickUsage = async () => {
    try {
      const response = await fetch('/api/user/limits');
      const userLimits = await response.json();

      if (response.ok) {
        setUsageData(userLimits);
        setShowUsageModal(true);
      } else {
        showError('Error fetching usage information');
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
      showError('Error fetching usage information');
    }
  };

  if (userLoading || isLoadingStats) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {userError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleViewDetails = (section: string) => {
    console.log(`View details for ${section}`);
  };

  const handleViewAnalytics = (type?: string) => {
    if (type) {
      // Si se especifica un tipo, podríamos agregar query params en el futuro
      router.push(`/admin/analytics?type=${type}`);
    } else {
      router.push('/admin/analytics');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {dbUser?.name}
          </p>
        </div>
      </div>

      {/* Demo Mode Warning */}
      <DemoModeWarning />      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your API Calls</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.api_calls.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className={stats && stats.usage_trend >= 0 ? "text-green-600" : "text-red-600"}>
                {stats && stats.usage_trend >= 0 ? '+' : ''}{stats?.usage_trend.toFixed(1) || 0}%
              </Badge>
              {" "}since last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => handleViewDetails('keys')}
              >
                View details
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Available Models</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.models_available || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                {stats?.active_models || 0} used
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_response_time.toFixed(2) || 0}s</div>
            <p className="text-xs text-muted-foreground">
              Across all models
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.success_rate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => handleViewAnalytics('performance')}
              >
                View analytics
              </Button>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary" className="text-green-600">
                Operational
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All systems running
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest API calls and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.api_calls === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">API calls will appear here</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Successful API call</p>
                      <p className="text-xs text-muted-foreground">Real data available</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User synchronized</p>
                      <p className="text-xs text-muted-foreground">{dbUser?.name}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Navigation</p>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleManageKeys}
              >
                <Key className="mr-2 h-4 w-4" />
                Manage API Keys
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleApiTesting}
              >
                <Cpu className="mr-2 h-4 w-4" />
                API Console
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleViewAnalytics('general')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleBilling}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Billing
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleConfigureModels}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions</p>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="default"
                  onClick={handleCreateApiKey}
                  disabled={isCreatingApiKey}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreatingApiKey ? 'Creating...' : 'Create New API Key'}
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleQuickUsage}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Current Usage
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleTestNotification}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Test Email Notification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Usage Modal */}
      <Dialog open={showUsageModal} onOpenChange={setShowUsageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📊 Current Usage</DialogTitle>
            <DialogDescription>
              Plan and limits status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {usageData ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Plan {usageData.currentPlan}</h3>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-blue-700">🔑 API Keys</span>
                        <span className="text-sm font-medium">{usageData.apiKeysUsed}/{usageData.apiKeysLimit}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (usageData.apiKeysUsed / usageData.apiKeysLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-blue-700">📡 Requests</span>
                        <span className="text-sm font-medium">{usageData.requestsUsed}/{usageData.requestsLimit}</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (usageData.requestsUsed / usageData.requestsLimit) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {((usageData.requestsUsed / usageData.requestsLimit) * 100).toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowUsageModal(false);
                      router.push('/admin/billing');
                    }}
                    className="flex-1"
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowUsageModal(false);
                      router.push('/admin/keys');
                    }}
                    className="flex-1"
                  >
                    View API Keys
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-center py-4">Loading usage information...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}