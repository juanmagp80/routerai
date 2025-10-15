'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, CreditCardIcon, DollarSignIcon, TrendingUpIcon } from "lucide-react";
import { useSearchParams } from 'next/navigation';
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
      '25 requests per week',
      '3 API keys',
      '7-day trial features',
      'Basic models access',
      'Community support'
    ]
  },
  {
    name: 'STARTER',
    price: '€29',
    period: 'per month',
    stripeId: 'starter',
    features: [
      '10,000 requests/month',
      '10 API keys',
      'All AI models',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    name: 'PRO',
    price: '€49',
    period: 'per month',
    stripeId: 'pro',
    popular: true,
    features: [
      '100,000 requests/month',
      '25 API keys',
      'All AI models',
      'Priority support',
      'Advanced analytics',
      'Custom integrations'
    ]
  },
  {
    name: 'ENTERPRISE',
    price: '€199',
    period: 'per month',
    stripeId: 'enterprise',
    features: [
      '1,000,000 requests/month',
      'Unlimited API keys',
      'All AI models',
      '24/7 dedicated support',
      'Custom analytics',
      'On-premise deployment',
      'SLA guarantees'
    ]
  }
];

function BillingPageContent() {
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const plan = searchParams.get('plan');

    if (success && plan) {
      alert(`¡Suscripción exitosa al plan ${plan.toUpperCase()}!`);
    } else if (canceled) {
      alert('Suscripción cancelada');
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
        alert('Error creating payment session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Error processing upgrade');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST'
      });

      if (response.ok) {
        const { portalUrl } = await response.json();
        window.location.href = portalUrl;
      } else {
        alert('Error al abrir el portal de cliente');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Error al abrir el portal');
    }
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
          <p className="text-slate-600 mt-1">Cargando información de facturación...</p>
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
          Manage your Roulix billing and usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                {getCurrentPlanBadge(userLimits?.currentPlan || 'free')}
                <span className="text-2xl font-bold text-slate-900">
                  {plans.find(p => p.stripeId === userLimits?.currentPlan?.toLowerCase())?.price || '€0'}/
                  {plans.find(p => p.stripeId === userLimits?.currentPlan?.toLowerCase())?.period || 'forever'}
                </span>
              </div>
              <p className="text-slate-600 mt-2">
                {userLimits?.apiKeysUsed || 0} of {userLimits?.apiKeysLimit || 0} API Keys •
                {formatNumber(userLimits?.requestsUsed || 0)} of {formatNumber(userLimits?.requestsLimit || 0)} requests
                {userLimits?.trialEndsAt && (
                  <span className="text-orange-600 ml-2">
                    • Trial ends: {new Date(userLimits.trialEndsAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <div className="space-x-2">
              {userLimits?.currentPlan !== 'free' && (
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  className="mr-2"
                >
                  Manage Subscription
                </Button>
              )}
              {userLimits?.currentPlan !== 'enterprise' && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">API Keys</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userLimits?.apiKeysUsed || 0}/{userLimits?.apiKeysLimit || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <TrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Requests</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(userLimits?.requestsUsed || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <DollarSignIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Limit</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(userLimits?.requestsLimit || 0)}
                </p>
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
            Elige el plan que mejor se adapte a tus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.stripeId}
                className={`relative p-6 rounded-lg border-2 ${plan.popular
                  ? 'border-purple-500 bg-purple-50'
                  : userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Más Popular</Badge>
                  </div>
                )}
                {userLimits?.currentPlan?.toLowerCase() === plan.stripeId && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                    ? 'bg-green-600 hover:bg-green-700'
                    : plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                    }`}
                  onClick={() => handleUpgrade(plan.stripeId)}
                  disabled={upgradingPlan === plan.stripeId || userLimits?.currentPlan?.toLowerCase() === plan.stripeId}
                >
                  {userLimits?.currentPlan?.toLowerCase() === plan.stripeId
                    ? 'Current Plan'
                    : plan.stripeId === 'free'
                      ? 'Free Plan'
                      : upgradingPlan === plan.stripeId
                        ? 'Processing...'
                        : `Upgrade to ${plan.name}`
                  }
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Plan Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Requests used</span>
                <span>{userLimits?.requestsUsed || 0} / {formatNumber(userLimits?.requestsLimit || 0)}</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((userLimits?.requestsUsed || 0) / (userLimits?.requestsLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>API Keys used</span>
                <span>{userLimits?.apiKeysUsed || 0} / {userLimits?.apiKeysLimit || 0}</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(((userLimits?.apiKeysUsed || 0) / (userLimits?.apiKeysLimit || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8">Cargando...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
