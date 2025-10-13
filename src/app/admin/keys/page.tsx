'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiKeyService } from "@/lib/api-key-service";
import { PlanLimitsService } from "@/lib/plan-limits-service";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangleIcon, CopyIcon, EyeIcon, EyeOffIcon, InfoIcon, KeyIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

interface NewApiKey extends ApiKey {
  key_value?: string; // Solo para nuevas keys recién creadas
}

export default function ApiKeysPage() {
  const { userId, isLoaded } = useAuth();
  const [apiKeys, setApiKeys] = useState<NewApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ key: string, name: string } | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [userLimits, setUserLimits] = useState<{
    user: {
      plan: string;
      isActive: boolean;
      createdAt: string;
      trialDaysRemaining: number | null;
    };
    limits: {
      plan_name: string;
      api_key_limit: number;
      monthly_request_limit: number;
      price_eur: number;
    };
    usage: {
      apiKeys: {
        allowed: boolean;
        reason?: string;
        current: number;
        limit: number;
      };
      requests: {
        allowed: boolean;
        current: number;
        limit: number;
        percentage: number;
      };
    };
  } | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const loadApiKeysAndLimits = async () => {
      try {
        // Cargar API keys del usuario
        const userApiKeys = await ApiKeyService.getApiKeysByUserId(userId);
        setApiKeys(userApiKeys);

        // Cargar límites y uso del usuario
        const limitsAndUsage = await PlanLimitsService.getUserLimitsAndUsage(userId);
        setUserLimits(limitsAndUsage);

      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadApiKeysAndLimits();
  }, [isLoaded, userId]);

  const createApiKey = async () => {
    if (!userId || !newKeyName.trim()) return;

    setIsCreatingKey(true);
    setError(null);

    try {
      // Verificar límites antes de crear
      const canCreate = await PlanLimitsService.canCreateApiKey(userId);

      if (!canCreate.allowed) {
        setError(canCreate.reason || 'Cannot create more API keys');
        return;
      }

      // Generar una API key realista
      const keyValue = `rtr_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const newKey = await ApiKeyService.createApiKey({
        user_id: userId,
        name: newKeyName.trim(),
        key_hash: keyValue, // Guardamos el valor completo en key_hash
        is_active: true
      });

      if (newKey) {
        // Agregar el key_value temporal para mostrar al usuario recién creada
        const newKeyWithValue: NewApiKey = {
          ...newKey,
          key_value: keyValue
        };
        setApiKeys([newKeyWithValue, ...apiKeys]);
        setNewKeyName('');
        setShowCreateDialog(false);

        // Recargar límites actualizados
        const updatedLimits = await PlanLimitsService.getUserLimitsAndUsage(userId);
        setUserLimits(updatedLimits);

        // Mostrar modal especial con la nueva API key
        setNewlyCreatedKey({ key: keyValue, name: newKeyWithValue.name });
        setShowNewKeyDialog(true);
      } else {
        throw new Error('Could not create API key');
      }
    } catch (err) {
      console.error('Error creating API key:', err);
      setError(err instanceof Error ? err.message : 'Error creating API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Mejor feedback visual en lugar de alert
      const notification = document.createElement('div');
      notification.textContent = '✓ API Key copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }).catch(() => {
      alert('Error al copiar. Por favor, selecciona y copia manualmente.');
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const success = await ApiKeyService.deleteApiKey(keyId, userId!);
      if (success) {
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        alert('API Key deleted successfully');
      } else {
        throw new Error('Could not delete API key');
      }
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(err instanceof Error ? err.message : 'Error deleting API key');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
        <p className="text-slate-600 mt-1">
          Manage your RouterAI API access keys
        </p>
      </div>

      {/* Stats con límites reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <KeyIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">API Keys</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userLimits?.usage.apiKeys.current || 0}
                  <span className="text-sm text-slate-500">
                    /{userLimits?.usage.apiKeys.limit || 0}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(userLimits?.usage.requests.percentage ?? 0) > 80 ? 'bg-red-100' : 'bg-green-100'
                }`}>
                <span className={`font-bold ${(userLimits?.usage.requests.percentage ?? 0) > 80 ? 'text-red-600' : 'text-green-600'
                  }`}>
                  {(userLimits?.usage.requests.percentage ?? 0) > 80 ? '⚠️' : '✓'}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Requests this month</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userLimits?.usage.requests.current || 0}
                  <span className="text-sm text-slate-500">
                    /{userLimits?.usage.requests.limit || 0}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {(userLimits?.usage.requests.percentage ?? 0).toFixed(1)}% used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <InfoIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Current Plan</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">
                  {userLimits?.user.plan || 'Free'}
                </p>
                {(userLimits?.limits.price_eur ?? 0) > 0 && (
                  <p className="text-xs text-slate-500">
                    €{userLimits?.limits.price_eur}/mes
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${userLimits?.user.plan === 'free' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                <AlertTriangleIcon className={`w-5 h-5 ${userLimits?.user.plan === 'free' ? 'text-orange-600' : 'text-blue-600'
                  }`} />
              </div>
              <div className="ml-4">
                {userLimits?.user.plan === 'free' && userLimits?.user.trialDaysRemaining !== null ? (
                  <>
                    <p className="text-sm font-medium text-slate-600">Trial remaining</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {userLimits?.user.trialDaysRemaining}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(userLimits?.user.trialDaysRemaining ?? 0) === 1 ? 'day' : 'days'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">Status</p>
                    <p className="text-2xl font-bold text-green-900">Active</p>
                    <p className="text-xs text-green-600">No time limit</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de límites */}
      {(userLimits?.usage.requests.percentage ?? 0) > 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">
                  Te estás acercando al límite de requests
                </h4>
                <p className="text-sm text-orange-700">
                  You have used {userLimits?.usage.requests.current} of {userLimits?.usage.requests.limit} requests this month
                  ({(userLimits?.usage.requests.percentage ?? 0).toFixed(1)}%).
                  {userLimits?.user.plan === 'free' ? (
                    <span> Considera actualizar a un plan de pago para obtener más requests.</span>
                  ) : (
                    <span> El contador se reiniciará el próximo mes.</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userLimits?.user.plan === 'free' && (userLimits?.user.trialDaysRemaining ?? 0) <= 2 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Your free trial is about to expire
                </h4>
                <p className="text-sm text-red-700">
                  You have {userLimits?.user.trialDaysRemaining} days of free trial remaining.
                  Upgrade to a paid plan to continue using RouterAI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de sincronización cuando los límites son 0/0 */}
      {(userLimits?.usage.apiKeys.limit || 0) === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Account needs synchronization
                  </h4>
                  <p className="text-sm text-blue-700">
                    Your limits appear as 0/0. Click "Sync Account" to fix this.
                  </p>
                </div>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/real-sync', { method: 'POST' });
                    const result = await response.json();
                    
                    if (result.success) {
                      alert('Cuenta sincronizada exitosamente');
                      window.location.reload();
                    } else {
                      alert('Error: ' + result.error);
                    }
                  } catch (error) {
                    alert('Connection error');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sync Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}



      {/* API Keys Management */}
      <Card>
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Your API Keys
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Manage and monitor your API access keys
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-400"
                  disabled={!userLimits?.usage.apiKeys.allowed || isCreatingKey}
                  title={
                    !userLimits?.usage.apiKeys.allowed
                      ? userLimits?.usage.apiKeys.reason
                      : 'Create new API key'
                  }
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New API Key
                  {userLimits?.usage.apiKeys.allowed === false && (
                    <span className="ml-2 text-xs">
                      ({userLimits?.usage.apiKeys.current}/{userLimits?.usage.apiKeys.limit})
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for your applications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="keyName" className="block text-sm font-medium text-slate-700 mb-2">
                      API Key Name
                    </label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="My Application - Production"
                      className="w-full"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <AlertTriangleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="ml-2">
                        <p className="text-xs text-yellow-800">
                          Store your API key securely. You won't be able to see it in full after creating it.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={createApiKey}
                    disabled={isCreatingKey || !newKeyName.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreatingKey ? 'Creating...' : 'Create API Key'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No API Keys configured
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first API key to start using RouterAI
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-slate-900">{key.name}</h3>
                        <Badge
                          variant={key.is_active ? "default" : "secondary"}
                          className={key.is_active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}
                        >
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {/* Indicar si es una key recién creada */}
                        {key.key_value && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Just created
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {key.key_value ? (
                            // Key recién creada - mostrar valor completo con opción de ocultar
                            <>
                              <code className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-md text-sm font-mono">
                                {visibleKeys.has(key.id) ? key.key_value : `${key.key_value.substring(0, 20)}...`}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(key.id)}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title={visibleKeys.has(key.id) ? "Hide full key" : "Show full key"}
                              >
                                {visibleKeys.has(key.id) ? (
                                  <EyeOffIcon className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeIcon className="w-4 h-4 text-green-600" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.key_value!)}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="Copy API key"
                              >
                                <CopyIcon className="w-4 h-4 text-green-600" />
                              </Button>
                            </>
                          ) : (
                            // Key existente - solo mostrar hash parcial
                            <>
                              <code className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-mono">
                                {`${key.key_hash.substring(0, 15)}...`}
                              </code>
                              <span className="text-xs text-slate-500 italic">
                                (Only hash visible for security)
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-sm text-slate-500">
                          Created on {formatDate(key.created_at)}
                        </span>
                        {key.last_used_at && (
                          <span className="text-sm text-slate-500">
                            Last used: {formatDate(key.last_used_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            How to use your API Key
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">HTTP Authentication</h4>
              <div className="bg-slate-50 rounded-md p-3">
                <code className="text-sm text-slate-800">
                  curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; https://api.routerai.com/v1/chat
                </code>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">JavaScript/Node.js</h4>
              <div className="bg-slate-50 rounded-md p-3">
                <code className="text-sm text-slate-800">
                  {`const response = await fetch('https://api.routerai.com/v1/chat', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});`}
                </code>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-2">Python</h4>
              <div className="bg-slate-50 rounded-md p-3">
                <code className="text-sm text-slate-800">
                  {`import requests
headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.post('https://api.routerai.com/v1/chat', headers=headers)`}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal especial para mostrar la nueva API key */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <KeyIcon className="w-4 h-4 text-green-600" />
              </div>
              <span>API Key created successfully!</span>
            </DialogTitle>
            <DialogDescription>
              This is your new API key for &quot;{newlyCreatedKey?.name}&quot;. Copy it now - you won't be able to see it in full later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Important!</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    For security reasons, this is the only time you'll be able to see your complete API key.
                    Make sure to copy it and store it in a safe place.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your new API Key
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-3">
                  <code className="text-sm font-mono text-slate-800 break-all">
                    {newlyCreatedKey?.key || ''}
                  </code>
                </div>
                <Button
                  onClick={() => copyToClipboard(newlyCreatedKey?.key || '')}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                >
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-800 mb-2">Quick usage example:</h4>
              <code className="text-xs text-slate-600 break-all">
                curl -H &quot;Authorization: Bearer {newlyCreatedKey?.key || 'YOUR_API_KEY'}&quot; https://api.routerai.com/v1/chat
              </code>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(newlyCreatedKey?.key || '')}
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy again
              </Button>
              <Button
                onClick={() => {
                  setShowNewKeyDialog(false);
                  setNewlyCreatedKey(null);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                ✓ I've copied it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}