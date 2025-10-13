'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free':
        return <Badge className="bg-gray-100 text-gray-800">FREE</Badge>;
      case 'starter':
        return <Badge className="bg-blue-100 text-blue-800">STARTER</Badge>;
      case 'pro':
        return <Badge className="bg-purple-100 text-purple-800">PRO</Badge>;
      case 'enterprise':
        return <Badge className="bg-orange-100 text-orange-800">ENTERPRISE</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">FREE</Badge>;
    }
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
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {data?.userPlan || 'Free'}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-slate-500">
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
              Top Users
            </CardTitle>
            <CardDescription>
              Users with most requests this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topUsers?.map((user, index) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {user.email}
                        </p>
                        <p className="text-sm text-slate-500">
                          #{index + 1}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(user.plan)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(user.requests)}
                    </TableCell>
                  </TableRow>
                )) || (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-500">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            My Recent Activity
          </CardTitle>
          <CardDescription>
            Latest actions performed in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentActivity?.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">
                        {activity.email}
                      </p>
                      <p className="text-sm text-slate-500">
                        {activity.userId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {activity.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {activity.details}
                  </TableCell>
                </TableRow>
              )) || (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No recent activity
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
