'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityIcon, DollarSignIcon, KeyIcon, TrendingDownIcon, TrendingUpIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalRequests: number;
  totalUsers: number;
  totalApiKeys: number;
  totalRevenue: number;
  requestsGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
  apiKeysGrowth?: number;
  userPlan?: string;
  userEmail?: string;
  planUpgradeDate?: string;
  // Real metrics only
  totalCost?: number;
  peakHours?: string;
  monthlyGrowth?: string;
  // Plan limits for calculations
  planLimits?: {
    monthlyRequestLimit: number;
    apiKeyLimit: number;
  };
  topUsers: Array<{
    userId: string;
    email: string;
    requests: number;
    plan: string;
  }>;
  topModels: Array<{
    model: string;
    requests: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    userId: string;
    email: string;
    action: string;
    details: string;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        setError('Error loading analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUpIcon className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDownIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Loading analytics data...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Error loading data</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAnalytics}
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
        <h1 className="text-2xl font-bold text-slate-900">My Analytics</h1>
        <p className="text-slate-600 mt-1">
          Your personal usage metrics and statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <ActivityIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">My Requests</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(data?.totalRequests || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(data?.requestsGrowth || 0)}
                  <span className={`text-sm ml-1 ${getGrowthColor(data?.requestsGrowth || 0)}`}>
                    {data?.requestsGrowth?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="p-3 rounded-full bg-green-100 mr-4 flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900 capitalize mb-1">
                  {data?.userPlan || 'Free'}
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 break-all">
                    {data?.userEmail || 'Your account'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <KeyIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">My API Keys</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(data?.totalApiKeys || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-slate-500">
                    Total active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <DollarSignIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(data?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(data?.revenueGrowth || 0)}
                  <span className={`text-sm ml-1 ${getGrowthColor(data?.revenueGrowth || 0)}`}>
                    {data?.revenueGrowth?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Usage Insights
            </CardTitle>
            <CardDescription>
              Detailed analysis of your API usage patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Total Cost</span>
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Real</span>
                  </div>
                  <p className="text-xl font-bold text-blue-900">${data?.totalCost?.toFixed(3) || '0.000'}</p>
                  <p className="text-xs text-blue-600 mt-1">Based on actual usage</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">Avg. Cost per Request</span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    ${data?.totalRequests && data.totalRequests > 0
                      ? ((data.totalCost || 0) / data.totalRequests).toFixed(4)
                      : '0.0000'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Per API call</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Usage Efficiency
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">API Keys Utilization</span>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-slate-200 rounded-full mr-2">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${data?.totalApiKeys ? Math.min((data.totalRequests / (data.totalApiKeys * 10)) * 100, 100) : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {data?.totalApiKeys ? Math.round((data.totalRequests / (data.totalApiKeys * 10)) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Plan Limit Usage</span>
                    <div className="flex items-center">
                      <div className="w-20 h-2 bg-slate-200 rounded-full mr-2">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${Math.min(((data?.totalRequests || 0) / (data?.planLimits?.monthlyRequestLimit || 25)) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {data?.totalRequests || 0}/{data?.planLimits?.monthlyRequestLimit || 25}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700">Smart Recommendations</span>
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">AI</span>
                </div>
                <div className="text-sm text-amber-800">
                  {(data?.totalRequests || 0) === 0
                    ? "Start making API calls to get personalized insights!"
                    : (data?.totalRequests || 0) / (data?.planLimits?.monthlyRequestLimit || 25) > 0.6
                      ? `You're using ${Math.round(((data?.totalRequests || 0) / (data?.planLimits?.monthlyRequestLimit || 25)) * 100)}% of your ${data?.userPlan || 'current'} plan. ${data?.userPlan === 'free' ? 'Consider upgrading for more requests.' : 'Monitor your usage.'}`
                      : (data?.totalRequests || 0) > 0 && (data?.topModels?.length || 0) <= 1
                        ? "Try experimenting with different AI models to find the best fit for your use case."
                        : "Your usage patterns look healthy! Keep up the good work."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              My Most Used Models
            </CardTitle>
            <CardDescription>
              Usage distribution by AI model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topModels?.map((model) => (
                <div key={model.model} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{model.model}</p>
                    <p className="text-sm text-slate-500">
                      {formatNumber(model.requests)} requests
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${model.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {model.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )) || (
                  <p className="text-center text-slate-500">
                    No data available
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Real Usage Statistics
            </CardTitle>
            <CardDescription>
              Your actual API usage and costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${data?.totalCost?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSignIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">Growth Rate</p>
                  <p className="text-2xl font-bold text-green-700">
                    {data?.monthlyGrowth || '0'}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  {getGrowthIcon(data?.requestsGrowth || 0)}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-900">Peak Hours</p>
                  <p className="text-lg font-bold text-purple-700">
                    {data?.peakHours || 'No data'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ActivityIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Account Summary
            </CardTitle>
            <CardDescription>
              Your account status and real metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📊 Current Plan
                </h4>
                <p className="text-sm text-blue-700">
                  You are on the <strong>{data?.userPlan || 'Free'}</strong> plan with {data?.totalApiKeys || 0} active API keys.
                </p>
              </div>

              <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50">
                <h4 className="font-semibold text-emerald-900 mb-2">
                  🎯 Total Requests
                </h4>
                <p className="text-sm text-emerald-700">
                  You have made {data?.totalRequests || 0} API requests this month.
                </p>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-2">
                  � Peak Activity
                </h4>
                <p className="text-sm text-purple-700">
                  Your most active time is {data?.peakHours || 'not yet determined'}.
                </p>
              </div>

              <div className="p-4 border-l-4 border-indigo-500 bg-indigo-50">
                <h4 className="font-semibold text-indigo-900 mb-2">
                  � Growth Trend
                </h4>
                <p className="text-sm text-indigo-700">
                  Your usage has {data?.requestsGrowth && data.requestsGrowth >= 0 ? 'increased' : 'decreased'} by {Math.abs(data?.requestsGrowth || 0).toFixed(1)}% this month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
