'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Shield, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from 'react';

interface CostMonitoringData {
  globalStats: {
    dailyCost: number;
    dailyLimit: number;
    percentage: number;
    requestsToday: number;
    uniqueUsersToday: number;
  };
  topUsers: Array<{
    userId: string;
    email: string;
    dailyCost: number;
    dailyLimit: number;
    percentage: number;
    requests: number;
    plan: string;
  }>;
  alerts: Array<{
    id: string;
    userId: string;
    alertType: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    createdAt: string;
  }>;
  cacheStats: {
    hits: number;
    misses: number;
    hitRate: number;
    totalEntries: number;
    memoryUsage: number;
  };
  protectionMetrics: {
    blockedRequests: number;
    rateLimitHits: number;
    spikeDetections: number;
    emergencyShutoffs: number;
  };
}

export default function CostMonitoringPage() {
  const [data, setData] = useState<CostMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchMonitoringData();

    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      const response = await fetch('/api/admin/cost-monitoring');
      if (response.ok) {
        const monitoringData = await response.json();
        setData(monitoringData);
      } else {
        setError('Error loading monitoring data');
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Cost Monitoring</h1>
          <p className="text-slate-600 mt-1">Cargando datos de monitoreo...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Cost Monitoring</h1>
          <p className="text-slate-600 mt-1">Error loading data</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchMonitoringData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cost Monitoring Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Monitoreo en tiempo real de costos y protecciones del sistema
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh (30s)
            </label>
            <button
              onClick={fetchMonitoringData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Global Daily Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(data?.globalStats.dailyCost || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${getPercentageColor(data?.globalStats.percentage || 0)}`}>
                    {(data?.globalStats.percentage || 0).toFixed(1)}% of ${data?.globalStats.dailyLimit || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Requests Today</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data?.globalStats.requestsToday || 0}
                </p>
                <p className="text-sm text-slate-500">
                  {data?.globalStats.uniqueUsersToday || 0} unique users
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Protection Stats</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data?.protectionMetrics.blockedRequests || 0}
                </p>
                <p className="text-sm text-slate-500">Blocked requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Cache Hit Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(data?.cacheStats.hitRate || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-slate-500">
                  {data?.cacheStats.totalEntries || 0} entries
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Active Alerts
          </CardTitle>
          <CardDescription>
            Alertas de costo y límites activas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.alerts && data.alerts.length > 0 ? (
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-75 mt-1">
                        User: {alert.userId} • Type: {alert.alertType}
                      </p>
                    </div>
                    <span className="text-xs uppercase font-semibold">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No hay alertas activas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Users by Cost */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Daily Cost</CardTitle>
          <CardDescription>
            Usuarios con mayor costo diario (potenciales riesgos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.topUsers && data.topUsers.length > 0 ? (
            <div className="space-y-4">
              {data.topUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.email}</p>
                      <p className="text-sm text-slate-500">
                        Plan: {user.plan} • {user.requests} requests today
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(user.dailyCost)}
                    </p>
                    <p className={`text-sm ${getPercentageColor(user.percentage)}`}>
                      {user.percentage.toFixed(1)}% of limit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No hay datos de usuarios disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
            <CardDescription>
              Estadísticas del sistema de caché
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Hit Rate</span>
                <span className="font-semibold">{(data?.cacheStats.hitRate || 0).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Entries</span>
                <span className="font-semibold">{data?.cacheStats.totalEntries || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Memory Usage</span>
                <span className="font-semibold">
                  {((data?.cacheStats.memoryUsage || 0) / 1024).toFixed(2)} KB
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Cache Hits</span>
                <span className="font-semibold text-green-600">{data?.cacheStats.hits || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Cache Misses</span>
                <span className="font-semibold text-red-600">{data?.cacheStats.misses || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection Metrics</CardTitle>
            <CardDescription>
              Métricas del sistema de protección de costos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Blocked Requests</span>
                <span className="font-semibold text-red-600">
                  {data?.protectionMetrics.blockedRequests || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Rate Limit Hits</span>
                <span className="font-semibold text-yellow-600">
                  {data?.protectionMetrics.rateLimitHits || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Spike Detections</span>
                <span className="font-semibold text-orange-600">
                  {data?.protectionMetrics.spikeDetections || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Emergency Shutoffs</span>
                <span className="font-semibold text-red-700">
                  {data?.protectionMetrics.emergencyShutoffs || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}