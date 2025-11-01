'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoModeWarning } from "@/components/DemoModeWarning";
import { CheckIcon, CreditCardIcon, DollarSignIcon, TrendingUpIcon } from "lucide-react";
import { showError, showSuccess, showWarning } from "@/lib/toast-helpers";
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface UserLimits {
  currentPlan: string;
  apiKeysUsed: number;
  apiKeysLimit: number;
  requestsUsed: number;
  requestsLimit: number;
  trialEndsAt?: string;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  stripeId: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: 'FREE',
    price: '€0',
    period: 'forever',
    stripeId: 'free',
    features: [
      '10 requests per month',
      '3 API keys',
      '7-day trial features',
      'Basic models access',
      'Community support'
    ]
  },
  {
    name: 'STARTER',
    price: '€39',
    period: 'per month',
    stripeId: 'starter',
    popular: true,
    features: [
      '5,000 requests/month',
      '10 API keys',
      'All AI models',
      'Priority support',
      'Analytics dashboard',
      'Cost protection'
    ]
  },
  {
    name: 'PRO',
    price: '€79',
    period: 'per month',
    stripeId: 'pro',
    features: [
      '20,000 requests/month',
      '25 API keys',
      'All AI models',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
      'Enhanced cost protection'
    ]
  },
  {
    name: 'ENTERPRISE',
    price: '€299',
    period: 'per month',
    stripeId: 'enterprise',
    features: [
      '80,000 requests/month',
      'Unlimited API keys',
      'All AI models',
      '24/7 dedicated support',
      'Custom analytics',
      'On-premise deployment',
      'SLA guarantees',
      'Maximum cost protection'
    ]
  }
];

function BillingPageContent() {
  const router = useRouter();
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success && plan) {
      showSuccess(`🎉 Successfully upgraded to ${plan.toUpperCase()} plan!`);
    } else if (canceled) {
      showWarning('⚠️ Subscription upgrade was cancelled');
    }

    fetchUserLimits();
  }, [searchParams]);

  const fetchUserLimits = async () => {
    try {
      const response = await fetch('/api/user/limits');
      if (response.ok) {
        const data = await response.json();
        setUserLimits(data);
      }
    } catch (error) {
      console.error('Error fetching user limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;

    setUpgradingPlan(planId);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId })
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        window.location.href = checkoutUrl;
      } else {
        const errorData = await response.json();
        console.error('Stripe error:', errorData);
        showError('❌ Error creating payment session. Please try again.');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      showError('❌ Error processing upgrade. Please try again.');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleManageSubscription = () => {
    router.push('/admin/profile');
  };

  const getCurrentPlanBadge = (planName: string) => {
    switch (planName.toLowerCase()) {
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="text-slate-600 mt-1">Loading billing information...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-600 mt-1">
          Manage your Roulyx billing and usage
        </p>
      </div>

      {/* Demo Mode Warning */}
      <DemoModeWarning />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {getCurrentPlanBadge(userLimits?.currentPlan || 'free')}
                <span className="text-2xl font-bold text-slate-900">
                  {plans.find(p => p.stripeId === userLimits?.currentPlan?.toLowerCase())?.price || '€0'}
                  <span className="text-base font-normal text-slate-600">
                    /{plans.find(p => p.stripeId === userLimits?.currentPlan?.toLowerCase())?.period || 'forever'}
                  </span>
                </span>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-slate-600">
                  <span className="font-medium">{userLimits?.apiKeysUsed || 0}</span> of <span className="font-medium">{userLimits?.apiKeysLimit || 0}</span> API Keys
                </p>
                <p className="text-slate-600">
                  <span className="font-medium">{formatNumber(userLimits?.requestsUsed || 0)}</span> of <span className="font-medium">{formatNumber(userLimits?.requestsLimit || 0)}</span> requests
                </p>
                {userLimits?.trialEndsAt && (
                  <p className="text-orange-600 font-medium">
                    Trial ends: {new Date(userLimits.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              {userLimits?.currentPlan !== 'free' && (
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="whitespace-nowrap"
                >
                  Manage Subscription
                </Button>
              )}
              {userLimits?.currentPlan !== 'enterprise' && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  onClick={() => handleUpgrade('pro')}
                  disabled={upgradingPlan === 'pro'}
                >
                  {upgradingPlan === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">API Keys</p>
                <p className="text-3xl font-bold text-blue-900">
                  {userLimits?.apiKeysUsed || 0}
                </p>
                <p className="text-sm text-blue-600">
                  of {userLimits?.apiKeysLimit || 0} available
                </p>
              </div>
              <div className="p-4 rounded-full bg-blue-200">
                <CreditCardIcon className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Requests Used</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatNumber(userLimits?.requestsUsed || 0)}
                </p>
                <p className="text-sm text-green-600">
                  this month
                </p>
              </div>
              <div className="p-4 rounded-full bg-green-200">
                <TrendingUpIcon className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Monthly Limit</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatNumber(userLimits?.requestsLimit || 0)}
                </p>
                <p className="text-sm text-purple-600">
                  requests max
                </p>
              </div>
              <div className="p-4 rounded-full bg-purple-200">
                <DollarSignIcon className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Available Plans
          </CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.stripeId}
                className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${plan.popular
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-3 py-1">Más Popular</Badge>
                  </div>
                )}
                {userLimits?.currentPlan?.toLowerCase() === plan.stripeId && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 py-1">Current Plan</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  </div>
                  <span className="text-slate-600 text-sm">per {plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 min-h-[160px]">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full text-sm font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  onClick={() => handleUpgrade(plan.stripeId)}
                  disabled={upgradingPlan === plan.stripeId || userLimits?.currentPlan?.toLowerCase() === plan.stripeId}
                >
                  <span className="truncate">
                    {userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                      ? 'Current Plan'
                      : plan.stripeId === 'free'
                        ? 'Free Plan'
                        : upgradingPlan === plan.stripeId
                          ? 'Processing...'
                          : plan.name === 'ENTERPRISE'
                            ? 'Upgrade to Enterprise'
                            : `Upgrade to ${plan.name}`
                    }
                  </span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
            <TrendingUpIcon className="h-6 w-6 mr-2 text-blue-600" />
            Plan Usage Overview
          </CardTitle>
          <CardDescription>
            Track your current usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-slate-900">Requests used this month</span>
                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                  {formatNumber(userLimits?.requestsUsed || 0)} / {formatNumber(userLimits?.requestsLimit || 0)}
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min(((userLimits?.requestsUsed || 0) / (userLimits?.requestsLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {((((userLimits?.requestsUsed || 0) / (userLimits?.requestsLimit || 1)) * 100)).toFixed(1)}% of monthly quota used
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-slate-900">API Keys created</span>
                <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                  {userLimits?.apiKeysUsed || 0} / {userLimits?.apiKeysLimit || 0}
                </span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: `${Math.min(((userLimits?.apiKeysUsed || 0) / (userLimits?.apiKeysLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {((((userLimits?.apiKeysUsed || 0) / (userLimits?.apiKeysLimit || 1)) * 100)).toFixed(1)}% of API key limit used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
